/* M69 — One curated Satyam 1 memory trace. */
(function () {
  const TRACE_ID = "satyam-1-then-visit-now";
  const sourceIds = ["photo-127", "daily-2026-08-03", "photo-173"];
  const links = window.JIHANKI_RELATIONSHIPS?.linkDefinitions || {};
  const hasLink = (from, to) => Array.isArray(links[from]) && links[from].some(link => link.id === to);
  const curated = hasLink("photo-127", "daily-2026-08-03") &&
    hasLink("daily-2026-08-03", "photo-173") &&
    hasLink("photo-173", "daily-2026-08-03");
  if (!curated) return;

  const definition = {
    id: TRACE_ID,
    kind: "memory-trace",
    title: "SATYAM 1 / THEN — THE VISIT — NOW",
    stamp: "MEMORY TRACE / SATYAM 1",
    inscription: "An earlier view, the visit with Koba-san, and a later view of the clearing. Three fragments connected by the archive.",
    serial: "SATYAM 1 / 03 AUG 2026",
    archiveDate: "3 AUGUST 2026",
    sourceIds
  };

  function check() {
    const visits = window.JIHANKI_MUSEUM?.trail?.() || [];
    const encountered = new Set(visits.map(entry => entry.id));
    if (!sourceIds.every(id => encountered.has(id))) return false;
    const result = window.JIHANKI_COLLECTION?.addFieldPass?.(definition);
    return !!result?.created;
  }

  window.addEventListener("jihanki:event", event => {
    const entry = event.detail || {};
    if (entry.type === "memory-opened" && sourceIds.includes(entry.detail?.itemId)) check();
  });

  check();
  window.JIHANKI_MEMORY_TRACES = { check, traceId: TRACE_ID, sourceIds: sourceIds.slice() };
})();
