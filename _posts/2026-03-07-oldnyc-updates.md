---
layout: post
title: 'AI adds 10,000 more photos to OldNYC'
time: 11:30AM EST
datetime: 2026-03-01 12:34AM EST
summary: "To view the past, we must embrace the future."
---

Over the past two years, I've quietly made some major updates to the [OldNYC photo viewer][oldnyc]. These add up to a site that has more photos in more accurate locations. It's also less expensive to run and has fewer legal issues. These are driven by advances in AI like LLMs, as well as the proliferation of the OpenStreetMap (OSM) ecosystem.

If you visited OldNYC back in 2016, it had about 39,000 photos. Today, it has 49,000. That's 10,000 more historic photos on the map for you to find and enjoy!

Most of these changes happened in 2024, but I'm only just announcing them now, in 2026. (I got distracted by an [unrelated project][boggle].) If you've never visited OldNYC or haven't visited it in years, [take a look!][oldnyc] You might find some photos you missed.

The rest of this post describes what's changed since 2016.

📪 If you'd like to be informed of OldNYC updates, please subscribe to the new mailing list! If you subscribed before 2026, you'll need to subscribe again. Sorry, MailChimp deleted the old list. 😡

[oldnyc]: https://www.oldnyc.org/
[boggle]: https://www.danvk.org/2025/08/25/boggle-roundup.html

## OpenAI + OpenStreetMap for geolocation

At its core, OldNYC is all about _geocoding_: taking a description of a location like "Broad Street, south from Wall Street" and producing a latitude and longitude, so that the photo can be placed on a map.

Back in 2015, geocoding mostly involved looking for cross-streets in the title ("Manhattan: Broad Street - Wall Street") and running these through the Google Maps Geocoding API to get a latitude and longitude. This usually worked well, but Google (reasonably!) geocodes for the present day. If the intersection in the photo no longer exists, it either wouldn't make it onto the map, or it would wind up in the wrong borough (there are many numbered grids in NYC).

I made two big changes to this process in 2024.

### GPT for Hard Geocodes

First, I use the OpenAI API to extract location information for hard-to-locate photos.

Most of the NYPL's images can be located based on cross-streets in the image title. But for many thousands of images, either the title doesn't fit that pattern, or the cross-streets don't produce a location. In those cases, it [proved worthwhile] to use OpenAI API (specifically gpt-4o) to try and extract location information from the image description.

Here's a [nice example](https://www.oldnyc.org/#732679f-a):

![Brooklyn Public School 143](/images/732679f-a.jpg)

> Public Schools - Brooklyn - P.S. 143. 1930
>
> Havemeyer Street, west side, from North 6th to North 7th Streets, showing Public School No. 143. The view is north from North 6th Street.

There's no Public School 143 in Brooklyn today, so the title can't be geocoded. Using the description, GPT was able to extract three possible locations for this photo:

- intersection: Havemeyer Street & North 6th Street
- interesction: Havemeyer Street & North 7th Street
- place name: Public School No. 143

Both intersections exist in OSM. OldNYC takes the first, and the image gets a location.

This isn't rocket science, but there's more human understanding that goes into a task like this than you might realize. The description just says "North 6th," but GPT realizes it means "North 6th Street." It's able to ignore the "west side" and understand the description of two intersections. This is the sort of not-quite-trivial task that computers have historically been bad at, but that LLMs are very good at.

Overall, using GPT netted locations for around 6,000 additional photographs. These are mostly in the correct locations, but if you spot a problem, please click the feedback link!

- At this point, we're locating ~87% of the images that can possibly be located. (Was 77%.)
- Of the images on the site, ~96% are in the correct location. (Was 97%.)

[proved worthwhile]: https://github.com/danvk/oldnyc/pull/164

### OSM for Geocoding

Second, I switched from the Google Maps Geocoding API to [OpenStreetMap][osm] and some other sources. This is a [bit more work][osm-geo], but it gives me much more control over the results and reduces reliance on an unpredictable, expensive, and legally cumbersome API.

Here's a [fun example](https://www.oldnyc.org/#704487f-a):

![Image of Fulton Street elevated line in 1937](/images/704487f-a.jpg)

> Brooklyn: Fulton Street - Nassau Street
>
> 186-200 Fulton Street, between Nassau (right), and Pineapple Streets, showing the Fulton Street elevated lines, as seen across clearing, from Nassau at Liberty Streets. In the background is the Hotel St. George. Also shown, is a view westward on the south side of Nassau Street, which becomes Orange Street after it crosses Fulton Street.

The title is an intersection, so we can try to geocode that. Fulton & Nassau _did_ intersect in Brooklyn back in 1930, but they don't today. (Thanks, [Robert Moses]!) Google really wants to come up with a location, though, so it reports the lat/long for Fulton and Nassau in _Manhattan_, where streets with those names [still intersect today]. This is clearly wrong, so I didn't include this photo on the old site.

Today, something better happens. I [pulled in] data from the NYPL's [historical streets project], which aimed to map historic streets of New York City that may or may not still exist today. That data set _does_ have this intersection, so OldNYC gets the location exactly right!

[Robert Moses]: https://en.wikipedia.org/wiki/Robert_Moses
[osm]: https://openstreetmap.org
[osm-geo]: https://github.com/danvk/oldnyc/pull/179
[pulled in]: https://github.com/danvk/oldnyc/pull/185
[historical streets project]: https://github.com/nypl-spacetime/nyc-historical-streets?tab=readme-ov-file
[still intersect today]: https://www.google.com/maps/place/Fulton+St+%26+Nassau+St,+New+York,+NY+10038

## AI-powered OCR

Most of the photos on OldNYC have descriptive text associated with them. If you click through to the NYPL Digital Collections site, though, you'll see that this text is a scan of typewriter text. It's an image, it hasn't been transcribed. Here's a typical example:

![Typewriter text reading "Clinton Street, south from Livingston Street."](/images/ocropus/start.png)

When I launched OldNYC [back in 2015][launch], I wanted to show these descriptions _as text_ on the site. They add context to the photos, and the site is much richer with them. Going from a photograph of text to the text itself is called Optical Character Recognition (OCR), and it's a classic problem in computer vision. OCRing 30,000+ images back in 2015 was the biggest challenge in launching the site.

My solution back then involved a bespoke algorithm to [find the text in the image][1] and a [custom model][2] using a tool called Ocropus. At the end of the day it got 99+% of the characters right. Still, when you're reading, having a typo in 1/100 letters registers as "lots of mistakes." I solved this with some clever UX: I added a "Fix Typos" link that let you correct mistakes. Once you corrected one transcription, it would show you another. This triggered New Yorkers' collective OCD and users submitted thousands of corrections.

Fast-forward to 2024 and the landscape of Machine Learning / AI is completely different. I redid all the OCR, this time using the OpenAI API (specifically gpt-4o-mini). Overall this was a [big win][3]. The site had text for 25,000 images before. Now it has text for 32,000. Of the ~22,000 images where I had text both before and from GPT, GPT is better ~75% of the time and only clearly worse ~2% of the time.

Here's a [compelling example](https://www.oldnyc.org/#709056f-a):

![descriptive text in an italic font](/images/709056b.jpg)

This description is perfectly legible, but it uses a different font than most. This completely threw off the old OCR model. Here's how the first line used to look on OldNYC:

> 2 )e g ,eww (w g 0 3CR: 7e(\n3y:\nJ .N DTIRITIUY Di11: TrO11 : hRiTTI1 ORY: 11NiA '(TTRRTRir1 1iTi 17A1iNN 1 T:TR1N, (RiRN: 1:T N1NORRR1N 11. 1(71Tr o1 11N. ANTTilrN rhO11. 11. RO11Ni R1Y\nDiuil1 y Richwrw 'NiduE (rohNr (TN11eIO227T : TiTi I(TO TO Ii1\nTT EY RYOTTN(~ :N1 TNi:i1 PThT1 ND NAh Nor0,...

It goes on from there and doesn't get much better. GPT is smarter. It isn't thrown off by the change in fonts, and it [nails the description](https://www.oldnyc.org/#709056f-a).

The OCR update was a bit of an odyssey and deserves a blog post of its own. But for now, here are a few other interesting tidbits:

- GPT was eventually excellent, but it took some work.
  - The typewriter images on the NYPL web site are low resolution. GPT did poorly with these. It needed higher-resolution imagery, which I got directly from the library.
  - The code I wrote back in 2015 to [find the text in the images][1] remained critical. GPT did much better with cropped images than full pages with lots of blank space. This may be because it has a maximum image width of 2048px, so uncropped images got shrunk, effectively lowering their resolution.
  - I expected that giving GPT some context about the image, for example the title and date from the NYPL records, would help it resolve unclear text in the image. Instead, the opposite happened. It would hallucinate text based on the title! This text looked plausible, but was nowhere to be found in the image. GPT-based OCR worked much better with _just_ the image.
  - GPT had trouble transcribing upside-down and rotated images. It often hallucinated text that wasn't there. Detecting upside-down images with classic techniques is notoriously hard, but GPT is actually really good at it! The trick was to give it an escape hatch. It can either respond with text, or that the image is rotated.
- What to do with all the human-generated edits? Except for contributions from a few power editors, I tossed these in favor of GPT's transcriptions. This simplified the pipeline and didn't result in meaningful losses. AI can be better at following instructions than humans. Where they differed, it was often because people would editorialize ("I went to school here!"). This is valuable information, but it belongs in the comments, not the description.

There are still images with missing text, but overall this is a big win for the site. Newer AI models made OCR a much simpler problem in 2024 than it was in 2015.

## From Google Maps to OpenStreetMap + MapLibre

_Sorry, this is a bit of a rant!_

When I started working on OldNYC in 2013, Google Maps was the only game in town. Google didn't charge non-commercial sites like OldNYC to use it, so it was widely adopted on the web. Over time, though, Google has grown more and more determined to make money. When they first started charging for the Maps API, they gave you $200/month of free credits. OldNYC never quite exceeded that (though it came close!) so I never worried about it.

In December of 2024, I got an ominous email from Google about changes to the Google Maps Platform pricing model. The old $200/month system was being replaced by a new system, where each API had its own separate free tier. The email was very positive! They were "streamlining" their offerings to make it "easier for me" and the new system would encourage me to try more of their 30+ APIs.

Unfortunately, the email was a little too honest: at the bottom, it included the price I paid with the current system ($0) and the price I'd pay with the new system ($35/month). Hardly anyone uses 30+ Google Maps APIs. The OldNYC web site uses just two, and their free tiers were becoming much less generous. Google's subsequent emails didn't include dollar estimates.

While a $35/month charge is small by internet standards, it's not trivial for a hobbyist project. And if I ever had a surge of traffic, I'd be in trouble. (I got millions of page views after the Times and other publications [wrote up OldNYC] in 2015.)

I thought about putting a "donate" button on the site to cover costs. But I didn't like that: I'd effectively be asking users to donate money to one of the most profitable corporations in the world.

When the pricing changes went into effect, I was able to work with the NYPL to get a non-profit Maps account with a higher free quota. But ultimately, the correct solution was to switch off of Google Maps. OldNYC is now [powered by OpenStreetMap and MapLibre][maplibre]. OSM [encourages you] to use their tiles, and there's no charge. Moreover, since I'm using OSM for geocodes now (see above), this setup doesn't violate anyone's Terms of Use.

![Map of New York bay without the Brooklyn-Battery Tunnel](/images/no-tunnel.jpg)
_Look, no Brooklyn-Battery Tunnel!_

By using OSM Vector tiles and MapLibre, I'm able to render the map more quickly and produce smoother zooms. Moreover, since it's so easy to style the map, it's now possible to remove some anachronisms from the map like highways and tunnels that didn't exist in the 1930s.

[maplibre]: https://github.com/oldnyc/oldnyc.github.io/pull/48
[wrote up OldNYC]: http://cityroom.blogs.nytimes.com/2015/05/26/new-york-today-new-views-of-the-past/?_r=0
[launch]: https://www.danvk.org/2015/06/04/launched-oldnyc.html
[1]: https://www.danvk.org/2015/01/07/finding-blocks-of-text-in-an-image-using-python-opencv-and-numpy.html
[2]: https://www.danvk.org/2015/01/11/training-an-ocropus-ocr-model.html
[3]: https://github.com/danvk/oldnyc/pull/146
https://github.com/danvk/oldnyc/pull/148
[encourages you]: https://operations.osmfoundation.org/policies/tiles/

## What's Next?

There's always more work to do! Beyond putting more images in more accurate locations, AI could tag other information about the images: are there people in them? Buildings? Is it outdoors or indoors? I'd also like to get images from other collections onto the site.

Recently I've started to [OpenHistoricalMap][ohm], the history-minded cousin of OpenStreetMap. If OHM eventually has complete street grids for NYC over time, it would make locating photos dramatically easier. You could even add the photos themselves to the OHM map.

I'd also like to make it easier for other developers to do OldNYC-styles sites for other cities. If you're interested in this, please reach out!

[ohm]: https://www.openhistoricalmap.org/
