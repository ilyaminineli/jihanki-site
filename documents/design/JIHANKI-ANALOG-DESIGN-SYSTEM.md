# JIHANKI Analog UI System

**Status:** Active design reference  
**Applies to:** the vending-machine shell, archive panels, Memory Network, Chronology, Museum, Sound Lab and standalone project dossiers.

This document is the source of truth for new interface work. Pages may have different information architecture and imagery, but should read as parts of the same physical machine.

## 1. Visual premise

JIHANKI should feel like an old Japanese vending machine with a small monochrome CRT: a maintained but weathered object, quiet phosphor, hard edges, limited light and dense information labels. The interface is not a generic dark-mode dashboard, a glossy cyberpunk terminal or a modern editorial magazine.

The machine artwork supplies the physical texture. CSS should not compete with it by adding bright frames, heavy glow, decorative cards or unrelated typefaces.

## 2. Shared tokens

Use the variables in `css/jihanki-analog.css`. Do not introduce a new shade for an existing role without a documented reason.

| Token | Purpose | Default |
|---|---|---|
| `--jhk-ink` | outer page / deepest black | `#050505` |
| `--jhk-screen` | CRT and base surface | `#080808` |
| `--jhk-panel` | archive panel | `#0d0d0d` |
| `--jhk-panel-raised` | inset media / inner panel | `#121212` |
| `--jhk-panel-hover` | restrained hover surface | `#191919` |
| `--jhk-text` | normal information | `#dddddd` |
| `--jhk-text-strong` | main heading / selected value | `#eeeeee` |
| `--jhk-text-soft` | secondary description | `#aaaaaa` |
| `--jhk-text-muted` | metadata / labels | `#777777` |
| `--jhk-text-faint` | tertiary detail | `#555555` |
| `--jhk-line` | default separator | white at 14% |
| `--jhk-line-soft` | quiet separator | white at 8% |
| `--jhk-line-strong` | important boundary | white at 32% |
| `--jhk-focus` | keyboard focus | white at 72% |

The default palette is neutral grayscale. Do not use green phosphor, cyan, amber or another accent system for one page unless the work is a deliberately separate artwork and is clearly labelled as such. Use contrast, dash pattern, shape and line weight—not a new colour palette—to distinguish map relationships and location precision.

## 3. Typography

- **Interface / metadata / body:** `--jhk-font-mono` (Courier New stack).
- **Japanese place names:** `--jhk-font-japanese` is allowed where a Mincho face improves legibility or preserves Japanese character; keep Latin metadata in the mono face.
- **Display hierarchy:** make hierarchy with size, weight, spacing and line breaks within the same type system. Do not introduce Impact, Arial Narrow, Helvetica, Georgia or generic sans-serif display headlines into archive UI.
- **Body copy:** keep readable, but do not switch an entire page to a separate magazine or book typography system.
- **Long archival text:** preserve the text and source formatting when it is part of the record; the surrounding interface remains JIHANKI.

## 4. Surfaces, borders and geometry

- Prefer flat black / near-black surfaces with subtle inset variation.
- Default border radius is `--jhk-radius: 0`. Physical photographs and source images retain their natural corners.
- Use thin, translucent grey separators. Bright white borders are reserved for the primary action or a necessary high-contrast state.
- Avoid large glows, gradients with strong colour, rounded dashboard cards, drop-shadow stacks and bright hover fills.
- Use spacing tokens in multiples of four where practical.
- The machine image remains the source of physical texture; do not simulate rust, scratches or bevels on every content card.

## 5. Interaction states and accessibility

- Resting controls should remain visually quiet.
- Hover may slightly brighten text, border or panel; it should not create a bright square around an oversized invisible hit area.
- Keyboard focus must remain visible with a thin neutral outline and adequate offset.
- Preserve large touch targets even when the visible control is small.
- Honour `prefers-reduced-motion`; avoid continuous animation unless it communicates a real function.
- Disabled, pending, uncertain and missing states must be described in text as well as indicated visually.

## 6. Page patterns

- **Chronology:** a compact archive register, mono wordmark, subtle separators, mono body copy and contact sheets. Large text is allowed, but not a different display font.
- **Memory Network:** monochrome map canvas and pins. Keep typed edges, dash patterns, precision shapes, Japanese labels, pan/zoom and map legend semantics. Do not turn the map green merely to make it look technological.
- **Museum / Collection:** terminal-style metadata and quiet panel surfaces. Collected objects can retain a small inscription treatment, but the interface should remain mono.
- **Sound Lab:** LIVE MIX and ARCHIVE LISTENING remain two modes in one panel. Controls use the same square, grey terminal language.
- **Project dossier:** may have its own information architecture and larger margins, but should consume shared palette tokens and the same mono type family.

## 7. Intentional exceptions

These are output formats, not alternate site UI themes:

- **Printed receipts:** may use a light paper-like page because they represent a physical receipt.
- **Exported Curator's Cabinet cards:** may use a paper print layout because the file is intended to be printed or shared independently.
- **Archive media and artwork:** never alter the source file to match UI chrome. A page may apply a reversible presentation filter (for example, the monochrome Chronology contact sheet or grayscale map backdrop); the opened archive record remains the original source.
- **Japanese place labels:** Mincho typography may be used for glyph clarity, but supporting labels and counts remain mono.

## 8. Implementation rules for future work

1. Load `css/jihanki-analog.css` after feature-specific stylesheets.
2. Use the existing tokens rather than hardcoded colours or one-off font declarations.
3. Keep page-specific CSS in the page/module stylesheet; shared visual decisions belong in the analog system.
4. Before adding a new component, check whether an existing pattern already covers it.
5. Add responsive browser assertions for important layout and style contracts.
6. When an intentional exception is necessary, add it to this guide instead of quietly introducing a second design language.

The design system governs presentation, not archive meaning. It must never change source records, dates, place certainty, relationship semantics or visitor-local privacy behaviour.
