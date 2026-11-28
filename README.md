# JIHANKI — Interactive Archive

**JIHANKI (自販機)** is an interactive archive presented through the interface of a Japanese vending machine. It brings together photographs, field notes, travel memories, sound, music, video, creative projects and the relationships between them.

The project began during the July 2026 stay of **Ilya Minin (Eli) and Takismana** at **SAIKONEON**, near Lake Saiko in Yamanashi, Japan. Encounters with ordinary vending machines, roads, forests, tunnels, shrines and small settlements became the starting point for an archive that returns fragments of memory through a machine-like interface.

The repository is the source archive. The vending machine is the way visitors encounter it.

- **Live site:** https://ilyaminineli.github.io/jihanki-site/
- **Repository:** https://github.com/ilyaminineli/jihanki-site
- **Residency:** https://saikoneon.com/

## What the site contains

- A fixed-coordinate, responsive vending-machine interface (429 × 932 design space) with eight physical archive selectors.
- A catalogue of texts, photographs, video, UTAU voicebanks, music, field recordings, notes and performances.
- Credit-based dispensing, stock states and browser-local transaction receipts.
- A searchable archive with typed relationships between works, people, photographs, notes and places.
- A schematic memory map with geographic place anchors and an archive-network view. Approximate places remain visibly approximate; it is not a GPS route map.
- A browser-local collection with acquired works, saved works, thematic shelves, serialized objects, a visit trail and separate backup/restore controls.
- Chronology, daily archive rotation and a maintenance terminal.
- Sound Lab with LIVE MIX and sequential ARCHIVE LISTENING.
- Small optional archive experiences: Field Impressions, Memory Traces, Curator’s Cabinet and Quiet Signals.
- Offline shell and requested-resource caching through a service worker.
- A shared monochrome JIHANKI Analog UI system.

The visitor-facing machine remains intentionally restrained. There are no XP levels, leaderboards, streaks, daily missions or forced explanations for photographs. A title, date, place name or single sentence can be enough; some fragments are allowed to remain unexplained.

## How the repository is organised

| Path | Purpose |
| --- | --- |
| `index.html` | Machine shell, fixed physical controls, CRT and artifact viewer. The physical machine skin remains inline. |
| `css/archive-system.css` | Archive panels, viewers and feature-specific interface styles. |
| `css/jihanki-analog.css` | Shared palette, typography, surfaces, controls and design tokens. |
| `data/archive.js` | Archive catalogue and record metadata. |
| `data/media-manifest.json` | File size and Git blob fingerprint for local media assets. |
| `js/` | Runtime modules, loaded in dependency order from `index.html`. |
| `documents/` | Field notes, projects, scripts, research, design guidance, privacy decisions and roadmaps. |
| `media/` | Source photographs, audio, music, video and interface sounds. |
| `assets/` | Machine artwork, seasonal variants and Japan prefecture SVG. |
| `projects/aokigahara/` | Standalone Aokigahara project experience. |
| `scripts/` | Archive schema, media manifest and repository integrity tooling. |
| `.github/workflows/` | GitHub Actions validation workflow. |
| `sw.js` | Offline shell and runtime cache. |

### Runtime modules

The current `js/` directory separates category semantics, events, inventory, typed relationships, geography and map rendering, rotation and chronology, receipts, personal collection and museum functions, audio, listening room, markdown/media rendering, maintenance, anomalies, discovery, field impressions, memory traces, quiet signals, machine personality, interaction-state handling and the machine controller.

The script order in `index.html` is the runtime dependency order. Do not remove a module merely because its milestone is complete: completed milestones describe implemented behaviour, not dead code.

## Archive and editorial material

Long-form source material is kept in Markdown so that it remains editable and can be read outside the interface.

- `documents/notes/daily/` contains the chronological Japan journey chapters.
- `documents/notes/photo-identification-register.md` tracks the 251 unique Japan photographs, source confidence and cross-collection relationships.
- `documents/notes/photo-intake-2026-11-27*.md` preserves the filename-level intake records for additions 3, 4 and 5.
- `documents/notes/photo-memory-prompts-2026-11-27.md` contains the remaining questions and unresolved identifications. Resolved questions should not be asked again.
- `documents/notes/map-coordinate-register-2026-11-27.md` explains the map source, anchor precision and deliberately approximate locations.
- `documents/notes/dynakyris-japan-corroborations-2026-11-27.md` preserves a separate traveller's corroborating perspective.
- `documents/design/JIHANKI-ANALOG-DESIGN-SYSTEM.md` defines shared interface rules.
- `documents/roadmap/` contains the implemented M35–M50 foundations and the M67–M72 liminal exploration programme.

Editorial registers and intake notes are archive provenance, not automatically visitor-facing memories. Do not add internal prompts, implementation instructions or analysis notes as public NOTES entries unless they are deliberately rewritten as an actual archive item.

## Adding an archive entry

1. Add the real document or media file to its appropriate folder.
2. Add a record with a stable ID to `data/archive.js`.
3. Add meaningful typed links in `js/relationships.js` and place metadata in `js/geography.js` or `js/map.js` only when the source supports them.
4. Rebuild or check the media manifest when local media changes.
5. Run the repository integrity validator.

Example catalogue record:

```javascript
{
  id: "my-new-entry",
  title: "MY NEW ENTRY",
  date: "2026-08-14",
  type: "text",
  category: "notes",
  group: "FIELD NOTES",
  file: "documents/notes/my-new-entry.md",
  metadata: {
    locations: ["Lake Saiko"],
    related: []
  }
}
```

Do not infer capture dates, GPS coordinates, venue names or exact chronology from filenames, visual similarity or ordering. Keep uncertainty explicit. Distinguish a same-photo sequence, shared subject, source corroboration, actual geographic relationship and chronological journey link; these are not interchangeable.

## Local development and validation

The site is static: no framework, package build step, backend or visitor account is required. Use an HTTP server rather than opening the page using `file://`.

```bash
python -m http.server 8000
```

Then open http://localhost:8000/.

The current repository contains a compact set of maintained validation utilities:

```bash
node scripts/build-media-manifest.mjs --check
node scripts/validate-archive.mjs
```

The first command checks the exact local media manifest; omit `--check` when you intentionally want to regenerate it. The integrated validator checks catalogue schema, stable IDs, category mapping, stock states, local paths, typed relationship targets, media-manifest coverage, duplicate HTML IDs, runtime script references, required images and Markdown links/anchors.

GitHub Actions also checks JavaScript syntax on Node.js 22 and runs the maintained validators on relevant pushes and pull requests. The former standalone regression test scripts were removed during repository cleanup; they are not current commands. Physical iOS Safari and Android Chrome checks should still be performed manually before a release.

## Design and preservation rules

1. Keep the machine's 429 × 932 internal coordinate system and its proportional scaling.
2. Keep catalogue data in `data/archive.js`, runtime behaviour in focused `js/` modules, styles in the shared CSS layers, and source material in `documents/` and `media/`.
3. Keep all visitor collection, receipt and preference data browser-local unless a separately approved backend and consent model is introduced.
4. Keep stable archive IDs when updating titles, media or metadata.
5. Do not fabricate missing dates, places, routes, authorship or provenance.
6. Do not overwrite archival masters when making web derivatives.
7. Keep map lines typed and semantically distinct; a visual resemblance is not evidence of a shared location or event.
8. Test desktop, phone portrait and short-landscape layouts after interface changes.

## Current status

**Experimental / actively developed.** The M67–M72 programme is implemented as optional, small-scale archive experiences. The broader roadmap remains open for maintenance, preservation, accessibility and carefully sourced additions. See [the roadmap index](documents/roadmap/README.md).
