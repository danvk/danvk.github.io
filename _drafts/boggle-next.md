---
layout: post
title: 'Boggle Revisited: The Path to a 4x4 Global Optimum'
time: 2:15PM EST
datetime: 2025-02-12 2:15PM EST
summary: "What's next for Boggle, and a look back on the experience of revisiting this hard problem."
---

That's it for the post, but I also have some thoughts on [pybind11] and working on optimization problems in general that I wanted to jot down.

### Python and C++ are a great mix, but C++ is still hard

Before I started making algorithmic improvements, my goal was to run my [2009 C++ Boggle code] from Python. My hope was that this would give me a nice mix of C++’s speed and Python’s developer productivity. Since I already had working C++ code, I didn’t want to adopt a tool like [Cython] that compiled to C.

I wound up using [pybind11], which is derived from [Boost Python]. It simplifies the process of creating a Python extension from your existing C++ code. In addition to providing a convenient syntax for exposing C++ functions and classes to Python, it automatically converts all the STL containers between Python and C++ for you. It’s a really nice piece of software! There’s a newer tool from the same author called [nanobind], but it pushes you to adopt CMake and I didn’t really feel like figuring out how to do that.

So is pybind11 the best of both worlds? Development nirvana? Sort of! It definitely delivers on the promise of making a mixed Python/C++ project manageable. That being said, you’re still using C++, and you still need to think about memory management. pybind11 tries to help with this: if you return a `unique_ptr` or raw pointer from a function that’s called from Python, it will manage that memory for you. But sometimes the memory management situation is more complex, and you still get the joy of debugging memory leaks and segfaults.

Some quick notes:

- I really liked writing tests for my C++ code in Python. Python test runners and debuggers tend to be a lot easier to set up than their C++ equivalents.
- So long as your C++ function calls take >1ms or so, you probably won’t have to worry about pybind11 overhead.
- Almost all my segfaults were because pybind11 [takes ownership] of any pointers you return. If you don’t want this, you need to specify `py::return_value_policy::reference`.

My workflow for exploring an optimization eventually wound up being: develop it in Python (including debug and iterating), then port it to C++ and make sure that the tests match. This meant that I could spend most of my time iterating and exploring in Python-land.

This generally worked pretty well. However, as I learned, optimizations in Python often do not translate to C++.

[Cython]: https://cython.readthedocs.io/en/stable/src/quickstart/build.html
[2009 C++ Boggle code]: https://github.com/danvk/performance-boggle
[Boost Python]: https://www.boost.org/doc/libs/1_58_0/libs/python/doc/
[nanobind]: https://nanobind.readthedocs.io/en/latest/index.html
[takes ownership]: https://pybind11.readthedocs.io/en/stable/advanced/functions.html#return-value-policies

### Optimization work is intellectually and psychologically hard

Designing and optimizing novel algorithms like this is hard, both intellectually and psychologically. I think the intellectual challenge is clear. These are hard problems to wrap your head around.

It’s hard psychologically because, when you come up with an idea, you invest a lot of time into building it out before you find out whether it’s going to work. If you sink a week into something you think is going to be a 5x speedup, and then it winds up having no effect, it’s incredibly disheartening. I think this is why I stopped working on Boggle in 2009.

It can be very hard to predict whether an optimization will pan out. This was a place where my development process (prototype in Python, then translate to C++) sometimes failed me. For example, de-duplicating nodes in the tree was an enormous win in Python, something like a 4-5x speedup. But when I ported it to C++, it was actually slower! Why? Executing Python code is slow, so anything you can do to move more of your code into C will be a win. Presumably `__hash__` is implemented in C, so relying more on `dict`s to de-dupe nodes was a subtle way to shift work into C code.

It’s likely that there were some C++ wins that I didn’t pursue because they weren’t wins in Python. For example, I [developed] an entirely different tree representation that used fewer nodes, then abandoned it. Now I suspect it would have been a win. You optimize for the environment you develop in.

This also came up when I first ran my code on the cloud machine. I was surprised how much slower it was than on my MacBook. Apple’s M chips are known for having very high memory bandwidth, and one theory is that my algorithm is subtly reliant on that. A different strategy might work better on the C4s.

Optimization work is also hard in that you never know whether you’re one tweak away from a big win. You don’t want to abandon an approach just before you get to the payoff. But at the same time, you don’t want to keep sinking more time into a bad strategy. See my infamous [TODO] from 2009. I was one small tweak away from a big win. But I’d already sunk weeks of development time in by then and decided to cut my losses.

### Thoughts on revisiting a 15 year old project

- 2009 Dan was pretty clever!
- And generally documented things pretty well.
- I wish I'd done a better job of documenting why I abandoned particular approaches.

[developed]: https://github.com/danvk/hybrid-boggle/tree/clean-tree
