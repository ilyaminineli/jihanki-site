#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const source = await readFile(fileURLToPath(new URL("../js/interaction-model.js", import.meta.url)), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(source, context, { filename: "js/interaction-model.js" });
const model = context.window.JIHANKI_INTERACTION;
const step = (state, event, payload) => {
  const outcome = model.transition(state, event, payload);
  return outcome;
};
const ok = (outcome, message) => assert.equal(outcome.accepted, true, message || outcome.reason);
const no = (outcome, reason) => {
  assert.equal(outcome.accepted, false);
  assert.equal(outcome.reason, reason);
};

let state = model.createState();
ok(step(state, "NAVIGATE_HOME")); state = step(state, "NAVIGATE_HOME").state;
ok(step(state, "BROWSE_CATEGORY")); state = step(state, "BROWSE_CATEGORY").state;
assert.equal(state.view, "category");
ok(step(state, "OPEN_RECORD", { itemId: "record-a" })); state = step(state, "OPEN_RECORD", { itemId: "record-a" }).state;
assert.equal(state.overlay, "record");
assert.equal(state.selectedId, "record-a");
ok(step(state, "CLOSE_OVERLAY")); state = step(state, "CLOSE_OVERLAY").state;
assert.equal(state.view, "category");
assert.equal(state.selectedId, "record-a");
no(step(state, "CLOSE_OVERLAY"), "overlay-already-closed");

state = model.createState();
for (let i = 0; i < 9; i++) { const outcome = step(state, "INSERT_CREDIT", { source: "physical" }); ok(outcome); state = outcome.state; }
assert.equal(state.credits, 9);
no(step(state, "INSERT_CREDIT"), "credit-limit");
assert.equal(step(state, "INSERT_CREDIT").state.credits, 9);

state = model.createState();
let outcome = step(state, "PURCHASE_ATTEMPT", { itemId: "record-a", live: true, available: true });
no(outcome, "no-credit");
assert.equal(outcome.state.credits, 0);
assert.equal(outcome.state.purchasePending, false);
state = step(state, "INSERT_CREDIT").state;
outcome = step(state, "PURCHASE_ATTEMPT", { itemId: "old-record", live: false, available: true });
no(outcome, "not-in-live-catalogue");
assert.equal(outcome.state.credits, 1);
outcome = step(state, "PURCHASE_ATTEMPT", { itemId: "sold-out", live: true, available: false, stockStatus: "sold-out" });
no(outcome, "sold-out");
assert.equal(outcome.state.credits, 1);
outcome = step(state, "PURCHASE_ATTEMPT", { itemId: "restocking", live: true, available: false, stockStatus: "restocking" });
no(outcome, "restocking");
assert.equal(outcome.state.credits, 1);
outcome = step(state, "PURCHASE_ATTEMPT", { itemId: "archived", live: true, available: false, stockStatus: "archived" });
no(outcome, "archived");
assert.equal(outcome.state.credits, 1);

outcome = step(state, "PURCHASE_ATTEMPT", { itemId: "record-a", live: true, available: true });
ok(outcome);
state = outcome.state;
assert.equal(state.credits, 0);
assert.equal(state.selectedId, "record-a");
assert.equal(state.transaction.status, "pending");
no(step(state, "PURCHASE_ATTEMPT", { itemId: "record-b", live: true, available: true }), "transaction-busy");
no(step(state, "PURCHASE_COMPLETE", { itemId: "record-b", receiptCode: "JHK-A" }), "no-matching-pending-purchase");
outcome = step(state, "PURCHASE_COMPLETE", { itemId: "record-a", receiptCode: "JHK-A" });
ok(outcome); state = outcome.state;
assert.equal(state.transaction.status, "dispensed");
no(step(state, "RECEIPT_SAVED", { receiptCode: "OTHER" }), "receipt-does-not-match-current-transaction");
ok(step(state, "RECEIPT_SAVED", { receiptCode: "JHK-A" }));
state = step(state, "RECEIPT_SAVED", { receiptCode: "JHK-A" }).state;
assert.equal(state.transaction.status, "receipt-saved");
ok(step(state, "RECEIPT_PRINT_DIALOG_OPENED", { receiptCode: "JHK-A" }));
state = step(state, "RECEIPT_PRINT_DIALOG_OPENED", { receiptCode: "JHK-A" }).state;
assert.equal(state.transaction.status, "print-dialog-opened");

state = model.createState();
state = step(state, "INSERT_CREDIT").state;
state = step(state, "PURCHASE_ATTEMPT", { itemId: "record-a", live: true, available: true }).state;
outcome = step(state, "PURCHASE_ABORT", { itemId: "record-a", reason: "collection-write-failed" });
ok(outcome); state = outcome.state;
assert.equal(state.credits, 1);
assert.equal(state.purchasePending, false);
assert.equal(state.transaction.status, "failed");
no(step(state, "PURCHASE_ABORT", { itemId: "record-a" }), "invalid-source-state");

state = model.createState();
state = step(state, "INSERT_CREDIT").state;
state = step(state, "PURCHASE_ATTEMPT", { itemId: "record-a", live: true, available: true }).state;
outcome = step(state, "RECOVER", { reason: "navigation" });
ok(outcome); state = outcome.state;
assert.equal(state.credits, 1);
assert.equal(state.purchasePending, false);
no(step(state, "RECOVER"), "nothing-to-recover");

state = model.createState();
state = step(state, "OPEN_PANEL", { view: "temporal" }).state;
assert.equal(state.view, "temporal");
assert.equal(state.overlay, "panel");
no(step(state, "OPEN_PANEL", { view: "service" }), "invalid-panel-view");
state = step(state, "ENTER_SERVICE").state;
assert.equal(state.view, "service");
outcome = step(state, "EXIT_SERVICE");
ok(outcome); state = outcome.state;
assert.equal(state.view, "idle");
no(step(state, "EXIT_SERVICE"), "invalid-source-state");

console.log("M35 interaction transition tests passed: views, overlays, credit, blocked stock, single-flight purchases, rollback, receipts and recovery.");
