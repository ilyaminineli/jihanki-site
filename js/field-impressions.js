/* M68 — One quiet, archive-only field impression. No GPS or physical-visit claims. */
(function () {
  const TRAIL_ID = "saiko-first-summit-2026-07-27";
  const trail = (window.JIHANKI_MAP?.trails || []).find(entry => entry.id === TRAIL_ID);
  const sourceIds = Array.isArray(trail?.photoIds) ? [...new Set(trail.photoIds)] : [];
  if (!trail || sourceIds.length !== 5) return;

  const definition = {
    id: TRAIL_ID,
    title: "SAIKONEON → FIRST SUMMIT NEAR SAIKO",
    stamp: "FIELD IMPRESSION / YAMANASHI",
    inscription: "Five photographs encountered in the archive. A record of looking, not proof of travel.",
    serial: "SAIKO / 27 JUL 2026",
    archiveDate: "27 JULY 2026",
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

  // Existing local reading history counts as already encountered archive material.
  check();
  window.JIHANKI_FIELD_IMPRESSIONS = {
    check,
    trailId: TRAIL_ID,
    sourceIds: sourceIds.slice()
  };
})();
