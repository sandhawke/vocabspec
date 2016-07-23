'use strict'

const test = require('tape')
const vocabspec = require('..')

test('property by a different name', t => {
  t.plan(1)
  const v1 = vocabspec.create()
  v1.defineProperty('age', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')
  const v2 = vocabspec.create()
  v2.defineProperty('yearsOld', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')
  const out = v1.convert({age: 20}, v2)
  t.deepEqual(out, {yearsOld: 20})
})

test('property not matched', t => {
  t.plan(1)
  const v1 = vocabspec.create()
  v1.defineProperty('age', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')
  const v2 = vocabspec.create()
  v2.defineProperty('yearsOld', 'NOT the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')
  const out = v1.convert({age: 20}, v2)
  t.deepEqual(out, {})
})

test('property absent', t => {
  t.plan(1)
  const v1 = vocabspec.create()
  v1.defineProperty('age', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')
  const v2 = vocabspec.create()
  const out = v1.convert({age: 20}, v2)
  t.deepEqual(out, {})
})

test('property auto created', t => {
  t.plan(3)
  const v1 = vocabspec.create()
  const rec = v1.defineProperty('age', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')
  const v2 = vocabspec.create()
  v2.onauto = (newrec) => {
    t.deepEqual(rec, newrec)
    t.deepEqual(newrec.names, ['age'])
  }
  const out = v1.convert({age: 20}, v2)
  t.deepEqual(out, {age: 20})
})

test('property by a different name, multiple defs', t => {
  t.plan(1)
  const v1 = vocabspec.create()
  v1.defineProperty('age2 age', ['the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds', 'older def'])
  const v2 = vocabspec.create()
  v2.defineProperty('yearsOld other', ['some other def', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds'])
  const out = v1.convert({age: 20}, v2)
  t.deepEqual(out, {yearsOld: 20})
})

test('error if name previously used', t => {
  t.plan(1)
  const v1 = vocabspec.create()
  v1.defineProperty('age', 'definition1')
  try {
    v1.defineProperty('age', 'definition2')
  } catch (e) {
    t.equal(e.message, 'Property name age already used')
  }
})

test('error if def previously used', t => {
  t.plan(1)
  const v1 = vocabspec.create()
  v1.defineProperty('age1', 'definition')
  try {
    v1.defineProperty('age2', 'definition')
  } catch (e) {
    t.equal(e.message, 'Property def of age2 already used by age1')
  }
})

test('auto created with renaming', t => {
  t.plan(2)

  const v0 = vocabspec.create()
  v0.defineProperty('age', 'some other def of age')

  const v1 = vocabspec.create()
  v1.defineProperty('age', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')

  const vx = vocabspec.create()
  vx.onauto = true
  t.deepEqual(v0.convert({age: 20}, vx), {age: 20})
  t.deepEqual(v1.convert({age: 21}, vx), {age_2: 21})
})

test('auto created with nasty renaming', t => {
  t.plan(5)

  const vx = vocabspec.create()
  vx.onauto = true

  const v0 = vocabspec.create()
  v0.defineProperty('age', 'some other def of age')
  t.deepEqual(v0.convert({age: 20}, vx), {age: 20})
  
  const v1 = vocabspec.create()
  v1.defineProperty('age', 'the v1 def of age')
  t.deepEqual(v1.convert({age: 21}, vx), {age_2: 21})
  
  const v2 = vocabspec.create()
  v2.defineProperty('age', 'the v2 def of age')
  t.deepEqual(v2.convert({age: 22}, vx), {age_3: 22})

  // we don't rename with this one, but we claim a name the renamer
  // would expect to use
  const v3 = vocabspec.create()
  v3.defineProperty('age_4', 'the v3 def of age with a name twist!')
  t.deepEqual(v3.convert({age_4: 23}, vx), {age_4: 23})

  const v4 = vocabspec.create()
  v4.defineProperty('age', 'the v4 def of age')
  t.deepEqual(v4.convert({age: 24}, vx), {age_5: 24})

})
