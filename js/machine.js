/* JIHANKI machine controller. All user-facing interactions live here;
   feature logic is delegated to the focused modules loaded before this file. */
(function () {
  "use strict";
  const screen = document.getElementById("screen-content");
  const artifact = document.getElementById("artifact");
  const artifactContent = document.getElementById("artifact-content");
  const esc = value => window.JIHANKI_MARKDOWN.escape(value);
  const allItems = () => window.JIHANKI_ARCHIVE || [];
  const byId = id => {
    const live = allItems().find(item => String(item.id) === String(id));
    if (live) return live;
    const collected = window.JIHANKI_COLLECTION?.all().find(record => String(record.id) === String(id));
    return collected ? (window.JIHANKI_COLLECTION.resolve(collected) || collected) : null;
  };
  let credits = 0, selectedId = null, activeCategory = null, lastDispensed = null;
  let maintenanceActive = false, serviceArmedUntil = 0, serviceHoldTimer = null, serviceActivated = false;
  let controlSequence = [];

  function resizeJihanki() {
    const scale = Math.min(window.innerWidth / 429, window.innerHeight / 932);
    document.documentElement.style.setProperty("--scale", scale);
  }
  window.addEventListener("resize", resizeJihanki);
  window.addEventListener("orientationchange", resizeJihanki);
  resizeJihanki();

  function showHome() {
    window.JIHANKI_AUDIO.setState("idle");
    const collectionCount = window.JIHANKI_COLLECTION.count();
    const rotation = window.JIHANKI_ROTATION.current();
    const muteLabel = window.JIHANKI_AUDIO.isMuted() ? "AMBIENCE / OFF" : "AMBIENCE / ON";
    screen.innerHTML = '<div class="boot"><div class="boot-japanese">自販機</div><div class="boot-title">JIHANKI</div><div class="boot-subtitle">MEMORY ARCHIVE</div><div class="boot-loading">SELECT A MEMORY</div>' +
      '<div class="home-actions"><button type="button" data-home-action="rotation">ROTATION / ' + rotation.items.length + '</button><button type="button" data-home-action="collection">COLLECTION / ' + collectionCount + '</button></div>' +
      '<button type="button" class="home-audio" data-home-action="audio">' + muteLabel + '</button></div>';
  }
  function showMessage(title, subtitle, footer) {
    screen.innerHTML = '<div class="boot"><div class="boot-title">' + esc(title) + '</div><div class="boot-subtitle">' + esc(subtitle || "") + '</div><div class="boot-loading">' + esc(footer || "") + '</div></div>';
  }
  function stockTag(item) {
    const status = window.JIHANKI_INVENTORY.status(item);
    return '<span class="archive-stock status-' + esc(status) + '">' + esc(window.JIHANKI_INVENTORY.label(item)) + '</span>';
  }
  function showCategory(category) {
    window.JIHANKI_AUDIO.setState("browsing");
    activeCategory = category === "text-index" ? "notes" : category;
    selectedId = null;
    const list = window.JIHANKI_CATEGORIES.items(activeCategory);
    const groups = new Map();
    list.forEach(item => {
      const group = item.group || "ARCHIVE";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(item);
    });
    const body = [...groups.entries()].map(([group, entries]) =>
      '<div class="archive-group">' + esc(group) + '</div>' +
      entries.map((item, index) => '<button class="archive-item" data-archive-id="' + esc(item.id) + '" type="button">' +
        '<span>' + String(index + 1).padStart(2, "0") + '&nbsp;&nbsp;' + esc(item.title || "UNTITLED") + stockTag(item) + '</span>' +
        (item.date ? '<small>' + esc(item.date) + '</small>' : '') +
        (item.description ? '<div class="archive-description">' + esc(item.description) + '</div>' : '') +
        '</button>').join("")
    ).join("");
    const title = window.JIHANKI_CATEGORIES.config[activeCategory]?.label || String(activeCategory).toUpperCase();
    const availableCount = window.JIHANKI_INVENTORY.available(list).length;
    screen.innerHTML = '<div class="archive"><div class="archive-header"><span class="archive-title">' + esc(title) + '</span><span class="archive-status">' + availableCount + ' / ' + list.length + ' AVAILABLE</span></div>' +
      (list.length ? body : '<div class="archive-item">NO MEMORY RECORDED</div>') + '</div>';
    window.JIHANKI_EVENTS.record("category-opened", { category: activeCategory, count: list.length });
  }

  function closeArtifact() {
    artifact.classList.remove("open");
    artifact.setAttribute("aria-hidden", "true");
    artifactContent.querySelectorAll("audio,video").forEach(media => { try { media.pause(); } catch (_) {} });
    window.JIHANKI_AUDIO.clearMedia();
    window.JIHANKI_AUDIO.setState(maintenanceActive ? "service" : (activeCategory ? "browsing" : "idle"));
  }

  async function renderBody(item) {
    const body = document.getElementById("artifact-body");
    if (!body) return;
    const type = String(item.type || item.category || "").toLowerCase();
    const file = item.file || "";
    const extension = file.split("?")[0].split(".").pop().toLowerCase();
    const title = esc(item.title || "UNTITLED");
    if (item.type === "voicebank" || item.machineCategory === "utau" && item.image) {
      const image = item.image ? '<img class="artifact-media" src="' + esc(item.image) + '" alt="' + title + '">' : "";
      const link = item.url ? '<p><a class="markdown-link" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">OPEN VOICEBANK RELEASE ↗</a></p>' : "";
      body.innerHTML = image + '<p class="voicebank-subtitle">' + esc(item.subtitle || "") + '</p><p class="voicebank-context">' + esc(item.context || "") + '</p><div class="artifact-text">' + esc(item.description || "") + '</div>' + link;
      return;
    }
    const coverHTML = item.image && (type === "project" || type === "audio") ? '<img class="project-cover" src="' + esc(item.image) + '" alt="' + title + '">' : "";
    if (type === "video" || /^(mp4|webm|mov)$/.test(extension)) {
      body.innerHTML = window.JIHANKI_VIDEO ? window.JIHANKI_VIDEO.render(item) :
        '<video class="artifact-video" controls playsinline preload="metadata" src="' + esc(file) + '"></video>';
      window.JIHANKI_AUDIO.bindMedia(body);
      return;
    }
    if (type === "audio" || type === "music" || type === "sound" || /^(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(extension)) {
      body.innerHTML = '<audio class="artifact-audio" controls playsinline preload="metadata" src="' + esc(file) + '"></audio>';
      window.JIHANKI_AUDIO.bindMedia(body);
      return;
    }
    if (type === "image" || type === "photo" || /^(png|jpe?g|webp|gif)$/.test(extension)) {
      body.innerHTML = '<figure class="artifact-photo"><img class="artifact-media" src="' + esc(file) + '" alt="' + title + '">' +
        (item.description ? '<figcaption class="artifact-caption">' + esc(item.description) + '</figcaption>' : '') + '</figure>';
      return;
    }
    if (file) {
      try {
        const response = await fetch(file, { cache: "no-cache" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const markdown = await response.text();
        const base = new URL("./", new URL(file, location.href)).href;
        body.innerHTML = coverHTML + '<div class="artifact-text markdown-rendered">' + window.JIHANKI_MARKDOWN.render(markdown, base) + '</div>';
        window.JIHANKI_AUDIO.bindMedia(body);
        return;
      } catch (error) {
        body.innerHTML = '<div class="artifact-text"><strong>MEMORY COULD NOT BE READ.</strong><br><br>' + esc(file) + '<br>' + esc(error.message) + '</div>';
        return;
      }
    }
    body.textContent = item.description || item.text || "NO DATA";
  }

  function renderRelations(item) {
    const related = window.JIHANKI_RELATIONSHIPS.related(item);
    const locations = window.JIHANKI_GEOGRAPHY.locations(item);
    let html = "";
    if (related.length) {
      html += '<section class="artifact-relations"><span class="artifact-section-label">RELATED RECORDS</span>' +
        related.map(record => '<button type="button" class="relation-link" data-related-id="' + esc(record.id) + '">' + esc(record.title) + '</button>').join("") + '</section>';
    }
    if (locations.length) {
      html += '<section class="artifact-locations"><span class="artifact-section-label">LOCATION INDEX</span>' +
        locations.map(place => '<button type="button" class="location-link" data-place="' + esc(place) + '">' + esc(place) + '</button>').join("") + '</section>';
    }
    return html;
  }

  async function openItem(item, receipt) {
    if (!item) return;
    selectedId = item.id;
    window.JIHANKI_AUDIO.start();
    if (receipt) {
      window.JIHANKI_AUDIO.setState("reading");
      window.JIHANKI_AUDIO.setState("dispensing", 1350);
    } else {
      window.JIHANKI_AUDIO.setState("reading");
    }
    window.JIHANKI_AUDIO.sfx("button");
    window.JIHANKI_EVENTS.record("memory-opened", { itemId: item.id });
    const status = window.JIHANKI_INVENTORY.status(item);
    const unavailable = !window.JIHANKI_INVENTORY.isAvailable(item);
    const date = item.date || "UNDATED";
    const author = item.author || "ARCHIVE";
    artifactContent.innerHTML =
      (receipt ? window.JIHANKI_RECEIPTS.markup(receipt) : "") +
      '<h1 class="artifact-title">' + esc(item.title || "UNTITLED") + '</h1>' +
      '<div class="artifact-meta">' + esc(author) + ' / ' + esc(date) + ' / ' + esc(item.machineCategory || item.category || item.type || "ARCHIVE") + '</div>' +
      '<div id="artifact-body">LOADING MEMORY...</div>' +
      (unavailable ? '<div class="artifact-unavailable"><strong>' + esc(window.JIHANKI_INVENTORY.label(item)) + '</strong><br>' + esc(window.JIHANKI_INVENTORY.message(item)) + '</div>' : '') +
      renderRelations(item) +
      '<div class="artifact-actions">' +
      (!unavailable && !receipt && allItems().some(record => record.id === item.id) ? '<button type="button" data-action="purchase-current">DISPENSE THIS MEMORY · 1 CREDIT</button>' : '') +
      (item.projectPath ? '<a class="markdown-link" href="' + esc(item.projectPath) + '" target="_blank" rel="noopener noreferrer">OPEN PROJECT DOSSIER ↗</a>' : '') +
      '</div>';
    artifact.classList.add("open");
    artifact.setAttribute("aria-hidden", "false");
    await renderBody(item);
  }

  function purchase(item) {
    if (!item) return;
    if (!window.JIHANKI_INVENTORY.isAvailable(item)) {
      showMessage(window.JIHANKI_INVENTORY.label(item), window.JIHANKI_INVENTORY.message(item), "MEMORY NOT DISPENSED");
      window.JIHANKI_EVENTS.record("purchase-blocked", { itemId: item.id, status: window.JIHANKI_INVENTORY.status(item) });
      return;
    }
    if (credits < 1) {
      showMessage("NO CREDIT", "INSERT A COIN FIRST", "ONE COIN / ONE MEMORY");
      window.JIHANKI_EVENTS.record("purchase-blocked", { itemId: item.id, reason: "no-credit" });
      return;
    }
    credits -= 1;
    lastDispensed = item.id;
    selectedId = item.id;
    const receipt = window.JIHANKI_RECEIPTS.create(item);
    window.JIHANKI_COLLECTION.add(item, receipt);
    window.JIHANKI_EVENTS.record("memory-dispensed", { itemId: item.id, receipt: receipt.code, creditsRemaining: credits });
    openItem(item, receipt);
  }

  function dispense() {
    if (selectedId) {
      const selected = byId(selectedId);
      if (selected) { purchase(selected); return; }
    }
    let pool = activeCategory ? window.JIHANKI_CATEGORIES.items(activeCategory) : allItems();
    pool = window.JIHANKI_INVENTORY.available(pool);
    if (pool.length > 1 && lastDispensed) pool = pool.filter(item => item.id !== lastDispensed).concat(pool.filter(item => item.id === lastDispensed).slice(0, 0));
    if (!pool.length) {
      const categoryItems = activeCategory ? window.JIHANKI_CATEGORIES.items(activeCategory) : allItems();
      const unavailable = categoryItems.find(item => !window.JIHANKI_INVENTORY.isAvailable(item));
      if (unavailable) showMessage(window.JIHANKI_INVENTORY.label(unavailable), window.JIHANKI_INVENTORY.message(unavailable), "SELECT ANOTHER MEMORY");
      else showMessage("SOLD OUT", "NO MEMORY IN STOCK", "PLEASE RETURN LATER");
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    purchase(item);
  }

  function showLocation(place) {
    closeArtifact();
    activeCategory = null; selectedId = null;
    window.JIHANKI_AUDIO.setState("browsing");
    const records = window.JIHANKI_GEOGRAPHY.entries(place);
    const html = records.map((item, index) => '<button class="archive-item" type="button" data-archive-id="' + esc(item.id) + '">' +
      String(index + 1).padStart(2, "0") + '&nbsp;&nbsp;' + esc(item.title) + stockTag(item) +
      '<small>' + esc(item.date || "UNDATED") + '</small></button>').join("");
    screen.innerHTML = '<div class="archive"><div class="archive-header"><span class="archive-title">' + esc(place.toUpperCase()) + '</span><span class="archive-status">' + records.length + ' RECORDS</span></div>' +
      (records.length ? html : '<div class="archive-item">NO MEMORY RECORDED</div>') + '</div>';
    window.JIHANKI_EVENTS.record("location-opened", { place, count: records.length });
  }

  function showRotation() {
    closeArtifact();
    activeCategory = null; selectedId = null;
    window.JIHANKI_AUDIO.setState("rotation");
    const current = window.JIHANKI_ROTATION.current();
    const residue = window.JIHANKI_ROTATION.residue();
    const row = (item, index, residueMode) =>
      '<button class="archive-item' + (residueMode ? ' rotation-residue' : '') + '" type="button" data-archive-id="' + esc(item.id) + '">' +
      String(index + 1).padStart(2, "0") + '&nbsp;&nbsp;' + esc(item.title || "UNTITLED") + stockTag(item) +
      '<small>' + esc(item.date || "UNDATED") + (residueMode ? ' · RESIDUE' : '') + '</small>' +
      (item.description ? '<div class="archive-description">' + esc(item.description) + '</div>' : '') + '</button>';
    const today = current.items.map((item, index) => row(item, index, false)).join("");
    const old = residue.map((item, index) => row(item, index, true)).join("");
    screen.innerHTML = '<div class="archive rotation-screen"><div class="archive-header"><span class="archive-title">ARCHIVE ROTATION</span><span class="archive-status">' + esc(current.date) + '</span></div>' +
      '<div class="archive-group">CURRENT / ' + current.items.length + ' FRAGMENTS</div>' + (today || '<div class="archive-item">NO MEMORY IN ROTATION</div>') +
      '<div class="archive-group">RESIDUE / PREVIOUS CYCLE</div>' + (old || '<div class="archive-item">NO RESIDUE RETAINED</div>') +
      '<div class="rotation-note">ROTATION CHANGES THE SURFACE, NOT THE ARCHIVE. ALL RECORDS REMAIN IN THEIR ORIGINAL CATEGORIES.</div></div>';
    window.JIHANKI_EVENTS.record("rotation-opened", { date: current.date, current: current.items.map(item => item.id), residue: residue.map(item => item.id) });
  }

  function showCollection() {
    closeArtifact();
    activeCategory = null; selectedId = null;
    window.JIHANKI_AUDIO.setState("collection");
    const records = window.JIHANKI_COLLECTION.all();
    const html = records.map((record, index) => {
      const item = window.JIHANKI_COLLECTION.resolve(record) || record;
      return '<button class="archive-item collection-item" type="button" data-archive-id="' + esc(item.id) + '">' +
        String(index + 1).padStart(2, "0") + '&nbsp;&nbsp;' + esc(record.title || item.title || "UNTITLED") +
        '<span class="collection-count">×' + Number(record.purchaseCount || 1) + '</span>' +
        '<small>LAST ACQUIRED / ' + esc(new Date(record.lastCollectedAt).toLocaleDateString()) + '</small></button>';
    }).join("");
    const storageNote = window.JIHANKI_COLLECTION.storageAvailable() ? "STORED IN THIS BROWSER" : "SESSION ONLY / STORAGE UNAVAILABLE";
    screen.innerHTML = '<div class="archive collection-screen"><div class="archive-header"><span class="archive-title">MY COLLECTION</span><span class="archive-status">' + records.length + ' WORKS</span></div>' +
      '<div class="collection-summary">' + window.JIHANKI_COLLECTION.totalPurchases() + ' TOTAL ACQUISITIONS / ' + esc(storageNote) + '</div>' +
      (records.length ? html : '<div class="archive-item collection-empty">NO MEMORIES COLLECTED YET</div>') +
      '<div class="collection-actions"><button type="button" data-collection-action="export">EXPORT COLLECTION</button><button type="button" data-collection-action="clear">CLEAR</button></div></div>';
    window.JIHANKI_EVENTS.record("collection-opened", { works: records.length, acquisitions: window.JIHANKI_COLLECTION.totalPurchases() });
  }

  function recordSequence(key) {
    const now = Date.now();
    controlSequence = controlSequence.filter(entry => now - entry.at < 7000);
    controlSequence.push({ key, at: now });
    controlSequence = controlSequence.slice(-5);
    const pattern = controlSequence.map(entry => entry.key).join(",");
    if (pattern === "HOME,HOME,HOME,COIN,COIN") {
      serviceArmedUntil = now + 8000;
      showMessage("SERVICE SEQUENCE READY", "HOLD MEMORY / PICK UP", "INTERNAL SERVICE");
      window.JIHANKI_EVENTS.record("service-sequence-armed", {});
    }
  }

  function enterMaintenance() {
    serviceArmedUntil = 0; maintenanceActive = true; serviceActivated = true;
    closeArtifact();
    window.JIHANKI_EVENTS.record("maintenance-opened", {});
    window.JIHANKI_AUDIO.setState("service");
    window.JIHANKI_AUDIO.sfx("home");
    window.JIHANKI_MAINTENANCE.render("overview");
  }

  function exitMaintenance() {
    maintenanceActive = false; showHome();
    window.JIHANKI_EVENTS.record("maintenance-closed", {});
  }

  document.querySelectorAll(".product").forEach(button => {
    button.addEventListener("click", () => {
      window.JIHANKI_AUDIO.start(); window.JIHANKI_AUDIO.sfx("button");
      if (maintenanceActive) exitMaintenance();
      const category = button.dataset.category;
      showCategory(category);
    });
  });

  document.getElementById("coin-button").addEventListener("click", () => {
    window.JIHANKI_AUDIO.start(); window.JIHANKI_AUDIO.sfx("coin");
    recordSequence("COIN");
    credits = Math.min(credits + 1, 9);
    window.JIHANKI_AUDIO.setState("dispensing", 850);
    if (Date.now() < serviceArmedUntil) {
      showMessage("SERVICE SEQUENCE READY", "HOLD MEMORY / PICK UP", "INTERNAL SERVICE");
    } else {
      showMessage("COIN ACCEPTED", credits + " CREDIT" + (credits === 1 ? "" : "S"), "PICK UP TO DISPENSE A MEMORY");
    }
    window.JIHANKI_EVENTS.record("coin-accepted", { credits });
    if (window.JIHANKI_ANOMALIES.maybe("coin")) return;
  });

  document.getElementById("home-button").addEventListener("click", () => {
    window.JIHANKI_AUDIO.start(); window.JIHANKI_AUDIO.sfx("home");
    recordSequence("HOME");
    if (maintenanceActive) { exitMaintenance(); return; }
    closeArtifact(); activeCategory = null; selectedId = null; showHome();
    window.JIHANKI_EVENTS.record("home-pressed", {});
    window.JIHANKI_ANOMALIES.maybe("home");
  });

  const memoryButton = document.getElementById("memory-button");
  memoryButton.addEventListener("pointerdown", () => {
    if (Date.now() >= serviceArmedUntil) return;
    clearTimeout(serviceHoldTimer);
    serviceHoldTimer = setTimeout(enterMaintenance, 2600);
  });
  window.addEventListener("pointerup", () => clearTimeout(serviceHoldTimer));
  window.addEventListener("pointercancel", () => clearTimeout(serviceHoldTimer));
  memoryButton.addEventListener("click", () => {
    if (serviceActivated) { serviceActivated = false; return; }
    if (maintenanceActive) { exitMaintenance(); return; }
    window.JIHANKI_AUDIO.start(); window.JIHANKI_AUDIO.sfx("button");
    dispense();
    if (!artifact.classList.contains("open")) window.JIHANKI_ANOMALIES.maybe("pickup");
  });

  document.getElementById("artifact-close").addEventListener("click", closeArtifact);
  artifact.addEventListener("click", event => { if (event.target === artifact) closeArtifact(); });
  artifactContent.addEventListener("click", event => {
    const target = event.target.closest("button,a");
    if (!target) return;
    if (target.dataset.action === "purchase-current") { purchase(byId(selectedId)); return; }
    if (target.dataset.relatedId) { const item = byId(target.dataset.relatedId); if (item) openItem(item); return; }
    if (target.dataset.place) { showLocation(target.dataset.place); return; }
    if (target.dataset.receiptAction === "print") { window.JIHANKI_RECEIPTS.print(target.dataset.receiptId); return; }
    if (target.dataset.receiptAction === "download") { window.JIHANKI_RECEIPTS.download(target.dataset.receiptId); return; }
  });

  screen.addEventListener("click", event => {
    const homeAction = event.target.closest("[data-home-action]");
    if (homeAction) {
      const action = homeAction.dataset.homeAction;
      if (action === "rotation") { showRotation(); return; }
      if (action === "collection") { showCollection(); return; }
      if (action === "audio") {
        const muted = window.JIHANKI_AUDIO.toggleMute();
        window.JIHANKI_EVENTS.record("ambient-control", { muted });
        if (maintenanceActive) window.JIHANKI_MAINTENANCE.render("ambient");
        else showHome();
        return;
      }
    }
    const collectionAction = event.target.closest("[data-collection-action]");
    if (collectionAction) {
      if (collectionAction.dataset.collectionAction === "export") {
        window.JIHANKI_COLLECTION.exportFile();
        showCollection();
      } else if (collectionAction.dataset.collectionAction === "clear") {
        if (window.confirm("Clear this browser's JIHANKI collection? Receipts will remain unchanged.")) {
          window.JIHANKI_COLLECTION.clear();
          showCollection();
        }
      }
      return;
    }
    const audioControl = event.target.closest("[data-audio-toggle]");
    if (audioControl) {
      const muted = window.JIHANKI_AUDIO.toggleMute();
      window.JIHANKI_EVENTS.record("ambient-control", { muted });
      window.JIHANKI_MAINTENANCE.render("ambient");
      return;
    }
    const maintenanceCollectionAction = event.target.closest("[data-maint-collection-action]");
    if (maintenanceCollectionAction && maintenanceActive) {
      if (maintenanceCollectionAction.dataset.maintCollectionAction === "export") {
        window.JIHANKI_COLLECTION.exportFile();
      } else if (maintenanceCollectionAction.dataset.maintCollectionAction === "clear" &&
          window.confirm("Clear this browser's JIHANKI collection? Receipts will remain unchanged.")) {
        window.JIHANKI_COLLECTION.clear();
      }
      window.JIHANKI_MAINTENANCE.render("collection");
      return;
    }
    const serviceSection = event.target.closest("[data-maint-section]");
    if (serviceSection && maintenanceActive) { window.JIHANKI_MAINTENANCE.render(serviceSection.dataset.maintSection); return; }
    if (event.target.closest("[data-maint-exit]")) { exitMaintenance(); return; }
    const serviceItem = event.target.closest("[data-service-item]");
    if (serviceItem && maintenanceActive) { const item = byId(serviceItem.dataset.serviceItem); if (item) openItem(item); return; }
    const servicePlace = event.target.closest("[data-maint-place]");
    if (servicePlace && maintenanceActive) { showLocation(servicePlace.dataset.maintPlace); return; }
    const archiveButton = event.target.closest(".archive-item[data-archive-id]");
    if (!archiveButton) return;
    const item = byId(archiveButton.dataset.archiveId);
    if (item) openItem(item);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && artifact.classList.contains("open")) closeArtifact();
    if (event.key.toLowerCase() === "m" && !event.ctrlKey && !event.metaKey && !event.altKey &&
        !artifact.classList.contains("open") && !["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)) {
      const muted = window.JIHANKI_AUDIO.toggleMute();
      window.JIHANKI_EVENTS.record("ambient-control", { muted, source: "keyboard" });
      if (maintenanceActive) window.JIHANKI_MAINTENANCE.render("ambient");
      else if (!activeCategory) showHome();
    }
  });

  window.JIHANKI_MACHINE = {
    openItem, purchase, dispense, showCategory, showLocation, showRotation, showCollection,
    getState() { return { credits, selectedId, activeCategory, maintenanceActive, ambient: window.JIHANKI_AUDIO.getState() }; }
  };
  window.JIHANKI_EVENTS.record("machine-booted", { items: allItems().length });
  showHome();
})();