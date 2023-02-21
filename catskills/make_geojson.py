#!/usr/bin/env python3

import glob
import xml.dom.minidom
import json


def dom_to_feature(path: str, dom):
    coords = []
    for pt in dom.getElementsByTagName('trkpt'):
        lat = float(pt.getAttribute('lat'))
        lng = float(pt.getAttribute('lon'))
        # ele = float(pt.getElementsByTagName('ele')[0].nodeValue)
        # time = pt.getElementsByTagName('time')[0].nodeValue

        coords.append([lng, lat])

    return {
        'type': 'Feature',
        'properties': {
            'path': path,
        },
        'geometry': {
            'type': 'Polygon',
            'coordinates': [coords]
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
