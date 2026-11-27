#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("js/quiet-signals.js", "utf8");
function create({ objects = [], saved = null } = {}) {
  const store = new Map(saved ? [["jihanki.quiet-signals.v1", JSON.stringify(saved)]] : []);
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
  const listeners = {};
  const recorded = [];
  const window = {
    addEventListener(type, callback) { (listeners[type] ||= []).push(callback); },
    JIHANKI_COLLECTION: { objects: () => objects },
    JIHANKI_EVENTS: { record(type, detail) { recorded.push({ type, detail }); } }
  };
  const context = vm.createContext({ window, localStorage });
  vm.runInContext(source, context, { filename: "js/quiet-signals.js" });
  return { signals: window.JIHANKI_QUIET_SIGNALS, listeners, recorded, localStorage, store };
}
function emit(app, type, detail = {}) {
  for (const callback of app.listeners["jihanki:event"] || []) callback({ detail: { type, detail } });
}

const app = create();
assert(app.signals, "Quiet Signals module should initialise.");
assert.equal(app.signals.homeLine(), null, "No signal should appear before the curated trace is completed.");
emit(app, "memory-trace-completed", { impressionId: "some-other-trace" });
assert.equal(app.signals.homeLine(), null, "Unrelated traces must not trigger this signal.");
emit(app, "memory-trace-completed", { impressionId: "satyam-1-then-visit-now" });
assert.equal(app.signals.homeLine(), "THE CLEARING REMAINS / NO FURTHER DETAILS AVAILABLE",
  "The authored signal should appear on the next home return.");
assert.equal(app.signals.homeLine(), null, "The signal must not repeat.");
assert.equal(app.recorded.filter(entry => entry.type === "quiet-signal-shown").length, 1,
  "Showing the signal should create one local event.");

const reloaded = create({ saved: JSON.parse(app.store.get("jihanki.quiet-signals.v1")) });
assert.equal(reloaded.signals.homeLine(), null, "Delivered state must survive reload and remain one-time.");

const legacy = create({ objects: [{ id: "OBJ-TRACE-SATYAM-1-THEN-VISIT-NOW",
  archiveId: "memory-trace:satyam-1-then-visit-now" }] });
assert.equal(legacy.signals.homeLine(), "THE CLEARING REMAINS / NO FURTHER DETAILS AVAILABLE",
  "A trace collected before M72 should still arm the one-time signal.");

const restoredDelivered = create({
  objects: [{ archiveId: "memory-trace:satyam-1-then-visit-now" }],
  saved: { version: 1, pending: false, delivered: true }
});
assert.equal(restoredDelivered.signals.homeLine(), null,
  "A delivered signal must not be re-armed by a restored trace object.");

console.log("M72 quiet signal tests passed: curated trigger, legacy trace, one-time delivery and reload persistence.");
