# JIHANKI — Development programme M41–M50

Purpose: this document extends the M35–M40 foundation and is the active implementation map for the next development cycle. Code coverage and real-device acceptance testing are tracked separately.

## Priority overview

| Priority | Work | Why |
| --- | --- | --- |
| P0 | Full media integrity checking | Detect missing, corrupt, stale and misreferenced assets before publication |
| P0 | Lazy loading and image fallbacks | Keep the archive usable on slow or unstable connections |
| P0 | Mobile accessibility audit | Keep the fixed machine usable on touch, keyboard, zoom and short landscape screens |
| P1 | Archive search | Find records without stepping through every physical category |
| P1 | Offline archive cache | Preserve access to the shell, documents and visited images after first load |
| P1 | Relationship graph | Explore people, works, places and production traces as a network |
| P1 | Media metadata | Show date, format, duration and available recording context |
| P2 | Collection import/export | Move a browser-local collection between devices without an account |
| P2 | Audio installation mode | Turn existing recordings into a user-controlled continuous listening environment |

## M41 — Media integrity, manifest and offline shell

**Priority:** P0  
**Status:** Implemented baseline; deployment and CI verification pending  
**Depends on:** M36, M37

### Goal
Establish a manifest-backed inventory for all media files, verify file size and Git blob checksum, and make the application shell available offline after the first successful visit.

### Scope
1. Generate data/media-manifest.json from every file under media/.
2. Record relative path, byte size and Git blob SHA-1 for each asset. The SHA is an integrity fingerprint, not an authorship signature.
3. Validate every archive file and image reference to media/ against the manifest.
4. Add a maintainer command to rebuild or check the manifest.
5. Pre-cache the machine shell, scripts, styles, archive catalogue and machine artwork.
6. Cache visited local documents and images using a runtime cache. Do not precache large audio/video masters.
7. Bypass Range requests and large video streams instead of claiming they are fully available offline.

### Acceptance criteria
- The manifest exactly describes the checked-in media directory.
- A missing file, size mismatch, checksum mismatch or stale archive path fails CI.
- A first visit can cache the core machine shell.
- Previously visited Markdown and images can be opened offline after successful caching.
- Large video playback remains network-dependent unless a complete file was separately cached.

## M42 — Delivery, responsive access and media metadata

**Priority:** P0/P1  
**Status:** Automated Playwright viewport/offline tests implemented; physical device audit remains manual  
**Depends on:** M35, M36, M38, M41

### Goal
Make media understandable before playback and keep the machine operable on more device shapes.

### Scope
1. Lazy-load non-critical imagery and use asynchronous image decoding.
2. Provide an explicit image/media failure state and retry action.
3. Surface format, archive date and browser-reported duration for audio/video.
4. Keep large video delivery behind an explicit visitor playback action.
5. Audit small portrait, small landscape, high zoom, keyboard-only operation, screen-reader naming and reduced-motion behaviour.
6. In short landscape, allow vertical scrolling rather than shrinking the machine until controls become unusable.

### Acceptance criteria
- Broken images have a visible fallback and retry.
- Media duration is shown only after the browser reports metadata; unknown values are not invented.
- Visitors can zoom and keyboard-operate every primary control.
- The short-landscape layout remains scrollable and controls retain focus visibility.
- Manual device testing is recorded separately from automated validation.
- CI emulates small-phone portrait, phone landscape, tablet and desktop viewports, checks touch geometry and map overflow, and performs offline reload plus cached-document reads.
- Physical confirmation remains required on iOS Safari and Android Chrome; browser emulation is not a substitute for hardware testing.

## M43 — Memory archaeology, archive search and relationship graph

**Priority:** P1  
**Status:** Implemented baseline  
**Depends on:** M30, M37, M39

### Goal
Let visitors reconstruct a memory through evidence and editorial connections rather than treating records as isolated files.

### Scope
1. Search titles, descriptions, contributors, dates and recorded locations.
2. Give relationships explicit types: shared voice, same project, field origin, production document, source observation and shared place.
3. Display a memory's immediate traces in its viewer.
4. Open a dedicated archaeology panel with the central record and its connected records.
5. Let visitors follow connected records without returning to the category selector.
6. Keep factual connections distinguishable from thematic or conceptual links.

### Acceptance criteria
- Every displayed link resolves to an existing archive record or named location.
- Shared-category coincidence alone does not create a relationship.
- Search results remain keyboard accessible and open the correct record.
- Visitors can move from a record to its archaeology view and back.

## M44 — The memory map

**Priority:** P1  
**Status:** Implemented baseline  
**Depends on:** M31, M37, M43

### Goal
Represent expedition geography and the archive's network of remembered places.

### Scope
1. Add a place-index mode using only locations already named in archive records.
2. Add a memory-network mode with links generated from records that explicitly associate multiple places.
3. Allow each place to open its associated archive entries.
4. Mark the map as schematic and not to scale; it is an editorial index, not a navigation or surveying tool.
5. Preserve unknown or imprecise locations rather than fabricating coordinates.

### Acceptance criteria
- Every pin corresponds to a known place in the geography index.
- Memory lines correspond to shared archive records, not invented routes.
- Place mode and memory mode are visibly distinguishable.
- Every map pin opens the correct location index.

## M45 — Machine personality and evolving behaviour

**Priority:** P1  
**Status:** Implemented baseline  
**Depends on:** M29, M33, M40

### Goal
Let the machine develop a subtle memory of a visitor's interaction history without becoming a chatbot or tracking system.

### Scope
1. Store a bounded visitor-local history of opened records and category familiarity.
2. Let the idle display evolve through restrained, context-sensitive messages.
3. Bias random pick-up toward less recently visited material while keeping selection probabilistic.
4. Avoid immediate repeats when other available memories exist.
5. Keep personality state inspectable and resettable locally.

### Acceptance criteria
- No interaction history leaves the visitor's browser.
- Personality messages do not block ordinary navigation.
- Random pick-up respects stock availability and coin rules.
- Resetting personality does not clear receipts or the personal collection.

## M46 — Collectible memory objects and portable collection

**Priority:** P2  
**Status:** Implemented baseline  
**Depends on:** M25, M33, M40

### Goal
Turn a successful purchase into a unique, portable artifact rather than only a history row.

### Scope
1. Generate a unique serialized memory object per successful receipt.
2. Give each object a category stamp, archive reference, acquisition date and short inscription.
3. Show the object in its memory viewer and in a separate browsable object list within the personal collection.
4. Allow the visitor to save an object as a small text artifact.
5. Upgrade collection export to version 2, including objects.
6. Support import of version 1 and version 2 files. Validate before merging; malformed imports must not mutate local data.
7. Keep import additive and idempotent so restoring the same backup twice does not duplicate objects or inflate purchase counts.

### Acceptance criteria
- Each successful receipt has one collectible object.
- The object points back to its source record and receipt code.
- Collection data remains browser-local.
- Every collected object can be opened and saved independently of its source work.
- Version 1 exports remain importable.
- Import never deletes current records or visitor receipts.

## M47 — Collection exploration and visitor continuity

**Priority:** P2  
**Status:** Implemented baseline  
**Depends on:** M40, M43, M46

### Goal
Make the personal collection a browsable personal museum, with clear separation between saved works, objects, receipts and machine preferences.

### Scope
1. Add museum sections for collected works, serialized objects, kept works, visit trail and custom shelves.
2. Search, filter and sort collected works; browse each souvenir independently.
3. Allow visitors to keep individual archive works and create up to 12 named shelves.
4. Add a bounded local visit trail and return-to-museum navigation from an opened work.
5. Export/import museum data separately from purchase collection data, validating before additive merge.
6. Provide independent clear/reset actions for kept works, shelves, trail, machine personality and collection/objects.
7. Never claim cloud synchronisation without an approved backend.

### Acceptance criteria
- Collection works, collectible objects, kept works, visit trail and custom shelves can be browsed separately.
- Museum backup/import is independent of the work/object collection backup.
- Clearing trail, keeps, shelves or works/objects does not silently clear receipts or other domains.
- Imported museum backups are validated and merged without replacing existing local data.
- No visitor profile is transmitted.

## M48 — Audio installation mode

**Priority:** P2  
**Status:** Implemented baseline; listening/device review pending  
**Depends on:** M32, M36, M42

### Goal
Allow the archive to function as a visitor-operated sound installation using existing local audio fragments.

### Scope
1. Select several audio items from the music and sound archive.
2. Control each selected layer's volume and loop state.
3. Start and stop all layers from explicit visitor actions.
4. Duck machine ambience while installation layers play, and restore it when they stop.
5. Avoid automatic playback before a visitor gesture.

### Acceptance criteria
- No audio begins merely by opening the installation panel.
- Start, stop, volume and loop controls are keyboard accessible.
- Stopping the installation releases every audio element.
- Existing machine ambience remains independently muteable.

## M49 — Visitor memory exchange

**Priority:** P2 / backend-dependent  
**Status:** Privacy and moderation design drafted; implementation blocked by release gates  
**Depends on:** approved moderation model, backend/data-region selection, named moderation owners and legal/privacy review

### Goal
Allow visitors to contribute an anonymous memory fragment without exposing the archive to unmoderated uploads.

### Scope
1. Accept a plain-text fragment of up to 500 characters, optionally responding to a prompt.
2. Allow an optional association to one existing archive record selected from an allowlist.
3. Require explicit consent and human moderation before publication; include withdrawal and report handling.
4. Defer photographs, audio uploads, arbitrary links, comments, direct messages and public profiles.
5. Keep the current static build fully functional without the service.

### Boundary
This cannot be implemented securely with the current static-only architecture. It requires a separately selected backend, moderation workflow and privacy policy.

**Design reference:** [M49 — Visitor Memory Exchange: Privacy, Consent, Moderation and Abuse Prevention](../privacy/M49-VISITOR-MEMORY-EXCHANGE-PRIVACY-AND-MODERATION.md).

The first-release model is text-first and anonymous: maximum 500 characters, optional association with one existing archive ID, no arbitrary links or media uploads, no accounts or public handles, and explicit consent. Every contribution remains private until a human moderator approves it. Automated checks may triage but may never publish. Pending, rejected and quarantined material is excluded from public reads. A one-time withdrawal key supports contributor-initiated removal without an account.

The design sets bounded retention targets, rate limits, rotating keyed anti-abuse identifiers, moderator MFA and role separation, report handling, backup deletion and incident response. Photographs, uploaded audio, comments, direct messages and public profiles are deferred.

M49 remains **design-only**. No frontend submission form, upload endpoint, API client, analytics event or hidden storage path may be added until every release gate in the design document is complete.

## M50 — Temporal archive

**Priority:** P2  
**Status:** Implemented static/browser-local baseline  
**Depends on:** M28, M43, M45

### Goal
Let the machine's available fragments and tone shift with local time and the archive's own chronology, without changing the source catalogue.

### Scope
1. Build a complete chronology directly from source catalogue date values, preserving day-, month- and year-only precision.
2. Keep undated or unparsed records visible in a separate section; do not assign invented dates.
3. Show missing years between dated records as gaps in the catalogue, not as claims about unrecorded events.
4. Use the visitor's local clock for restrained presentational variation and a deterministic hourly echo within the current day-part.
5. Keep the implementation static and browser-local, without network calls, cookies, local storage or visitor profiles.
6. Keep every archive record reachable and preserve the original category selectors and archive rotation.

### Implemented behaviour
- A TIME ARCHIVE action opens the complete newest-first chronology, grouped by year and month.
- The visitor-local hour, constrained by its day-part, selects one existing catalogue fragment as an hourly echo. The interface explicitly states that this does not imply the work was originally recorded at that hour.
- Every chronological entry opens its original archive record.
- Date precision and original catalogue values are preserved; unplaced entries remain available.
- The local clock is read at render time only. No temporal preference or clock value is persisted or transmitted.

### Acceptance criteria
- Time changes presentation, never the underlying catalogue or original record dates.
- All source catalogue entries appear in the chronology, including undated and unplaced entries.
- Year-only records are not assigned invented months or days.
- Missing years and unknown dates remain visible without invented chronology.
- The local clock is not transmitted or persisted; no backend or visitor profile is used.
- The complete archive and original category selectors remain reachable at every hour.

## Cross-cutting technical rules

- Keep the site static and account-free unless a later milestone explicitly approves a backend.
- Keep visitor state browser-local and document each storage domain.
- Keep the archive catalogue as the source of truth.
- Use stable archive IDs in links, receipts, objects and graph edges.
- Do not overwrite archival masters when generating web derivatives.
- Do not fabricate location, recording duration, date, credit or provenance.
- Treat browser-only tests and real-device tests as separate evidence.
- Keep the machine's physical 429 × 932 composition intact; exploration panels should deepen the machine, not turn it into a conventional portfolio.