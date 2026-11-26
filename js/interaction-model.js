/* M35 — deterministic machine state and transaction transition contract.
   Rendering stays in machine.js; this module is the single authority for legal state changes. */
(function () {
  "use strict";

  const VIEWS = Object.freeze([
    "idle", "category", "location", "rotation", "exploration", "temporal", "museum", "service"
  ]);
  const OVERLAYS = Object.freeze(["none", "panel", "record"]);
  const LIMITS = Object.freeze({ credits: 9 });
  const TABLE = Object.freeze({
    NAVIGATE_HOME: { from: "*", view: "idle", overlay: "none", clearsSelection: true },
    BROWSE_CATEGORY: { from: "*", view: "category", overlay: "none", clearsSelection: true },
    SHOW_LOCATION: { from: "*", view: "location", overlay: "none", clearsSelection: true },
    SHOW_ROTATION: { from: "*", view: "rotation", overlay: "none", clearsSelection: true },
    OPEN_PANEL: { from: "*", view: "payload.view", overlay: "panel", clearsSelection: true },
    OPEN_RECORD: { from: "*", view: "same", overlay: "record", selectsRecord: true },
    CLOSE_OVERLAY: { from: "*", view: "same", overlay: "none" },
    ENTER_SERVICE: { from: "*", view: "service", overlay: "none", clearsSelection: true },
    EXIT_SERVICE: { from: ["service"], view: "idle", overlay: "none", clearsSelection: true },
    INSERT_CREDIT: { from: "*", transaction: "credit-accepted", maximumCredits: 9 },
    PURCHASE_ATTEMPT: { from: "*", transaction: ["blocked", "pending"], reservesCredit: true },
    PURCHASE_COMPLETE: { from: ["pending"], transaction: "dispensed" },
    PURCHASE_ABORT: { from: ["pending"], transaction: "failed", refundsReservedCredit: true },
    RECOVER: { from: "*", transaction: "failed", refundsPendingCredit: true },
    RECEIPT_SAVED: { from: ["dispensed", "print-dialog-opened"], transaction: "receipt-saved" },
    RECEIPT_PRINT_DIALOG_OPENED: { from: ["dispensed", "receipt-saved"], transaction: "print-dialog-opened" }
  });

  function createState() {
    return {
      view: "idle",
      overlay: "none",
      credits: 0,
      selectedId: null,
      purchasePending: false,
      transaction: { status: "idle", itemId: null, receiptCode: null, reason: null, source: null },
      revision: 0
    };
  }

  function copyState(state) {
    return {
      view: state.view,
      overlay: state.overlay,
      credits: state.credits,
      selectedId: state.selectedId,
      purchasePending: state.purchasePending,
      transaction: { ...state.transaction },
      revision: state.revision
    };
  }

  function result(state, accepted, reason) {
    if (accepted) state.revision += 1;
    return { accepted, reason: reason || null, state };
  }

  function transition(previous, event, payload = {}) {
    const state = copyState(previous || createState());
    const definition = TABLE[event];
    if (!definition) return result(state, false, "unknown-transition");

    if (Array.isArray(definition.from) && !definition.from.includes(
      event === "PURCHASE_COMPLETE" || event === "PURCHASE_ABORT" ||
      event === "RECEIPT_SAVED" || event === "RECEIPT_PRINT_DIALOG_OPENED"
        ? state.transaction.status : state.view
    )) return result(state, false, "invalid-source-state");

    if (event === "EXIT_SERVICE" && state.view !== "service") {
      return result(state, false, "not-in-service");
    }

    switch (event) {
      case "NAVIGATE_HOME":
      case "BROWSE_CATEGORY":
      case "SHOW_LOCATION":
      case "SHOW_ROTATION":
      case "ENTER_SERVICE":
      case "EXIT_SERVICE":
        state.view = definition.view;
        state.overlay = definition.overlay;
        if (definition.clearsSelection) state.selectedId = null;
        if (event === "NAVIGATE_HOME" || event === "EXIT_SERVICE" || event === "ENTER_SERVICE") {
          state.purchasePending = false;
          if (state.transaction.status === "pending") {
            state.credits = Math.min(LIMITS.credits, state.credits + 1);
            state.transaction = { status: "failed", itemId: state.transaction.itemId,
              receiptCode: null, reason: "navigation-recovery", source: null };
          }
        }
        return result(state, true);

      case "OPEN_PANEL": {
        const view = payload.view || "exploration";
        if (!VIEWS.includes(view) || view === "service") return result(state, false, "invalid-panel-view");
        state.view = view;
        state.overlay = "panel";
        state.selectedId = null;
        return result(state, true);
      }

      case "OPEN_RECORD":
        if (payload.itemId === undefined || payload.itemId === null || String(payload.itemId) === "") {
          return result(state, false, "missing-record-id");
        }
        state.overlay = "record";
        state.selectedId = String(payload.itemId);
        return result(state, true);

      case "CLOSE_OVERLAY":
        if (state.overlay === "none") return result(state, false, "overlay-already-closed");
        state.overlay = "none";
        return result(state, true);

      case "INSERT_CREDIT":
        if (state.credits >= LIMITS.credits) {
          state.transaction = { status: "blocked", itemId: state.selectedId, receiptCode: null,
            reason: "credit-limit", source: payload.source || "physical" };
          return result(state, false, "credit-limit");
        }
        state.credits += 1;
        state.transaction = { status: "credit-accepted", itemId: state.selectedId, receiptCode: null,
          reason: null, source: payload.source || "physical" };
        return result(state, true);

      case "PURCHASE_ATTEMPT": {
        if (state.purchasePending) return result(state, false, "transaction-busy");
        const itemId = String(payload.itemId || "");
        if (!itemId) return result(state, false, "missing-record-id");
        let reason = null;
        if (!payload.live) reason = "not-in-live-catalogue";
        else if (!payload.available) reason = String(payload.stockStatus || "unavailable");
        else if (state.credits < 1) reason = "no-credit";
        if (reason) {
          state.transaction = { status: "blocked", itemId, receiptCode: null, reason, source: payload.source || "purchase" };
          return result(state, false, reason);
        }
        state.credits -= 1;
        state.selectedId = itemId;
        state.purchasePending = true;
        state.transaction = { status: "pending", itemId, receiptCode: null, reason: null, source: payload.source || "purchase" };
        return result(state, true);
      }

      case "PURCHASE_COMPLETE":
        if (!state.purchasePending || state.transaction.status !== "pending" ||
            String(payload.itemId || "") !== state.transaction.itemId || !payload.receiptCode) {
          return result(state, false, "no-matching-pending-purchase");
        }
        state.purchasePending = false;
        state.transaction = { ...state.transaction, status: "dispensed", receiptCode: String(payload.receiptCode), reason: null };
        return result(state, true);

      case "PURCHASE_ABORT":
        if (!state.purchasePending || state.transaction.status !== "pending" ||
            (payload.itemId && String(payload.itemId) !== state.transaction.itemId)) {
          return result(state, false, "no-matching-pending-purchase");
        }
        state.credits = Math.min(LIMITS.credits, state.credits + 1);
        state.purchasePending = false;
        state.transaction = { ...state.transaction, status: "failed", receiptCode: null, reason: String(payload.reason || "purchase-failed") };
        return result(state, true);

      case "RECOVER":
        if (state.purchasePending && state.transaction.status === "pending") {
          state.credits = Math.min(LIMITS.credits, state.credits + 1);
          state.purchasePending = false;
          state.transaction = { ...state.transaction, status: "failed", receiptCode: null, reason: String(payload.reason || "recovered") };
          return result(state, true);
        }
        return result(state, false, "nothing-to-recover");

      case "RECEIPT_SAVED":
      case "RECEIPT_PRINT_DIALOG_OPENED": {
        const allowed = event === "RECEIPT_SAVED"
          ? ["dispensed", "print-dialog-opened"] : ["dispensed", "receipt-saved"];
        if (!allowed.includes(state.transaction.status) ||
            !payload.receiptCode || String(payload.receiptCode) !== state.transaction.receiptCode) {
          return result(state, false, "receipt-does-not-match-current-transaction");
        }
        state.transaction = { ...state.transaction, status: event === "RECEIPT_SAVED" ? "receipt-saved" : "print-dialog-opened" };
        return result(state, true);
      }

      default:
        return result(state, false, "unhandled-transition");
    }
  }

  window.JIHANKI_INTERACTION = Object.freeze({
    VIEWS, OVERLAYS, LIMITS, TABLE, createState, transition
  });
})();
