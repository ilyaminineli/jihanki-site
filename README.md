# JIHANKI — Interactive Archive

**JIHANKI (自販機)** is a web-based interactive archive presented as a Japanese vending machine interface.

It combines an experimental physical-machine UI with an archive of texts, sounds, music, photographs, scripts, and project documentation collected around the JIHANKI / Japan project.

The site is intentionally built as a lightweight static web application: no framework, no build step, and no backend are required.

## Origin — SAIKONEON / Lake Saiko

JIHANKI began at **SAIKONEON**, an artist-in-residence on the shore of Lake Saiko in Yamanashi, Japan, during the July 2026 Japan stay of **Ilya Minin (Eli) and Julia Baranyuk**.

The project grew out of nighttime walks, field observation, and encounters with ordinary infrastructure around Saiko. The first JIHANKI encounter was a vending machine seen at night near SAIKONEON. In the darkness, the machine stopped feeling like a simple commercial device and began to read as an isolated illuminated object — a small interface between a person and an otherwise quiet landscape.

That observation became the conceptual seed of the archive. The physical vending machines encountered around Saiko became a model for the website itself: instead of accepting money and returning a drink or snack, the digital machine accepts interaction and returns a fragment of memory.

The project therefore grew directly from the place and the journey rather than being designed as a generic archive independently of them.

SAIKONEON describes itself as a space for research, creation, collaboration, and exchange between creators from different fields, situated in the natural environment around Lake Saiko and Mount Fuji. The JIHANKI project belongs to that particular environment: lake, forest, roads, tunnels, small settlements, shrines, and isolated infrastructure all became part of the archive's source material.

Official residency site: <https://saikoneon.com/>

The original field note is preserved in:

```text
documents/notes/first-jihanki.md
```

## Credits

**JIHANKI — Interactive Archive**  
Concept, archive, interface, documentation and development: **Ilya Minin (Eli)**  
Origin / field experience: **SAIKONEON, Lake Saiko, Japan**  
Japan stay / shared field experience: **Julia Baranyuk**

## Features

* Interactive vending-machine interface with a fixed 429 × 932 coordinate system
* Explicit archive category mapping for all eight physical selectors
* Stock states: NEW, AVAILABLE, LOW STOCK, SOLD OUT, RESTOCKING and ARCHIVED
* Credit-based dispensing with a persistent balance and in-viewer coin insertion
* Accessible memory dialog with keyboard focus management and live status announcements
* Browser-local transaction receipts with print and text-export actions
* Hidden service terminal, local event journal and inventory diagnostics
* Cross-referenced memories, voice credits and geographic archive index
* Non-destructive daily archive rotation with fragments retained as residue
* Browser-local personal museum with collected works, serialized objects, saved shelves and visit trail
* Browser-local collection and museum backup/restore with separate clear controls
* Ambient machine states with volume transitions, media ducking and visitor mute control
* Rare, authored machine anomalies
* Memory archaeology with typed links between works, voices, notes and places
* Schematic memory map with place-index and archive-network modes
* Local, evolving machine personality with weighted rediscovery
* Serialized collectible memory objects linked to purchase receipts
* Archive search, offline shell cache and media metadata
* Versioned browser-local collection import/export
* Multi-layer audio installation mode using existing archive sounds
* Static temporal archive with visitor-local time presentation and the complete dated catalogue
* Markdown documents, images, audio and video rendered inside the artifact viewer
* Ambient JIHANKI loop and interface sound effects
* Static deployment: no framework, build step, backend or visitor account
* Works as a static site and can be served with any basic HTTP server

## Project Structure

```text
JIHANKI/
├── assets/
│   └── jihanki.png
│
├── css/
│   └── archive-system.css     # active supplemental CRT / archive / modal styles
│
# The fixed-coordinate machine skin and layout remain inline in index.html.
# machine.css and screen.css are retained as standalone layout references.
│
├── data/
│   ├── archive.js              # archive data only
│   └── README.md
│
├── documents/
│   ├── notes/
│   │   ├── archive-rotation.md
│   │   ├── expedition-2026-07-22.md
│   │   └── first-jihanki.md
│   │
│   ├── projects/
│   │   ├── aokigahara.md
│   │   └── fuji-sonicpi.md (historical pointer)
│   │
│   ├── scripts/
│   │   └── fuji-six-yokai-script.md
│   │
│   ├── privacy/
│   │   └── M49-VISITOR-MEMORY-EXCHANGE-PRIVACY-AND-MODERATION.md
│   │
│   └── yokai/
│       └── fuji-six-yokai.md
│
├── media/
│   ├── music/
│   ├── photo/
│   ├── sound/
│   │   └── jihanki-sfx/
│   │       ├── button-sound.opus
│   │       ├── entering-money.opus
│   │       ├── homebutton.opus
│   │       └── jihanki-music-loop.opus
│   └── video/
│
├── js/
│   ├── categories.js
│   ├── events.js
│   ├── inventory.js
│   ├── relationships.js
│   ├── geography.js
│   ├── rotation.js
│   ├── receipts.js
│   ├── collection.js
│   ├── museum.js
│   ├── temporal.js
│   ├── audio.js
│   ├── markdown.js
│   ├── maintenance.js
│   ├── anomalies.js
│   ├── video.js
│   └── machine.js
├── index.html
├── info.md
└── README.md
```

## Architecture

The application is intentionally simple.

### `index.html`

Contains the machine artwork, fixed-coordinate controls, CRT and artifact shell. Runtime code is loaded from the dedicated scripts below.

### `data/archive.js`

Catalogue data only. It defines the archive records and connects them with their actual files. It does not install UI behaviour.

### `js/`

The runtime is separated by responsibility: category semantics, inventory rules, receipts, events, relationships, geography, daily archive rotation, personal collection, ambient audio states, Markdown rendering, maintenance mode, anomalies, video presentation and the machine controller. The scripts are loaded in dependency order at the end of `index.html`.

### `documents/`

Long-form archive material lives here as Markdown.

Documents are separated by purpose:

* `notes/` — field notes, observations, and project records
* `projects/` — individual creative/technical projects
* `scripts/` — video and production scripts
* `yokai/` — yokai-related research and documentation

Markdown files are loaded dynamically and displayed inside the JIHANKI screen.

### `media/`

Actual media assets are kept separately from the archive metadata.

```text
media/
├── music/     # music and Sonic Pi renders
├── photo/     # photographs and archive imagery
├── sound/     # sound effects and interface audio
└── video/     # video material
```

## JIHANKI Interface

The vending machine is designed around a fixed internal coordinate system so that the physical proportions and interaction coordinates remain stable across different screen sizes.

The machine scales proportionally rather than being independently stretched in width and height.

This is especially important on phones, where the machine must remain correctly mapped to its visual buttons and screen.

## Audio

The interface uses a small set of dedicated JIHANKI sounds:

* `button-sound.opus` — interface interaction
* `entering-money.opus` — vending-machine interaction
* `homebutton.opus` — home/navigation interaction
* `jihanki-music-loop.opus` — continuous background ambience on current Safari
* `jihanki-music-loop.wav` — compatibility fallback for browsers without Ogg Opus support
* WAV fallbacks for the button, coin and home effects on older Safari

The background loop starts directly from the first user interaction. A WAV fallback is retained for older Safari versions that cannot reliably play Ogg Opus.

The machine changes the loop's level and playback character across idle, browsing, reading, dispensing, service, rotation and collection states. Foreground archive audio gently ducks the machine loop rather than abruptly stopping it. Visitors can mute/unmute all machine sound from the CRT home screen or with the M key; the choice is stored locally.

## Adding an Archive Entry

Add the actual document or media file first.

For a Markdown document, place it somewhere under `documents/`, for example:

```text
documents/notes/my-new-entry.md
```

Then add the corresponding entry to:

```text
data/archive.js
```

Example:

```javascript
{
    id: "my-new-entry",
    title: "MY NEW ENTRY",
    date: "2026-08-14",
    type: "text",
    category: "notes",
    group: "FIELD NOTES",
    file: "documents/notes/my-new-entry.md"
}
```

The catalogue entry provides the metadata; the Markdown file remains the actual archive content.

## Current Archive Material

The repository currently contains material related to:

* The SAIKONEON / Lake Saiko origin of the JIHANKI project
* The first JIHANKI encounter
* The July 2026 Japan expedition
* Archive rotation / catalogue behaviour
* The Aokigahara / Fuji Sonic Pi procedural ambient pentalogy album
* The Fuji Six Great Yokai project
* Video scripts and research
* Experimental music
* Photographic material
* JIHANKI interface sounds

The Fuji Sonic Pi project is represented by:

```text
documents/projects/fuji-sonicpi.md
```

with four associated audio renders in:

```text
media/music/
├── fuji-sonicpi-01.opus
├── fuji-sonicpi-02.opus
├── fuji-sonicpi-03.opus
└── fuji-sonicpi-04.opus
```

## Running Locally

Do not open `index.html` directly with `file://`.

Use a local HTTP server instead.

### Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Any other static HTTP server can be used as well.

## Design Principle

JIHANKI is not intended to behave like a conventional documentation website.

The repository is the underlying archive, while the vending machine is the interface through which the archive is experienced.

The separation is therefore intentional:

```text
ARCHIVE DATA
     ↓
data/archive.js
     ↓
CATEGORY / INVENTORY CONTRACTS
     ↓
FOCUSED RUNTIME MODULES
     ↓
DOCUMENTS / MEDIA
     ↓
JIHANKI MACHINE
```

The machine should remain visually and spatially stable while the archive itself continues to grow.

## Development Notes

There is no framework or compilation pipeline.

When modifying the project:

1. Keep the machine's internal coordinate system intact.
2. Keep archive metadata in `data/archive.js`.
3. Keep long-form text in Markdown files under `documents/`.
4. Keep binary media under `media/`.
5. Avoid introducing duplicate application logic.
6. Test the interface through an HTTP server rather than `file://`.
7. Check both desktop and phone-sized layouts after changes.

## Status

**Experimental / actively developed.**

JIHANKI is a living archive and interface. Its contents, visual design, sounds, documents, and interaction model are expected to evolve as new material is added.

## Machine systems

### Transactions and receipts

A successful purchase creates a browser-local receipt with a unique per-browser archive code, original archive date, transaction timestamp and item category. Receipts can be printed or saved as text. The receipt history is local to the visitor's browser.

### Stock and dispensing

Stock status is authored in each archive record. Supported states are `new`, `available`, `low-stock`, `sold-out`, `restocking`, and `archived`. Unavailable items remain visible for inspection but are excluded from dispensing. On a static site, purchases do not decrement shared stock: stock status is maintained in the published catalogue.

The dispenser first purchases the selected item. Without a selection, it draws randomly from available items in the active category; from the home screen it draws from the full available archive. One coin purchases one memory.

The Aokigahara / Fuji Sonic Pi fifth environment (Shrine / Ritual) is represented as a RESTOCKING record linked to the consolidated pentalogy dossier.

### Maintenance terminal

The service terminal is an undocumented interaction: press HOME three times, COIN twice, then hold MEMORY / PICK UP for approximately 2.6 seconds. It exposes public archive metadata, stock diagnostics, visitor-local receipts and event logs. This is an Easter egg, not an authentication boundary; all shipped documents and code remain publicly accessible.

### Local data and privacy

Receipts and event logs are stored in the visitor's browser using local storage. They are not sent to a server. Clearing browser storage removes that visitor-local history. The public archive and its stock definitions remain unchanged.

### M28 — Archive rotation

A date-based rotation surfaces one fragment from each of the eight machine categories. Up to three records from the previous day's rotation remain as RESIDUE. This only changes the current presentation: no archive record is deleted, rewritten or made inaccessible. The ordinary category selectors remain the complete archive.

### M32 — Ambient machine states

The original JIHANKI ambience loop transitions between idle, browsing, reading, dispensing, service, rotation, collection and anomaly profiles. Foreground archive media ducks the loop smoothly. A visitor-controlled mute preference is stored in the current browser. No sound begins before a user gesture.

### M33 — Personal collection

Successful purchases add the work and receipt code to a browser-local collection. Repeat purchases increment an acquisition count. Visitors can revisit collected memories, export the collection as JSON, or clear it locally. Collection data is not transmitted and is not shared between browsers or devices.

## Automated validation and device emulation

Run the repository integrity checks with Node.js 22 or later. CI also runs responsive/offline Chromium checks with Playwright:

```bash
node scripts/validate-archive.mjs
npm install --no-save playwright
npx playwright install chromium
node scripts/test-responsive.mjs
```

The integrity and browser checks run automatically on pushes and pull requests. The browser suite emulates phone portrait, phone landscape, tablet and desktop layouts; it checks map overflow, keyboard modal focus, touch target geometry and offline shell/document recovery. Physical iOS Safari and Android Chrome testing remains a manual release check. It verifies archive IDs and required fields, physical category mappings, stock states, local media/document paths, curated relationships, duplicate HTML IDs and runtime script references. The check does not decode or recompress media files.

## M49 — Visitor Memory Exchange

M49 is design-only and is not enabled. The moderation and privacy model is documented in [M49 — Visitor Memory Exchange](documents/privacy/M49-VISITOR-MEMORY-EXCHANGE-PRIVACY-AND-MODERATION.md). No contribution form, upload endpoint or remote visitor profile exists. Implementation remains blocked until a backend, data region, named moderation operators, deletion process and legal/privacy review are approved.

## M50 — Temporal Archive

The temporal archive is a static view over the existing public catalogue. It uses the visitor's browser-local clock for restrained presentation and the original archive date field for chronology. Date precision is preserved, unknown dates stay separately visible, and missing years are shown as catalogue gaps rather than invented events.

The module does not use a backend, network API, cookies, localStorage, IndexedDB or visitor profile. It does not change archive records, rotation rules or category availability. The complete archive remains accessible at every hour.

## Roadmap

The next development milestones are documented in [documents/roadmap/](documents/roadmap/README.md), from M35 machine interaction integrity through M50 temporal archive, including the active M41–M50 implementation map.
