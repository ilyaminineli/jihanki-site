#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const window = {};
const context = vm.createContext({ window });
for (const source of ["data/archive.js", "js/categories.js", "js/geography.js", "js/relationships.js"]) {
  vm.runInContext(await readFile(source, "utf8"), context, { filename: source });
}
const archive = window.JIHANKI_ARCHIVE || [];
const notes = window.JIHANKI_CATEGORIES.items("notes");
const hidden = [
  "expedition-index",
  "photo-intake-addition-4",
  "photo-intake-addition-5",
  "dynakyris-japan-corroborations-2026-11-27",
  "person-banbutsu-san",
  "person-shoko-asahara",
  "kadoya-shoten-miura-contact"
];
for (const id of hidden) {
  assert.equal(archive.some(item => item.id === id), false, "Non-machine editorial/context record must not be public: " + id);
  assert.equal(notes.some(item => item.id === id), false, "Hidden record leaked into NOTES: " + id);
  assert.equal(window.JIHANKI_GEOGRAPHY.entries("Kyoto").some(item => item.id === id), false,
    "Hidden context record leaked into the public place index: " + id);
}
for (const id of ["first-jihanki-note", "archive-rotation", "daily-2026-07-22", "daily-2026-08-03"]) {
  assert(archive.some(item => item.id === id), "JIHANKI origin / field memory was removed by the editorial cleanup: " + id);
}
for (const id of ["photo-203", "photo-251", "photo-202", "photo-247", "photo-250"]) {
  assert(archive.some(item => item.id === id), "Photographic archive record was removed: " + id);
}
const relatedIds = archive.flatMap(item => Array.isArray(item.metadata?.related) ? item.metadata.related : []);
for (const id of hidden) {
  assert(!relatedIds.includes(id), "A public archive record still points to a hidden editorial/context record: " + id);
}
const definitions = window.JIHANKI_RELATIONSHIPS.linkDefinitions;
for (const [source, links] of Object.entries(definitions)) {
  assert(archive.some(item => item.id === source), "A relationship source no longer exists in the public archive: " + source);
  for (const link of links) assert(archive.some(item => item.id === link.id),
    "A relationship target no longer exists in the public archive: " + source + " -> " + link.id);
}
console.log("Public archive tests passed: internal intake prompts and non-Jihanki context remain unlisted; trip chapters and all photo records remain.");
