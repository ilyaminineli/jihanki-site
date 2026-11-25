# M38 — Accessibility and device robustness

**Status:** Baseline fixes in progress  
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
