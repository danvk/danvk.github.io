---
layout: post
title: 'Boggle Revisited: New Ideas in 2025'
time: 2:15PM EST
datetime: 2025-02-17 2:15PM EST
summary: "After 15 years, a Boggle advance!"
---

## New ideas in 2025

I explored many new ideas for speeding up Boggle solving, but there were five that panned out:

1. Play a slightly different version of Boggle where you can find the same word as many times as you like.
2. Build the “evaluation tree” used to calculate the max/no-mark bound explicitly in memory.
3. Implement “pivot” and “lift” operations on this tree to synchronize letter choices across subtrees.
4. Aggressively compress and de-duplicate the evaluation tree.
5. Use three letter classes instead of four.

### Multi-Boggle

Looking at the best 3x3 board:

```
P E R
L A T
D E S
```

There are two different ways to find the word “LATE”:

```
P E R   P E\R
L-A-T   L-A-T
D E/S   D E S
```

In regular Boggle you’d only get points for finding LATE once. But for our purposes, this will wind up being a global constraint that’s hard to enforce. Instead, we just give you two points for it. We’ll call this “Multi-Boggle”. The score of a board in Multi-Boggle is always higher than its score in regular Boggle, so it’s still an upper bound.

If there are no repeat letters on the board, then the score is the same as in regular Boggle. In other words, while you can find LATE twice, you still can’t find LATTE because there’s only one T on the board.

In practical terms, this means that we’re going to focus solely on the max/no-mark bound and forget about the sum/union bound. The max/no-mark bound for a concrete board (one with a single letter on each cell) is its Multi-Boggle score.

TODO: explain later on where this assumption becomes important. Or move this section later.

### The Evaluation Tree

The fundamental flaw in my approach from 2009 (repeatedly splitting up cells in a board class) is that it results in an enormous amount of duplicated work. When you split up the middle cell into each possible vowel, the five board classes you get have a lot in common. Every word that doesn’t go through the middle cell is identical. It would be nice if we could avoid repeating that work.

Back in 2009, I [implemented] the max/no-mark upper bound by recursively searching over the board and the dictionary Trie. This was a natural generalization of the way you score a concrete Boggle board. It didn’t use much memory, but it also didn’t leave much room for improvement.

You can visualize a series of recursive function calls as a tree. The key advance in 2025 is to form this tree explicitly in memory. This is more expensive, but it gives us a lot of options to speed up subsequent steps.

Here’s an example of what one of these trees looks like:

![Evaluation tree for a 2x3 Boggle board](/images/boggle-2x3-tree.svg)

This is visualizing a 2x3 board class, with the cells numbered 0-5:

```
 T I    0 3
AE .    1 .
 R .    2 .
```

The top "ROOT" indicates that you have to start on one of the four cells. "CH" ovals indicate that you have to make a choice on a cell, rectangles indicate what those choices are (A or E?) and double-outlined rectangles indicate complete words. You can read words by following a path down the tree. From the left we have: TAR, TIE, TIER, AIT, RAT, RET, REI. It's news to me that [AIT] is a word.

To get a bound from a tree, you take the sum of your children on rectangular nodes and the max of your children on oval (choice) nodes. Double-outlined boxes indicate how many points they're worth. In this case the bound at the root is 3, coming from the top branch.

This is a small tree with 30 nodes, but in practice they can be quite large. The tree for the 3x3 board class we’ve been looking at has 520,947 nodes and the 3x4 and 4x4 trees can be much larger.

I actually tried [building these trees] in 2009, but I [abandoned it] because I wasn’t seeing a big enough speedup in subsequent steps (scoring boards with a split cell) to justify the cost of building the tree.

What did I miss in 2009? Sadly, I had a [TODO] that turned out to be critical: rather than pruning out subtrees that don’t lead to points in a second pass, it’s much faster and results in less memory fragmentation if you do it as you build the tree. A 33% speedup becomes a 2x speedup. Maybe if I’d discovered that in 2009 I would have kept going!

The other discovery was that there's a more important operation to optimize.

[building these trees]: https://github.com/danvk/performance-boggle/blob/master/tree_tool.cc
[abandoned it]: https://github.com/danvk/performance-boggle/commit/ec55e1c55cb1e5ad66e0784e3bd318a59c8812af
[TODO]: https://github.com/danvk/performance-boggle/blob/2710062fca308b93a6ee6a19980d6bcb4218b6e8/breaking_tree.cc#L34
[implemented]: https://github.com/danvk/performance-boggle/blob/master/3x3/ibuckets.cc
[AIT]: https://en.wiktionary.org/wiki/ait

### “Pivot” and “Lift” operations

After we found an upper bound on the 3x3 board class, the next operation was to split up the middle cell and consider each of those five (smaller) board classes individually. Now that we have a tree, the question becomes: how do you go from the initial tree to the tree you’d get for each of those five board classes?

There’s another way to think about this problem. Why is the max/no-mark bound imprecise? Why doesn’t it get us the score of the best board in the class? Its flaw is that you don’t have make consistent choices across different subtrees. You can see this by zooming in on the "0=t" subtree from the previous graph:

![A subtree with choices made in inconsistent orders](/images/boggle-focus-t0.svg)

The bound on this tree is 3 (sum all the words). On the top branch (with a "T-" prefix), it makes the most sense to choose "A" for cell 1, so that you can spell "TAR." But on the bottom branch (with a "TI-" prefix), it makes more sense to choose "E" so that you can spell "TIE" and "TIER."

Of course, the cell has to be either A or E. It can't be both. The problem is that these choices happen far apart in the tree, so they're not synchronized. If we adjusted the tree so that the first thing you did was make a choice for cell 1, then the subtrees would all be synchronized and the bound would go down:

![The same subtree with choice 1 made first](/images/lift-choice1.svg)

This represents the same tree, except that the choice on cell 1 has been pushed to the left. The bound is now 2, not 3 (you have to pick 1 point from the top branch or 2 points from the bottom branch).

What we need is a “pivot” operation to lift a particular choice node up to the top of the tree. You can work out how to do this for each type of node. It helps a lot to draw the lift operation.

- If a subtree doesn’t involve a choice for cell N, then we don’t have to change it.
- Lifting through a choice node.
- Lifting through a sum node.

If you lift the choice for the middle cell of the 3x3 board to the top of the tree, you wind up with this:

![Top of tree with choice of middle cell first](/images/boggle-1-aeiou.svg)

There’s a choice node with five sum nodes below it, and the bound is lower. Now if you lift another cell to the top, you’ll get two layers of choice nodes with sum nodes below them:

![Top of tree with two choices lifted](/images/boggle-lift-4-5.svg)

I've rotated the tree because it's already getting big. As before, the bound is lower. If you keep doing this, you build up a “pyramid” of choice nodes at the top of the tree. If the bound on any of these nodes drops below the highest score we know about, we can prune it out. This is equivalent to the “stop” condition from the 2009 algorithm, it’s just that we’re doing it in tree form.

This “lift” operation is not cheap. The cost of making choices in an unnatural order is that the tree gets larger. Here’s the tree size if you lift all nine cells of the 3x3 board, along with the bound:

|   Step |      Nodes | Bound |
| ------ | ---------- | ----- |
| (init) |    520,947 | 9,359 |
|      1 |    702,300 | 6,979 |
|      2 |  1,315,452 | 5,334 |
|      3 |  2,527,251 | 4,069 |
|      4 |  5,158,477 | 3,047 |
|      5 |  8,395,605 | 2,318 |
|      6 | 14,889,665 | 1,774 |
|      7 | 18,719,619 | 1,373 |
|      8 | 11,205,272 | 1,037 |
|      9 |  4,143,221 |   804 |

The node count goes up slowly, then more rapidly, and then it comes down again as we’re able to prune more subtrees. At the end of this, there’s only 428 concrete boards (out of 5,625,000 boards in the class) that we need to test.

Does 4 million nodes seem like a lot for only 428 Boggle boards? It is. There are a few important tweaks we can make to keep the tree small as we lift choices.

TODO: could mention that it's storing a trie under each choice node

### Compression and De-duping

Keeping the tree as small as possible is essential for solving Boggle quickly. There are two inefficient patterns we can identify and fix in our trees to keep them compact.

1. Collapse chains of sum nodes into a single sum node.
2. Merge sibling choice nodes.

(example of each)

Here are the node counts when you add compression after each pivot:

| Step | Nodes |
| --- | --- |
| (init) | 520,947 |
| 1 | 669,156 |
| 2 | 1,054,515 |
| 3 | 1,726,735 |
| 4 | 2,675,250 |
| 5 | 2,620,720 |
| 6 | 1,420,925 |
| 7 | 301,499 |
| 8 | 39,667 |
| 9 | 9,621 |

These are considerably better, particularly after more lift operations. Compression on its own is a 2-3x speedup.

The "lift" operation expands the tree because it can duplicate nodes or entire subtrees. Another optimization is to de-duplicate these, and make sure we only ever operate on unique nodes. This can be done by computing a hash for each node.

| Step | Unique Nodes |
| --- | --- |
| (initial) | 98,453 |
| 1 | 117,602 |
| 2 | 215,121 |
| 3 | 318,088 |
| 4 | 592,339 |
| 5 | 754,947 |
| 6 | 481,449 |
| 7 | 125,277 |
| 8 | 27,125 |
| 9 | 9,613 |

Whereas compression is more effective at reducing node counts after many lifts, de-duplication is better at reducing (unique) node counts initially and after fewer lifts. Only processing each unique node once can potentially save us a lot of time. One way to think about this is that it allows us to [memoize] the pivot operation. Another is that it turns the tree into a [DAG], similar to how you can compress a Trie by turning it into a [DAWG/DAFSA] (Directed Acyclic Word Graph).

[memoize]: https://en.wikipedia.org/wiki/Memoization
[dag]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
[DAWG/DAFSA]: https://en.wikipedia.org/wiki/Deterministic_acyclic_finite_state_automaton

### Use three letter classes instead of four

The net effect of all these changes is that we’re able to “break” difficult board classes much more efficiently. (ADD EXAMPLES)

If hard board classes aren’t so bad any more, maybe we should have more of them? If we use use three letter buckets instead of four, it significantly reduces the number of board classes we need to consider:

- Four letter buckets: 4^12/4 ≈ 4.2M boards classes
- Three letter buckets: 3^12/4 ≈ 133k board classes

The board classes with three letter buckets are going to be bigger and harder to break. But with our new tools, these are exactly the sort of boards on which we get the biggest improvement. So long as the average breaking time doesn’t go up by more than a factor of ~32x (4.2M/133k), using three buckets will be a win.

| Code Year | Buckets | Pace (s/class) |
| --------- | ------- | -------------- |
|      2009 | 4 | 4.53 |
|      2009 | 3 | 33.336 (7.4x slower) |
|      2025 | 4 | 1.175 |
|      2025 | 3 | 5.321 (4.5x slower) |

So three buckets would have been better with the 2009 algorithm, but it's an even bigger win in 2025. Since 4.5 * 7 ≈ 32, we'd expect this to be around a 7x speedup.

Why not keep going to two classes, or even just one? The cost is memory and reduced parallelism. “Chunkier” board classes require bigger trees, and RAM is a finite resource. Moreover, the fewer letter buckets we use, the more skewed the distribution of breaking times gets. Some board classes remain trivial to break (ones with all consonants, for example), but others are real beasts. On the full 3x4 run, the fastest board was broken in 0.003s whereas the slowest took 2297s. It’s harder to distribute these uneven tasks evenly across many cores or many machines to get the full speedup you expect from distribution. I think using slightly bigger chunks could still help, say two classes (consonant/vowel) in the corners, three on the edges and five in the middle.

## Putting it all together

For each board class, the algorithm is:

1. Build the evaluation tree.
2. “Lift” a few choice cells to the top.
3. Continue splitting cells without modifying the tree, ala the 2009 approach.

The right number of “lifts” depends on the board and the amount of memory you have available. Harder boards benefit from more lifts, but this takes more memory.

Using this approach, I was able to evaluate all the 3x4 Boggle board classes on a 192-node C4 cloud instance in 8–9 hours, roughly $100 of compute time. The results? There are exactly five boards that score more than 1600 points with the ENABLE2K word list:

- srepetaldnis (1651)
- srepetaldnic (1614)
- srepetaldnib (1613)
- sresetaldnib (1607)
- sresetaldnip (1607)

The best one is the same one I found through simulated annealing. The others are 1-2 character variations on it. It would have been more exciting if there were a new, never before seen board. But we shouldn’t be too surprised that simulated annealing found the global optimum. After all, it did for 3x3 Boggle, too. And Boggle is “smooth” in the sense that similar boards tend to have similar scores. It would be hard for a great board to “hide” far away from any other good boards.

## Next Steps

This is an exciting result! After 15 years, it is meaningful progress towards the goal of finding the globally-optimal 4x4 Boggle board.

There are still many optimizations that could be made. My 2025 code only wound up being a 3-4x speedup vs. my 2009 code when I ran it on the 192-core machine. This was because I had to dial back a few of the optimizations because I kept running out of memory. So changes that reduce memory usage would likely be the most impactful.

On the other hand, I don’t think there’s any tweaks to my current approach that will yield more than a 10x performance improvement. So while I might be able to break 3x4 Boggle more efficiently, it’s not going to make a big dent in 4x4 Boggle. Remember that 1,000,000x increase in difficulty from earlier. For 4x4 Boggle, we still need a different approach. (Or $100M of compute time!)

I have a few ideas about what that might be, but they’ll have to wait for another post.

## Appendix

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
