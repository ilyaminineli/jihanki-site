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

## Type-specific record contracts

The validator in `scripts/archive-schema.mjs` checks the runtime record shape without requiring optional editorial context.

| `type` | Required source field | Optional type-specific context |
| --- | --- | --- |
| `video` | `file` | `voices` may list credited voice sources |
| `image` | `file` | `description` and thematic `group` |
| `voicebank` | `image` | `subtitle`, `context` and external `url` |
| `project` | `file` | `image` and `projectPath` |
| `audio` | `file` | `voices` and production context |
| `text` | `file` | `project` and editorial grouping |
| `video` in category `performance` | `file` | Performance context remains explicitly editorial |

Common fields are `id`, `title`, `type` and `category`. `date` is optional so an undated work can remain unplaced; when present it must be a year (`YYYY`), month (`YYYY-MM`) or real calendar date (`YYYY-MM-DD`). The validator checks the shape of optional `voices`, `stock` and `metadata` fields, validates HTTP(S) URLs and continues to check local paths separately.

The contract does not require invented dates, locations, durations, voice credits or other provenance. Add or change a record type deliberately: update the contract and its valid/invalid fixtures in `scripts/fixtures/archive-schema.json` together.

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

## Repository-wide integrity checks

The static archive is validated at two levels:

- `scripts/archive-schema.mjs` validates per-type catalogue fields.
- `scripts/markdown-links.mjs` scans repository Markdown links, images and local HTML targets, checks file/directory destinations and validates local Markdown-heading and HTML anchors.
- `scripts/media-manifest.mjs` compares the manifest with the exact files under `media/`, checks canonical paths, duplicate entries, untracked/stale files, byte sizes and Git blob SHA-1 fingerprints.
- `scripts/validate-archive.mjs` combines the live archive, category and relationship checks with media, Markdown, HTML ID, image and runtime-script checks.

Run the focused fixtures and integrated validator from the repository root:

```sh
node scripts/test-archive-schema.mjs
node scripts/test-interaction-model.mjs
node scripts/test-markdown-links.mjs
node scripts/test-media-manifest.mjs
node scripts/validate-archive.mjs
node scripts/build-media-manifest.mjs --check
```

A valid manifest must list every file under `media/` exactly once. After adding, removing or replacing a media file, rebuild it with `node scripts/build-media-manifest.mjs`, then rerun the check. The Git blob SHA-1 is an integrity fingerprint, not an authorship signature.

The Markdown scanner ignores code examples, accepts external links without trying to fetch them, and checks local relative destinations and fragments. It uses GitHub-compatible heading slugs so existing roadmap anchors stay valid.

## Visitor-local data

Receipts, event logs, personality state, museum state, collection records and collectible objects are saved in separate browser-local storage domains. They are never transmitted by the static site. Collection exports are versioned and include serialized objects; imports are validated before additive merge. Museum exports use a separate versioned format for kept works, shelves and visit trail; imports are validated before additive merge.

## Presentation and visitor memory

The daily rotating selection is implemented in js/rotation.js. Personal collection and souvenirs live in js/collection.js. The visitor-specific museum — kept works, custom shelves, visit trail and its own backup format — lives in js/museum.js. Local visitor interaction patterns drive the limited machine personality in js/personality.js. They do not affect the published catalogue.

## Automated integrity checks

Run the focused schema, interaction, Markdown and media-manifest fixtures above, then run `node scripts/validate-archive.mjs` for the integrated repository scan. GitHub Actions runs these fixtures, the six-viewport interaction/offline Playwright suite, and the integrated validator.

When adding a record, use file for the primary local document or media path. Do not use the obsolete textFile property.