
Status: discussion draft, not yet implemented

Introduction
============

The term **vocabspec** refers to a system of making data formats
(particularly JSON formats) interoperable by SPECifying the VOCABulary
used in the format.

For example, the json document 

```json
{ "temp": 33.0 }
```

might refer to a high or a low temperature, depending on whether
"temp" is in Celcius or Farenheit.  Vocabspec allows data files and
the systems which use them to communicate these details, and in some
cases to convert between similar formats.

For example, if that document were written as:

```json
{ "vocabspec": "http://globalWeather.example/basic",
  "temp": 33.0 }
```

then readers could look at that URL for a spec for the "temp"
property.

VocabSpec Documents
===================

```json
{ "vocabSpecVersion": 0.01,
  "importLocations": {
     "http://phones.example": true,
     "./vocabspec-old/v31": true
  },
  "properties": {
    "firstName": {
	  _id: "..."   // ??
      definition: "...",
      valueType: "...",
      about: "..."
    }
  }
}
```

vocabSpecVersion
----------------

importLocations
---------------

Definition
----------

See http://w3.org/ns/mics for full definition.

Must be canonicalized before checking for equality.   Canonicallization means:
* s/[ \t\r\n]+/ /
* add valueType & about, with property name in set treated as [][].
* /\[([_a-zA-Z0-0]+)\]\[\]/ is taken as a reference to property $1, so the definition of $1 is appended, with a "\n\n# $1\n\n" separator, with $1 replaced by the next integer, starting with 1, unless it's already been assigned a number.  Any references to the property itself are treated as 0.

This may be a bad idea, since it discourages transparency: For
convenience a defnhash MAY be included, which is the SHA-256 of the
canonicalized definition.  Consumers SHOULD verify the defnhash.

Value Type (valueType)
----------------------

* **string**
* **integer**
* **float**
* **number**  
* ...?
* **link**  in js { _id: ... }
* **linkLocation**   is a string, with a special meaning
* (or can we combine those)
* **set(_elementType_)**   recursive
* **set(_elementType_, keyPropertyName)**   recursive
* **array(_elementType_)** recursive
* **tagged** is any type which is tagged, like { type: string, value :... }

Metadata Properties (about)
---------------------------

The "about" property is used to say whether this is a metadata
property, and if it is, which metadata approach is being used.  

Non-metadata properties should have "about":"subject".  This is the
usual data situation, where the data is about some subject.

For example, imagine Alice and Bob each have a page of data about Charlie:
  
http://alice.example/friend/charlie

   name: Charlie Example
   born: 1967
   knownSince: 2005
   updated: 2014-07-01
   license: CC-BY   

http://bob.example/friend/charlie

   name: Charlie Example
   born: 1967
   knownSince: 2008
   updated: 2014-07-02
   license: CC-BY-NC

Here, "name" and "born" are clearly about Charlie, so they would be
defined with "about":"subject".

???  The "knownSince" property is a little more subtle.  It's also about
Charlie, but it's an "context-sensitive" property, one whose meaning
depends on the context in which it is said. 

???  And "added" property is about this as an address-book entry

The "license" and "author" properties are about the content.  If you
were to copy the content, you'd want to copy those, too.  So they are
"about":"content".

The "updated" property is about each of the information records.  It's
"about":"resource".  We could also have "pageLastAccessed", or
"pageHits".

For about:location, we could also have a "urlLastAccessed" and
"urlHits", but they would be recording those values for that spelling
of the URL.

* **subject**: The usual reference mode.   This is not a metadata property.  Technically: this is a property of the subject described by the content provided as a representation of the resource at this location.
* **content**: A kind of metadata reference.  Technically: this is a property of the content provided as a representation of the resource at this location.
* **resource**: A kind of metadata reference.  Technically: this is a property of the resource at this location.
* **location**: A kind of metadata reference.  Technically: this is a property of the location itself.

If two objects are about the same subject, then all the about=subject
properties in one would be equally true in the other.

If two objects have the same content, then all the about=content
properties in one would be equally true in the other.

If two objects have the same underlying resource (eg file or database
query), then all the about=resource properties in one would be equally
true in the other.

If two objects have the exact same canonicalized URL, then all the
about=location properties in one would be equally true in the other.
URL canonicalization handles things like case folding on the schema
name and domain name, as well as processing "/../" path segments, but
cannot tell (for example) that "/foo" and "/foo.html" are the same
resource.  

That is "http://foo.COM/bar" and "http://foo.com/bar" are the same
location.

"http://foo.com/bar.html" and "http://foo.com/bar" are different
locations but on many servers, set up for content-negotiation, they
would be the same resource.  If they are the same resource, they would
have the same content and the same subject.

"http://foo.com/bar.html" and "http://mirror.foo.com/bar.html" might
have exactly the same content and the same subject, but would probably
not be the same resource, since they might in some situations be out
of sync.

"http://foo.com/about" and "http://foo.com/internal/about" would
typically be different resources with different content, but both have
the same subject, as both describe Foo Corporation, but one does it
for the public and the other does it for people inside the company.

Determining the VocabSpec
=========================


Inline VocabSpec Link
---------------------

```json
{ "vocabspec": "http://" }
```

Possible alternative:

```json
{ "vocabspec": { _id: "http://" } }
```

Possible alternative:

```json
{ "vocabspec": { 
    "imports": {
       "http://...": true 
    }
}}
```

Inline VocabSpec Content
------------------------

```json
{ "vocabspec": { ... } }
```

HTTP Link Header
----------------

If the content was obtained via HTTP, the reader MUST then look for a Link header, rel=vocabspec

```http
Link: <http:...> rel=vocabspec
```

Relative Locations
------------------

If the content was obtained from source with a hierarchical name such
as an HTTP URL or a file name (in a hierarchical filesystem), then the
sources "vocabspec" and "vocabspec.json" must be looked for in the
same directory, and recursively each parent directory.

Look in these places, in this order, as if this were in the document

```json
{ "vocabspec": "./vocabspec" }
```

```json
{ "vocabspec": "./vocabspec.json" }
```

```json
{ "vocabspec": "../vocabspec" }
```

```json
{ "vocabspec": "../vocabspec.json" }
```

```json
{ "vocabspec": "../../vocabspec" }
```

```json
{ "vocabspec": "../../vocabspec.json" }
```

etc.  The ".." mechanism cannot actually be used since then you can't
tell when you reach the root; that's just for illustration.

Host Well-Known
---------------

If the content was obtained from an http or https URL, then also look as if:

```json
{ "vocabspec": "/.well-known/vocabspec" }
```

```json
{ "vocabspec": "/.well-known/vocabspec.json" }
```

Server-Side Conversion
======================

When a web server is providing data to a consumer, if it can determine
which vocabspec the consumer prefers (as below), it MUST perform
conversion to that vocabspec.

In-Band
-------

Particular protocols may offer a way for the client to specify which
vocabspec it expects.

Others
------

MAYBE: use the origin: header

MAYBE: use some kind of location header


Conversion Algorithm
====================

To Triples
----------

it starts like this...

```
s = { p: o }
=>
s2 p2 o2

s2 depends on vocabspec.properties[p].about
p2 is [p].defnHash
o2 depends on [p].valueType
```

