/* M28 — Non-destructive, date-based archive rotation.
   The visible rotation changes daily; the underlying catalogue is never hidden or edited. */
(function () {
  const DAY = 86400000;
  const CATEGORY_ORDER = ["video","photo","utau","text","music","sound","notes","performance"];
  const LIMIT = 8;

  function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }
  function dayNumber(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY);
  }
  function hash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function select(date) {
    const key = dateKey(date), day = dayNumber(date);
    const order = CATEGORY_ORDER.slice();
    const shift = ((day % order.length) + order.length) % order.length;
    const rotated = order.slice(shift).concat(order.slice(0, shift));
    const selected = [];
    for (const category of rotated) {
      const pool = window.JIHANKI_CATEGORIES?.items(category) || [];
      if (!pool.length) continue;
      const ranked = pool.slice().sort((a, b) =>
        hash(key + ":" + category + ":" + a.id) - hash(key + ":" + category + ":" + b.id)
      );
      const item = ranked[0];
      if (item && !selected.some(entry => entry.id === item.id)) selected.push(item);
      if (selected.length >= LIMIT) break;
    }
    return { date: key, day, items: selected };
  }
  function current() { return select(new Date()); }
  function previous() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return select(date);
  }
  function residue() {
    const now = current();
    const today = new Set(now.items.map(item => item.id));
    return previous().items.filter(item => !today.has(item.id)).slice(0, 3);
  }
  window.JIHANKI_ROTATION = {
    current, previous, residue,
    snapshot() {
      const now = current(), old = residue();
      return { date: now.date, featured: now.items.length, residue: old.length, ids: now.items.map(item => item.id) };
    }
  };
})();