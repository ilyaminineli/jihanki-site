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

## Additional Japan photographs and source map pins

The Japan photographic archive contains 203 source files across `addition_1`, `addition_2`, `addition_3`, `addition_4`, `eli_photos` and `taki_photos`. It is represented by 202 unique catalogue memories (`photo-01` through `photo-202`). `addition_2 (8).jpg` is an exact duplicate of `addition_2 (3).jpg` and remains in the media manifest without a second catalogue record. All 32 `addition_3` images are unique against the existing archive.

The initial addition batches occupy `photo-24` through `photo-74`. The formerly unindexed Eli and Taki collections are catalogued in `photo-75` through `photo-140`; `addition_3` is catalogued in `photo-141` through `photo-172`; and `addition_4` is catalogued in `photo-173` through `photo-202`. The photo identification register documents new names, cross-links, thematic clusters and confidence boundaries. Confirmed place metadata includes Saiko Iyashi no Sato Nenba, Fujisan Sengen Shrine, Arakurayama Sengen Park / Chureito Pagoda, Oishi Park / Lake Kawaguchi, Kawaguchiko Nostalgic Toys Museum, Kawaguchiko Automobile Museum / Flight Hall in Narusawa, Shinjuku, Kamo River / Kyoto, Katori Jingu, Katori Station, Haneda, Lake Saiko, PICA Fuji Saiko, Genko-an, Kinkaku-ji, Japan Kanji Museum & Library, Banbutsu Sōzō-bō, Fujisan Dragon Tower / Tagonoura Minato Park, Sumida Ward / Tokyo Skytree, and Ueno Castle (Iga-Ueno). Some other photographs intentionally retain only regional or thematic associations. Some records intentionally retain only a region or thematic group when the exact site is not supported.

The Memory Map's `PINS` mode preserves four forwarded pins with caption-derived labels and twelve individually numbered 20 July map links that have no place names in the source export. Caption-derived labels are descriptions, not asserted official names. The original Google Maps links are retained for future confirmation.

## Photo-identification register

`documents/notes/photo-identification-register.md` is the editorial audit for this collection. It distinguishes sign- or note-backed identifications from probable visual candidates and purely thematic groupings. The former Sunpu Castle candidate has been withdrawn after the traveller confirmed visits to Osaka Castle and Ueno Castle (Iga-Ueno). The new nighttime castle approach and keep are confirmed as Ueno Castle. The Kyoto shop previously mistaken for a nostalgic museum is Banbutsu Sōzō-bō.

The `addition_3` folder is ingested and reviewed in [photo-intake-2026-11-27.md](../documents/notes/photo-intake-2026-11-27.md). All 32 JPEGs have archive records and are included in the `photo-141`–`photo-172` catalogue range. A filename-based reminder list for the remaining uncertain places and visual relationships is kept in [photo-memory-prompts-2026-11-27.md](../documents/notes/photo-memory-prompts-2026-11-27.md).

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
node scripts/test-relationship-semantics.mjs
node scripts/test-field-impressions.mjs
node scripts/test-memory-traces.mjs
node scripts/test-curators-cabinet.mjs
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

## Confirmed additions and historical corrections — 27 November 2026

- The addition_4 intake now includes traveller-confirmed identifications for the Genko-an guestbook, Nagahama fireworks, Satyam 1 present-day clearing, Kadoya Shoten contact, Niikura Tunnel emergency phones and the Kyoto and Osaka photographs, plus the school-sign photograph near Miyukihama, Odawara.
- The 3 August Koba-san field note separates the traveller-identified Satyam 1 place from Satyam No. 7, identified by the Ministry of Justice as the sarin-production plant in the wider former Kamikuishiki compound.
- Event and contact memories are maintained separately in [Nagahama Furusato Festival](../documents/notes/events/2026-08-15-nagahama-furusato-festival.md) and [Kadoya Shoten / Miura contact](../documents/notes/contacts/kadoya-shoten-miura.md).
- The Memory Map and relationship index distinguish shared photo sequences, companion-source corroboration, geographical containment / outlook / transit-corridor relationships, and chronological travel or visit sequences.
