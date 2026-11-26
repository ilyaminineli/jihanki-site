# M35 — Machine interaction integrity

**Status:** Implemented — explicit state model, transaction outcomes and regression coverage verified in CI  
**Depends on:** M25–M34.

## Goal

Make every machine interaction legible and reversible. A visitor should always understand the current screen, credit balance, selected memory and next available action.

## Interaction model

The transition authority is `js/interaction-model.js`; `js/machine.js` remains responsible for rendering and effects. The model stores the active view, overlay, selected record, credit balance, pending-purchase flag, last transaction outcome and a monotonically increasing revision.

| Event family | Accepted transition | Rejected / recovery behaviour |
| --- | --- | --- |
| Boot and navigation | Home, category, location, rotation and service each enter a named view | Navigation to home/service recovers and refunds any still-pending reserved credit |
| Panels and records | Search/map/chronology/collection panels use the panel overlay; archive memories use the record overlay | Closing an overlay preserves the underlying view and selected record |
| Credit | Insert one credit, up to a maximum of nine | Credit-limit rejection does not increase the balance |
| Purchase attempt | Validate live-catalogue membership, stock and available credit; reserve one credit and enter a single-flight pending state | No credit, sold-out, restocking, archived and out-of-catalogue attempts preserve balance and selection; a second concurrent purchase is rejected |
| Purchase completion | Match the pending record and create its receipt identity before moving to dispensed | A mismatched completion is rejected; a failed commit aborts and refunds the reserved credit |
| Receipt actions | Track receipt download initiation and print-dialog opening against the exact receipt code | Repeated download/print actions are idempotent; a mismatched receipt code is rejected |

Transaction statuses include `credit-accepted`, `blocked`, `pending`, `dispensed`, `failed`, `receipt-download-started` and `print-dialog-opened`. The interface deliberately says “RECEIPT DOWNLOAD STARTED” and “PRINT DIALOG OPENED”: the browser does not expose proof that a visitor retained a downloaded file or completed printing.

## Implemented behaviour

- Keep the credit balance visible in the CRT and memory viewer.
- Allow one credit to be inserted from the open memory viewer.
- Keep insufficient-credit, stock, catalogue and transaction-failure feedback inside the active viewer rather than writing it behind the modal.
- Preserve the selected record and remaining credit after rejected purchases.
- Route view and overlay changes through one transition model.
- Make purchases single-flight; reserve a credit before writing the receipt/collection and refund it on failure or interrupted recovery.
- Bind receipt outcomes to the current receipt code and distinguish download initiation from print-dialog opening.
- Ignore stale asynchronous Markdown success *and failure* responses after another record has been opened or the viewer has closed.
- Keep the transition model in the offline shell cache.

## Verification

- `scripts/test-interaction-model.mjs` covers views, overlays, credit limit, no-credit, sold-out, restocking, archived and out-of-catalogue rejection, single-flight attempts, mismatched completion, rollback, recovery and receipt outcomes.
- The Playwright suite covers viewer-safe rejected purchases, receipt creation/download status, no-credit retries, rapid audio source changes and a delayed Markdown failure race.
- GitHub Actions runs both suites together with the six-viewport and offline-recovery regression suite.

## Acceptance criteria

- No visible action produces feedback behind an open modal.
- A memory can be purchased without losing the selected record.
- Credit counts never become negative and remain consistent across screen changes.
- Closing a memory restores the underlying view and releases its overlay.
- A slow document response cannot replace the content of a newer selection.
- Every rejected purchase has one explicit failure outcome; every completed purchase has one receipt identity and a deterministic transaction state.

# M36 — Media delivery and preservation

**Status:** Planned; waiting for the source-video compression pass  
**Depends on:** M25 portability and M35 interaction integrity.

## Goal

Separate archival masters from files served to visitors. JIHANKI should remain a preservation archive without forcing every visitor to download the largest production files.

## Scope

1. Preserve original video, audio and image masters outside any destructive web-optimisation workflow.
2. Create web delivery encodes at agreed quality and resolution targets. Do not replace masters with derivatives.
3. Add a media manifest that records archive ID, source path, delivery path, codec, dimensions, duration, file size and checksum.
4. Generate poster frames for videos and appropriately sized image derivatives for the archive viewer.
5. Prefer efficient formats with a reliable fallback where browser support requires it.
6. Keep metadata-only or lighter defaults for large media, and do not fetch full media until a visitor requests playback.
7. Add a repository size report and a per-asset budget warning to CI.

## Delivery profiles

- **Preview:** small poster or short preview for discovery.
- **Web:** standard visitor playback, tuned for common desktop and mobile connections.
- **Master:** preserved source, not automatically served by the machine interface.

The final codec, resolution and bitrate should be chosen after comparing the compressed outputs on actual devices and listening to the audio/video quality. No fixed bitrate should be applied blindly across all footage.

## Acceptance criteria

- Every public media record resolves to a delivery derivative.
- Every derivative maps back to a preserved master.
- Video pages display a poster before playback.
- No full-resolution video is downloaded just by opening a category list.
- The published payload stays within the selected hosting budget.
- Compression does not silently change the archive's source files or creative masters.

## Boundary

This milestone does not author, transcode or replace the user's source videos. The compression pass should happen first; the website can then adopt the resulting derivatives and manifest.

# M37 — Archive schema and automated validation

**Status:** Implemented — typed contracts, fixture coverage, Markdown link/anchor checks and exact media-manifest validation verified in CI  
**Depends on:** M25–M34; supports every future content milestone.

## Goal

Make the archive a trustworthy source of truth. New records should fail validation before they become broken visitor experiences.

## Implemented validation

- Maintain type-aware record contracts for video, image, voicebank, project, audio and text records, including performance-category video records.
- Validate required type-specific media fields, optional date/voice/URL/stock/metadata shapes, stable IDs, physical category mapping, stock states, local paths and curated relationship targets.
- Validate relative Markdown links, image links and local HTML `href`/`src` attributes throughout the repository.
- Validate target files and directory indexes, Markdown heading anchors (including duplicate heading slugs) and HTML `id`/`name` fragments.
- Match the repository's GitHub-style em-dash heading anchors rather than forcing documentation URL changes.
- Compare the media manifest against the exact set of files under `media/`: detect unlisted files, stale entries, duplicate/non-canonical paths, symbolic links, invalid sizes and invalid/mismatched Git blob SHA-1 fingerprints.
- Validate archive `file` and `image` references against that manifest.
- Run schema, interaction, Markdown and media-manifest fixtures, then the full validator, in GitHub Actions for relevant pushes and pull requests.
- Keep the README authoring example aligned with the actual `file` property.

## Validation modules

- `scripts/archive-schema.mjs` — per-type source record contract.
- `scripts/markdown-links.mjs` — repository Markdown destinations and anchors.
- `scripts/media-manifest.mjs` — exact media inventory and fingerprints.
- `scripts/validate-archive.mjs` — live repository integration check.
- `scripts/test-archive-schema.mjs`, `scripts/test-markdown-links.mjs`, and `scripts/test-media-manifest.mjs` — fixtures for valid and invalid input.

## Remaining long-horizon scope

1. Move all content records and pending records into the archive data source; runtime modules should not invent or migrate editorial content.
2. Extend the documented contracts and fixture set deliberately whenever new record types or fields are introduced.
3. Keep migration scripts explicit, versioned and removable after migration.

## Acceptance criteria

- Invalid IDs, categories, stock states, type-specific fields, relationships and local paths fail CI.
- Every repository-relative Markdown link/image target resolves; every local Markdown or HTML fragment exists.
- The media manifest exactly covers the media directory, and every listed file matches its byte size and Git blob fingerprint.
- Each record type has a clear contract and a useful validation message.
- The README and data guide show examples that match the actual renderer.

# M38 — Accessibility and device robustness

**Status:** Core accessibility behaviour implemented and covered by automated browser regression; physical-device and assistive-technology audit remains manual  
**Depends on:** M35; benefits from M37.

## Goal

Preserve the fixed physical-machine composition while making the interface usable across touch, keyboard, screen-reader and zoom contexts.

## Baseline changes

- Remove viewport settings that disable user zoom.
- Add a status announcement region for screen and transaction changes.
- Move focus into the memory dialog, trap Tab navigation while it is open and restore focus on close.
- Add visible keyboard focus treatment.
- Keep reduced-motion preferences respected.

## Remaining scope

1. Test the 429 × 932 composition on narrow phones, short landscape screens, tablets and desktop displays.
2. Check that the machine can be operated without a pointer.
3. Add explicit accessible names and state descriptions to physical controls and archive items where visible labels are not sufficient.
4. Verify focus order, high-contrast visibility, text scaling and browser zoom.
5. Ensure long archive lists and modal media can be reached without trapping the visitor in nested scroll regions.
6. Test sound controls and media playback with keyboard and assistive technology.

## Acceptance criteria

- The visitor can zoom the page.
- Every action is keyboard reachable and has a visible focus indicator.
- The memory viewer receives focus, contains focus while open and restores focus on close.
- Screen and transaction changes are announced without reading the entire archive list aloud.
- No required content is clipped at supported viewport sizes.
- Reduced-motion preferences suppress non-essential animations.

# M39 — Deep archive discovery

**Status:** Planned  
**Depends on:** M30 relationships, M31 geography, M37 archive schema.

## Goal

Let the archive be discovered through its internal relationships rather than through category lists alone. Discovery should feel like moving through traces of a place, a sound or a memory.

## Scope

1. Extend the existing thematic photo groups into a curated visual index with stable themes, captions and meaningful sequence.
2. Surface visual fragments that are not currently in the main catalogue through a deliberate secondary layer. Do not expose every source photograph indiscriminately.
3. Build paths across video works, UTAU voices, music, sound fragments, production notes and locations.
4. Add temporal trails through the Japan expedition, preserving gaps and uncertain chronology instead of inventing missing events.
5. Allow an archive item to have several kinds of relationship: shared voice, shared project, shared location, source material, response or thematic echo.
6. Add contextual ways to continue exploring from the artifact viewer without replacing the machine's physical controls.

## Design principles

- A relationship must have editorial meaning; avoid automatically connecting everything that shares a broad category.
- Distinguish factual location and production credits from fictional or conceptual relationships.
- Themed photographs should remain grouped by what the image contains or evokes, not merely by photographer.
- Missing fragments and uncertain records may remain visibly incomplete.

## Acceptance criteria

- Visitors can move between related records without repeatedly returning to the category selector.
- Every relationship has an explicit kind and valid target.
- The photo index remains curated and thematic.
- The expedition trail does not invent missing dates or locations.
- Discovery adds depth without turning the machine into a conventional portfolio or search-results page.

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
