#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { extractMarkdownDestinations, validateMarkdownRepository } from "./markdown-links.mjs";

const root = mkdtempSync(path.join(os.tmpdir(), "jihanki-markdown-links-"));
try {
  mkdirSync(path.join(root, "docs"), { recursive: true });
  writeFileSync(path.join(root, "docs", "target.md"), "# Existing heading\n\n## Repeated\n\n## Repeated\n");
  writeFileSync(path.join(root, "docs", "index.html"), '<h1 id="machine">Machine</h1>');
  writeFileSync(path.join(root, "docs", "source.md"), [
    "# Source",
    "[valid](target.md#existing-heading)",
    "[duplicate heading](target.md#repeated-1)",
    "[html anchor](index.html#machine)",
    "![image-like reference](../assets/missing.png)",
    "[missing](absent.md)",
    "[missing fragment](target.md#does-not-exist)",
    "[external](https://example.org/path)",
    "```md",
    "[not checked](not-a-real-file.md)",
    "```"
  ].join("\n"));
  const links = extractMarkdownDestinations("[one](a.md) and [two](b.md)\n\n`[code](c.md)`");
  assert(links.some(link => link.destination === "a.md") && links.some(link => link.destination === "b.md"),
    "Inline links were not extracted");
  assert(!links.some(link => link.destination === "c.md"), "Inline code link was not ignored");

  const result = validateMarkdownRepository(root);
  assert(result.files === 2, "Expected to scan both Markdown fixture files");
  assert(result.issues.some(issue => issue.includes("absent.png")), "Missing image link was not detected");
  assert(result.issues.some(issue => issue.includes("absent.md")), "Missing Markdown link was not detected");
  assert(result.issues.some(issue => issue.includes("does-not-exist")), "Missing anchor was not detected");
  assert(!result.issues.some(issue => issue.includes("valid") || issue.includes("duplicate heading") || issue.includes("html anchor")),
    "A valid relative path or anchor was incorrectly rejected");
  console.log("Markdown link fixtures passed: relative paths, images, repeated heading anchors, HTML IDs and code exclusions.");
} finally {
  rmSync(root, { recursive: true, force: true });
}
