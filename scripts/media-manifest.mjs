/* M37 — exact media manifest coverage and Git-blob fingerprint verification. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

function walkMedia(root, directory, output, issues) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walkMedia(root, full, output, issues);
    else if (entry.isFile()) output.push(path.relative(root, full).split(path.sep).join("/"));
    else if (entry.isSymbolicLink()) issues.push("Media directory contains a symbolic link: " + path.relative(root, full));
  }
}

export function validateMediaManifest(root, manifest) {
  const issues = [];
  if (!manifest || manifest.format !== "JIHANKI-MEDIA-MANIFEST" || manifest.version !== 1 || !Array.isArray(manifest.files)) {
    return ["Media manifest has an unsupported format."];
  }

  const actualFiles = [];
  walkMedia(root, path.join(root, "media"), actualFiles, issues);
  actualFiles.sort();
  const expected = new Set(actualFiles);
  const listed = new Set();

  for (const entry of manifest.files) {
    const relative = entry?.path;
    if (typeof relative !== "string" || !relative || path.posix.normalize(relative) !== relative ||
      !relative.startsWith("media/") || relative.startsWith("/") || relative.split("/").includes("..")) {
      issues.push("Media manifest path is not a canonical media-relative path: " + String(relative));
      continue;
    }
    if (listed.has(relative)) {
      issues.push("Media manifest has a duplicate path: " + relative);
      continue;
    }
    listed.add(relative);
    if (!expected.has(relative)) {
      issues.push("Media manifest path is missing from the media directory: " + relative);
      continue;
    }
    if (!Number.isSafeInteger(entry.size) || entry.size < 0) {
      issues.push("Media manifest has an invalid byte size: " + relative);
      continue;
    }
    if (typeof entry.gitBlobSha !== "string" || !/^[a-f0-9]{40}$/.test(entry.gitBlobSha)) {
      issues.push("Media manifest has an invalid Git blob SHA-1: " + relative);
      continue;
    }
    const bytes = readFileSync(path.join(root, relative));
    if (bytes.length !== entry.size) issues.push("Media size mismatch: " + relative);
    const actualSha = createHash("sha1")
      .update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes])).digest("hex");
    if (actualSha !== entry.gitBlobSha) issues.push("Media checksum mismatch: " + relative);
  }

  for (const relative of expected) {
    if (!listed.has(relative)) issues.push("Media file is absent from manifest: " + relative);
  }
  return issues;
}
