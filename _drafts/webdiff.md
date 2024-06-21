---
layout: post
title: 'Another Decade, Another Webdiff'
time: 12:36PM EST
datetime: 2024-06-13 2:15PM EST
summary: ""
---

- Had the opportunity to make long-desired improvements to webdiff the past few weeks.

Over the past few weeks, I found the time to work on [webdiff], an open source project of mine that I built [over a decade ago]. I still use it all the time, but hadn't actively worked on it since 2015. Revisiting an old project is always an interesting experience, and this post presents my reflections on it.

First off, what is webdiff? It's a diff tool. Rather than running `git diff`, you run `git webdiff` and you get a two-column diff UI with syntax highlighting in your browser:

(image)

Because it's running in your browser, you get lots of nice things for free: web fonts, zoom, search. You can also look at diffs between images:

(image)

- Origins of the project
  - Leaving Google
  - Missing Mondrian / Critique
  - GitHub's PR review flow was terrible in 2014
  - I wanted to learn how to build a tool outside of Google.

The project came out of my experience of [leaving Google] for the first time back in 2014. I was very accustomed to how software was built inside Google, and there were some tools that I missed. In particular, Google's code review tools (Mondrian and later Critique) were light years ahead of GitHub's in 2014. GitHub's PR Review was quite barebones back then: no two-column diffs, no syntax highlighting. webdiff was my attempt both to improve this, and to learn how to build and publish a tool outside the Google ecosystem.

I spent a good chunk of the summer of 2014 building webdiff, and I was happy with how it turned out. I released it that July and continued to work on it, even giving a [PyCon talk] about it in 2015.

- I've continued to use the tool over the past ten years
  - Google trained me to look at two-column diffs with syntax highlighting in a browser.
  - I like the one-file-at-a-time display.
  - vscode's diff viewer doesn't quite work for me, though it has potential.

While I haven't worked much on webdiff since 2015, I've continued to be an active user. My years at Google trained me to look at two-column diffs with syntax highlighting in a browser, and I still much prefer this to looking at diffs in a terminal. GitHub's Pull Request UI has [improved significantly] over the years, but I like that I can run `git webdiff` locally (or on a plane) without having to push anything to GitHub. I also prefer the one-file-at-a-time UI, which matches Mondrian/Critique. [VSCode's diff viewer] is another interesting option these days, though I feel some mismatch between diff viewing as an ephemeral process and editing as a more persistent one.

- Realizations over ten years
  - It was hard for me to build this tool in 2014 because I didn't really understand git.
  - My git acumen improved tremendously as a result of watching "git from the bits up" in 2016
  - Eventually I realized that I should let git determine the diffs

Using webdiff over the years, I had a few realizations. One was that I hadn't understood git very well when I built it in 2014. Most of my experience had been with `git5`, a git wrapper around Perforce in use at Google at the time. In retrospect, this was an incredibly confusing way to learn git! My understanding of git improved while I [worked at Hammerlab] in 2014–2015, then took another big step forward in 2016 when I watched the fantastic [git from the bits up] talk.

The other big realization was that I'd architected `webdiff` in the wrong way. webdiff takes two directories (before and after, or left and right) and tries to match up the files in them. This is usually straightforward, but there are some tricky edge cases, like a [rename+change]. The original webdiff matched files up on its own, then calculated diffs for each file. The realization was that `git` is already really good at this, and that I should rely on it to do all the diff calculations for me. webdiff should _display_ diffs, never calculate them.

- Origins of the current changes
  - Tried to implement this in 2022
  - Made a lot of progress, did some modernization, ran into a wall
  - `git diff --no-index` and symlinks
  - Moved on.
  - A year and a half later, I revisited with fresh eyes.
  - The fundamental issue could be hacked around!

This idea kicked around in the back of my head for a few years, until I had some time to work on it in the fall of 2022. I learned about `git diff --no-index`, which lets you use `git-diff` to diff two files or directories outside a git repo. And I learned about `git diff --raw`, which diffs two directories and matches files between them to produce adds, deletes, renames and changes. This all seemed promising!

Then I ran into a wall: if you run `git difftool` from `HEAD`, one of the directories it produces will be filled with symlinks to files in your repo. This makes sense: it's faster to create symlinks to the files than copies. And for webdiff, it meant that you could edit a file, reload the browser window, and see the new diff.

Unfortunately for webdiff, `git diff --no-index` [does not resolve symlinks]. This meant that, in order to produce a diff, I had to run `git difftool --no-symlinks`. This was slower, and it broke an important workflow: reloading the diff after editing a file no longer reflected your changes. This was frustrating, and enough to put me off the project.

Fast-forward almost two years and I decided to pick up the project again. What had seemed like a fundamental issue in 2022 now just seemed like a nuisance. Before passing the directories to `git diff --no-index`, I could make a version of the directory that resolved the symlinks. This would let `git` pair up the files for me. Then I could resolve symlinks before running `git diff --no-index` to generate diffs for individual files. Elegant, no, but it let me get through the impasse.

- Revisiting an old project
  - Modernization is fun
  - Skipping a few generations isn't a bad strategy
  - The Python packaging situation has significantly improved with poetry and `pyproject.toml`.
  - There's nothing like a jQuery conversion to remind you that React is a thing of beauty.
  - This enabled lots of other long-desired features, and could enable more in the future.

Once that was resolved, I was able to cut the first new release of webdiff in years. But once I was in there, I didn't want to stop. When you look at ten year old code, it's hard to resist the urge to modernize it. I've done quite a bit of that over the past few weeks.

One advantage of stepping away from a project for so long is that you get to skip several generations of tooling. In this case I got to skip straight from Python's vintage setuptools to [poetry] for managing dependencies and releases. And [migrating the diff UI] from jQuery to React was a real throwback to 2015.

It was also a nice reminder of the beauty of React. There was considerable duplication between the code for building the initial diff UI and for filling in additional rows when you clicked a "Show 12 rows" link. Adding "show 10 more" links would have made it even worse.

When I ported the code over to React, the duplication went away. It was easy to show the additional skipped rows _in the data model_ and trust React to render them appropriately.

- What's next?
  - It's hard to justify spending more than two weeks on this
  - Time to be a user again
  - My top request is a language service + code review workflow

I've added quite a few new features and even started to play around with next-generation tooling like the [React Compiler]. But after a few weeks, I can tell that I've hit the point of diminishing returns. I'd like to go back to being a user again.

What would I work on next for webdiff? There's a [long-standing, annoying bug] where the terminal process doesn't quit when you close the diff in your browser. I'd like to try to fix that. And now that the diff UI is fully React-ified, [generating it lazily] could make it easier to render diffs for large files like lockfiles (or `checker.ts`). I'd also be excited about a special mode for [diffing minified JSON].

My biggest dream for a code review tool would be to have language services available while reviewing code. Google didn't have this when I worked there, but it might have it now. I don't think this is a feature webdiff will ever have, but if VS Code gets it right, it might be enough to make me switch.

----

https://www.danvk.org/wp/2014-07-03/introducing-git-webdiff/index.html
https://www.danvk.org/2014/11/07/github-integration-and-image-diff-improvements-headline-webdiff-0-8.html
https://www.danvk.org/2015/04/12/pycon-2015-make-web-development-awesome-with-visual-diffing-tools.html

webdiff came about because I missed Mondrian and Critique, the code review tools I used at Google. I even missed `g4 diff`! I also wanted to learn how to build a tool outside of Google.

codediff.js was a fork of difflib.js. I spent a good chunk of the summer of 2014 building it. It would definitely take less time now, though I have less to learn.

I hadn't worked very actively on webdiff since 2015, but I still use it all the time. A few years back I had an idea for how to improve it. `git difftool` hands webdiff two directories, a left and a right. It's up to webdiff to figure out what's changed. But `git diff` is already quite good at that! Why reinvent the wheel? This would also get me access to the many options that `git diff` supports, such as `-b` to ignore space changes.

I spent some time in the fall of 2022 exploring this idea. I learned about `git diff --no-index`, which lets you use `git-diff` to diff two files or directories outside a git repo. And I learned about `git diff --raw`, which diffs two directories and matches files between them to produce adds, deletes, renames and changes. This all seemed promising!

Then I ran into a wall: if you run `git difftool` from `HEAD`, one of the directories it produces will be filled with symlinks to files in your repo. This makes sense: it's faster to create symlinks to the files than copies. And for webdiff, it meant that you could edit a file, reload the browser window, and see the new diff.

Unfortunately for webdiff, `git diff --no-index` [does not resolve symlinks]. This meant that, in order to produce a diff, I had to run `git difftool --no-symlinks`. This was slower and broke that edit/reload cycle that I enjoyed. This was frustrating, and enough to put me off the project.

Fast-forward almost two years and I decided to pick up the project again. What had seemed like a fundamental issue in 2022 now just seemed like a nuisance. Before passing the directories to `git diff --no-index`, I could make a version of the directory that resolved the symlinks. This would let `git` pair up the files for me. Then I could resolve symlinks before running `git diff --no-index` to generate diffs for individual files. Elegant, no, but it let me get through the impasse.

Once that was resolved, I was able to cut the first new release of webdiff in years. But once I was in there, I didn't want to stop. When you look at ten year old code, it's hard to resist the urge to modernize it. I've done quite a bit of that over the past few weeks.

One advantage of stepping away from a project for so long is that you get to skip several generations of tooling. In this case I got to skip straight from Python's vintage setuptools to [poetry] for managing dependencies and releases. And [migrating the diff UI] from jQuery to React was a real throwback to 2015.

It was also a nice reminder of the beauty of React. There was considerable duplication between the code for building the initial diff UI and for filling in additional rows when you clicked a "Show 12 rows" link. Adding "show 10 more" links would have made it even worse.

When I ported the code over to React, the duplication went away. It was easy to show the additional skipped rows _in the data model_ and trust React to render them appropriately.

I've added quite a few new features and even started to play around with next-generation tooling like the React Compiler. But I'm hitting the point of diminishing returns and I'd like to go back to being a user again.

[react-compiler]: https://github.com/danvk/webdiff/pull/209

https://github.com/danvk/webdiff/releases/tag/v1.0.1

- Use git diff for diffs
- Use git config for configuration
- Update deps

https://github.com/danvk/webdiff/releases/tag/v1.1.0

- Show diffhunk headers and fine-grained "show more" buttons
- Dropped Flask

https://github.com/danvk/webdiff/releases/tag/v1.2.0

- `git webshow` command: web-based equivalent of `git show`.
- Diffhunk selection and keyboard shortcuts for next/prev (`n` / `p`)
- Keyboard shortcuts UI (`?`)
- Show diffstats
- Add UI option for max diff width
- Inlined codediff.js and ported it to React. Set up eslint and typescript-eslint.

