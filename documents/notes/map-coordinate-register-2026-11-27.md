# Japan geographic map coordinate register
**Updated:** 27 November 2026

The geographic map uses the traveller-supplied `japan.svg` as its base. The file contains 47 prefecture paths and carries the MapSVG geographic extent:

`west 123.658963°E / east 145.820743°E / north 45.523885°N / south 24.217586°N`

The SVG was copied to `assets/maps/japan-prefectures.svg`, retaining its prefecture shapes and adding an explicit SVG viewBox. The map surface is 2800 × 3305 pixels to retain the source's portrait aspect ratio. The longitude/latitude bounds are linearly normalised into that surface; this is a practical overlay transform for this supplied SVG, not a surveyed GIS reprojection.

## Position precision

The third value in each `GEO_COORDS` entry in `js/map.js` records how precisely the archive supports the position:

- `site` — a named landmark or a publicly identifiable place reference. This is a map anchor, not a claim that the photograph contains EXIF GPS at that coordinate.
- `locality` — a town, station area or neighbourhood anchor. It is deliberately broader than a storefront or individual photograph location.
- `area` — the traveller identifies a general area, but the exact point is unresolved. These anchors must remain visibly approximate.
- `prefecture` — a representative prefectural anchor, normally around its administrative centre. It is not necessarily a place the traveller visited.

Marker size and style show the precision class. The index below the map remains the complete place-name register and is the reliable way to open each place's archive records.

## Deliberately approximate anchors

| Map label | Current anchor | Why it remains approximate |
|---|---:|---|
| First summit near Saiko | 35.4990, 138.6810 | Traveller-confirmed outing area only. The Mount Ashiwada / Koyodai direction sign is contextual evidence, not proof of the summit reached or exact trail. |
| Satyam 1 | 35.4450, 138.5850 | Former Kamikuishiki area connected with Koba-san's 3 August visit; no exact compound coordinate is asserted. |
| Uno-Misaki Tunnel | 35.4660, 138.6020 | Regional anchor for the named tunnel memory; not a surveyed entrance coordinate. |
| Niikura Tunnel | 35.4950, 138.8050 | Area reference near Fujiyoshida; individual tunnel entrance position remains approximate. |
| Banbutsu Sōzō-bō | 35.0110, 135.7690 | Kyoto shop-area anchor, not a confirmed storefront GPS point. |
| Kadoya Shoten / Nagahama | 35.5080, 138.7220 / 35.5140, 138.7180 | Lake Kawaguchi shore / Nagahama locality; the remembered contact and festival are retained without fabricating a precise shop or photograph point. |
| Yokosawa Sabo | 35.5010, 138.7010 | The photograph is placed somewhere near Lake Saiko; exact structure coordinate is not confirmed. |
| Gokodai / Koyodai / Mount Ashiwada | around 35.50, 138.68 | Viewpoint and direction-sign context, not a claim that these names are interchangeable or that the first summit was reached at one of them. |

The `area` and `prefecture` classes are intentionally not styled as precise site pins.

## Label layout

All mapped places retain a marker at their geographic anchor. The 18 primary memory hubs receive larger CRT label cards; the remaining 66 mapped places are compact precision-coded dots. Label cards may be displaced a short distance to avoid covering one another, with a leader line back to the exact map anchor. The dots and relationship lines themselves use the geographic anchors, not the displaced label positions.

The following place/route concepts are intentionally not forced into a false point: the Kyoto–Osaka corridor, the Demachiyanagi–Sanjo–Otsu transit corridor, and the general 2026 Japan expedition. Moscow and Sheremetyevo are outside the Japan map. Their records remain in the archive/index where applicable.

## Relationship semantics

The lines continue to come from `js/relationships.js`. They represent the curated relationship types (within, near, located-on, overlooks, connected-area and transit-corridor) and not shared-photo links or GPS tracks. The Saiko first-summit outing remains an evidence set and documented sequence, not a plotted hiking route.
