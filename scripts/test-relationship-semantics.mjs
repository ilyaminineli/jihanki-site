#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const context = vm.createContext({ window: {} });
for (const source of ["data/archive.js", "js/geography.js", "js/relationships.js"]) {
  const code = await readFile(source, "utf8");
  vm.runInContext(code, context, { filename: source });
}

const archive = context.window.JIHANKI_ARCHIVE || [];
const geography = context.window.JIHANKI_GEOGRAPHY;
const relationships = context.window.JIHANKI_RELATIONSHIPS;
assert(archive.length > 0, "Archive failed to initialise.");
assert(geography && relationships, "Geography or relationship index failed to initialise.");

const miyukihamaIds = Array.from(geography.entries("Miyukihama"), record => record.id).sort();
assert.deepEqual(miyukihamaIds, ["photo-202", "photo-247", "photo-250"],
  "Miyukihama should contain only the three traveller-confirmed Odawara photographs.");
assert.equal(geography.entries("Okinawa").length, 0,
  "No archive memories should be assigned to Okinawa.");

for (const id of ["photo-202", "photo-247", "photo-250"]) {
  const item = archive.find(record => record.id === id);
  assert(item, "Missing Miyukihama archive record: " + id);
  const locations = geography.locations(item);
  assert(locations.includes("Miyukihama"), id + " is missing its Miyukihama location.");
  assert(locations.includes("Odawara"), id + " is missing its Odawara location.");
  assert(!locations.some(location => /okinawa/i.test(location)),
    id + " contains a false Okinawa location.");
}

const definitions = relationships.linkDefinitions;
const expectedEdges = [
  ["photo-247", "photo-250"],
  ["photo-247", "photo-202"],
  ["photo-250", "photo-247"],
  ["photo-250", "photo-202"],
  ["photo-intake-addition-5", "photo-202"]
];
for (const [from, to] of expectedEdges) {
  const edge = (definitions[from] || []).find(candidate => candidate.id === to);
  assert(edge, "Missing curated Miyukihama connection: " + from + " -> " + to);
  assert.match(edge.label, /Miyukihama/i,
    "Relationship should use the confirmed locality, not the misleading beach sign text: " + from + " -> " + to);
  assert.doesNotMatch(edge.label, /Okinawa|Miyuki Beach/i,
    "Relationship label contains an obsolete or misleading place name: " + from + " -> " + to);
}

const guide = await readFile("data/README.md", "utf8");
assert.match(guide, /Miyukihama, Odawara/i,
  "Data guide should preserve the corrected Miyukihama / Odawara identification.");
assert.doesNotMatch(guide, /Kyoto\s*\/\s*Osaka\s*\/\s*Okinawa/i,
  "Data guide still groups the Japan photographs under the incorrect Okinawa destination.");

console.log("Relationship semantics passed: Miyukihama / Odawara labels are grounded and Okinawa has no assigned memories.");
