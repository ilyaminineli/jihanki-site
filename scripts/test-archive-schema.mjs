#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateRecordSchema } from "./archive-schema.mjs";

const fixturePath = fileURLToPath(new URL("./fixtures/archive-schema.json", import.meta.url));
const fixtures = JSON.parse(await readFile(fixturePath, "utf8"));
for (const fixture of fixtures.valid) {
  assert.deepEqual(validateRecordSchema(fixture.record), [], "Valid fixture failed: " + fixture.label);
}
for (const fixture of fixtures.invalid) {
  const errors = validateRecordSchema(fixture.record);
  assert(errors.some(message => message.includes(fixture.contains)),
    "Invalid fixture was not rejected: " + fixture.label + " / " + errors.join("; "));
}
console.log("Archive schema fixtures passed: " + fixtures.valid.length + " valid and " +
  fixtures.invalid.length + " invalid records.");
