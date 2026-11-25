# JIHANKI — Development roadmap

The roadmap follows the machine's internal logic: make the existing experience dependable before increasing its complexity. Milestones are sequenced, but creative work can proceed independently when it does not weaken preservation or runtime integrity.

| Milestone | Focus | Status |
|---|---|---|
| [M35](./M35-machine-interaction-integrity.md) | Machine interaction integrity | Baseline fixes in progress |
| [M36](./M36-media-delivery-and-preservation.md) | Media delivery and preservation | Planned; source-video compression pending |
| [M37](./M37-archive-schema-and-validation.md) | Archive schema and automated validation | Validator and CI added |
| [M38](./M38-accessibility-and-device-robustness.md) | Accessibility and device robustness | Baseline fixes in progress |
| [M39](./M39-deep-archive-discovery.md) | Deep archive discovery | Planned |
| [M40](./M40-visitor-continuity.md) | Visitor continuity | Planned |

## Ordering

M35 and M38 protect the interaction surface. M36 protects delivery and long-term preservation. M37 supplies automated guardrails for the content and code that follow. M39 deepens the archive's discovery model. M40 builds on the local collection without turning a private, browser-local archive into an account-driven service.

The M36 implementation must not overwrite source masters. Web derivatives should be generated from preserved originals, with their relationship recorded explicitly.
