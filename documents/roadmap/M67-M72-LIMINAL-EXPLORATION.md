# M67–M72 — Liminal Archive Exploration

**Direction:** Extend the archive as a quiet, optional exploration game. The archive remains the artwork and source of truth; game mechanics should be almost invisible until they become meaningful.

This programme deliberately narrows the earlier feature proposal. It is not a conventional gamification layer and should not become a checklist-driven travel app.

## Design boundaries

- No XP, levels, leaderboards, streaks, deadlines, public profiles or daily missions.
- No fake shared stock, artificial rarity, second currency or rewards for raw browsing volume.
- No GPS tracking, geocaching or claims that a schematic trail is an exact route.
- No auto-generated stories that explain every photograph or relationship.
- No visitor-facing progress system that pressures people to complete the archive.
- A title, date, place name or single sentence may be the complete editorial context. Some fragments may remain unexplained.
- Any discovery state remains browser-local and optional. It must not be transmitted or treated as a verified physical visit.
- Every factual connection must come from a curated source relationship or explicit archive metadata. Visual similarity alone is not evidence.

## Milestones

| Milestone | Focus | Status |
| --- | --- | --- |
| [M67](#m67--place-and-relationship-integrity) | Place and relationship integrity | Implemented |
| [M68](#m68--field-impressions) | Field Impressions | Implemented |
| [M69](#m69--memory-traces) | Memory Traces | Implemented |
| [M70](#m70--curators-cabinet) | Curator’s Cabinet | Implemented |
| [M71](#m71--listening-room) | Listening Room | Deferred until additional source samples are supplied |
| [M72](#m72--quiet-signals) | Quiet Signals | Later / experimental |

## M67 — Place and relationship integrity

**Status:** Implemented.

Correct the false Okinawa association and make it harder for a location error to return through a human-readable relationship label.

- The three confirmed records photo-202, photo-247 and photo-250 remain indexed under Miyukihama, Odawara.
- Replace the mistaken “same Okinawa outing” wording with the confirmed Miyukihama / Odawara context.
- Distinguish the sign text “MIYUKI BEACH” from the actual locality name, Miyukihama.
- Correct the historical-corrections text in data/README.md; the addition_4 intake includes Kyoto and Osaka photographs and a separate school-sign photograph near Miyukihama, Odawara.
- Add a semantic regression test for the locality, the curated cross-links and the absence of an Okinawa assignment.

**Acceptance:** the geographic index contains the three photographs under Miyukihama and Odawara, Okinawa has no assigned archive records, and the relationship labels do not present the beach sign as a locality or claim an Okinawa visit.

## M68 — Field Impressions

**Status:** Implemented.

A very small exploration loop based on the documented Saikoneon → first summit near Saiko outing. The existing trail already supplies five source photographs and four source-grounded stages.

- Opening all five source photographs, in any order, issues one local Field Impression in the Museum.
- Existing browser-local Visit Trail entries count as previously encountered fragments; no re-reading is required after an update.
- The pass is a souvenir of encountering the archive, not proof that the visitor physically completed the hike.
- The pass preserves its five source IDs in the Collection backup and can be saved as a text object.
- No visible checklist, progress percentage, timer, score, deadline or GPS tracking is added.

This first implementation is limited to one trail. More should be added only if they contribute something distinct to the archive experience.

## M69 — Memory Traces

**Status:** Implemented.

One curated trace now recognises the Satyam 1 chain. Encountering all three source records, in any order, adds one private Memory Trace object to the Museum:

- photo-127 — earlier view
- daily-2026-08-03 — Koba-san visit and context
- photo-173 — present-day clearing

The module verifies the curated source links before enabling the trace. There is no puzzle prompt, guessed answer, score or requirement to follow every graph edge. The trace object preserves the three source IDs and remains local to the visitor’s browser.

## M70 — Curator’s Cabinet

**Status:** Implemented.

The existing shelves are now personal exhibitions. Each shelf keeps its visitor-chosen title and selected records; no explanatory note or cover image is required. An optional “Export Exhibition Card” action downloads a self-contained HTML card with print styling, the shelf title and its selected archive records. The existing Museum backup continues to preserve shelves.

## M71 — Listening Room

**Status:** Deferred until additional source samples are supplied.

The current Sound Lab already supports layered archive listening. Do not invent artificial audio challenges or overbuild a save/load recipe system before the source palette grows. When new samples arrive, review the new material, update the archive catalogue and manifest, then decide whether saved listening arrangements are genuinely useful.

## M72 — Quiet Signals

**Status:** Later / experimental.

A few authored, rare machine responses may acknowledge a meaningful return or a completed curated connection. Keep the existing anomalies atmospheric. Do not expose a secret checklist, make discovery repeatable for points, or turn randomness into an economy. This milestone may be dropped entirely if it makes the machine feel too game-like.

## Implementation order

1. Keep M67’s semantic checks in CI.
2. Build only the single-trail M68 experiment and evaluate its tone before expanding.
3. Add one M69 trace only after the trail interaction feels settled.
4. Revisit M70 and M72 only if they add atmosphere rather than administrative work.
5. Leave M71 dormant until the additional audio material is available.
