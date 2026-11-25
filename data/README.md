# Archive catalogue

archive.js is data-only. It defines ARCHIVE and the flat JIHANKI_ARCHIVE array. The display/runtime behaviour lives in js/.

## Record contract

A record has a stable id, a human-readable title, an archive date, a semantic category, a type, and whichever file or external release URL applies.

Example fields:

- id: "example-memory"
- title: "EXAMPLE MEMORY"
- date: "2026"
- type: "video"
- category: "video"
- group: "JAPAN / AUDIOVISUAL WORKS"
- file: "media/video/example.mp4"
- stock: { status: "new", quantity: null }
- metadata: { locations: ["Lake Saiko"], related: ["another-record-id"] }

## Physical category mapping

The eight physical selectors are mapped explicitly in js/categories.js:

| Selector | Catalogue categories |
|---|---|
| VIDEO | video |
| PHOTO | photo, image |
| UTAU | utau, voicebank |
| TEXT | text |
| MUSIC | music |
| SOUND | sound |
| NOTES | notes, note |
| PERFORMANCE | performance |

Records that do not match a mapping are reported in the maintenance terminal's unclassified count instead of being silently placed in another category.

## Stock states

- new — newly added work; available for dispensing and marked as fresh stock.
- available — normally available.
- low-stock — available with a low-stock label.
- sold-out — visible for inspection, not dispensed.
- restocking — visible while a work is being prepared, not dispensed.
- archived — preserved but removed from circulation.

quantity: null means no numeric limit is advertised. A finite quantity of zero blocks dispensing. Because JIHANKI is a static site, the published catalogue controls shared availability; visitor purchases do not modify global stock.

The fifth Aokigahara / Fuji Sonic Pi environment, Shrine / Ritual, is listed as restocking until its public render is added.

## Relationships and geography

Use metadata.locations for known place names and metadata.related for stable IDs of related archive records. Curated defaults for video voicebanks, expedition entries and known places live in js/relationships.js and js/geography.js.

Photo group values are thematic groupings (for example, Machines after dark and Forest boundaries); they should not be confused with geographic locations.

## Visitor-local data

Receipts and machine event logs are saved in the visitor's browser. They are not fields in archive.js and do not alter the published catalogue.


## Presentation and visitor memory

The daily rotating selection is implemented in js/rotation.js. It chooses a date-stable fragment from each physical category and keeps a small residue from the preceding cycle. This is a presentation layer only: the complete catalogue remains available from the physical category selectors.

Personal collections are implemented in js/collection.js. Only successful purchases are collected. Stored records include the archive ID, title, date, category, acquisition timestamps, repeat count and associated receipt codes. They remain local to the browser and can be exported as JSON.

Ambient machine profiles live in js/audio.js. The original ambience loop fades between machine states; the visitor can mute it without disabling visual interactions or archive playback controls.
