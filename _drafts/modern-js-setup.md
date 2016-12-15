Yesterday two of my friends independently asked me for help setting up a
dev environment for a modern JavaScript web app. Since there's clearly interest,
I'm summarizing what I told them in a blog post.

Web development has changed enormously in the past ten years. It used to look
something like this:

```html
<script src="jquery.min.js"></script>
<script src="myscript.js"></script>
```

This was great in some ways -- there was no build step (so iteration was fast),
minimal dependencies (so your code stayed small) and the browser loaded your
code directly (so debugging was simple).

While some systems (e.g. Google's [Closure Compiler][cc]) were specifically designed
to avoid the need for a build step, it's pretty standard to add one these days.
Once you do that, you open a Pandora's box. If you're going to do one thing in
your build step (perhaps concatenating multiple JS files) then you may as well
do some other things (perhaps converting your favorite flavor of JS to something
browsers understand). There have been various attempts to consolidate the JS
build step over the past few years and hence it has a confusing toolchain.

Here I'll present

Things to cover:

### What's the relationship between JS, ES, ES5, ES6 and HTML5?

### What is bundling?

Once including dependencies is easy, you'll include a lot of them. The node
ecosystem is famous for its [multitude of tiny modules][leftpad]. When you include
transitive dependencies, your simple app could easily involves hundreds of files.

Loading hundreds of JS files via `<script>` tags would generate hundreds of
network requests on page load, which would be unacceptably slow.

A better approach is to package all your app and all its transitive dependencies
into a single JS file which can be delivered to the browser. This is known as
_bundling_. It's typically done using `browserify` or `webpack`. `browserify`
popularized this approach but `webpack` is the more modern tool and you should
use it.

### Dependencies: npm, node_modules, bower

Where do you get third-party JS libraries? Usually their instructions will give
you a choice: either a `<script>` tag that you can copy/paste to load the library
from a CDN, or an `npm install` command.

The `<script>` tag way is the old-fashioned one. It will generate a network request
for each library and will introduce a single global variable.

`npm` is a package manager for node.js, a tool for running server-side JavaScript.
Node's package manager and module system are two of its best features, and they've
been coopted for client-side JavaScript as well.

To install a module, you run:

```
npm install --save library
```

This will place the library under `node_modules/library` and add as a dependency
to your `package.json` file (this is what the `--save` is for).

If you were using node.js, you'd be able to use the library by writing:

```js
const _ = require('underscore');

// use underscore methods
```

Web browsers don't know about `require`, so to run this in a browser you'll need
to send it through `webpack` first.

A few other terms here:

- `bower` was an independent repository of client-side modules. Don't use it.
    npm is bigger, better and more well-maintained. There's no reason to use bower.
- `yarn` is a drop-in replacement for the `npm` command from Facebook. It's
    faster and has a simpler command-line interface. It's new but seems promising.

### What is transpilation?

Back in the day, 

### What are source maps?

### What about CoffeeScript? JavaScript: The Good Parts?

_JavaScript: The Good Parts_ is pretty old and largely irrelevant now.
CoffeeScript is dead: its best elements were incorporated into ES6.

### Where do `<script>` tags fit into all this?

### How do imports work?

Imports and requires. What's with all the types of import statements?

### What about jQuery?

What about jQuery? (use fetch for XHRs)

### How should you iterate on your code?

Use a server.
(Maybe webpack-dev-server. Maybe http-server. Probably not python SimpleHTTPServer.)
Use `webpack --watch`.

### Linting tools

Use eslint, not jslint or jshint. There's a lot of history here.
If you want to enforce stylistic things (e.g. indentation), use jscs.
If you're into this sort of thing, you should probably use TypeScript.
Don't use Flow. Don't use Closure Compiler.

### Pipeline tools: What about Gulp and Grunt?

Don't bother. They don't do much for you that a Makefile wouldn't, and they
add a layer of separation between you and your tools. Webpack typically does
everything you want out of the box. If it doesn't, I just write a short shell
script.

### Which IDE should you use?

I'm a big fan of [Visual Studio Code][vscode], which is particularly great if
you use TypeScript. Lots of people like Sublime and Atom. If you're more into
IDEs, you'll probably like WebStorm. Vim and Emacs are also great, especially
if you set up integration with your linter.

### How do you do testing?

The key trick: bundle your test JS and load it in a browser.

[cc]: closure Compiler
[vscode]:
[leftpad]:
