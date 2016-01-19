---
layout: post
title: Extending the Grid to Add 1,000 Photos to OldNYC
time: 12:36PM EST
datetime: 2016-01-19 12:36PM EST
summary: "A walkthrough of how I added about 1,000 new images to OldNYC.org by building a Manhattan Grid geocoder. This includes photos from intersections which no longer exist, e.g. in areas like the old Gaslight District, which was destroyed to create Stuytown."
---

I recently added around 1,000 new photos to the map on OldNYC. Read on to find
out how!

<div class="center">
<img src="/images/stuytown-update.gif" width=300 height=275 alt="OldNYC update around Stuytown">
</div>

At its core, OldNYC is based on [geocoding][]: the process of going from
textual addresses like "9th Street and Avenue A" to numeric latitudes and
longitudes. There's a bit of a mismatch here. The NYPL photos have 1930s
addresses and cross-streets, but geocoders are built to work with contemporary
addresses. OldNYC makes an assumption that contemporary geocoders will produce
accurate results for these old addresses. For NYC, this is usually a good
assumption! The street grid hasn't changed too much in the past 150 years. But
it is an assumption, and it doesn't always pan out.

Two of the most noticeable problem spots are Stuytown and Park Avenue South:

<div class="center">
<img src="/images/stuytown-pas-missing.png" width=600 height=550 alt="Stuytown and Park Avenue South have no images">
</div>

The lettered Avenues (A, B, C, D) used to continue above 14th street. This was
the [Gas House district][ghd]. But in the 1940s, this area was destroyed to
make way for the super-blocks of [Stuyvesant Town][stuytown]. Intersections
like "15th and A" do no exist in the contemporary Manhattan grid and geocoders
can't make sense of them. But there _are_ [photos there][15a]!

The problem for Park Avenue South is different. [Until 1959][pas], it was known
as 4th Avenue. So photographs from the 1930s are recorded as being at, for
example, "4th Avenue and 17th street", an interesection which no longer exists.
Again, contemporary geocoders can't make sense of this.

The frustrating thing here is that it's perfectly obvious where all of these
interesctions _should_ be. Manhattan has a [regular street grid][grid], after
all. So I set out to build my own Manhattan street grid geocoder.

To begin with, I gathered lat/lons for [every intersection][spreadsheet] that I
could. With [some simple logic][logic], this handled the Avenue renaming issue.

My initial idea to geocode unknown interesections was to interpolate
on the avenues. For example, to find where the intersection of 18th Street and
Avenue A should be, you can assume that the intersections of numbered streets
and Avenue A are evenly spaced and then find where the 18th street intersection
would fall:

<div class="center">
<img src="/images/extrapolation.png" width=552 height=428 alt="Extrapolation of intersections">
</div>

Mathematically, you fit linear regressions from cross-street to latitude and
longitude. This feels like it should work but, because the streets aren't all
perfectly spaced, it winds up producing results that don't quite look right.

While I was playing around with this approach, I realized that I was checking
the results using a different technique: continuing the straight lines of the
streets until they intersected:

<div class="center">
<img src="/images/continued-lines.png" width=403 height=329 alt="Extrapolation of streets">
</div>

Mathematically, this means that you fit a linear regression to the
latitude→longitude mapping for each Street and Avenue. To find an intersection,
you find the point where these lines intersect. This works so long as the
Streets and Avenues are straight. Fortunately, with a few exceptions like
Avenue C and the West Village, they are (r<sup>2</sup>&gt;0.99).

This approach produced very good results. The oddities which remained were as
likely to be problems with the data as with the geocoder ([one image][25d] was
non-sensically labeled as "25th & D", which extrapolates to somewhere in the
East River).

While Stuytown and Park Avenue South were clear winners, new photos appeared
all over the map:

<div class="center">
<img src="/images/oldnyc-update.gif" width=400 height=400 alt="Update for lower Manhattan">
</div>

It even helped uptown:

<div class="center">
<img src="/images/oldnyc-uptown-update.gif" width=640 height=400 alt="Update for Uptown">
</div>

All told, there are about 1,000 new images on the map. Go check them out and!
And please help transcribe the text on the back of them. My [OCR system][ocr]
didn't run on the new images, so they're sorely lacking descriptions.

Here are a few favorites:

<div class="center">
<a href="https://www.oldnyc.org/#716426f-a"><img src="/images/716426f-a.jpg" width=600 height=421></a>
<br>
<i>Looking down Avenue B from 15th to 17th Street. This Avenue no longer exists.</i>
</div>

<div class="center">
<a href="https://www.oldnyc.org/#708194f-a"><img src="/images/708194f-a.jpg" width=482 height=348></a>
<br>
<i>The Everett House hotel at Union Square in 1906. This building no longer
exists, but there's a new hotel (the W) at the same location.</i>
</div>


[geocoding]: https://en.wikipedia.org/wiki/Geocoding
[ghd]: https://en.wikipedia.org/wiki/Gashouse_District
[stuytown]: https://en.wikipedia.org/wiki/Stuyvesant_Town%E2%80%93Peter_Cooper_Village
[pas]: https://en.wikipedia.org/wiki/Park_Avenue#History
[grid]: https://en.wikipedia.org/wiki/Commissioners%27_Plan_of_1811
[spreadsheet]: https://docs.google.com/spreadsheets/d/1Kv0xXYHXUrlFmyIF92NsWTMuuRWAl-heBEI_OejcBA0/edit#gid=0
[25d]: http://digitalcollections.nypl.org/items/510d47dd-07a6-a3d9-e040-e00a18064a99
[ocr]: http://www.danvk.org/2015/01/09/extracting-text-from-an-image-using-ocropus.html
[15a]: http://www.oldnyc.org/#711319f-a
[logic]: https://github.com/danvk/oldnyc/blob/9aa15e0a4ce46d746531c7f9531ff4a50e17a53f/grid/gold.py#L21-L41
