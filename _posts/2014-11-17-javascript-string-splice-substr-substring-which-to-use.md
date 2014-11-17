---
layout: post
title: "JavaScript String splice, substr, substring: which to use?"
time: 01:57PM EST
---

I recently read Douglas Crockford's [_JavaScript: The Good Parts_][1]. It's a
classic (published in 2008) which is credited with reviving respect for
JavaScript as a programming language. Given its title, it's also famously short.

One very specific thing it cleared up for me was what to do with all of
JavaScript's various substring methods:

  * [String.prototype.substr][substr](start[, length])
  * [String.prototype.substring][substring](start[, stop])

One method takes an offset and a length. The other takes two offsets. The names
don't reflect this distinction in any way, so they're impossible to remember.
I resorted to writing an [Alfred Snippet][2] with the syntaxes, to quickly look
it up (since I always had to).

They also have some other differences in behavior: `substring` doesn't allow
its offset to be negative, but `substr` does. This is arbitrary. It's
impossible to remember because there's no rhyme or reason to it.

Crockford cleared this all up. The solution is to never use _either_ method!

Instead, you should use the `slice` method:

  * [String.prototype.slice][stringslice](start[, stop])

This takes two offsets. Either can be negative. And it's the exact same as the
corresponding [Array `slice`][arrayslice] method.

So: stop using `substr` and `substring`. Use `slice`!


[1]: http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742
[substr]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr
[substring]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring
[stringslice]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice
[arrayslice]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
[2]: http://support.alfredapp.com/tutorials:clipboard-snippets
