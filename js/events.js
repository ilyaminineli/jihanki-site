/* Local, anonymous machine event journal. Nothing is transmitted. */
(function () {
  const KEY = "jihanki.events.v1";
  const LIMIT = 300;
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function record(type, detail) {
    const entry = {
      id: "evt-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      at: new Date().toISOString(),
      type: String(type || "machine-event"),
      detail: detail && typeof detail === "object" ? detail : { message: String(detail || "") }
    };
    try {
      const entries = read();
      entries.push(entry);
      localStorage.setItem(KEY, JSON.stringify(entries.slice(-LIMIT)));
    } catch (_) { /* Private browsing / storage denial must not break the machine. */ }
    window.dispatchEvent(new CustomEvent("jihanki:event", { detail: entry }));
    return entry;
  }
  window.JIHANKI_EVENTS = {
    record,
    all: read,
    clear() { try { localStorage.removeItem(KEY); } catch (_) { } },
    count() { return read().length; }
  };
})();