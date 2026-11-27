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
| [M71](#m71--listening-room) | Listening Room | Implemented with existing archive sources |
| [M72](#m72--quiet-signals) | Quiet Signals | Implemented — one authored, browser-local response |

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

**Status:** Implemented using the existing archive sources.

The Listening Room is a sequential player, distinct from the Sound Lab's live multi-layer mixer. It uses the actual audio catalogue and preserves its existing source group labels:

- Four public renders from the FUJI SONIC PI / AOKIGAHARA pentalogy, in the documented order: Fujisan, Aokigahara, Saiko and Village. The fifth environment, Shrine, remains visible as pending and has no invented audio file.
- The separate Tongue Drums session remains a standalone session rather than being folded into the album.
- Seventeen field-archive sound fragments remain grouped by their catalogue labels: Environment / weather, Environment / contact, Voices / animal traces, Objects / signals and Musical fragments.

The four pentalogy renders are now individually catalogued as audio records and linked to the parent project. The Listening Room plays one source at a time, can start a room as a sequential queue, supports previous / next / stop, and advances when a recording ends. It does not invent geography, alter source files, create a saved mix or record listening history. Sound Lab remains the place for visitor-built simultaneous layers.

## M72 — Quiet Signals

**Status:** Implemented — deliberately limited to one signal.

Completing the existing curated Satyam 1 Memory Trace arms one browser-local response. On the visitor's next return to the machine home screen, it replaces the ordinary home line once: “THE CLEARING REMAINS / NO FURTHER DETAILS AVAILABLE”. The signal is not a prize, does not assert a physical visit, is not repeatable, and is never triggered by unrelated browsing or random chance. Its delivered state survives reloads. No secret checklist or new progression system is exposed.

## Implementation order

1. Keep M67’s place and relationship semantics checks in CI.
2. Keep M68 limited to the single documented Saiko trail.
3. Keep M69 limited to the curated Satyam 1 trace.
4. Keep M70 title-led and optional; no explanatory note or cover image is required.
5. Keep M71 grounded in the existing catalogue. Add later recordings only after their source identity and metadata are reviewed.
6. Keep M72 to its single authored Satyam 1 return signal; do not expand it into a catalogue of unlocks.
