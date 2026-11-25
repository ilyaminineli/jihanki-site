# M40 — Visitor continuity

**Status:** Planned  
**Depends on:** M29 event journal, M33 collection, M35 interaction integrity and M37 validation.

## Goal

Allow the machine to remember a visitor's path across sessions while keeping that memory transparent, portable and local by default.

## Scope

1. Add versioned import and restore for the personal collection and, separately, selected machine preferences.
2. Preserve a visitor's recently opened records and optional exploration path locally.
3. Allow a visitor to resume an unfinished path or revisit a previous sequence of memories.
4. Keep receipts, collection records, mute preferences and exploration history as distinct data domains.
5. Add explicit export, clear and reset controls with clear descriptions of what each action affects.
6. Add migration handling when the archive schema changes, retaining snapshots for removed records.
7. Keep all visitor state in the browser unless a separately specified backend and consent model are approved.

## Privacy and preservation principles

- No account or tracking service is required.
- Do not transmit collection records or browsing history.
- Export files should identify their format and version.
- Import should validate the file before changing existing local data.
- Clearing one data domain must not silently erase the others.
- A removed archive entry may remain readable in a collection snapshot, but must not become purchasable again.

## Acceptance criteria

- A collection can be exported and imported on another browser.
- Unsupported or malformed imports leave current visitor data unchanged.
- Visitor state is versioned and can be migrated.
- Receipts, collection, preferences and history can be cleared independently.
- The site makes no claim of cross-device synchronisation while storage remains browser-local.
