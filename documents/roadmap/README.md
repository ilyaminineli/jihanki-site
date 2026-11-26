# JIHANKI — Development roadmap

The roadmap makes the machine dependable before increasing its complexity. Existing M35–M40 foundations remain in [ROADMAP.md](./ROADMAP.md). The next development programme is in [M41–M50 — Implementation Map](./M41-M50-IMPLEMENTATION-MAP.md).

| Milestone | Focus | Status |
| --- | --- | --- |
| [M35](./ROADMAP.md#m35--machine-interaction-integrity) | Machine interaction integrity | Baseline fixes in progress |
| [M36](./ROADMAP.md#m36--media-delivery-and-preservation) | Media delivery and preservation | Source-video compression pending |
| [M37](./ROADMAP.md#m37--archive-schema-and-automated-validation) | Archive schema and automated validation | Validator and CI baseline added |
| [M38](./ROADMAP.md#m38--accessibility-and-device-robustness) | Accessibility and device robustness | Baseline fixes in progress |
| [M39](./ROADMAP.md#m39--deep-archive-discovery) | Deep archive discovery | Partially implemented by M43–M44 |
| [M40](./ROADMAP.md#m40--visitor-continuity) | Visitor continuity | Partially implemented by M46 |
| [M41–M42](./M41-M50-IMPLEMENTATION-MAP.md#m41--media-integrity-manifest-and-offline-shell) | Media integrity, offline shell and delivery | Implemented baseline |
| [M43](./M41-M50-IMPLEMENTATION-MAP.md#m43--memory-archaeology-archive-search-and-relationship-graph) | Memory archaeology, search and graph | Implemented baseline |
| [M44](./M41-M50-IMPLEMENTATION-MAP.md#m44--the-memory-map) | Memory map | Implemented baseline |
| [M45](./M41-M50-IMPLEMENTATION-MAP.md#m45--machine-personality-and-evolving-behaviour) | Machine personality | Implemented baseline |
| [M46](./M41-M50-IMPLEMENTATION-MAP.md#m46--collectible-memory-objects-and-portable-collection) | Collectible memory objects | Implemented baseline |
| [M47](./M41-M50-IMPLEMENTATION-MAP.md#m47--collection-exploration-and-visitor-continuity) | Visitor continuity | Implemented baseline |
| [M48](./M41-M50-IMPLEMENTATION-MAP.md#m48--audio-installation-mode) | Audio installation mode | Implemented baseline |
| [M49](./M41-M50-IMPLEMENTATION-MAP.md#m49--visitor-memory-exchange) | Moderated visitor memory exchange | Privacy/moderation design drafted; implementation blocked |
| [M50](./M41-M50-IMPLEMENTATION-MAP.md#m50--temporal-archive) | Temporal archive | Static/browser-local baseline implemented |

## Implementation order

P0 media integrity and device reliability remain the release gate. The visitor-facing feature work is layered on the archive foundation: M43 discovery, M44 place map, M45 evolving behaviour, M46 collectible objects, then M48 audio installation. M49 now has a written privacy, consent, moderation and abuse-prevention model, but implementation remains blocked until the backend, data region, moderation owners, deletion process and legal/privacy review are approved. M50 is implemented without a backend and remains entirely static/browser-local.

Implementation statuses describe code coverage, not an assertion that every browser/device acceptance test has passed.