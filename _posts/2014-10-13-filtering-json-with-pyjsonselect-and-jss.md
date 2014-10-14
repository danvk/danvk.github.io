---
title: Filtering JSON with pyjsonselect and jss
layout: post
summary: In which I discuss the gnarly GeoJSON files I worked with while developing Comparea, a Python port of a CSS-like spec for working with JSON files and a command-line tool I built to deal with the problem.
time: 11:43PM EDT
---

The data store for [Comparea](http://www.comparea.org/) is a
[giant](https://github.com/danvk/comparea/blob/master/comparea/static/data/comparea.geo.json)
23MB [GeoJSON](http://geojson.org/) file. Most of the space in that file is
taken up by the giant lists of coordinates which define the boundaries of each
shape. But there's also some interesting metadata hidden amongst all those
latitudes and longitudes:

```json
{
  "features": [
    {
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -69.89912109375001,
              12.452001953124963
            ],
            [
              -69.89570312500004,
              12.422998046875009
            ],
            ...
          ]
        ]
      },
      "type": "Feature",
      "properties": {
        "description": "Aruba is an island.",
        "wikipedia_url": "http://en.wikipedia.org/wiki/Aruba",
        "area_km2": 154.67007756254557,
        "population": 103065,
        "population_year": "???",
        "name": "Aruba"
      },
      "id": "ABW"
    }
  ]
}
```

I'd hoped that I could use [jq](http://stedolan.github.io/jq/) to filter out
all the coordinates and just look at the metadata. But I got bogged down
reading through its extensive [manual](http://stedolan.github.io/jq/manual/).
At the end of the day, I didn't want to learn an ad-hoc language just for
filtering JSON files.

The maddening thing was that there's already a great language for selecting
elements in trees: **CSS Selectors**! I did some searching and learned that there's
already a standard for applying CSS-like selectors to JSON called
[JSONSelect](http://jsonselect.org/#overview). It dates from 2011. It has a
spec and [conformance tests](https://github.com/lloyd/JSONSelectTests), and
it's been implemented in a [number of languages](http://jsonselect.org/#code).

So I picked my language of choice (Python) and began implementing a new command
line tool for filtering JSON files.

The first issue I ran into: the standard [Python
implementation](https://github.com/mwhooker/jsonselect) didn't conform to the
standard! It only implemented 2/3 levels of CSS selectors from the spec, and
many of the interesting selectors are in level 3.

The reference [JavaScript implementation](https://github.com/lloyd/JSONSelect/blob/master/src/jsonselect.js)
was only 572 lines of code and, with all those tests, I figured it wouldn't be
too hard to port it directly to Python. This was a fun project—there's
something very zen about coding against a spec, getting test after test to
pass. I learned about a few nuances of JavaScript and Python by doing this:

- Their regular expressions differ in how they specify [unicode
  ranges](http://stackoverflow.com/questions/3835917/how-do-i-specify-a-range-of-unicode-characters)
- the reference implementation made use of the `null` vs. `undefined`
  distinction
- JavaScript's `typeof` function is quite odd
- JavaScript's `Array.prototype.concat` method is quite subtle in its behavior

I wound up re-implementing all of these quirks these in Python.

At the end of the day, I published
[pyjsonselect](https://github.com/danvk/pyjsonselect/), the first
fully-conformant JSONSelect implementation in Python. A small win for the open
source world!

jss
---

So, how does the tool work? You can read about installation and basic usage [on
github](https://github.com/danvk/jss), but here are a few motivating examples.

jss is a JSON→JSON converter. It supports three modes:

1. select: find all the values that match a selector (1→N)
2. filter out: remove all values which match a selector (1→1)
3. filter in: keep only values which match a selector (1→1)

Here's how the filter out mode works:
```
$ jss -v '.coordinates' comparea.geo.json
```

```json
{
  "features": [
    {
      "geometry": {
        "type": "Polygon"
      },
      "type": "Feature",
      "properties": {
        "description": "Aruba is an island.",
        "wikipedia_url": "http://en.wikipedia.org/wiki/Aruba",
        "area_km2": 154.67007756254557,
        "population": 103065,
        "population_year": "???",
        "name": "Aruba"
      },
      "id": "ABW"
    },
    ...
  ]
}
```

That knocked out all the `coordinates` keys from the GeoJSON file!

I eventually did figure out how to do this in jq. Here's what it looks like:

```
$ jq 'del(..|.coordinates?| select(. != []))' comparea.geo.json
(same output)
```

To come up with that incantation, I had to dig through jq's [github
issues](https://github.com/stedolan/jq/issues/319). It's certainly not
something I could re-type from memory! The `jss` version is clear as could be.

It's also significantly faster. For the 23MB `comparea.geo.json` file, the
`jss` command runs in 1.7s on my laptop vs. 12.9s for `jq`. The trick to this
speed is [appropriate
pruning](http://stackoverflow.com/questions/26221309/preorder-traversal-using-python-generators-with-a-mechanism-to-ignore-subtrees)
of the selector search.


Fancy selectors
---------------

You can specify as operations as you like. Here's a more complex invocation:

```
$ jss -v .coordinates -k '.features>*:has(:contains("ZAF"))' comparea.geo.json
```
```json
{
  "features": [
    {
      "geometry": {
        "type": "Polygon"
      },
      "type": "Feature",
      "id": "ZAX",
      "properties": {
        "description": "South Africa, officially the Republic of South Africa, is a country located at the southern tip of Africa. It has 2,798 kilometres of coastline that stretches along the South Atlantic and Indian oceans.",
        "population_source": "World Factbook",
        "sov_a3": "ZAF",
        "freebase_mid": "/m/0hzlz",
        "name": "South Africa",
        "population_source_url": "https://www.cia.gov/library/publications/the-world-factbook/fields/2119.html",
        "area_km2_source_url": "https://www.cia.gov/library/publications/the-world-factbook/fields/2147.html",
        "population_date": "July 2014",
        "wikipedia_url": "http://en.wikipedia.org/wiki/South_Africa",
        "area_km2": 1214470,
        "area_km2_source": "World Factbook",
        "population": 48375645
      }
    }
  ]
}
```

After filtering out the `coordinates` fields, it keeps only elements
directly under the `features` key (i.e. a top-level feature) which contains
"ZAF" somewhere (the "sov\_a3" field, in this case).

Isn't this just as complicated as the jq syntax? Sure! But at least you learned
something useful.  If you get better at writing CSS selectors as a result of
filtering JSON files, then that's great! You've become a better web developer
in the process.

You can install `jss` with `pip`. Read more [on github](https://github.com/danvk/jss)!
