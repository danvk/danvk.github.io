#!/usr/bin/env python3
"""Make the combined tracks.geojson file from GPX files."""

import glob
import xml.dom.minidom
import json


def extract_date(path):
    return path[:10]


def extract_season(date: str) -> str:
    date = date[5:]
    if date <= '03-21' or date >= '12-21':
        return 'winter'
    elif date <= '06-20':
        return 'spring'
    elif date <= '09-21':
        return 'summer'
    return 'fall'


def dom_to_feature(path: str, dom):
    coords = []
    for pt in dom.getElementsByTagName('trkpt'):
        lat = float(pt.getAttribute('lat'))
        lng = float(pt.getAttribute('lon'))
        # ele = float(pt.getElementsByTagName('ele')[0].nodeValue)
        # time = pt.getElementsByTagName('time')[0].nodeValue

        coords.append([lng, lat])

    date = extract_date(path)
    return {
        'type': 'Feature',
        'properties': {
            'path': path,
            'date': date,
            'season': extract_season(date)
        },
        'geometry': {
            'type': 'LineString',
            'coordinates': coords
        }
    }


def main():
    features = []
    for path in glob.glob('*/*.gpx'):
        dom = xml.dom.minidom.parse(path)
        feature = dom_to_feature(path, dom)
        features.append(feature)

    with open('tracks.geojson', 'w') as out:
        json.dump({'type': 'FeatureCollection', 'features': features}, out)


if __name__ == '__main__':
    main()
