---
layout: post
title: Finding blocks of text in an image using Python, OpenCV and numpy
summary: In which I develop a computer vision algorithm to find blocks of text inside a larger image. This is trivial for humans, but tricky for computers!
time: 06:27PM EST
---

As part of an [ongoing project][1] with the New York Public Library, I've been
attempting to [OCR][2] the text on the back of the [Milstein Collection][mil]
images.  Here's what they look like:

<div class="center">
<img src="/images/milstein-backing.jpg" width="332" height="512">
</div>

A few things to note:

- There's a black border around the whole image, gray backing paper and then white paper with text on it.
- Only a small portion of the image contains text.
- The text is written with a tyepwriter, so it's monospace. But the typewriter font isn't [always consistent][3] across the collection. Sometimes a [single image][4] has two fonts!
- The image is slightly rotated from vertical.
- The images are ~4x the resolution shown here (2048px tall)
- There are ~34,000 images: too many to affordably [turk][5].

OCR programs typically have to do some sort of [page-layout analysis][7] to
find out where the text is and carve it up into individual lines and
characters. When you hear "OCR", you might think about fancy Machine Learning
techniques like [Neural Nets][8]. But it's a dirty secret of the trade that
page layout analysis, a much less glamorous problem, is at least as important
in getting good results.

The most famous OCR program is [Tesseract][6], a remarkably long-lived open
source project developed over the past 20+ years at HP and Google. I quickly
noticed that it performed much better on the Milstein images when I manually
cropped them down to just the text regions first:

<div class="center">
<img src="/images/cropping.png" width="620" height="512">
</div>

So I set out to write an image cropper: a program that could automatically find
the green rectangle in the image above. This turned out to be surprisingly
hard!

[Computer Vision][9] problems like this one are difficult because they're so
incredibly easy for humans. When you looked at the image above, you could
immediately isolate the text region. This happened instantaneously, and you'll
never be able to break down exactly how you did it.

The best we can do is come up with ways of breaking down the problem in terms
of operations that are simple for computers. The rest of this post lays out a
way I found to do this.

First off, I applied the [canny edge detector][10] to the image. This produces
white pixels wherever there's an edge in the original image. It yields
something like this:

<div class="center">
<img src="/images/edges.png" width="332" height="512">
</div>

This removes most of the background noise from the image and turns the text
regions into bright clumps of edges. It turns the borders into long, crisp
lines.

The sources of edges in the image are the borders and the text. To zero in on
the text, it's going to be necessary to eliminate the borders.

One really effective way to do this is with a [rank filter][11]. This
essentially replaces a pixel with something like the median of the pixels
to its left and right. The text areas have lots of white pixels, but the
borders consist of just a thin, 1 pixel line. The areas around the borders will
be mostly black, so the rank filter will eliminate them. Here's what the image
looks like after applying a vertical and horizontal rank filter:

<div class="center">
<img src="/images/edges-rankfilter.png" width="332" height="512">
</div>

The borders are gone but the text is still there! Success!

While this is effective, it still leaves bits of text _outside_ the borders
(look at the top left and bottom right). That may be fine for some
applications, but I wanted to eliminate these because they're typically
uninteresting and can confuse later operations. So instead of applying the
rank filter, I found the [contours][12] in the edge image. These are sets of
white pixels which are connected to one another. The border contours are easy
to pick out: they're the ones whose [bounding box][bbox] covers a large
fraction of the image:

<div class="center">
<img src="/images/edges-bordercontour.png" width="332" height="512">
</div>

With polygons for the borders, it's easy to black out everything outside them.

What we're left with is an image with the text and possibly some other bits due
to smudges or marks on the original page.

At this point, we're looking for a crop `(x1, y1, x2, y2)` which:

1. maximizes the number of white pixels inside it and
2. is as small as possible.

These two goals are in opposition to one another. If we took the entire image,
we'd cover all the white pixels. But we'd completely fail on goal #2: the crop
would be unnecessarily large. This should sound familiar: it's a classic
[precision/recall tradeoff][13]:

- The recall is the fraction of white pixels inside the cropping rectangle.
- The precision is the fraction of the image outside the cropping rectangle.

A fairly standard way to solve precision/recall problems is to optimize the [F1
score][14], the harmonic mean of precision and recall. This is what we'll try
to do.

The set of all possible crops is quite large: _W_<sup>2</sup>_H_<sup>2</sup>,
where _W_ and _H_ are the width and height of the image. For a 1300x2000 image,
that's about 7 trillion possibilities!

The saving grace is that most crops don't make much sense. We can simplify the
problem by finding individual chunks of text. To do this, we apply [binary
dilation][15] to the de-bordered edge image. This "bleeds" the white pixels
into one another. We do this repeatedly until there are only a few connected
components. Here's what it looks like:

<div class="center">
<img src="/images/edges-dilated.png" width="560" height="373">
</div>

As we hoped, the text areas have all bled into just a few components. There are
five connected components in this image. The white blip in the top right
corresponds to the "Q" in the original image.

By including some of these components and rejecting others, we can form good
candidate crops. Now we've got a [subset sum problem][16]: which subset of
components produces a crop which maximizes the F1 score?

There are 2<sup>_N_</sup> possible combinations of subsets to examine. In
practice, though, I found that a greedy approach worked well: order the
components by the number of white pixels they contain (in the original image).
Keep adding components while it increases the F1 score. When nothing improves
the score, you're done!

Here's what that procedure produces for this image:

<div class="center">
<img src="/images/edges-chosen.png" width="560" height="373">
</div>

The components are ordered as described above. Component #1 contains the most
white pixels in the original image. The first four components are accepted and
the fifth is rejected because it hurts the F1 score:

1. Accept #1, F1 Score → 0.886
2. Accept #2, F1 Score → 0.931
3. Accept #3, F1 Score → 0.949
4. Accept #4, F1 Score → 0.959
5. Reject #5 (F1 Score → 0.888)

Applying this crop to the original image, you get this:

<div class="center">
<img src="/images/milstein-cropped.jpg" width="875" height="233">
</div>

That's 875x233, whereas the original was 1328x2048. That's a **92.5% decrease in
the number of pixels, with no loss of text**! This will help any OCR tool focus
on what's important, rather than the noise. It will also make OCR run faster,
since it can work with smaller images.

This procedure worked well for my particular application. Depending on how you
count, I'd estimate that it gets a perfect crop on about 98% of the images, and
its errors are all relatively minor.

If you want to try using this procedure to crop your own images, you can find
the [source code here][17]. You'll need to install `OpenCV`, `numpy` and `PIL`
to make it work.

I tried several other approaches which didn't work as well. Here are some
highlights:

- I ran the image through Tesseract to find areas which contained letters.
  These should be the areas that we crop to! But this is a bit of a chicken
  and the egg problem. For some images, Tesseract misses the text completely.
  Cropping fixes the problem. But we were trying to find a crop in the first
  place!

- I tried running the images through [unpaper][18] first, to remove noise and
  borders. But this only worked some of the time and I found unpaper's
  interface to be quite opaque and hard to tweak.

- I ran canny, then calculated row and column sums to optimize the x- &
  y-coordinates of the crop independently. The text regions did show up clearly
  in charts of the row sums:
  <img src="/images/milstein-rowsums.png" width="379" height="258"><br>
  The four spikes are the tops and bottoms of the two borders. The broad
  elevated region in the middle is the text. Making this more precise turned
  out to be hard. You lose a lot of structure when you collapse a
  dimension—this problem turned out to be easier to solve as a single 2D
  problem than as two 1D problems.

In conclusion, I found this to be a surprisingly tricky problem, but I'm happy
with the solution I worked out.

In the next post, I'll talk about my experience running OCR tools over these
cropped images.


[1]: http://www.danvk.org/wp/2013-02-09/finding-pictures-in-pictures/
[2]: http://en.wikipedia.org/wiki/Optical_character_recognition
[3]: http://digitalgallery.nypl.org/nypldigital/dgkeysearchdetail.cfm?trg=1&strucID=397983&imageID=708193b&total=683&num=160&word=4002&s=1&notword=&d=&c=&f=13&k=3&lWord=&lField=&sScope=Name&sLevel=&sLabel=Brown%20Brothers%20%28New%20York%29&sort=&imgs=20&pos=163&e=w&cdonum=0
[4]: http://digitalgallery.nypl.org/nypldigital/dgkeysearchdetail.cfm?trg=1&strucID=362388&imageID=701471b&total=534&num=180&word=Pumps&s=3&notword=&d=&c=&f=2&k=1&lWord=&lField=&sScope=&sLevel=&sLabel=&sort=&imgs=20&pos=184&e=w&cdonum=0
[5]: https://www.mturk.com/mturk/welcome
[6]: https://code.google.com/p/tesseract-ocr/
[7]: http://en.wikipedia.org/wiki/Document_layout_analysis
[8]: http://en.wikipedia.org/wiki/Artificial_neural_network
[9]: http://en.wikipedia.org/wiki/Computer_vision
[10]: http://en.wikipedia.org/wiki/Canny_edge_detector
[11]: http://scikit-image.org/docs/dev/auto_examples/applications/plot_rank_filters.html
[12]: http://docs.opencv.org/trunk/doc/py_tutorials/py_imgproc/py_contours/py_contours_begin/py_contours_begin.html
[13]: http://en.wikipedia.org/wiki/Precision_and_recall
[14]: http://en.wikipedia.org/wiki/F1_score
[15]: http://homepages.inf.ed.ac.uk/rbf/HIPR2/dilate.htm
[16]: http://en.wikipedia.org/wiki/Subset_sum_problem
[17]: https://github.com/danvk/oldnyc/blob/master/ocr/tess/crop_morphology.py
[18]: https://www.flameeyes.eu/projects/unpaper
[mil]: http://digitalgallery.nypl.org/nypldigital/dgdivisionbrowseresult.cfm?div_id=hh
[bbox]: http://en.wikipedia.org/wiki/Minimum_bounding_box
