
# VocabSpec: JSON Data Conversion System

Early version!   Lots of ideas not implemented in this particular snapshot.

See https://decentralyze.com/2014/06/30/growjson/ for one version of the vision.

Provides:

* Conversion between JavaScript (aka JSON) objects written using different vocabularies, when the vocabularies are declared using our defineProperty function.

Does not yet provide:

* type checking
* conversion rules
* reference modes
* nice looking vocab documentation
* hyperlinks in definitions

```js
const vocabspec = require('vocabspec')

const v1 = vocabspec.create()
v1.defineProperty('age', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')

const v2 = vocabspec.create()
v2.defineProperty('yearsOld', 'the number of years since a thing was created, a number, using years as 365.24 * 86400 seconds')

console.log(v1.convert({ age: 20 }, v2) // { yearsOld: 20 }
```

During convert(), properties that have no matching definition on v2 are silently dropped, unless v2.onauto is truthy, in which case the necessary definitions from v1 are copied over.  If v2.onauto is a function, it's called any time that happens, being passed a structured version of the definition being added.

See the test/ directory for more examples.