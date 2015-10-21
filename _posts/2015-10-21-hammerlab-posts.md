---
layout: post
title: Dan writes on HammerLab
summary: Fear not, loyal readers, I haven't stopped blogging. I've just been doing it elsewhere.
date: 2015-10-21 02:03PM EDT
---

I haven't written a substantial blog post on danvk.org [since January][1].
Instead, I've been writing over on my groups's blog at [hammerlab.org][2].

Here are the posts I've written or edited:

* [SVG→Canvas, the pileup.js Journey][p1] (13 Oct 2015)

    In which I explain why we changed from using SVG to using canvas for our
    genome browser (spoiler: it's performance). This also introduces
    [data-canvas][], which compensates for some of the drawbacks of canvas,
    e.g. difficulty in tracking clicks and writing tests.

* [Bundling and Distributing Complex ES6 Libraries in an ES5 World][p2] (09 Jul 2015)

    I helped edit this post, which was written by [Arman Aksoy][arman]. It
    outlines our approach to writing ES6 JavaScript while distributing/bundling
    it for ES5 clients.

* [Introducing pileup.js, a Browser-based Genome Viewer][p3] (19 Jun 2015)

    This post introduces pileup.js, the in-browser genome visualizer I've been
    working on for most of the past year.

* [Testing React Web Apps with Mocha][p5] (14 Feb 2015)
* [Testing React Web Apps with Mocha (Part 2)][p4] (21 Feb 2015)

    A two-parter in which I explain how we set up testing for our React web app
    using Mocha, rather than Jest. Since writing this post, I've completely
    changed my mind about how web testing should be done. If your code is
    intended to be run in the browser, then you should test it in the browser,
    rather than using Node as these posts suggest.

* [Faster Pileup Loading with BAI Indices][p6] (23 Jan 2015)

    BAM is a very widely used bioinformatics file format which stores aligned
    reads from a genome. These files can be huge, so the BAM Index (BAI) format
    was created to speed up retrieval. We found that the BAI was _also_ too
    large for convenient access on the web, so we created an index of the
    index.

* [Streaming from HDFS with igv-httpfs][p7] (05 Dec 2014)

    How we got data from HDFS into our genome viewer of choice by building a
    small piece of infrastructure. We've since stopped using this. Nowadays we
    have an NFS mount for our HDFS file system and serve from that using nginx.


[1]: http://www.danvk.org/2015/01/11/training-an-ocropus-ocr-model.html
[2]: http://www.hammerlab.org/
[p1]: http://www.hammerlab.org/2015/10/13/svg-canvas-the-pileup-js-journey/
[p2]: http://www.hammerlab.org/2015/07/09/bundling-and-distributing-complex-es6-libraries-in-an-es5-world/
[p3]: http://www.hammerlab.org/2015/06/19/introducing-pileup-js-a-browser-based-genome-viewer/
[p4]: http://www.hammerlab.org/2015/02/21/testing-react-web-apps-with-mocha-part-2/
[p5]: http://www.hammerlab.org/2015/02/14/testing-react-web-apps-with-mocha/
[p6]: http://www.hammerlab.org/2015/01/23/faster-pileup-loading-with-bai-indices/
[p7]: http://www.hammerlab.org/2014/12/05/igv-httpfs/
[arman]: http://arman.aksoy.org/
[data-canvas]: https://github.com/hammerlab/data-canvas
