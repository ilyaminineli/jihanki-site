# Archive catalogue

`archive.js` is the catalogue source. It defines the archive records and metadata; visitor-interface behaviour lives in the focused modules under `js/`.

## Record shape

A record normally has a stable `id`, human-readable `title`, `type`, semantic `category`, and the local `file` or `image` it opens. Use the original date precision: a year-only date stays year-only, and unknown dates stay unknown.

Example:

```javascript
{
  id: "example-memory",
  title: "EXAMPLE MEMORY",
  date: "2026-08-14",
  type: "text",
  category: "notes",
  group: "FIELD NOTES",
  file: "documents/notes/example-memory.md",
  stock: { status: "available", quantity: null },
  metadata: {
    locations: ["Lake Saiko"],
    related: []
  }
}
```

## Categories and physical selectors

The physical machine has eight selectors. The mapping and aliases are defined once in `js/categories.js`. Keep semantic category values in the catalogue and do not introduce a new alias without adding it to that mapping.

## Stock and dispensing

Supported stock statuses are `new`, `available`, `low-stock`, `sold-out`, `restocking`, `archived` and `withdrawn`. Unavailable records remain inspectable where appropriate but cannot be purchased. The catalogue stores published stock state; visitor purchases do not decrement a shared server-side inventory because the site has no backend.

## Relationships and geography

- Stable record IDs are used by `js/relationships.js` for typed cross-references.
- Record location metadata is used by the place index and map modules.
- `js/geography.js` defines place information and `js/map.js` provides the schematic map and archive-network view.
- Geographic containment, proximity, outlook, transit corridor, same-photo sequence, shared subject and chronological travel links have different meanings. Do not flatten them into a generic “related” line.
- Approximate area anchors must remain approximate; they are not exact photo coordinates or navigation instructions.

## Runtime and visitor-local data

The site loads its modules in dependency order from `index.html`. Modules cover relationships, geography, search/discovery, chronology, collection, museum shelves, receipts, audio, listening, visitor impressions, memory traces and the machine state model.

Collection, receipts and preferences are browser-local. They are not synced between devices or transmitted to a backend.

## Media manifest

`data/media-manifest.json` records each local media path, size and Git blob fingerprint. It is checked with:

```bash
node scripts/build-media-manifest.mjs --check
```

After intentionally adding or changing media, rebuild the manifest with:

```bash
node scripts/build-media-manifest.mjs
```

Then run `node scripts/validate-archive.mjs`. The Git blob value is an integrity fingerprint, not a cryptographic authorship signature.

## Validation scope

The maintained integrated validator checks record contracts, unique IDs, selector mapping, stock state, local file resolution, relationship targets, manifest coverage, HTML IDs, script references, image paths and Markdown relative links / anchors. GitHub Actions checks JavaScript syntax and runs the manifest check and integrated validator.

The former standalone `scripts/test-*.mjs` files are no longer present. Do not use old test commands copied from earlier milestone notes as current instructions.
