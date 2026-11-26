# Archive catalogue

archive.js is data-only. It defines ARCHIVE and the flat JIHANKI_ARCHIVE array. The display/runtime behaviour lives in js/.

## Record contract

A record has a stable id, a human-readable title, an archive date, a semantic category, a type, and whichever file or external release URL applies.

Example fields:
- id: example-memory
- title: EXAMPLE MEMORY
- date: 2026
- type: video
- category: video
- group: JAPAN / AUDIOVISUAL WORKS
- file: media/video/example.mp4
- stock: { status: new, quantity: null }
- metadata: { locations: [Lake Saiko], related: [another-record-id] }

Optional metadata should describe only known facts: locations, related archive IDs, production context, people and source material. Do not invent geographic coordinates or recording durations.

## Physical category mapping

The eight physical selectors are mapped explicitly in js/categories.js:

| Selector | Catalogue categories |
| --- | --- |
| VIDEO | video |
| PHOTO | photo, image |
| UTAU | utau, voicebank |
| DOCS | text |
| MUSIC | music |
| SOUND | sound |
| NOTES | notes, note |
| PERFORMANCE | performance |

## Stock states

- new — newly added work; available for dispensing and marked as fresh stock.
- available — normally available.
- low-stock — available with a low-stock label.
- sold-out — visible for inspection, not dispensed.
- restocking — visible while a work is being prepared, not dispensed.
- archived — preserved but removed from circulation.

quantity: null means no numeric limit is advertised. A finite quantity of zero blocks dispensing. Because JIHANKI is a static site, the published catalogue controls shared availability; visitor purchases do not modify global stock.

## Relationships and geography

Use metadata.locations for known place names and metadata.related for stable IDs of related archive records. Typed editorial relationships live in js/relationships.js; contextual discovery and shared-location links live in js/discovery.js. Geography is indexed in js/geography.js.

Photo group values are thematic groupings (for example, Machines after dark and Forest boundaries); they should not be confused with geographic locations. The Memory Map is schematic and explicitly not to scale.

## Media integrity

data/media-manifest.json inventories every file under media/ with its byte size and Git blob SHA-1. Rebuild it after adding or replacing media with:
node scripts/build-media-manifest.mjs
node scripts/build-media-manifest.mjs --check

The validator confirms that catalogue paths exist and every referenced media file is represented in the manifest. The manifest hash is an integrity fingerprint, not a cryptographic authorship signature.

## Visitor-local data

Receipts, event logs, personality state, collection records and collectible objects are saved in separate browser-local storage domains. They are never transmitted by the static site. Collection exports are versioned and include serialized objects; imports are validated before additive merge.

## Presentation and visitor memory

The daily rotating selection is implemented in js/rotation.js. Personal collection and souvenirs live in js/collection.js. Local visitor interaction patterns drive the limited machine personality in js/personality.js. They do not affect the published catalogue.

## Automated integrity checks

Run node scripts/validate-archive.mjs to validate required record fields, unique IDs, category aliases, stock states, local media/document paths, curated relationship targets, HTML IDs, runtime scripts and media manifest checksums. GitHub Actions first runs `node --check` over the runtime modules, service worker and Node scripts, then checks the media manifest and archive references on pushes and pull requests.

When adding a record, use file for the primary local document or media path. Do not use the obsolete textFile property.