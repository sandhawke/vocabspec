'use strict'

const debug = require('debug')('vocabspec')

function create () {
  const v = {}
  const recs = []
  const nameCount = new Map()

  // record that this name (not one returned by uniqueVersion) is claimed
  // so uniqueVersion can do its job and avoid it
  function claimName (name) {
    debug('claiming name', name)
    nameCount.set(name, 1)
  }
  // 'name' turns out to be already taken, so return a string like
  // name_34 which hasn't been taken.
  function uniqueVersion (name) {
    let count = nameCount.get(name)
    let result = null
    while (true) {
      count++
      result = name + '_' + count
      let stored = nameCount.get(result)
      if (stored === undefined) break
      debug('nameCount.get =', stored)
    // we'll end up here in the corner case where someone defines
    // names 'a' and 'a_2'.  In this case, we'll just try 'a_3',
    // etc, until we find one not taken.
    }
    nameCount.set(name, count)
    return result
  }

  function defineProperty (names, defs, options) {
    if (typeof names === 'string') names = names.split(' ')
    if (typeof defs === 'string') defs = [defs]
    if (names.length === 0) {
      throw Error('names must be string or non-empty array')
    }
    if (defs.length === 0) {
      throw Error('defs must be string or non-empty array')
    }
    // check type in other ways?  No empty arrays?
    for (let i in names) {
      const name = names[i]
      let conflict = false
      for (let rec of recs) {
        for (let rname of rec.names) {
          if (rname === name) conflict = true
        }
      }
      if (conflict) {
        if (options && options.renameIfConflict) {
          names[i] = uniqueVersion(name)
        } else {
          throw Error('Property name ' + name + ' already used')
        }
      } else {
        claimName(name)
      }
    }
    for (let rec of recs) {
      for (let rdef of rec.defs) {
        for (let def of defs) {
          if (rdef === def) {
            throw Error('Property def of ' + names[0] + ' already used' +
              ' by ' + rec.names[0])
          }
        }
      }
    }
    const newRec = {names: names, defs: defs}
    recs.push(newRec)
    return newRec
  }

  // Return a rec which has one def which is the same as a def of the target.
  //
  // If there's no match, and onauto is set, then add target as a new rec.
  //
  function match (target) {
    for (let rec of recs) {
      for (let rdef of rec.defs) {
        for (let def of target.defs) {
          if (rdef === def) {
            return rec
          }
        }
      }
    }
    if (v.onauto) {
      debug('auto defining', target)
      const opts = {renameIfConflict: true}
      const rec = defineProperty(target.names, target.defs, opts)
      if (typeof v.onauto === 'function') {
        v.onauto(rec)
      }
      return rec
    }
    return null
  }

  // if there's a rec using this name, return it
  function byName (name) {
    debug('byname', name)
    for (let rec of recs) {
      debug('  rec', rec)
      for (let rname of rec.names) {
        if (rname === name) return rec
      }
    }
    return null
  }

  function convert (obj, to) {
    if (obj === undefined) return obj
    if (obj === null) return obj
    if (obj === true) return obj
    if (obj === false) return obj
    if (typeof obj === 'string') return obj
    if (typeof obj === 'number') return obj
    if (Array.isArray(obj)) {
      const result = []
      for (let a of obj) {
        result.push(convert(a), to)
      }
      return result
    }
    if (typeof obj === 'object') {
      debug('converting object', obj)
      const result = {}
      for (let fromName of Object.getOwnPropertyNames(obj)) {
        debug('converting property', fromName)
        const fromVal = obj[fromName]
        const rec = byName(fromName)
        const toRec = to._match(rec)
        debug('from', rec, 'to', toRec)
        if (toRec) {
          result[toRec.names[0]] = convert(fromVal, to)
        }
      }
      return result
    }
    throw TypeError('vocabspec unable to convert type ' + typeof obj)
  }

  v.onauto = null
  v.defineProperty = defineProperty
  v.convert = convert
  v._match = match
  return v
}

module.exports.create = create
