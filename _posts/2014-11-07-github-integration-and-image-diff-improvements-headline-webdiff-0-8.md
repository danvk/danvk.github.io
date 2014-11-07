---
title: GitHub integration and Image Diff improvements headline webdiff 0.8
layout: post
time: 01:37PM EST
---

I've released [webdiff 0.8.0][1], which you can install via:

    pip install --upgrade webdiff

The most interesting new features are GitHub pull request integration and expanded image diffing modes.

You can view a GitHub Pull Request in webdiff by running something like:

    webdiff https://github.com/hammerlab/cycledash/pull/175

Any github Pull Request URL will do. This will pull down the files from GitHub
to local disk and then diff them in the standard webdiff UI. My main use case
for this is looking at screenshot diffs and thinking "I want to see bigger images in this PR diff". Speaking of which…

<img src="/images/webdiff-swipe.gif" width="700" height="451">

This version includes a few improvements to the image diff mode:

  1. A "shrink to fit" option, which is enabled by default. This shrinks large images to fit in your browser window.
  1. Consistent use of red/green borders for before/after images.
  1. "Onion Skin" diff mode, which fades one image into the other.
  1. "Swipe" diff mode, which lets you lets you drag a dividing line between the images.

These are based on [GitHub's image view modes][2]. I still find "blink" to be
the most helpful for spotting small changes, but now you've got choices!

There were a few smaller changes as well. Full release notes are [on PyPI][1].


[1]: https://pypi.python.org/pypi/webdiff/0.8.0
[2]: https://github.com/blog/817-behold-image-view-modes
