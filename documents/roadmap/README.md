# JIHANKI — Development roadmap

This index records the current implementation state. Completed milestones remain useful as design and engineering documentation; they are not instructions to repeat completed work or a reason to delete the runtime modules they introduced.

## Foundations and machine integrity

| Milestone | Focus | Current state |
| --- | --- | --- |
| [M35](./ROADMAP.md#m35--machine-interaction-integrity) | Machine interaction integrity | Implemented interaction and purchase state model |
| [M36](./ROADMAP.md#m36--media-delivery-and-preservation) | Media delivery and preservation | Preservation rules documented; source-video compression remains a separate task |
| [M37](./ROADMAP.md#m37--archive-schema-and-automated-validation) | Archive schema and automated validation | Schema contracts, manifest and repository validator maintained |
| [M38](./ROADMAP.md#m38--accessibility-and-device-robustness) | Accessibility and device robustness | Baseline work documented; physical device review remains necessary |
| [M39](./ROADMAP.md#m39--deep-archive-discovery) | Deep archive discovery | Foundations implemented through later discovery and map modules |
| [M40](./ROADMAP.md#m40--visitor-continuity) | Visitor continuity | Browser-local continuity features implemented in later collection work |
| [M41–M50](./M41-M50-IMPLEMENTATION-MAP.md) | Media, discovery, geography, personality, collection, audio and chronology | Implementation map retained as milestone history and technical reference |

## M67–M72 — Liminal archive exploration

The latest visitor-facing programme is [M67–M72 — Liminal Archive Exploration](./M67-M72-LIMINAL-EXPLORATION.md). Its six milestones are marked implemented in that document.

| Milestone | Focus | Current state |
| --- | --- | --- |
| [M67](./M67-M72-LIMINAL-EXPLORATION.md#m67--place-and-relationship-integrity) | Place and relationship integrity | Implemented |
| [M68](./M67-M72-LIMINAL-EXPLORATION.md#m68--field-impressions) | Field Impressions | Implemented |
| [M69](./M67-M72-LIMINAL-EXPLORATION.md#m69--memory-traces) | Memory Traces | Implemented |
| [M70](./M67-M72-LIMINAL-EXPLORATION.md#m70--curators-cabinet) | Curator's Cabinet | Implemented |
| [M71](./M67-M72-LIMINAL-EXPLORATION.md#m71--listening-room) | Listening Room | Implemented |
| [M72](./M67-M72-LIMINAL-EXPLORATION.md#m72--quiet-signals) | Quiet Signals | Implemented — one authored, browser-local response |

## Current priorities

The completed feature set should now be treated as a maintenance and archive-quality baseline rather than an invitation to add more mechanics automatically.

1. Check the deployed site on physical iOS Safari and Android Chrome, especially the fixed machine canvas, overlays, zoom, keyboard focus and map bounds.
2. Keep media paths and manifest fingerprints exact as new material is added.
3. Continue source-aware photo identification and typed relationship review without turning uncertain similarities into facts.
4. Review overlays and small-screen overflow whenever a module changes.
5. Keep the machine interface, map and collection coherent with the shared [JIHANKI Analog UI System](../design/JIHANKI-ANALOG-DESIGN-SYSTEM.md).

## Validation commands

The maintained local checks are:

```bash
node scripts/build-media-manifest.mjs --check
node scripts/validate-archive.mjs
```

GitHub Actions runs these checks and JavaScript syntax validation on relevant pushes and pull requests. The older standalone `scripts/test-*.mjs` fixtures are no longer present in the repository; milestone descriptions should not imply they are still executed.

## Documentation policy

- Keep this index short and current.
- Keep full milestone rationale, decisions and acceptance criteria in the linked milestone documents.
- Do not duplicate roadmap excerpts into new dated notes.
- Keep feature modules when their milestones are complete; remove code only after confirming it is unreferenced by `index.html`, the service worker, catalogue data and current runtime.
