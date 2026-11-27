#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};
const visits = [];
const listeners = {};
const window = {
  JIHANKI_MAP: {
    trails: [{
      id: "saiko-first-summit-2026-07-27",
      title: "SAIKONEON → FIRST SUMMIT NEAR SAIKO",
      photoIds: ["photo-219", "photo-220", "photo-221", "photo-222", "photo-223"]
    }]
  },
  JIHANKI_MUSEUM: { trail: () => visits.slice() },
  addEventListener(type, callback) {
    (listeners[type] ||= []).push(callback);
  }
};
const context = vm.createContext({ window, localStorage, Date });
const collectionSource = await readFile("js/collection.js", "utf8");
const impressionsSource = await readFile("js/field-impressions.js", "utf8");
vm.runInContext(collectionSource, context, { filename: "js/collection.js" });
vm.runInContext(impressionsSource, context, { filename: "js/field-impressions.js" });

const collection = window.JIHANKI_COLLECTION;
assert(collection, "Collection module failed to initialise.");
assert(window.JIHANKI_FIELD_IMPRESSIONS, "Field impression module failed to initialise.");
assert.equal(collection.objects().length, 0, "A field pass must not exist before its source fragments are encountered.");

function openPhoto(id) {
  visits.push({ id, title: id, visitedAt: new Date().toISOString() });
  for (const callback of listeners["jihanki:event"] || []) {
    callback({ detail: { type: "memory-opened", detail: { itemId: id } } });
  }
}

for (const id of ["photo-219", "photo-220", "photo-221", "photo-222"]) openPhoto(id);
assert.equal(collection.objects().length, 0, "Four of five photographs must not issue a pass.");

openPhoto("photo-223");
let passes = collection.objects().filter(object => object.kind === "field-impression");
assert.equal(passes.length, 1, "The fifth source photograph should issue exactly one field impression.");
assert.deepEqual(JSON.parse(JSON.stringify(passes[0].sourceIds)),
  ["photo-219", "photo-220", "photo-221", "photo-222", "photo-223"]);
assert.equal(passes[0].archiveId, "field-impression:saiko-first-summit-2026-07-27");
assert.match(passes[0].inscription, /not proof of travel/i);

openPhoto("photo-223");
passes = collection.objects().filter(object => object.kind === "field-impression");
assert.equal(passes.length, 1, "Reopening a source photograph must not create duplicate passes.");

const backup = {
  format: "JIHANKI-COLLECTION",
  version: 2,
  records: [],
  objects: JSON.parse(JSON.stringify(passes))
};
collection.clear();
assert.equal(collection.objects().length, 0, "Collection clear should remove the pass with other local objects.");
collection.importPayload(backup);
passes = collection.objects().filter(object => object.kind === "field-impression");
assert.equal(passes.length, 1, "A collection backup should restore a field impression.");
assert.deepEqual(JSON.parse(JSON.stringify(passes[0].sourceIds)),
  ["photo-219", "photo-220", "photo-221", "photo-222", "photo-223"]);

console.log("M68 field impression tests passed: five source photographs, idempotent award, no physical-visit claim, and backup/restore.");
