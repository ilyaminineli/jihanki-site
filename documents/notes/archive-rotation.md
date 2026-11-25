# ARCHIVE ROTATION

**Date:** 2026  
**Type:** Concept note  
**Tags:** memory, tunnel, archive, time, sound

The tunnel is a recording device.

The walls remember footsteps, coins, engines and voices.

At night, the archive rotation takes place.

The past is overwritten.

## Core idea

A place does not contain one memory.

It contains layers.

The JIHANKI archive should feel incomplete.

Every item is only a fragment.

The user should never be completely sure whether they are viewing documentation, fiction, memory, field recording, reconstruction, or an accidental trace.


## Machine implementation

The current static-site implementation gives the rotation a date-based cycle. Each cycle surfaces one record from each of the eight physical archive categories, and up to three records from the preceding cycle remain as **RESIDUE**. The rotation changes what is foregrounded, not what exists: category browsing continues to expose the complete catalogue, and no source document or media file is overwritten.

The rotation is deterministic for a given local calendar date, so refreshes do not reshuffle the current day. The previous day's fragments are selected from the same deterministic rule and are shown as a partial trace of the prior cycle.
