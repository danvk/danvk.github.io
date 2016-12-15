Surprises:

- `throw` from a .then() handler doesn't do anything.
  You need to return Promise.reject() instead.
- `.then()` with one callback is called for both success and failure.
- `.then()` after `.catch()` is still called.
  You need to use the two-argument version of `.then()` to handle these
  cases separately.
- `fetch()` returns a response with a bad status code on failure.
  It doesn't reject the Promise!
- Methods like `response.json()` and `response.text()` return Promises.

