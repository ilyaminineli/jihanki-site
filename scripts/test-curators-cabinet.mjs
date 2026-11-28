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
const window = {
  JIHANKI_ARCHIVE: [
    { id: "photo-127", title: "Earlier Satyam 1 view", date: "2026-07-30" },
    { id: "photo-173", title: "Present-day clearing", date: "2026-08-03" }
  ],
  addEventListener() {}
};
const context = vm.createContext({ window, localStorage, Date, Math });
vm.runInContext(await readFile("js/museum.js", "utf8"), context, { filename: "js/museum.js" });

const museum = window.JIHANKI_MUSEUM;
const shelf = museum.createShelf("A place remembered");
museum.addToShelf(shelf.id, "photo-127");
museum.addToShelf(shelf.id, "photo-173");
assert.equal(museum.shelves()[0].itemIds.length, 2, "A shelf should contain only the two explicitly selected records.");
museum.addToShelf(shelf.id, "photo-127");
assert.equal(museum.shelves()[0].itemIds.length, 2, "Adding the same work twice should not create duplicates.");
assert.equal(museum.removeFromShelf(shelf.id, "photo-127"), true, "A selected work should be removable from its shelf.");
assert.deepEqual(Array.from(museum.shelves()[0].itemIds), ["photo-173"], "Removing a work should leave the remaining shelf selection intact.");
museum.addToShelf(shelf.id, "photo-127");
const html = museum.shelfCardHtml(shelf.id);
assert.match(html, /A place remembered/, "Cabinet card should use the visitor's shelf title.");
assert.match(html, /Earlier Satyam 1 view/, "Cabinet card should include the selected archive records.");
assert.match(html, /Present-day clearing/, "Cabinet card should include all selected archive records.");
assert.match(html, /@media print/, "Cabinet card should include print styling.");
assert.doesNotMatch(html, /Add a description|Write your story|Required note/i,
  "The visitor must not be pressured to write explanatory text.");
assert.equal(museum.shelfCardHtml("missing-shelf"), "", "Unknown shelf IDs must not produce an exhibition card.");

const backup = {
  format: "JIHANKI-MUSEUM", version: 1, kept: [],
  shelves: museum.shelves(), trail: []
};
museum.clearShelves();
museum.importPayload(backup);
assert.match(museum.shelfCardHtml(shelf.id), /A place remembered/,
  "Existing shelf backup/restore should preserve the cabinet exhibition title and records.");
assert.equal(museum.deleteShelf(shelf.id), true, "A shelf should be deletable.");
assert.equal(window.JIHANKI_ARCHIVE.length, 2, "Deleting a shelf must not delete the underlying archive records.");

console.log("M70 curator cabinet tests passed: title-only shelf, selected works, print-ready card, backup/restore.");
