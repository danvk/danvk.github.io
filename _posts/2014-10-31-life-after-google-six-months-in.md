---
layout: post
title: Life after Google, Six Months In
time: 05:32PM EDT
---

It's been almost exactly six months since I ended an eight year run at Google.
One of the biggest reasons to do this was to come back up to speed with the
open source ecosystem and to experience a different working environment (sample size 1→2!).

When I joined Google, it seemed like our tech stack was years ahead of anything
else. This included tools like [BUILD files][1] for managing dependencies and
compilation, [borg][2] for running jobs in a data center, and [closure
compiler][3] for dealing with JavaScript's idiosyncracies.

The open source world has come a long way since 2006. It's solved many of the
same problems that Google did, but in different ways. There's the hadoop stack
for distributed work. And there are polyfills and CommonJS for JavaScript.
These aren't necessarily better or worse than Google's solutions, but they are
different. And they're the tools that new developers are learning.

Long term, this is a big problem for Google. "Ahead of the field" can rapidly
turn into "Not Invented Here". "Better" can become merely "different".

A simple example of this is [`goog.bind`][4]. It works around some confusing
behavior involving `this` in JavaScript. It was a great tool in 2004. But
modern JavaScript has its own solution ([Function.prototype.bind][5]).  It's
been around for years and is supported in 90+% of browsers. Google will still
be writing `goog.bind` long after IE8 ceases to be relevant.

Facebook has a better solution to this: they always use the latest version of
the JavaScript standard, and then [transpile][6] to something that older
browsers will understand. This way they stay on the mainstream of technological
development.

Here are a few other things I've found notable:

- **Almost any Google technology has an open-source equivalent.**<br>
  Examples include Travis-CI (similar to TAP), the Hadoop stack (MapReduce,
  CNS, Dremel, …), CommonJS (Closure modules).

- **Package managers**<br>
  For most Google engineers, something like 95+% of the code you work with is
  first-party (i.e. written at Google). For a smaller group, this ratio is
  going to be dramatically different. As a result, third party package managers
  are much more important. And the good news is that they've gotten much better
  over the last eight years! Leaving Google has finally forced me to learn how
  to use tools like NPM and pip. I've found this incredibly empowering. I used
  to avoid external dependencies for personal projects. I suspect many Google
  engineers do the same.

- **Markdown is more pervasive than I'd realized**<br>
  I was vaguely aware of [Markdown][8] while I was at Google, but didn't really see
  the point. Now that I'm out, I've been surprised to see how pervasive it is.
  I suspect that much of this comes from GitHub, where you use Markdown for
  READMEs, issues and code review comments. You also use it with GitHub pages,
  so I'm typing in it right now! It's worthwhile to learn Markdown a bit
  better. It's like HTML with infinitely less boilerplate.

- **Knowledge of git**<br>
  It's completely reasonable for someone with ten years of experience at Google
  to never have run git. I'm happy I was involved enough with open source
  projects that I have years of basic experience with it. But others have
  clearly gone much deeper. My git skills have gotten much better since leaving
  Google. I know how to use `git rebase` now!

- **sysadmin knowledge**<br>
  borg meant that I never had to learn any systems administration. It's a
  particular blind spot for me. For example, [upstart][7] was released over eight
  years ago, just after I joined Google. It's incredibly widely used. I'd never
  heard of it.

- **Google uses a lot of email**<br>
  We use almost no email in my new group. HipChat takes the place of a group
  mailing list and your coworkers @mention you when they want you to chime in.
  The chat format keeps things short. I still get emails for code reviews, but
  I could imagine this going through GitHub notifications instead.

- **Buying your own lunch isn't that big a deal.**<br>
  As it turns out, there are people in NYC who will make you food in exchange
  for money, or even deliver it! The variety is much greater than what you get
  at a Google Cafe, and it's nice to have a good reason to go outside during
  the day. I also like the more flexible eating schedule. Almost everyone in my
  office eats lunch very late, perhaps at 3 or 4.



[1]: http://google-engtools.blogspot.com/2011/08/build-in-cloud-how-build-system-works.html
[2]: http://www.quora.com/What-is-Borg-at-Google
[3]: https://developers.google.com/closure/compiler/
[4]: http://docs.closure-library.googlecode.com/git/namespace_goog.html
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
[6]: https://github.com/facebook/jstransform
[7]: http://upstart.ubuntu.com/
[8]: http://daringfireball.net/projects/markdown/
