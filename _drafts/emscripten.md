My experiences using emcc to build a bridge site.

- It really is a drop-in replacement for gcc/g++.
- If you use part of the C standard library, it'll compile that.
- My program initially generated a huge, mostly-empty `.mem` file. This turned out to be because of large static variables. The issue was [quickly fixed][1] in Emscripten.
- The tools for wrapping C functions are a little awkward. Passing numbers and strings is easy, so I wound up making my C functions return JSON. Does this leak? I'm not sure.
- Passing in `struct`s requires a little more care.

Overall Emscripten is an amazing, well-executed tool. It make sense to use if you:

- Have a computationally intensive task with a narrow API.
- Want to use a C/C++ library in JavaScript (sqlite.js is another great example of this).
- You want to build games or do graphics in JS.

[1]: https://github.com/kripken/emscripten/issues/3907
