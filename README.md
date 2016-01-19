To get started:

    sudo gem install bundler
    bundle install
    bundle exec jekyll serve --drafts --config _config.yml,_local.yml

The `_local.yml` bit excludes some large directories which you're unlikely to change.

To write a new post, put it in `_posts/YYYY-MM-DD-post-title.md`. The front
matter should look like:


    ---
    layout: post
    title: Title of the blog post
    time: 12:36PM EST  # displayed literally on the home page
    datetime: 2016-01-19 12:36PM EST  # parsed and placed in atom.xml
    summary: "Summary that goes on the home page"
    ---
