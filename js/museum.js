/* M47 — Visitor-specific personal museum. All state stays in this browser. */
(function () {
  "use strict";
  const KEY = "jihanki.museum.v1", PREFS_KEY = "jihanki.museum.preferences.v1";
  const MAX_SHELVES = 12, MAX_ITEMS = 250, MAX_TRAIL = 500;
  const tabs = ["overview", "works", "objects", "kept", "trail", "shelves", "care"];
  const fresh = () => ({ version: 1, kept: [], shelves: [], trail: [] });
  const freshPrefs = () => ({ version: 1, lastTab: "overview", sort: "recent", category: "all" });
  const array = value => Array.isArray(value) ? value : [];
  let state = fresh(), prefs = freshPrefs();

  function clean(value) {
    return {
      version: 1,
      kept: [...new Set(array(value.kept).filter(id => typeof id === "string" && id))].slice(0, 2000),
      shelves: array(value.shelves).filter(s => s && typeof s.id === "string" && typeof s.name === "string" && s.name.trim())
        .slice(0, MAX_SHELVES).map(s => ({
          id: s.id.slice(0, 100), name: s.name.trim().slice(0, 36),
          itemIds: [...new Set(array(s.itemIds).filter(id => typeof id === "string" && id))].slice(0, MAX_ITEMS)
        })),
      trail: array(value.trail).filter(e => e && typeof e.id === "string" && typeof e.title === "string").slice(-MAX_TRAIL)
        .map(e => ({
          id: e.id.slice(0, 200), title: e.title.slice(0, 240), category: String(e.category || "archive").slice(0, 80),
          visitedAt: String(e.visitedAt || new Date().toISOString())
        }))
    };
  }
  function load() {
    try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && v.version === 1) state = clean(v); } catch (_) { state = fresh(); }
    try {
      const v = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
      if (v && v.version === 1) prefs = {
        ...freshPrefs(), ...v, lastTab: tabs.includes(v.lastTab) ? v.lastTab : "overview",
        sort: ["recent", "title", "oldest", "most"].includes(v.sort) ? v.sort : "recent", category: typeof v.category === "string" ? v.category : "all"
      };
    } catch (_) { prefs = freshPrefs(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (_) { return false; } }
  function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); return true; } catch (_) { return false; } }
  function shelves() { return state.shelves.map(s => ({ ...s, itemIds: s.itemIds.slice() })); }
  function shelfCardHtml(shelfId) {
    const shelf = state.shelves.find(entry => entry.id === String(shelfId));
    if (!shelf) return "";
    const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    const records = shelf.itemIds.map(id => (window.JIHANKI_ARCHIVE || []).find(item => item.id === id)).filter(Boolean);
    const entries = records.map((item, index) => "<li><span>" + String(index + 1).padStart(2, "0") + "</span><div><strong>" + esc(item.title || item.id) + "</strong><small>" + esc(item.date || "UNDATED") + " / " + esc(item.id) + "</small></div></li>").join("");
    return "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>" + esc(shelf.name) + " — JIHANKI</title>" +
      "<style>*{box-sizing:border-box}body{margin:0;padding:48px 24px;background:#eee;color:#171717;font:14px/1.5 Georgia,serif}.card{max-width:720px;margin:auto;padding:42px;border:1px solid #aaa;background:#faf9f5}.mark{font:10px monospace;letter-spacing:.18em;color:#666}.rule{height:1px;background:#aaa;margin:24px 0}.title{font-size:clamp(28px,6vw,48px);font-weight:400;line-height:1.05;overflow-wrap:anywhere}ol{list-style:none;padding:0;margin:30px 0}li{display:flex;gap:18px;padding:13px 0;border-bottom:1px solid #ddd}li>span,small{font:10px monospace;color:#777}li div{display:grid;gap:4px}li strong{font-weight:400;font-size:16px}.foot{font:10px monospace;color:#777;letter-spacing:.1em}@media print{body{padding:0;background:#fff}.card{border:0;max-width:none;padding:18mm} }</style>" +
      "<body><main class=\"card\"><div class=\"mark\">自販機 / JIHANKI — PERSONAL CABINET</div><div class=\"rule\"></div><h1 class=\"title\">" + esc(shelf.name) + "</h1><p class=\"foot\">A SMALL EXHIBITION / " + records.length + " WORKS</p><div class=\"rule\"></div><ol>" + entries + "</ol><div class=\"rule\"></div><p class=\"foot\">ARRANGED FROM THE JIHANKI ARCHIVE · " + new Date().toISOString().slice(0, 10) + "</p></main></body></html>";
  }
  function exportShelfCard(shelfId) {
    const html = shelfCardHtml(shelfId);
    if (!html) return false;
    const shelf = state.shelves.find(entry => entry.id === String(shelfId));
    const blob = new Blob([html], { type: "text/html;charset=utf-8" }), url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "jihanki-cabinet-" + String(shelf.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".html";
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    window.JIHANKI_EVENTS?.record("museum-shelf-card-exported", { shelfId: shelf.id, works: shelf.itemIds.length });
    return true;
  }
  function keptIds() { return state.kept.slice(); }
  function trail() { return state.trail.map(e => ({ ...e })); }
  function isKept(id) { return state.kept.includes(String(id)); }
  function toggleKeep(id) {
    const key = String(id || ""); if (!key) return false;
    state.kept = isKept(key) ? state.kept.filter(v => v !== key) : [...state.kept, key];
    save(); window.JIHANKI_EVENTS?.record("museum-keep-changed", { itemId: key, kept: isKept(key) }); return isKept(key);
  }
  function createShelf(name) {
    const label = String(name || "").trim().replace(/\s+/g, " ").slice(0, 36);
    if (!label) throw new Error("Give the shelf a name first.");
    if (state.shelves.length >= MAX_SHELVES) throw new Error("The museum can hold up to " + MAX_SHELVES + " shelves.");
    if (state.shelves.some(s => s.name.toLowerCase() === label.toLowerCase())) throw new Error("A shelf with that name already exists.");
    const shelf = { id: "shelf-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7), name: label, itemIds: [] };
    state.shelves.push(shelf); save(); window.JIHANKI_EVENTS?.record("museum-shelf-created", { shelfId: shelf.id }); return { ...shelf };
  }
  function addToShelf(shelfId, itemId) {
    const shelf = state.shelves.find(s => s.id === String(shelfId)), id = String(itemId || "");
    if (!shelf || !id) return false;
    if (!shelf.itemIds.includes(id)) { if (shelf.itemIds.length >= MAX_ITEMS) throw new Error("This shelf has reached its item limit."); shelf.itemIds.push(id); save(); }
    window.JIHANKI_EVENTS?.record("museum-shelf-item-added", { shelfId: shelf.id, itemId: id }); return true;
  }
  function removeFromShelf(shelfId, itemId) {
    const shelf = state.shelves.find(s => s.id === String(shelfId)); if (!shelf) return false;
    shelf.itemIds = shelf.itemIds.filter(id => id !== String(itemId)); save(); return true;
  }
  function deleteShelf(shelfId) { const n = state.shelves.length; state.shelves = state.shelves.filter(s => s.id !== String(shelfId)); save(); return state.shelves.length !== n; }
  function recordVisit(id, title, category) {
    if (!id) return;
    const now = new Date(), last = state.trail[state.trail.length - 1];
    if (last && last.id === String(id) && now - Date.parse(last.visitedAt) < 5000) return;
    state.trail.push({ id: String(id), title: String(title || "UNTITLED").slice(0, 240), category: String(category || "archive").slice(0, 80), visitedAt: now.toISOString() });
    state.trail = state.trail.slice(-MAX_TRAIL); save();
  }
  window.addEventListener("jihanki:event", event => {
    const entry = event.detail || {}; if (entry.type !== "memory-opened") return;
    const id = entry.detail?.itemId, item = (window.JIHANKI_ARCHIVE || []).find(r => r.id === id);
    recordVisit(id, item?.title || id, item?.machineCategory || item?.category);
  });
  function clearKept() { state.kept = []; save(); }
  function clearShelves() { state.shelves = []; save(); }
  function clearTrail() { state.trail = []; save(); }
  function resetPreferences() { prefs = freshPrefs(); savePrefs(); }
  function stats() { return { kept: state.kept.length, shelves: state.shelves.length, visits: state.trail.length }; }
  function setView(tab, sort, category) {
    if (tab) prefs.lastTab = tabs.includes(tab) ? tab : "overview";
    if (sort) prefs.sort = ["recent", "title", "oldest", "most"].includes(sort) ? sort : "recent";
    if (category) prefs.category = String(category);
    savePrefs(); return { ...prefs };
  }
  function exportFile() {
    const payload = { format: "JIHANKI-MUSEUM", version: 1, exportedAt: new Date().toISOString(), kept: state.kept, shelves: state.shelves, trail: state.trail };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "jihanki-museum-" + new Date().toISOString().slice(0, 10) + ".json"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    window.JIHANKI_EVENTS?.record("museum-exported", stats()); return payload;
  }
  function importPayload(payload) {
    if (!payload || payload.format !== "JIHANKI-MUSEUM" || Number(payload.version) !== 1 || !Array.isArray(payload.kept) ||
      !Array.isArray(payload.shelves) || !Array.isArray(payload.trail) || payload.kept.length > 2000 ||
      payload.shelves.length > MAX_SHELVES || payload.trail.length > MAX_TRAIL) throw new Error("Unsupported or malformed museum backup.");
    if (payload.kept.some(id => typeof id !== "string" || !id) || payload.shelves.some(s => !s || typeof s.id !== "string" ||
      typeof s.name !== "string" || !s.name.trim() || !Array.isArray(s.itemIds) || s.itemIds.length > MAX_ITEMS ||
      s.itemIds.some(id => typeof id !== "string" || !id)) || payload.trail.some(e => !e || typeof e.id !== "string" ||
        typeof e.title !== "string" || (e.visitedAt && Number.isNaN(Date.parse(e.visitedAt))))) throw new Error("Museum backup contains invalid saved items, shelves or visit entries.");
    const merged = clean(state);
    merged.kept = [...new Set([...merged.kept, ...payload.kept])].slice(0, 2000);
    payload.shelves.forEach(incoming => {
      const existing = merged.shelves.find(s => s.id === incoming.id);
      if (existing) existing.itemIds = [...new Set([...existing.itemIds, ...incoming.itemIds])].slice(0, MAX_ITEMS);
      else {
        const conflict = merged.shelves.some(s => s.name.toLowerCase() === incoming.name.trim().toLowerCase());
        merged.shelves.push({
          id: conflict ? incoming.id + "-import-" + Math.random().toString(36).slice(2, 6) : incoming.id,
          name: conflict ? (incoming.name + " (IMPORTED)").slice(0, 36) : incoming.name.trim().slice(0, 36),
          itemIds: [...new Set(incoming.itemIds)].slice(0, MAX_ITEMS)
        });
      }
    });
    if (merged.shelves.length > MAX_SHELVES) throw new Error("The combined museum would exceed the shelf limit.");
    const seen = new Set(merged.trail.map(e => e.id + "|" + e.visitedAt));
    payload.trail.forEach(e => {
      const key = e.id + "|" + e.visitedAt; if (seen.has(key)) return;
      merged.trail.push({ id: e.id, title: e.title.slice(0, 240), category: String(e.category || "archive").slice(0, 80), visitedAt: String(e.visitedAt || new Date().toISOString()) }); seen.add(key);
    });
    merged.trail = merged.trail.slice(-MAX_TRAIL); state = clean(merged); save();
    window.JIHANKI_EVENTS?.record("museum-imported", { kept: payload.kept.length, shelves: payload.shelves.length, trail: payload.trail.length }); return stats();
  }
  async function importFile(file) {
    if (!file) throw new Error("No museum backup selected.");
    let payload; try { payload = JSON.parse(await file.text()); } catch (_) { throw new Error("The selected file is not valid JSON."); } return importPayload(payload);
  }
  load();
  window.JIHANKI_MUSEUM = {
    shelves, shelfCardHtml, exportShelfCard, keptIds, trail, isKept, toggleKeep, createShelf, addToShelf, removeFromShelf, deleteShelf,
    clearKept, clearShelves, clearTrail, resetPreferences, stats, setView, preferences: () => ({ ...prefs }), exportFile, importFile, importPayload,
    get storageAvailable() { try { const key = "jihanki.museum.storage-test"; localStorage.setItem(key, "1"); localStorage.removeItem(key); return true; } catch (_) { return false; } }
  };
})();