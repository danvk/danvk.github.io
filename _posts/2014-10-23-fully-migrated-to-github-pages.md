---
layout: post
title: Fully Migrated to GitHub Pages
time: 10:51PM EDT
---

<img src="/images/jekyll.png" alt="Jekyll Logo" width="249" height="115" style="float:right">

My danvk.org site is now fully hosted on GitHub pages. I changed the DNS entry last night.

My hope was to do this without breaking anything. That didn't prove to be
possible, but I came close. And overall, the process wasn't too bad! It was
helpful to make a [census of material][0] that was on my old site using access
logs. This turned up a few redirects I wouldn't have thought of, and also
reminded me of the many features my old site accumulated over the years. Some
of these are now accessible under the "Features" menu on the new site.

There were a few pain points:

  - **Redirects**

    It would have been enormously helpful if GitHub pages supported something
    like [mod_rewrite][1]. As it was I had to kill a few old links because I
    was [completely unable to generate 301/302 redirects][2]. I wound up
    [hard-coding JavaScript redirects][3] instead. It's not ideal, and I'll
    probably lose some pagerank, but it's the best I could do.

  - **Migrating the domain**

    I really hate DNS. It's impossible to know whether your site isn't working
    because you've misconfigured your DNS, or because the new records haven't
    propagated out yet. I'm surprised more sites don't go down because of DNS
    problems. The [Global DNS Propagation Tracker][4] was indispensible as a
    sanity check.

One thing that worked really well was migrating my old WordPress blog. I'd
expected this to be a complete pain, but it was nothing of the sort. I used
[httrack](http://www.httrack.com/) to mirror the rendered version of my blog
site to a folder on local disk. Then I checked that folder into GitHub. Done.

Finally, I learned a lot about [Jekyll][5] from this process. It really is a
static content generator. It's not a serving system. This is why it can't do
things like 301/302 redirects. GitHub pages would be a much more powerful
serving system if it included support for things like mod_rewrite. But then it
would be less Jekyll-y. The beauty of the system is that it's pure static
content, and hence insanely fast and simple.


[0]: https://github.com/danvk/danvk.github.io/issues/1
[1]: https://en.wikipedia.org/wiki/Rewrite_engine
[2]: http://stackoverflow.com/questions/26374707/can-jekyll-serve-content-based-on-a-url-parameter
[3]: https://github.com/danvk/danvk.github.io/commit/f99fa0d6ef808a2ba468587d3f7eab800d448f1e
[4]: https://www.whatsmydns.net/
[5]: http://jekyllrb.com/
