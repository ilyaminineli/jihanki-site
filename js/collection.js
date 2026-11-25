/* M33 — Visitor-local collection of purchased memories.
   This is private to the current browser profile; it is not synced or transmitted. */
(function () {
  const KEY = "jihanki.collection.v1";
  let memory = [];
  let storageAvailable = true;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw == null) return memory.slice();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      storageAvailable = false;
      return memory.slice();
    }
  }
  function write(records) {
    memory = records.slice();
    try {
      localStorage.setItem(KEY, JSON.stringify(memory));
      storageAvailable = true;
      return true;
    } catch (_) {
      storageAvailable = false;
      return false;
    }
  }
  function all() {
    return read().slice().sort((a,b) => String(b.lastCollectedAt || "").localeCompare(String(a.lastCollectedAt || "")));
  }
  function add(item, receipt) {
    if (!item?.id) return null;
    const records = read();
    let record = records.find(entry => entry.id === item.id);
    const now = new Date().toISOString();
    if (!record) {
      record = {
        id: item.id,
        title: item.title || "UNTITLED",
        date: item.date || "UNDATED",
        type: item.type || "text",
        category: item.machineCategory || item.category || item.type || "archive",
        author: item.author || "ARCHIVE",
        group: item.group || "",
        file: item.file || "",
        image: item.image || "",
        projectPath: item.projectPath || "",
        firstCollectedAt: now,
        lastCollectedAt: now,
        purchaseCount: 0,
        receiptCodes: []
      };
      records.push(record);
    }
    record.title = item.title || record.title;
    record.lastCollectedAt = now;
    record.purchaseCount = Number(record.purchaseCount || 0) + 1;
    if (!Array.isArray(record.receiptCodes)) record.receiptCodes = [];
    if (receipt?.code && !record.receiptCodes.includes(receipt.code)) record.receiptCodes.push(receipt.code);
    write(records);
    window.JIHANKI_EVENTS?.record("collection-added", {
      itemId: item.id, purchaseCount: record.purchaseCount, receipt: receipt?.code || null,
      persistent: storageAvailable
    });
    return record;
  }
  function resolve(record) {
    if (!record) return null;
    const live = (window.JIHANKI_ARCHIVE || []).find(item => item.id === record.id);
    return live || record;
  }
  function count() { return all().length; }
  function totalPurchases() { return all().reduce((sum, record) => sum + Number(record.purchaseCount || 0), 0); }
  function clear() {
    write([]);
    try { localStorage.removeItem(KEY); } catch (_) { storageAvailable = false; }
    window.JIHANKI_EVENTS?.record("collection-cleared", {});
    return true;
  }
  function exportFile() {
    const records = all();
    const payload = {
      format: "JIHANKI-COLLECTION",
      version: 1,
      exportedAt: new Date().toISOString(),
      records
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url;
    link.download = "jihanki-collection-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    window.JIHANKI_EVENTS?.record("collection-exported", { records: records.length });
    return records.length;
  }
  window.JIHANKI_COLLECTION = {
    all, add, resolve, count, totalPurchases, clear, exportFile,
    storageAvailable() { return storageAvailable; },
    contains(id) { return all().some(record => record.id === id); }
  };
})();