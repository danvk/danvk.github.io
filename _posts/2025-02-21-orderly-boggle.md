---
layout: post
title: 'Boggle Revisited: A Thrilling Insight and the Power of Algorithms'
time: 12:15PM EST
datetime: 2025-02-21 12:15PM EST
summary: "Just as I was ready to wrap up work on Boggle, a thrilling flash of insight pulls me right back in."
preview_png: /images/boggle/tree-orderly.png
---

At the end of my [last post] on Boggle, I’d achieved perhaps a 10x speedup over my [2009 approach] and run my code for 8-9 hours on a 192-core machine to definitively prove that this is the highest-scoring 3x4 Boggle board for the ENABLE2K word list:

```
S L P
I A E
N T R
D E S
```

I was happy with the work. All that was left was to write one final blog post reflecting back on the process.

Then I had a thrilling flash of insight that made me dive right back in.

## How bounds are computed

To understand the insight, we need to talk a bit more about how you compute an upper bound on a class of boards. I [wrote about this] back in 2009, but let’s recap now using some visualizations.

To keep things small, let's play 2x2 Boggle. We'll consider this board class:

```
0:{a,b} 2:{e,f}
1:{c,d} 3:{g,h}
```

Each cell can be one of two different letters, so this board class contains 2^4=16 different 2x2 Boggle boards:

```
a e   a e   a f   a f
c g   c h   c g   c h

a e   a e   a f   a f
d g   d h   d g   d h

b e   b e   b f   b f
c g   c h   c g   c h

b e   b e   b f   b f
d g   d h   d g   d h
```

Some  have zero points (`bdfh`) while the highest-scoring one has 8 points (`adeg`).

We’d like to compute an upper bound on the highest-scoring board in this class without enumerating every board in it. To do so, we traverse the board [just like we would] to find the words on a regular Boggle board. We [prune the search] using valid prefixes: a path starting with “ac” is worth exploring, but one starting with “hd” is not.

Unlike a regular Boggle board, though, we’ll encounter cells with multiple possible letters. In this case we try each of them and pick the one that leads to the most points.

You can visualize this board traversal as a tree:

![Tree representation of the traversal of a 2x2 Boggle Board Class](/images/boggle/tree-old-style.svg)

There’s a lot of information in this image:

- Every word that can be found on any board in the board class appears in a double-outlined node (”cage”, “each”, “age”, “aged”, “ache”, etc.).
- Each node tracks an upper bound for its tree, the most points you can find under it.
- There are two types of nodes, sum nodes and choice nodes.
  - To calculate the bound for a sum node, add the bounds of its children. This models how you can move in any direction from a cell.
  - To calculate the bound for a choice node, take the max of its children. This models that, to get a concrete board, you have to choose a single letter for each cell.
- The left-most node (ROOT) is a sum node, modeling how you can find a word starting from any cell. Its bound is an upper bound on the board class as a whole.
- The upper bound for this board (14 points), is, indeed, higher than the highest-scoring board in the class (8 points).

Back in 2009, I [implemented this] using recursive function calls, so that the tree structure was implicit in the traversal order. In 2025, I [explicitly allocated] this tree in memory so that I could [perform operations] on it.

We’re mostly interested in the bound, so let’s simplify the diagram by throwing away everything *except* the bound. Here’s what that looks like:

![Simplified tree representation using color to represent choices](/images/boggle/tree-color.svg)

The colors represent individual cells:

- <span style="background: LightSkyBlue">Blue:</span> Cell 0 / Top Left (A or B)
- <span style="background: PaleGreen">Green:</span> Cell 1 / Bottom Left (C or D)
- <span style="background: LightSalmon">Orange:</span> Cell 2 / Top Right (E or F)
- <span style="background: Khaki">Brown:</span> Cell 3 / Bottom Right (G or H)

The number is the bound on each node. Nodes with a white background are sum nodes and/or words. You can’t read the individual words off this diagram any more, just the points that they contribute.

To recap how the bounds flow:

- White nodes (sum nodes) are the sum of their children, plus any words on this node.
- Colored nodes (choice nodes) are the max of their children.

And that is how you calculate an upper bound on a class of boards.

The upper bound here isn’t precise: 14 is larger than 8. Why is that? One thing that’s striking in the colorful tree is just how jumbled the colors are. There’s green on the left, right and middle. There’s orange everywhere. In terms of the Boggle board, this means we make the same choice (which letter to pick for each cell) many times in many different places in the tree. And we might not make the same choice every time. It’s not possible to find both CAGE and AGED on the same board, because the bottom left cell (1/green) has to be either a C or a D. It can’t be both.

The last post explained how we could tighten the bound by synchronizing these choices. In terms of the tree, this means applying lots of [pivot operations] to “lift” one of the choices to the top (left). Here’s what the tree looks like after lifting the choice for cell 0 (blue):

![Tree after lifting choice on cell 0 to the left](/images/boggle/tree-color-lift0.svg)

Now there’s a single blue choice node on the left, and the bound has gone down. In this case there are fewer nodes after lifting, but that’s not usually the case. The choice for cell 0 (blue) is synchronized now, but the other choices are not. To keep improving the bound, we can lift another choice. Let’s do green:

![Same tree after lifting cell 1](/images/boggle/tree-color-lift1.svg)

The bound has dropped again, and the tree is getting more orderly. We can keep going. Cell 2, orange, is next:

![Same tree after lifting cell 2](/images/boggle/tree-color-lift2.svg)

It won't improve the bound but, for completeness, we can also lift cell 3 (brown):

![Same tree after lifting cell 3](/images/boggle/tree-color-lift3.svg)

Each lift adds a layer to a “choice pyramid” at the top of the tree, until what we’re left with is just a decision tree. The bound on this is tight, and you can find the board that produces the best score by following the max path down the tree.

Lifting is an effective way to tighten the bound on a class of boards, but it’s computationally expensive and it gobbles up enormous amounts of memory for large trees.

## Orderly Trees

I tried to imagine what “lifting” meant in terms of how you traversed the board. What if there were a way to construct the lifted tree directly?

One interesting property of the lifted tree is that it doesn’t encode the letters of a word in the order that they appear in that word. AGED, for example, might be represented more like GEDA after lifting. You could imagine creating an effect like this while traversing the Boggle board by allowing yourself to add letters at the start of the word, in addition to the end, or even the middle.

Once you do this, though, you have to worry about finding the same word twice. To avoid double-counting, you could sort the cells that you used to spell the word.

And *that* leads us to the blazing flash of insight. We’re free to add the cells in a word in any order we like. So why don’t we *always* sort the cells before adding a word to the tree? This will naturally organize the tree in a way that synchronizes choices.

I’ve taken to calling these “orderly trees” because of the sorting and because they’re more organized than the trees we’ve been working with before. Here’s the tree for the `ab cd ef gh` board class we’ve been looking at in this post:

![Same tree as before, constructed using the orderly algorithm](/images/boggle/tree-orderly.svg)

There are a few things to note straightaway:

- The tree is much smaller than before.
- The colors are much more organized, even without lifting: a single blue node on the left, green nodes mostly on the left, brown nodes always on the right.
- Green nodes always appear to the right of blue nodes. Orange is always to the right of green, and tan is always to the right of orange. This reflects how we sort the cells before adding words.
- The bound is much tighter than before: 8 vs. 14. In fact, 8 is already the tightest possible bound for this board class since `adeg` scores 8 points.
- There are sum nodes only where it’s possible to “skip” a cell in the order.

This seems great! Surely reducing the bound and shrinking the tree will speed up the breaking process. But by how much? It’s not at all clear whether this is a 2x, 10x or a 100x optimization.

You might object: if we sort the cells, how do we distinguish anagrams like ACHE and EACH? Remember from the last post that we’re really playing [Multi-Boggle], where you’re allowed to find the same word twice so long as you find it in a different way. That saves us here. Because ACHE and EACH follow different paths, we add their points twice. They wind up on the same node in the tree, but they do both count.

## Orderly Results

This was exciting! A great idea with unknown upside. I [implemented it](https://github.com/danvk/hybrid-boggle/pull/21) to find out how helpful it was.

The reduction in bounds was enormous and got bigger for larger and harder board classes:

- A big 3x3 board: 9,359 → 1,449 points (6x fewer)
- Some 3x4 boards: 36,134 → 3,858 (9x), 51,317 → 4,397 (12x), 194,482 → 9,884 (20x)

Surely a 20x reduction in bounds would speed up the breaking process, but by how much? On my test set of 50 3x4 board classes, this took me from 333→29s, an 11.5x speedup. Nice!

Between this and a few other optimizations, I was able to redo the [full 3x4 Boggle run] from the last post. For that run, I used a [192-core C4] on GCP for 8-9 hours to find all the 3x4 boards with 1600+ points. For this run, I used three cores on my M2 Macbook for about 19 hours to find all the boards with 1500+ points. That’s a 30x speedup! And the Macbook was solving a harder problem.

Why not an even bigger speedup? Because the trees are more “orderly”, there’s less room for lifting to improve the bounds. Lifting is still helpful, especially on more complex boards, just much less so than with the old trees.

What about 4x4 Boggle? I estimate that it’s about [50,000x harder] than 3x4 Boggle. So while a 30x speedup is huge, we’re still fighting against a 1,500x headwind. If we were to do the full 4x4 run on GCP, I estimate that orderly trees would reduce the bill from around $500,000 to $15,000. Now that’s an optimization!

Orderly Trees are a great illustration of the power of algorithmic advances: one good idea let me do on my laptop what had previously needed a 192-core cloud machine. And it would save $485,000 on the 4x4 run!

That’s still a bit more than I’m willing to pay (if you feel otherwise, let me know!) but we’re getting closer. A few more insights and the general trend towards lower compute costs might just bring it within reach.

Barring any more surprising insights, the next posts will look at the best 3x4 board, what it can tell us about 4x4 Boggle, and will offer my reflections on this process.

As always, you can find all the code for this post in the <img alt="GitHub Logo" src="/images/github-mark.svg" height="16" style="display:inline-block"> [danvk/hybrid-boggle][repo] repo.

[last post]: https://www.danvk.org/2025/02/13/boggle2025.html
[2009 approach]: https://www.danvk.org/2025/02/10/boggle34.html#how-did-i-find-the-optimal-3x3-board-in-2009
[wrote about this]: https://www.danvk.org/wp/2009-08-08/breaking-3x3-boggle/index.html#:~:text=fold%20for%20more%E2%80%A6-,Upper%20Bounds,-Now%20on%20to
[just like we would]: https://www.danvk.org/wp/2007-01-30/boggle-2-the-shortest-solver/index.html
[prune the search]: https://www.danvk.org/wp/2007-02-06/in-which-we-discover-that-tries-are-awesome/index.html
[implemented this]: https://github.com/danvk/performance-boggle/blob/master/3x3/ibuckets.cc
[explicitly allocated]: https://www.danvk.org/2025/02/13/boggle2025.html#the-evaluation-tree
[perform operations]: https://www.danvk.org/2025/02/13/boggle2025.html#pivot-and-lift-operations
[pivot operations]: https://www.danvk.org/2025/02/13/boggle2025.html#pivot-and-lift-operations
[Multi-Boggle]: https://www.danvk.org/2025/02/13/boggle2025.html#multi-boggle
[full 3x4 Boggle run]: https://www.danvk.org/2025/02/13/boggle2025.html#putting-it-all-together
[192-core C4]: https://cloud.google.com/compute/docs/general-purpose-machines#c4_series
[50,000x harder]: https://www.danvk.org/2025/02/10/boggle34.html#how-much-harder-are-3x4-and-4x4-boggle
[repo]: https://github.com/danvk/hybrid-boggle
