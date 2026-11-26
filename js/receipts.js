/* Anonymous, browser-local purchase tickets. Codes are per-browser, not global IDs. */
(function () {
  const KEY = "jihanki.receipts.v1";
  const SEQ = "jihanki.receipt-sequence.v1";
  const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  function all() {
    try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
  }
  function create(item) {
    const now = new Date();
    let seq = 1;
    try { seq = Number(localStorage.getItem(SEQ) || "0") + 1; localStorage.setItem(SEQ, String(seq)); } catch (_) { }
    const year = String(now.getFullYear()).slice(-2);
    const nonce = Math.random().toString(36).slice(2, 7).toUpperCase();
    const code = "JHK-" + year + "-" + String(seq).padStart(4, "0") + "-" + nonce;
    const receipt = {
      id: code, code, itemId: item.id, title: item.title || "UNTITLED",
      category: item.machineCategory || item.category || item.type || "archive",
      archiveDate: item.date || "UNDATED", purchasedAt: now.toISOString(),
      purchasedLabel: now.toLocaleString(), author: item.author || "ARCHIVE",
      statement: "MEMORY PRESERVED."
    };
    try { const list = all(); list.push(receipt); localStorage.setItem(KEY, JSON.stringify(list.slice(-500))); } catch (_) { }
    window.JIHANKI_EVENTS?.record("receipt-generated", { code, itemId: item.id });
    return receipt;
  }
  function get(id) { return all().find(receipt => receipt.id === id) || null; }
  function markup(receipt) {
    if (!receipt) return "";
    return '<section class="receipt-ticket" aria-label="Purchase receipt">' +
      '<div class="receipt-top">自販機 <span>JIHANKI</span></div>' +
      '<div class="receipt-rule"></div>' +
      '<div class="receipt-heading">PURCHASE RECEIPT</div>' +
      '<div class="receipt-row"><span>ITEM</span><strong>' + esc(receipt.title) + '</strong></div>' +
      '<div class="receipt-row"><span>CATEGORY</span><strong>' + esc(receipt.category) + '</strong></div>' +
      '<div class="receipt-row"><span>ARCHIVE DATE</span><strong>' + esc(receipt.archiveDate) + '</strong></div>' +
      '<div class="receipt-row"><span>TRANSACTION</span><strong>' + esc(receipt.purchasedLabel) + '</strong></div>' +
      '<div class="receipt-code-label">ARCHIVE CODE</div><div class="receipt-code">' + esc(receipt.code) + '</div>' +
      '<div class="receipt-rule"></div><div class="receipt-statement">' + esc(receipt.statement) + '</div>' +
      '<div class="receipt-actions"><button type="button" data-receipt-action="print" data-receipt-id="' + esc(receipt.id) + '">PRINT</button><button type="button" data-receipt-action="download" data-receipt-id="' + esc(receipt.id) + '">SAVE TICKET</button></div>' +
      '</section>';
  }
  function print(id) {
    const receipt = get(id); if (!receipt) return false;
    const win = window.open("", "_blank", "width=420,height=680");
    if (!win) { window.alert("Allow pop-ups to print this receipt."); return false; }
    win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(receipt.code) + '</title><style>body{margin:0;padding:28px;background:#eee;font:12px/1.5 Courier New,monospace}.ticket{width:280px;margin:auto;padding:22px 18px;background:#fff;color:#111;box-shadow:0 2px 12px #aaa}.center{text-align:center}.rule{border-top:1px dashed #555;margin:12px 0}.row{margin:9px 0}.row span{display:block;color:#666;font-size:10px}.code{font-size:18px;letter-spacing:1px;text-align:center;margin:14px 0}@media print{body{background:#fff;padding:0}.ticket{box-shadow:none}}</style></head><body><main class="ticket"><div class="center">自販機<br><b>JIHANKI</b><br>MEMORY ARCHIVE</div><div class="rule"></div><div class="center">PURCHASE RECEIPT</div><div class="row"><span>ITEM</span><b>' + esc(receipt.title) + '</b></div><div class="row"><span>CATEGORY</span>' + esc(receipt.category) + '</div><div class="row"><span>ARCHIVE DATE</span>' + esc(receipt.archiveDate) + '</div><div class="row"><span>TRANSACTION</span>' + esc(receipt.purchasedLabel) + '</div><div class="row"><span>ARCHIVE CODE</span></div><div class="code">' + esc(receipt.code) + '</div><div class="rule"></div><div class="center">' + esc(receipt.statement) + '</div></main><script>window.addEventListener("load",()=>window.print())<\/script></body></html>');
    win.document.close();
    window.JIHANKI_EVENTS?.record("receipt-print-dialog-opened", { code: receipt.code });
    window.dispatchEvent(new CustomEvent("jihanki:receipt-printed", { detail: { receiptCode: receipt.code } }));
    return true;
  }
  function download(id) {
    const receipt = get(id); if (!receipt) return false;
    window.JIHANKI_EVENTS?.record("receipt-exported", { code: receipt.code });
    const text = ["自販機 / JIHANKI", "PURCHASE RECEIPT", "ITEM: " + receipt.title, "CATEGORY: " + receipt.category, "ARCHIVE DATE: " + receipt.archiveDate, "TRANSACTION: " + receipt.purchasedLabel, "ARCHIVE CODE: " + receipt.code, receipt.statement].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = receipt.code + ".txt"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    window.JIHANKI_EVENTS?.record("receipt-saved", { code: receipt.code });
    window.dispatchEvent(new CustomEvent("jihanki:receipt-saved", { detail: { receiptCode: receipt.code } }));
    return true;
  }
  window.JIHANKI_RECEIPTS = { all, create, get, markup, print, download };
})();