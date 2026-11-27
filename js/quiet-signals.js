/* M72 — One authored, visitor-local signal after the curated Satyam 1 trace.
   It is a quiet acknowledgement on a later return, not a reward or repeatable challenge. */
(function () {
  "use strict";

  const KEY = "jihanki.quiet-signals.v1";
  const TRACE_ID = "satyam-1-then-visit-now";
  const MESSAGE = "THE CLEARING REMAINS / NO FURTHER DETAILS AVAILABLE";
  const fresh = () => ({ version: 1, pending: false, delivered: false });

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      if (value?.version === 1) {
        return {
          version: 1,
          pending: value.pending === true,
          delivered: value.delivered === true
        };
      }
    } catch (_) { }
    return fresh();
  }

  let state = read();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { }
  }

  window.addEventListener("jihanki:event", event => {
    const entry = event.detail || {};
    if (entry.type !== "memory-trace-completed" ||
        entry.detail?.impressionId !== TRACE_ID ||
        state.delivered || state.pending) return;
    state.pending = true;
    save();
  });

  function homeLine() {
    if (!state.pending || state.delivered) return null;
    state.pending = false;
    state.delivered = true;
    save();
    window.JIHANKI_EVENTS?.record("quiet-signal-shown", { signal: TRACE_ID });
    return MESSAGE;
  }

  window.JIHANKI_QUIET_SIGNALS = { homeLine };
})();
