/* Catalogue-authored stock rules. Purchases never change shared stock on a static site. */
(function () {
  const UNAVAILABLE = new Set(["sold-out", "restocking", "archived", "withdrawn"]);
  const LABELS = {
    new: "NEW STOCK",
    available: "AVAILABLE",
    "low-stock": "LOW STOCK",
    "sold-out": "SOLD OUT",
    restocking: "RESTOCKING",
    archived: "ARCHIVED",
    withdrawn: "WITHDRAWN"
  };
  function status(item) {
    return String(item?.stock?.status || "available").toLowerCase();
  }
  function isAvailable(item) {
    const quantity = item?.stock?.quantity;
    return !!item && !UNAVAILABLE.has(status(item)) && !(Number.isFinite(quantity) && quantity <= 0);
  }
  function label(item) {
    return item?.stock?.label || LABELS[status(item)] || "UNCLASSIFIED";
  }
  function message(item) {
    const s = status(item);
    if (s === "restocking") return item.stock?.note || "THIS MEMORY IS BEING PREPARED.";
    if (s === "sold-out") return item.stock?.note || "THIS MEMORY IS TEMPORARILY OUT OF STOCK.";
    if (s === "archived" || s === "withdrawn") return "THIS MEMORY IS PRESERVED, BUT NOT IN CIRCULATION.";
    return "MEMORY AVAILABLE.";
  }
  window.JIHANKI_INVENTORY = {
    status, label, message, isAvailable,
    available(items) { return (items || []).filter(isAvailable); },
    unavailable(items) { return (items || []).filter(item => !isAvailable(item)); },
    summary() {
      const all = window.JIHANKI_ARCHIVE || [];
      return all.reduce((out, item) => {
        const s = status(item);
        out[s] = (out[s] || 0) + 1;
        return out;
      }, {});
    }
  };
})();