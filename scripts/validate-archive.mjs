#!/usr/bin/env node
/**
 * JIHANKI repository integrity check.
 * Uses only Node's standard library; no build dependencies are required.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { validateRecordSchema } from "./archive-schema.mjs";
import { validateMediaManifest } from "./media-manifest.mjs";
import { validateMarkdownRepository } from "./markdown-links.mjs";

const root = process.cwd();
const issues = [];
const report = (message) => issues.push(message);
const read = (relative) => {
  const full = path.join(root, relative);
  if (!existsSync(full)) {
    report("Missing required file: " + relative);
    return "";
  }
  return readFileSync(full, "utf8");
};
const context = vm.createContext({ window: {} });

try {
  vm.runInContext(read("data/archive.js"), context, { filename: "data/archive.js" });
  const sourceArchive = context.window.JIHANKI_ARCHIVE || [];
  const sourceIds = sourceArchive.map((record) => record.id);
  const duplicateSourceIds = sourceIds.filter((id, index) => id && sourceIds.indexOf(id) !== index);
  [...new Set(duplicateSourceIds)].forEach((id) => report("Duplicate source archive id: " + id));

  vm.runInContext(read("js/categories.js"), context, { filename: "js/categories.js" });
  vm.runInContext(read("js/relationships.js"), context, { filename: "js/relationships.js" });

  const archive = context.window.JIHANKI_ARCHIVE || [];
  const categories = context.window.JIHANKI_CATEGORIES;
  const validStock = new Set(["new", "available", "low-stock", "sold-out", "restocking", "archived", "withdrawn"]);
  const ids = new Set();

  if (!archive.length) report("Archive is empty or failed to initialise.");
  archive.forEach((record, index) => {
    const prefix = "Record " + (record.id || "#" + (index + 1)) + ": ";
    validateRecordSchema(record).forEach(message => report(prefix + message));
    for (const field of ["id", "title", "type", "category"]) {
      if (!String(record[field] || "").trim()) report(prefix + "missing required field " + field);
    }
    if (record.id) {
      if (ids.has(record.id)) report(prefix + "duplicate runtime ID");
      ids.add(record.id);
    }
    if (categories?.categoryFor(record) === "unclassified") {
      report(prefix + "unknown physical category alias: " + record.category);
    }
    if (!validStock.has(String(record.stock?.status || "available").toLowerCase())) {
      report(prefix + "invalid stock status: " + record.stock?.status);
    }
    for (const field of ["file", "image", "projectPath"]) {
      const target = record[field];
      if (!target || /^https?:\/\//i.test(target)) continue;
      const normalized = path.normalize(String(target).replace(/\\/g, "/"));
      const resolved = path.resolve(root, normalized);
      if (path.isAbsolute(String(target)) || normalized.startsWith("..") ||
        (resolved !== root && !resolved.startsWith(root + path.sep))) {
        report(prefix + field + " escapes the repository: " + target);
      } else if (!existsSync(resolved)) {
        report(prefix + field + " does not resolve: " + target);
      }
    }
  });

  const unknown = categories?.unknown?.() || [];
  if (unknown.length) report("Unclassified records: " + unknown.map((record) => record.id).join(", "));

  const relationAudit = context.window.JIHANKI_RELATIONSHIPS?.validate?.();
  if (relationAudit?.unresolvedSources?.length) {
    report("Relationship source IDs not found: " + relationAudit.unresolvedSources.join(", "));
  }
  if (relationAudit?.unresolvedTargets?.length) {
    relationAudit.unresolvedTargets.forEach(({ from, to, source }) => {
      report("Unresolved " + source + " relationship: " + from + " -> " + to);
    });
  }
} catch (error) {
  report("Archive initialisation failed: " + (error?.stack || error));
}

const manifestText = read("data/media-manifest.json");
if (manifestText) {
  try {
    const manifest = JSON.parse(manifestText);
    validateMediaManifest(root, manifest).forEach(report);
    const manifestPaths = new Set(Array.isArray(manifest.files)
      ? manifest.files.map(entry => entry?.path).filter(value => typeof value === "string") : []);
    for (const record of context.window.JIHANKI_ARCHIVE || []) {
      for (const field of ["file", "image"]) {
        const target = record[field];
        if (typeof target === "string" && target.startsWith("media/") && !manifestPaths.has(target)) {
          report("Archive media reference is absent from manifest: " + record.id + " -> " + target);
        }
      }
    }
  } catch (error) { report("Media manifest is invalid JSON: " + error.message); }
}

const index = read("index.html");
const htmlIds = [...index.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
const seenHtmlIds = new Set();
htmlIds.forEach((id) => {
  if (seenHtmlIds.has(id)) report("Duplicate HTML id in index.html: " + id);
  seenHtmlIds.add(id);
});

const scriptPaths = [...index.matchAll(/<script\s+src=["']([^"']+)["']/g)].map((match) => match[1]);
scriptPaths.forEach((script) => {
  if (!existsSync(path.resolve(root, script))) report("Missing runtime script: " + script);
});
if (!existsSync(path.join(root, "sw.js"))) report("Missing service worker: sw.js");

for (const [page, prefix] of [["index.html", "site"], ["projects/aokigahara/index.html", "AOKIGAHARA"]]) {
  const html = read(page);
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    const target = match[1];
    if (/^(https?:|data:)/i.test(target)) continue;
    const resolved = path.resolve(root, path.dirname(page), target);
    if (!resolved.startsWith(root + path.sep) || !existsSync(resolved)) {
      report(prefix + " page has a missing image: " + target);
    }
  }
}

const markdownReport = validateMarkdownRepository(root);
markdownReport.issues.forEach(report);

if (issues.length) {
  console.error("JIHANKI integrity check failed:");
  issues.forEach((issue) => console.error(" - " + issue));
  process.exitCode = 1;
} else {
  console.log("JIHANKI integrity check passed.");
  console.log("Validated " + (context.window.JIHANKI_ARCHIVE?.length || 0) + " runtime archive records, relationships, local paths, exact media manifest coverage, Markdown relative links and anchors, HTML IDs and script references.");
}
