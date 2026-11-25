# M35 — Machine interaction integrity

**Status:** Baseline fixes in progress  
**Depends on:** M25–M34.

## Goal

Make every machine interaction legible and reversible. A visitor should always understand the current screen, credit balance, selected memory and next available action.

## Baseline changes

- Keep the credit balance visible in the CRT and memory viewer.
- Allow one credit to be inserted from the open memory viewer, so the visitor does not have to close the viewer to reach the physical COIN control.
- Keep insufficient-credit feedback inside the viewer instead of writing it to the obscured CRT.
- Track the actual machine view (idle, category, location, rotation, collection, service) and restore the matching ambient profile after closing a memory.
- Ignore stale asynchronous Markdown responses after another memory has been opened or the viewer has closed.

## Remaining scope

1. Define one explicit interaction transition table for boot, browse, select, insert credit, dispense, read, close, service and recovery.
2. Make repeated coin presses, rapid item changes and simultaneous media playback deterministic.
3. Ensure every failed transaction preserves the selected item and remaining credit.
4. Add a small transaction confirmation state that distinguishes credit accepted, memory dispensed and receipt saved.
5. Add interaction tests for each transition, including no-credit, sold-out, archived and restocking records.

## Acceptance criteria

- No visible action produces feedback behind an open modal.
- A memory can be purchased without losing the selected record.
- Credit counts never become negative and remain consistent across screen changes.
- Closing a memory restores the precise screen and ambient state from which it was opened.
- A slow document response cannot replace the content of a newer selection.
- Every transaction has one unambiguous outcome and a corresponding receipt or failure event.
