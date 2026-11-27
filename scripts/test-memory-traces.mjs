#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const visits = [];
const listeners = {};
const awarded = [];
const window = {
  JIHANKI_RELATIONSHIPS: {
    linkDefinitions: {
      "photo-127": [{ id: "daily-2026-08-03" }],
      "daily-2026-08-03": [{ id: "photo-127" }, { id: "photo-173" }],
      "photo-173": [{ id: "daily-2026-08-03" }]
    }
  },
  JIHANKI_MUSEUM: { trail: () => visits.slice() },
  JIHANKI_COLLECTION: { addFieldPass(definition) {
    if (awarded.length) return { object: awarded[0], created: false };
    const object = { ...definition };
    awarded.push(object);
    return { object, created: true };
  }},
  addEventListener(type, callback) { (listeners[type] ||= []).push(callback); }
};
const context = vm.createContext({ window });
vm.runInContext(await readFile("js/memory-traces.js", "utf8"), context, { filename: "js/memory-traces.js" });
assert(window.JIHANKI_MEMORY_TRACES, "Curated Satyam 1 trace did not initialise.");
assert.equal(awarded.length, 0, "Trace should not be awarded before all source fragments are encountered.");

function open(id) {
  visits.push({ id });
  for (const callback of listeners["jihanki:event"] || []) callback({ detail: { type: "memory-opened", detail: { itemId: id } } });
}
open("photo-127");
open("daily-2026-08-03");
assert.equal(awarded.length, 0, "Two fragments must not complete the trace.");
open("photo-173");
assert.equal(awarded.length, 1, "The third curated fragment should complete the trace.");
assert.equal(awarded[0].kind, "memory-trace");
assert.deepEqual(JSON.parse(JSON.stringify(awarded[0].sourceIds)), ["photo-127", "daily-2026-08-03", "photo-173"]);
open("photo-173");
assert.equal(awarded.length, 1, "Reopening a fragment must not duplicate the trace.");

const brokenWindow = {
  JIHANKI_RELATIONSHIPS: { linkDefinitions: { "photo-127": [{ id: "photo-173" }] } },
  JIHANKI_MUSEUM: { trail: () => visits },
  JIHANKI_COLLECTION: { addFieldPass() { throw new Error("Uncurated trace must never award."); } },
  addEventListener() {}
};
vm.runInContext(await readFile("js/memory-traces.js", "utf8"), vm.createContext({ window: brokenWindow }));
assert.equal(brokenWindow.JIHANKI_MEMORY_TRACES, undefined, "Trace must not initialise if its curated relationship chain is incomplete.");

console.log("M69 memory trace tests passed: curated links, three source records, idempotent award.");
