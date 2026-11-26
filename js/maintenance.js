/* Hidden service terminal. It is an Easter egg, not an access-control boundary. */
(function () {
  const esc = value => window.JIHANKI_MARKDOWN.escape(value);
  function button(label, section) {
    return '<button type="button" class="service-button" data-maint-section="' + esc(section) + '">' + esc(label) + '</button>';
  }
  function render(section) {
    const screen = document.getElementById("screen-content"); if (!screen) return;
    const all = window.JIHANKI_ARCHIVE || [], receipts = window.JIHANKI_RECEIPTS?.all() || [], events = window.JIHANKI_EVENTS?.all() || [];
    const summary = window.JIHANKI_INVENTORY?.summary() || {};
    const sections = [
      ["OVERVIEW", "overview"], ["INVENTORY", "inventory"], ["ARCHIVE INDEX", "archive"],
      ["ROTATION", "rotation"], ["COLLECTION", "collection"], ["AMBIENT", "ambient"],
      ["PRODUCTION NOTES", "documents"], ["TRANSACTIONS", "receipts"], ["SYSTEM LOG", "log"],
      ["GEOGRAPHY", "geography"]
    ];
    let body = "";
    if (section === "overview") {
      const rotation = window.JIHANKI_ROTATION?.snapshot() || { date: "UNKNOWN", featured: 0, residue: 0 };
      const collection = window.JIHANKI_COLLECTION;
      const ambient = window.JIHANKI_AUDIO?.getState() || { state: "unknown", muted: false };
      body = '<div class="service-grid"><div>ARCHIVE ITEMS<strong>' + all.length + '</strong></div><div>TRANSACTIONS<strong>' + receipts.length + '</strong></div><div>EVENTS<strong>' + events.length + '</strong></div><div>COLLECTED WORKS<strong>' + (collection?.count() || 0) + '</strong></div></div>' +
        '<div class="service-subhead">STOCK SUMMARY</div>' + Object.entries(summary).map(([k, v]) => '<div class="service-line"><span>' + esc(k.toUpperCase()) + '</span><strong>' + v + '</strong></div>').join("") +
        '<div class="service-subhead">ROTATION / ' + esc(rotation.date) + '</div><div class="service-line"><span>FEATURED FRAGMENTS</span><strong>' + rotation.featured + '</strong></div><div class="service-line"><span>RESIDUE</span><strong>' + rotation.residue + '</strong></div>' +
        '<div class="service-subhead">AMBIENT STATE</div><div class="service-line"><span>' + esc(ambient.state.toUpperCase()) + '</span><strong>' + (ambient.muted ? 'MUTED' : 'ACTIVE') + '</strong></div>' +
        '<div class="service-note">LOCAL SERVICE TERMINAL / VISITOR DATA STAYS IN THIS BROWSER</div>';
    } else if (section === "inventory") {
      body = all.map(item => '<div class="service-record"><span>' + esc(item.title) + '</span><small>' + esc(item.id) + ' · ' + esc(window.JIHANKI_INVENTORY.label(item)) + '</small></div>').join("");
    } else if (section === "archive") {
      body = all.map(item => '<div class="service-record"><span>' + esc(item.title) + '</span><small>' + esc(item.id) + ' · ' + esc(item.machineCategory || "unclassified") + '</small></div>').join("");
    } else if (section === "rotation") {
      const current = window.JIHANKI_ROTATION?.current() || { date: "UNKNOWN", items: [] };
      const residue = window.JIHANKI_ROTATION?.residue() || [];
      body = '<div class="service-subhead">CURRENT / ' + esc(current.date) + '</div>' +
        current.items.map(item => '<button class="service-record service-record-button" type="button" data-service-item="' + esc(item.id) + '"><span>' + esc(item.title) + '</span><small>' + esc(item.id) + '</small></button>').join("") +
        '<div class="service-subhead">RESIDUE / PREVIOUS CYCLE</div>' +
        residue.map(item => '<button class="service-record service-record-button" type="button" data-service-item="' + esc(item.id) + '"><span>' + esc(item.title) + '</span><small>' + esc(item.id) + ' · ROTATED OUT</small></button>').join("") +
        '<div class="service-note">ROTATION CHANGES THE SURFACE, NEVER THE MASTER ARCHIVE.</div>';
    } else if (section === "collection") {
      const records = window.JIHANKI_COLLECTION?.all() || [];
      body = '<div class="service-subhead">' + records.length + ' WORKS / ' + (window.JIHANKI_COLLECTION?.totalPurchases() || 0) + ' ACQUISITIONS</div>' +
        records.map(record => '<button class="service-record service-record-button" type="button" data-service-item="' + esc(record.id) + '"><span>' + esc(record.title) + '</span><small>' + esc(record.id) + ' · ×' + Number(record.purchaseCount || 1) + '</small></button>').join("") +
        (records.length ? '' : '<div class="service-note">NO MEMORIES COLLECTED YET</div>') +
        '<div class="collection-actions"><button type="button" data-maint-collection-action="export">EXPORT</button><button type="button" data-maint-collection-action="clear">CLEAR</button></div>';
    } else if (section === "ambient") {
      const ambient = window.JIHANKI_AUDIO?.getState() || { state: "unknown", muted: false, foregroundCount: 0, targetVolume: 0 };
      body = '<div class="service-subhead">MACHINE SOUND PROFILE</div>' +
        '<div class="service-line"><span>STATE</span><strong>' + esc(ambient.state.toUpperCase()) + '</strong></div>' +
        '<div class="service-line"><span>AMBIENT LEVEL</span><strong>' + Math.round(ambient.targetVolume * 100) + '%</strong></div>' +
        '<div class="service-line"><span>FOREGROUND MEDIA</span><strong>' + ambient.foregroundCount + '</strong></div>' +
        '<div class="service-line"><span>USER CONTROL</span><strong>' + (ambient.muted ? 'MUTED' : 'ENABLED') + '</strong></div>' +
        '<div class="collection-actions"><button type="button" data-audio-toggle>' + (ambient.muted ? 'ENABLE AMBIENCE' : 'MUTE AMBIENCE') + '</button></div>' +
        '<div class="service-note">THE LOOP FADES BETWEEN IDLE, BROWSING, READING, DISPENSING AND SERVICE STATES.</div>';
    } else if (section === "documents") {
      body = all.filter(item => item.file && (item.machineCategory === "text" || item.machineCategory === "notes" || item.machineCategory === "performance")).map(item => '<button class="service-record service-record-button" type="button" data-service-item="' + esc(item.id) + '"><span>' + esc(item.title) + '</span><small>' + esc(item.file) + '</small></button>').join("") || '<div class="service-note">NO DOCUMENT RECORDS</div>';
    } else if (section === "receipts") {
      body = receipts.slice().reverse().map(receipt => '<div class="service-record"><span>' + esc(receipt.title) + '</span><small>' + esc(receipt.code) + ' · ' + esc(receipt.purchasedLabel) + '</small></div>').join("") || '<div class="service-note">NO TRANSACTIONS RECORDED</div>';
    } else if (section === "log") {
      body = events.slice().reverse().slice(0, 100).map(event => '<div class="service-record"><span>' + esc(event.type.toUpperCase()) + '</span><small>' + esc(new Date(event.at).toLocaleString()) + ' · ' + esc(event.detail?.itemId || event.detail?.message || "") + '</small></div>').join("") || '<div class="service-note">NO SYSTEM EVENTS RECORDED</div>';
    } else if (section === "geography") {
      body = (window.JIHANKI_GEOGRAPHY?.places() || []).map(place => '<button class="service-record service-record-button" type="button" data-maint-place="' + esc(place.name) + '"><span>' + esc(place.name) + '</span><small>' + esc(place.count + " RECORDS · " + place.description) + '</small></button>').join("") || '<div class="service-note">NO LOCATION RECORDS</div>';
    }
    screen.innerHTML = '<div class="service-terminal"><div class="service-head"><span>JHK / INTERNAL SERVICE</span><span class="service-indicator">● ACTIVE</span></div><div class="service-nav">' +
      sections.map(([label, key]) => button(label, key)).join("") +
      '</div><div class="service-current">' + esc((section || "overview").toUpperCase()) + '</div><div class="service-body">' + body + '</div><div class="service-footer"><span>LOCAL ARCHIVE / SERVICE MODE</span><button type="button" data-maint-exit>EXIT</button></div></div>';
  }
  window.JIHANKI_MAINTENANCE = { render };
})();