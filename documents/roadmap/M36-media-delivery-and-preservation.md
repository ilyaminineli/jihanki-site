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
