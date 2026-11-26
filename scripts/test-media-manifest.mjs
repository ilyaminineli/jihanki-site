#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { validateMediaManifest } from "./media-manifest.mjs";

const root = mkdtempSync(path.join(os.tmpdir(), "jihanki-media-manifest-"));
function gitSha(bytes) {
  return createHash("sha1").update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes])).digest("hex");
}
try {
  mkdirSync(path.join(root, "media", "audio"), { recursive: true });
  const bytes = Buffer.from("archive-fragment");
  writeFileSync(path.join(root, "media", "audio", "sample.opus"), bytes);
  const valid = { format: "JIHANKI-MEDIA-MANIFEST", version: 1,
    files: [{ path: "media/audio/sample.opus", size: bytes.length, gitBlobSha: gitSha(bytes) }] };
  assert.deepEqual(validateMediaManifest(root, valid), [], "Valid manifest was rejected");

  const missing = { ...valid, files: [] };
  assert(validateMediaManifest(root, missing).some(issue => issue.includes("absent from manifest")),
    "Unlisted media file was accepted");

  const stale = { ...valid, files: [{ ...valid.files[0], path: "media/audio/removed.opus" }] };
  assert(validateMediaManifest(root, stale).some(issue => issue.includes("missing from the media directory")),
    "Stale manifest path was accepted");

  const brokenHash = { ...valid, files: [{ ...valid.files[0], gitBlobSha: "0".repeat(40) }] };
  assert(validateMediaManifest(root, brokenHash).some(issue => issue.includes("checksum mismatch")),
    "Incorrect media checksum was accepted");

  const traversal = { ...valid, files: [{ ...valid.files[0], path: "../outside.opus" }] };
  assert(validateMediaManifest(root, traversal).some(issue => issue.includes("not a canonical")),
    "Path traversal in the manifest was accepted");

  const duplicate = { ...valid, files: [...valid.files, { ...valid.files[0] }] };
  assert(validateMediaManifest(root, duplicate).some(issue => issue.includes("duplicate path")),
    "Duplicate manifest path was accepted");

  writeFileSync(path.join(root, "media", "audio", "untracked.wav"), Buffer.from("untracked"));
  assert(validateMediaManifest(root, valid).some(issue => issue.includes("untracked.wav")),
    "Untracked media asset was accepted");
  console.log("Media manifest fixtures passed: exact coverage, stale paths, checksums, traversal and duplicates.");
} finally {
  rmSync(root, { recursive: true, force: true });
}
