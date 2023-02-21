#!/usr/bin/env python3
"""Convert a FeatureCollection (of photos, say) to a GPX track."""

import sys
import json


def main():
    infile, = sys.argv[1:]
    fc = json.load(open(infile))
    points = [
        (f['properties']['date'], *f['geometry']['coordinates'])
        for f in fc['features']
    ]
    points.sort()
    print(
    f'''<?xml version="1.0"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" creator="AllTrails.com" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
  </metadata>
  <trk>
    <name>{infile}</name>
    <src>Photos</src>
    <trkseg>
    ''')
    for (t, lng, lat) in points:
        # TODO: reformat date/time
        print(f'''     <trkpt lat="{lat}" lon="{lng}">
        <time>{t}</time>
      </trkpt>
        ''')
    print('''</trkseg>
  </trk>
</gpx>
''')

if __name__ == '__main__':
    main()
