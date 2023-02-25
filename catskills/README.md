# Dan's Catskills Adventures

The idea is to collect all my Catskills hikes on a public website. I got a lot of value out of [this 2013 blog][1] while planning hikes, and I'd like to "pay it forward" by sharing my own notes and hikes.

Things to include:

- Blog post for each hike with photos
- Interactive map with all hikes
- Notes on planning / logistics

## TODO

- [ ] Collect GPX data for all hikes
  - [ ] How do I get GPX from eBird? (Lat/Lng seq in `data-maptrack-data`, no times)
  - [x] convert to properly-formatted zulu time in `fc_to_track.py`
  - [ ] Make per-day tracks
  - [ ] Add campsites
  - [ ] Consolidate scripts in one repo (not `danvk.github.io`)
- [ ] Collect photos for all hikes
- [ ] Ask Max, John, Alex for photos from our hikes
- [ ] Make a map visualization
  - [x] Write a script to convert GPX -> GeoJSON FeatureCollection
  - [x] Add all peaks to the Mapbox map
  - [ ] Make peak style look more like AllTrails
  - [ ] Add elevation to the Mapbox map
  - [ ] Show which peaks I've hiked and which I haven't
  - [x] Show all tracks on a map
  - [ ] Show photos on the map
  - [ ] Show notes for each hike
  - [ ] Organize hikes by type
  - [ ] Filter hikes by dates (winter, month, etc.)
  - [ ] Convert this to a CRA app
- [x] Collect notes for all hikes
- [x] Make slugged directories for all hikes
- [x] Make spreadsheet listing of all hikes
- [ ] Make the "blog" -- posts for each hike
- [ ] Make a root page
- [ ] Make an RSS feed

## Notes on making GPX tracks

I can generate a GeoJSON FeatureCollection from photos by downloading a ZIP file from Google Photos and running it through my google-photo-map extractor. I can then convert that to a rough GPX using `fc_to_track.py`.

To snap the lines in that GPX to trails, load it into gpx.studio and add some new waypoints, following trail routing.

[1]: https://www.njnyhikes.com/p/map.html
