#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const store = new Map();
const localStorage = {
  getItem(key) { return store.has(key) ? store.get(key) : null; },
  setItem(key, value) { store.set(key, String(value)); },
  removeItem(key) { store.delete(key); }
};
const listeners = {};
const recorded = [];
const window = {
  addEventListener(type, callback) { (listeners[type] ||= []).push(callback); },
  JIHANKI_EVENTS: { record(type, detail) { recorded.push({ type, detail }); } }
};
const context = vm.createContext({ window, localStorage });
vm.runInContext(await readFile("js/quiet-signals.js", "utf8"), context, { filename: "js/quiet-signals.js" });

const signals = window.JIHANKI_QUIET_SIGNALS;
assert(signals, "Quiet Signals module should initialise.");
assert.equal(signals.homeLine(), null, "No signal should appear before the curated trace is completed.");

function emit(type, detail = {}) {
  for (const callback of listeners["jihanki:event"] || []) callback({ detail: { type, detail } });
}

emit("memory-trace-completed", { impressionId: "some-other-trace" });
assert.equal(signals.homeLine(), null, "Unrelated traces must not trigger this signal.");

emit("memory-trace-completed", { impressionId: "satyam-1-then-visit-now" });
assert.equal(signals.homeLine(), "THE CLEARING REMAINS / NO FURTHER DETAILS AVAILABLE",
  "The authored signal should appear on the next home return.");
assert.equal(signals.homeLine(), null, "The signal must not repeat.");
assert.equal(recorded.filter(entry => entry.type === "quiet-signal-shown").length, 1,
  "Showing the signal should create one local event.");

const reloadedWindow = { addEventListener() {} };
const reloaded = vm.createContext({ window: reloadedWindow, localStorage });
vm.runInContext(await readFile("js/quiet-signals.js", "utf8"), reloaded);
assert.equal(reloadedWindow.JIHANKI_QUIET_SIGNALS.homeLine(), null,
  "Delivered state must survive reload and remain one-time.");

console.log("M72 quiet signal tests passed: curated trigger, one-time delivery and reload persistence.");
