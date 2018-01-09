# Dan Vanderkam

[danvdk@gmail.com](mailto:danvdk@gmail.com)

## Employment

### Sidewalk Labs (Feb. 9, 2016–)

I was the first engineer at [Sidewalk Labs][swl], an Alphabet company dedicated to improving life in
cities. My responsibilities have revolved around starting new teams and prototyping ideas.

  * Chose our initial software stack (Google Cloud, TypeScript, Python 3)
  * Set up development processes: code reviews, continuous deploy, weekly snippets.
  * Did all engineering interviewing and onboarding for the [Flow][] team.
  * Built initial prototypes and did eng onboarding for the [CityBlock][] team.
  * Built and launched the [NYC Transit Explorer][transit-ex], which we used to
    [map L-mageddon][transit-ex-post].
  * Built a [smart chute][smart-chute] prototype.
  * Led an exploration into microsimulation and visualization

### Hammer Lab (April 28, 2014–Feb. 5, 2016)

[Hammer Lab][] is a software lab within the [Icahn Institute][] at [Mount Sinai][] in NYC.
While there, I worked primarily on visualizations, frontend tooling and software development processes.

  * [pileup.js][pileup]

    pileup.js is an interactive genome explorer which can be embedded within
    web pages. It was built from scratch using the latest (c. 2015) web
    technologies: ES2015, React, Flow, Babel, Browserify, Promises and Mocha.
    Read more in [this blog post][pileup-post] or [try a demo][pileup-demo].

  * [Cycledash][]

    I was one of the primary developers for Cycledash, a tool for managing
    collections of genomic data. This work led to the development of pileup.js.
    See the [blog post][cycledash-post] introducing it.

  * Blogging and Speeches

    I wrote extensively about my work at Hammer Lab and spoke at PyCon in
    2015. See a [roundup of my posts][hammerlab-posts] and a [video][pycon-video]
    of [my talk at PyCon 2015][pycon-talk].


### Google (August 14, 2006–April 25, 2014)

I was as a Software Engineer at Google for approximately eight years. I
worked primarily in Search: ranking, features and projects relating to search
logs analysis.

  * Tech Lead, Tufte Team (August 2012–April 2014)
    * Finance Answer Card: [[GOOG]][tufte-fac]
    * Statistics Knowledge Panel: [[life expectancy south africa]][tufte-statskp]
      * This was [featured][statskp-googleio] in the keynote at Google I/O in 2013.
    * Fact Comparisons: [[brad pitt height]][tufte-facts]
    * March Madness: \[march madness\] (defunct); see [coverage][mm-avc]
  * Google Correlate (October 2010–December 2011)
    * Built an early proof-of-concept demo
    * Designed large portions of the infrastructure
    * Extensive exploration of approximate/exact Nearest Neighbors search,
      see [Nearest Neighbors Search in Google Correlate][correlate-tech].
    * Streamlined and narrowed the vision for our product
    * Conceived of and implemented the [search by Drawing feature][correlate-drawing],
      which garnered [significant attention][correlate-reddit] in its own right.
  * Google Flu Trends (January 2009 - October 2009)
    * Responsible for query time series infrastructure
    * [Emergency Mexico Launch][flu-mx]
    * [Flu Trends Australia/New Zealand][flu-anz]
    * [Flu Trends International][flu-intl]
  * Webspam (August 2006 - March 2009)
    * Worked on core site quality ranking signals
    * Metrics and dashboards
  * Miscellaneous Projects
    * [Sunrise/Sunset onebox][sunrise]
    * G%gle (Percent Server), a tool which shows how many Googlers joined after you.
    * Shuttlesheet, a tool for navigating Google Shuttle schedules.

## Other Projects

### [OldNYC][] (January 2013–)

After moving to NYC, I got in touch with the NYPL about creating an "OldSF for NYC." This turned
into a major project to map and transcribe their [Photographic Views of NYC][oldnyc-nypl]
collection. After launching in mid-2015, the site was used by millions of people and received
[widespread media attention][oldnyc-blog], including a [write-up][oldnyc-times] in the Times. I
[recorded a talk][oldnyc-talk] about the project at the NYPL in summer 2015.

### [dygraphs][] (2006–)

I initially developed the dygraphs charting library for the Webspam group at Google. After it proved
useful for the Flu Trends team as well, I decided to [open source it][dygraphs-github] in 2009. The
library has found wide use since then, both inside and outside of Google. Notable users include [R
Studio][dygraphs-r] and [InfluxDB][dygraphs-influx]. I gave a [talk on dygraphs][dygraphs-talk]
which was recorded in 2017.

### [OldSF][] (2008–2012)

Historical photographs of San Francisco, dated, geocoded, mapped and visualized. A collaboration
with the SFPL. See [coverage][oldsf-coverage] in the New York Times.

### [Comparea][] (2014)
Comparea is a tool that lets you Comparea Areas. It lets you answer questions like "how big is
Greenland, really?" or "how large would Alaska be if it were in the contiguous US?". Comparea has
been popular [amongst school teachers][comparea-writeup]. Read more about it in [this blog
post][comparea-blog].

## Education

### Rice University

  * Bachelor of Arts, Computer Science and Mathematics, _cum laude_, 2006
    (3.9 GPA).
  * Recipient of the W. L. Moody Jr. Scholarship in Engineering, 2004-2006
  * Winner of the Hubert Bray Prize in Mathematics, Spring 2005, awarded
    annually to the top Junior Math major at Rice.
  * Competed in the William Lowell Putnam national math competition, 2002-2005.
    Best finish was in the top 150 nationally in 2005.

## Prior Work Experience

  * _Research Assistant, Rice University_, Summer 2006
    Spent the summer before coming to Google analyzing the Wikipedia edit history
    and attempting to write an edit classifier to detect vandalism.

  * _Software Development Engineer (SDE) Intern, Microsoft_, Summer 2005
    Designed and developed a new mechanism for rolling out features on the MSN
    Shopping website (shopping.msn.com). Implemented this mechanism using
    C#/ASP.NET and Microsoft SQL Server 2000.

## Publications

  * [pileup.js][pileup-paper]
    Dan Vanderkam, B. Arman Aksoy, Isaac Hodes, Jaclyn Perrone, and Jeff Hammerbacher
  * [Google Correlate Whitepaper][correlate-whitepaper]
    Matt Mohebbi, Dan Vanderkam, Julia Kodysh, Rob Schonberger, Hyunyoung Choi & Sanjiv Kumar
  * [Nearest Neighbor Search in Google Correlate][correlate-tech]
    Dan Vanderkam, Robert Schonberger, Henry Rowley, Sanjiv Kumar

[swl]: https://www.sidewalklabs.com/
[Hammer Lab]: http://www.hammerlab.org/
[Icahn Institute]: https://icahn.mssm.edu/departments-and-institutes/genomics
[Mount Sinai]: https://icahn.mssm.edu/
[pileup]: https://github.com/hammerlab/pileup.js/
[pileup-post]: http://www.hammerlab.org/2015/06/19/introducing-pileup-js-a-browser-based-genome-viewer/
[pileup-demo]: http://www.hammerlab.org/pileup/
[pileup-paper]: https://www.biorxiv.org/content/early/2016/01/15/036962
[cycledash]: https://github.com/hammerlab/cycledash/
[cycledash-post]: http://www.hammerlab.org/2015/01/28/introducing-cycledash-0-0-0/
[hammerlab-posts]: http://www.danvk.org/2015/10/21/hammerlab-posts.html
[pycon-video]: https://www.youtube.com/watch?v=jUUTqgzNR3M
[pycon-talk]: https://us.pycon.org/2015/schedule/presentation/395/
[statskp-googleio]: http://www.youtube.com/watch?v=9pmPa_KxsAM#at=6853
[sunrise]: http://googleblog.blogspot.com/2010/06/this-week-in-search-62710.html
[tufte-fac]: https://www.google.com/search?q=GOOG
[tufte-statskp]: https://www.google.com/search?q=life+expectancy+south+africa
[tufte-facts]: https://www.google.com/search?q=brad+pitt+height
[mm-avc]: http://www.avc.com/a_vc/2013/03/fun-friday-march-madness.html
[correlate-drawing]: http://www.google.com/trends/correlate/draw
[correlate-tech]: https://www.google.com/trends/correlate/nnsearch.pdf
[correlate-hn]: http://news.ycombinator.com/item?id=2953900
[correlate-reddit]: https://www.reddit.com/r/technology/comments/k2j1e/google_correlate_by_drawing_actual_drawing/
[correlate-whitepaper]: https://www.google.com/trends/correlate/whitepaper.pdf
[flu-anz]: http://blog.google.org/2009/06/google-flu-trends-for-australia-and-new.html
[flu-mx]: http://www.nytimes.com/2009/05/04/technology/internet/04link.html
[flu-intl]: http://blog.google.org/2009/10/google-flu-trends-expands-to-16.html
[oldnyc]: https://www.oldnyc.org
[oldnyc-nypl]: http://digitalcollections.nypl.org/collections/photographic-views-of-new-york-city-1870s-1970s-from-the-collections-of-the-ne-2#/?tab=about
[oldnyc-blog]: http://www.danvk.org/2015/06/04/launched-oldnyc.html
[oldnyc-times]: http://cityroom.blogs.nytimes.com/2015/05/26/new-york-today-new-views-of-the-past/?_r=0
[oldnyc-talk]: http://www.nypl.org/audiovideo/oldnyc-launch-party
[comparea]: http://comparea.org
[comparea-writeup]: http://www.freetech4teachers.com/2014/09/three-easy-ways-to-visual-compare-sizes.html
[comparea-blog]: http://www.danvk.org/wp/2014-08-13/introducing-comparea/
[oldsf]: http://oldsf.org
[oldsf-coverage]: http://www.nytimes.com/2011/09/04/us/04bchistory.html
[dygraphs]: http://dygraphs.com
[dygraphs-r]: https://rstudio.github.io/dygraphs/
[dygraphs-influx]: https://influxdb.com/blog/2015/07/07/Announcing-Chronograf-a-data-visualization-tool-for-InfluxDB.html
[dygraphs-github]: https://github.com/danvk/dygraphs
[dygraphs-talk]: https://www.youtube.com/watch?v=I6E5e1HBFi0 
[flow]: http://www.flowmobility.io/
[cityblock]: https://www.cityblock.com/
[transit-ex]: https://transit.sidewalklabs.com/
[transit-ex-post]: https://www.sidewalklabs.com/blog/new-map-demo-how-the-l-train-shutdown-will-impact-your-commute/
[smart-chute]: https://www.sidewalklabs.com/blog/we-held-a-one-week-design-sprint-to-build-a-smart-trash-chute-heres-what-we-learned/
