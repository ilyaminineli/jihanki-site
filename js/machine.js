/* JIHANKI machine controller. All user-facing interactions live here;
   feature logic is delegated to the focused modules loaded before this file. */
(function () {
  "use strict";
  const screen = document.getElementById("screen-content");
  const artifact = document.getElementById("artifact");
  const artifactContent = document.getElementById("artifact-content");
  const artifactClose = document.getElementById("artifact-close");
  const creditDisplay = document.getElementById("credit-display");
  const announcer = document.getElementById("machine-announcer");
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
  let currentView = "idle";
  let activeArtifact = null;
  let lastFocusedElement = null;
  let artifactRenderToken = 0;

  function announce(message) {
    if (announcer) announcer.textContent = String(message || "");
  }
  function updateCreditDisplay() {
    if (creditDisplay) creditDisplay.textContent = "CREDITS / " + credits;
    const balance = artifactContent.querySelector(".artifact-credit-status");
    if (balance) balance.textContent = "CREDIT BALANCE / " + credits;
  }
  function audioStateForView() {
    if (maintenanceActive || currentView === "service") return "service";
    return ({ category: "browsing", location: "browsing", rotation: "rotation", collection: "collection", exploration: "browsing" })[currentView] || "idle";
  }
  function updateArtifactActions() {
    const actions = artifactContent.querySelector(".artifact-actions");
    if (!actions || !activeArtifact) return;
    const item = activeArtifact.item, receipt = activeArtifact.receipt;
    const live = allItems().some(record => String(record.id) === String(item.id));
    const unavailable = !window.JIHANKI_INVENTORY.isAvailable(item);
    let transaction = "";
    if (live && !unavailable && !receipt) {
      const action = credits > 0 ? "purchase-current" : "insert-credit-current";
      const label = credits > 0 ? "DISPENSE THIS MEMORY · 1 CREDIT" : "INSERT 1 CREDIT";
      transaction = '<button type="button" data-action="' + action + '">' + label + '</button>';
    }
    const dossier = item.projectPath
      ? '<a class="markdown-link" href="' + esc(item.projectPath) + '" target="_blank" rel="noopener noreferrer">OPEN PROJECT DOSSIER ↗</a>'
      : "";
    actions.innerHTML = '<span class="artifact-credit-status">CREDIT BALANCE / ' + credits + '</span>' + transaction + dossier;
  }
  function artifactFeedback(message) {
    const feedback = artifactContent.querySelector(".artifact-feedback");
    if (feedback) feedback.textContent = String(message || "");
    if (message) announce(message);
  }
  function acceptCoin(source) {
    window.JIHANKI_AUDIO.start();
    window.JIHANKI_AUDIO.sfx("coin");
    if (credits >= 9) {
      if (source === "artifact") artifactFeedback("CREDIT LIMIT REACHED — DISPENSE A MEMORY FIRST");
      else showMessage("CREDIT LIMIT", "MAXIMUM 9 CREDITS", "DISPENSE A MEMORY FIRST");
      window.JIHANKI_EVENTS.record("coin-rejected", { credits, reason: "credit-limit", source: source || "physical" });
      return false;
    }
    recordSequence("COIN");
    credits += 1;
    updateCreditDisplay();
    window.JIHANKI_AUDIO.setState("dispensing", 850);
    if (Date.now() < serviceArmedUntil) {
      if (source === "artifact") artifactFeedback("SERVICE SEQUENCE READY — HOLD MEMORY / PICK UP");
      else showMessage("SERVICE SEQUENCE READY", "HOLD MEMORY / PICK UP", "INTERNAL SERVICE");
    } else if (source === "artifact") {
      artifactFeedback("COIN ACCEPTED — " + credits + " CREDIT" + (credits === 1 ? "" : "S") + " AVAILABLE");
      updateArtifactActions();
    } else {
      showMessage("COIN ACCEPTED", credits + " CREDIT" + (credits === 1 ? "" : "S"), "PICK UP TO DISPENSE A MEMORY");
    }
    window.JIHANKI_EVENTS.record("coin-accepted", { credits, source: source || "physical" });
    if (source !== "artifact" && window.JIHANKI_ANOMALIES.maybe("coin")) return true;
    return false;
  }

  function resizeJihanki() {
    const shortLandscape = window.innerWidth > window.innerHeight && window.innerHeight < 620;
    document.body.classList.toggle("compact-landscape", shortLandscape);
    const scale = shortLandscape ? Math.min(window.innerWidth / 429, 1) : Math.min(window.innerWidth / 429, window.innerHeight / 932);
    document.documentElement.style.setProperty("--scale", scale);
    const viewport = document.getElementById("viewport");
    if (shortLandscape) {
      viewport.style.position = "absolute"; viewport.style.top = "12px";
      viewport.style.transform = "translateX(-50%) scale(" + scale + ")";
      viewport.style.transformOrigin = "top center";
      document.body.style.minHeight = Math.ceil(932 * scale + 24) + "px";
    } else {
      viewport.style.position = ""; viewport.style.top = ""; viewport.style.transform = ""; viewport.style.transformOrigin = "";
      document.body.style.minHeight = "";
    }
  }
  window.addEventListener("resize", resizeJihanki);
  window.addEventListener("orientationchange", resizeJihanki);
  resizeJihanki();

  function showHome() {
    currentView = "idle";
    window.JIHANKI_AUDIO.setState("idle");
    updateCreditDisplay();
    const collectionCount = window.JIHANKI_COLLECTION.count();
    const rotation = window.JIHANKI_ROTATION.current();
    const muteLabel = window.JIHANKI_AUDIO.isMuted() ? "AMBIENCE / OFF" : "AMBIENCE / ON";
    const machineLine = window.JIHANKI_PERSONALITY?.homeLine() || "SELECT A MEMORY";
    screen.innerHTML = '<div class="boot"><div class="boot-japanese">自販機</div><div class="boot-title">JIHANKI</div><div class="boot-subtitle">MEMORY ARCHIVE</div><div class="boot-loading">' + esc(machineLine) + '</div>' +
      '<div class="home-actions"><button type="button" data-home-action="rotation">ROTATION / ' + rotation.items.length + '</button>' +
      '<button type="button" data-home-action="collection">COLLECTION / ' + collectionCount + '</button>' +
      '<button type="button" data-home-action="map">MEMORY MAP</button><button type="button" data-home-action="search">SEARCH</button>' +
      '<button type="button" data-home-action="installation">SOUND LAB</button>' +
      '<button type="button" data-home-action="personality">MACHINE MEMORY</button></div>' +
      '<button type="button" class="home-audio" data-home-action="audio">' + muteLabel + '</button></div>';
    announce("JIHANKI home. " + collectionCount + " collected works. " + rotation.items.length + " rotation fragments. " + machineLine);
  }
  function showMessage(title, subtitle, footer) {
    screen.innerHTML = '<div class="boot"><div class="boot-title">' + esc(title) + '</div><div class="boot-subtitle">' + esc(subtitle || "") + '</div><div class="boot-loading">' + esc(footer || "") + '</div></div>';
    announce([title, subtitle, footer].filter(Boolean).join(". "));
    updateCreditDisplay();
  }
  function openSystemPanel(title, content, state) {
    if (artifact.classList.contains("open")) closeArtifact();
    currentView = "exploration"; activeCategory = null;
    window.JIHANKI_AUDIO.setState(state || "browsing");
    artifactRenderToken += 1; activeArtifact = null; lastFocusedElement = document.activeElement;
    artifactContent.innerHTML = '<div class="exploration-panel"><div class="exploration-heading"><span>JHK / ARCHIVE INTERFACE</span><h1>' +
      esc(title) + '</h1></div>' + content + '</div>';
    artifact.classList.add("open"); artifact.setAttribute("aria-hidden", "false");
    artifactClose?.focus(); announce(title + " opened.");
  }
  function openSearch(query) {
    const value = String(query || "");
    const content = '<label class="archive-search-label" for="archive-search-input">SEARCH THE MEMORY CATALOGUE</label>' +
      '<input id="archive-search-input" type="search" autocomplete="off" placeholder="A place, voice, sound, title…" value="' + esc(value) + '">' +
      '<div id="archive-search-results" class="archive-search-results">' + window.JIHANKI_DISCOVERY.renderSearchResults(value) + '</div>' +
      '<p class="exploration-footnote">Search includes titles, descriptions, dates, contributors and known locations.</p>';
    openSystemPanel("ARCHIVE SEARCH", content);
    const input = artifactContent.querySelector("#archive-search-input");
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
  function openMap(mode) { openSystemPanel("THE MEMORY MAP", window.JIHANKI_MAP.render(mode || "geography")); }
  function openArchaeology(item) {
    if (!item) return;
    openSystemPanel("MEMORY ARCHAEOLOGY", '<div class="exploration-return"><button type="button" data-panel-back="' + esc(item.id) +
      '">← RETURN TO MEMORY</button></div>' + window.JIHANKI_DISCOVERY.renderGraph(item.id));
  }
  function openSoundscape() {
    openSystemPanel("SOUND INSTALLATION", window.JIHANKI_SOUNDSCAPE.render(), "reading");
    window.JIHANKI_AUDIO.bindMedia(artifactContent);
  }
  function openMachineMemory() {
    const profile = window.JIHANKI_PERSONALITY?.profile() || { opened: 0, purchases: 0, frequentCategory: null, recent: [] };
    const recent = profile.recent.map(id => byId(id)).filter(Boolean);
    const rows = recent.map(item => '<button type="button" class="archaeology-node" data-related-id="' + esc(item.id) + '">' +
      '<span class="archaeology-node-copy"><strong>' + esc(item.title) + '</strong><small>RECENTLY VISITED</small></span></button>').join("");
    const content = '<div class="personality-grid"><div><span>MEMORY OPENINGS</span><strong>' + Number(profile.opened) + '</strong></div>' +
      '<div><span>PURCHASES</span><strong>' + Number(profile.purchases) + '</strong></div>' +
      '<div><span>FREQUENT CATEGORY</span><strong>' + esc((profile.frequentCategory || "NONE").toUpperCase()) + '</strong></div></div>' +
      '<div class="archaeology-branch-label">RECENTLY REMEMBERED / ' + recent.length + '</div>' +
      (rows || '<div class="exploration-empty">THE MACHINE HAS NOT STORED A ROUTE YET.</div>') +
      '<div class="personality-actions"><p>THIS MEMORY IS STORED ONLY IN THIS BROWSER.</p>' +
      '<button type="button" data-personality-reset>RESET MACHINE MEMORY</button></div>';
    openSystemPanel("MACHINE MEMORY", content);
  }

  function stockTag(item) {
    const status = window.JIHANKI_INVENTORY.status(item);
    return '<span class="archive-stock status-' + esc(status) + '">' + esc(window.JIHANKI_INVENTORY.label(item)) + '</span>';
  }
  function showCategory(category) {
    currentView = "category";
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
    announce(title + " archive. " + list.length + " records, " + availableCount + " available.");
    updateCreditDisplay();
  }

  function closeArtifact() {
    const wasOpen = artifact.classList.contains("open");
    artifactRenderToken += 1;
    artifact.classList.remove("open");
    artifact.setAttribute("aria-hidden", "true");
    artifactContent.querySelectorAll("audio,video").forEach(media => { try { media.pause(); } catch (_) { } });
    window.JIHANKI_AUDIO.clearMedia();
    activeArtifact = null;
    window.JIHANKI_AUDIO.setState(audioStateForView());
    if (wasOpen && lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
    lastFocusedElement = null;
    if (wasOpen) announce("Closed memory. Returned to " + currentView + ".");
  }

  function mediaMetadataMarkup(item, extension) {
    return '<div class="media-metadata"><span>ARCHIVE / ' + esc(item.date || "UNDATED") + '</span><span>FORMAT / ' +
      esc(String(extension || "UNKNOWN").toUpperCase()) + '</span><span>DURATION / <b data-media-duration>WAITING FOR METADATA</b></span></div>' +
      '<div class="media-load-status" role="status" aria-live="polite"></div>';
  }
  function bindMediaMetadata(body) {
    const media = body.querySelector("audio,video"); if (!media) return;
    media.addEventListener("loadedmetadata", () => {
      const status = body.querySelector(".media-load-status");
      if (status) status.textContent = "";
      const target = body.querySelector("[data-media-duration]");
      if (target) {
        const seconds = Number(media.duration);
        if (Number.isFinite(seconds)) {
          const whole = Math.floor(seconds), minutes = Math.floor(whole / 60), remainder = whole % 60;
          target.textContent = minutes + ":" + String(remainder).padStart(2, "0");
        } else target.textContent = "LIVE / UNKNOWN";
      }
    });
    media.addEventListener("error", () => {
      const status = body.querySelector(".media-load-status");
      if (status) status.innerHTML = 'MEDIA COULD NOT BE LOADED. <button type="button" data-media-retry>RETRY</button>';
    });
  }

  async function renderBody(item, renderToken) {
    const body = document.getElementById("artifact-body");
    if (!body) return;
    const type = String(item.type || item.category || "").toLowerCase();
    const file = item.file || "";
    const extension = file.split("?")[0].split(".").pop().toLowerCase();
    const title = esc(item.title || "UNTITLED");
    if (item.type === "voicebank" || item.machineCategory === "utau" && item.image) {
      const image = item.image ? '<figure class="voicebank-image"><img class="artifact-media" src="' + esc(item.image) + '" alt="' + title + '" loading="eager" decoding="async"><figcaption class="artifact-media-status" aria-live="polite"></figcaption></figure>' : "";
      const link = item.url ? '<p><a class="markdown-link" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">OPEN VOICEBANK RELEASE ↗</a></p>' : "";
      body.innerHTML = image + '<p class="voicebank-subtitle">' + esc(item.subtitle || "") + '</p><p class="voicebank-context">' + esc(item.context || "") + '</p><div class="artifact-text">' + esc(item.description || "") + '</div>' + link;
      const portrait = body.querySelector(".voicebank-image img");
      if (portrait) {
        portrait.addEventListener("error", () => {
          const status = body.querySelector(".voicebank-image .artifact-media-status");
          if (status) status.innerHTML = '<span>IMAGE COULD NOT BE LOADED.</span> <button type="button" data-media-retry>RETRY</button>';
        });
        portrait.addEventListener("load", () => {
          const status = body.querySelector(".voicebank-image .artifact-media-status");
          if (status) status.textContent = "";
        });
      }
      return;
    }
    const coverHTML = item.image && (type === "project" || type === "audio") ?
      '<figure class="project-cover-frame"><img class="project-cover artifact-media" src="' + esc(item.image) + '" alt="' + title + '" loading="lazy" decoding="async"><figcaption class="artifact-media-status" aria-live="polite"></figcaption></figure>' : "";
    if (type === "video" || /^(mp4|webm|mov)$/.test(extension)) {
      body.innerHTML = (window.JIHANKI_VIDEO ? window.JIHANKI_VIDEO.render(item) :
        '<video class="artifact-video" controls playsinline preload="metadata" src="' + esc(file) + '"></video>') +
        mediaMetadataMarkup(item, extension);
      bindMediaMetadata(body); window.JIHANKI_AUDIO.bindMedia(body); return;
    }
    if (type === "audio" || type === "music" || type === "sound" || /^(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(extension)) {
      body.innerHTML = '<audio class="artifact-audio" controls playsinline preload="metadata" src="' + esc(file) + '"></audio>' +
        mediaMetadataMarkup(item, extension);
      bindMediaMetadata(body); window.JIHANKI_AUDIO.bindMedia(body); return;
    }
    if (type === "image" || type === "photo" || /^(png|jpe?g|webp|gif)$/.test(extension)) {
      body.innerHTML = '<figure class="artifact-photo"><img class="artifact-media" src="' + esc(file) + '" alt="' + title + '" loading="eager" decoding="async">' +
        (item.description ? '<figcaption class="artifact-caption">' + esc(item.description) + '</figcaption>' : '') +
        '<figcaption class="artifact-media-status" aria-live="polite"></figcaption></figure>';
      const photo = body.querySelector("img");
      photo.addEventListener("error", () => {
        const status = body.querySelector(".artifact-media-status");
        if (status) status.innerHTML = '<span>IMAGE COULD NOT BE LOADED.</span> <button type="button" data-media-retry>RETRY</button>';
      });
      photo.addEventListener("load", () => {
        const status = body.querySelector(".artifact-media-status");
        if (status) status.textContent = "";
      });
      return;
    }
    if (file) {
      try {
        const response = await fetch(file, { cache: "no-cache" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const markdown = await response.text();
        if (renderToken !== artifactRenderToken || !artifact.classList.contains("open")) return;
        const base = new URL("./", new URL(file, location.href)).href;
        body.innerHTML = coverHTML + '<div class="artifact-text markdown-rendered">' + window.JIHANKI_MARKDOWN.render(markdown, base) + '</div>';
        const cover = body.querySelector(".project-cover");
        if (cover) {
          const status = body.querySelector(".project-cover-frame .artifact-media-status");
          cover.addEventListener("error", () => {
            if (status) status.innerHTML = '<span>IMAGE COULD NOT BE LOADED.</span> <button type="button" data-media-retry>RETRY</button>';
          });
          cover.addEventListener("load", () => { if (status) status.textContent = ""; });
        }
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
    const links = window.JIHANKI_DISCOVERY.links(item), locations = window.JIHANKI_GEOGRAPHY.locations(item);
    let html = '<section class="artifact-relations"><span class="artifact-section-label">MEMORY ARCHAEOLOGY</span>' +
      '<button type="button" class="relation-link archaeology-open" data-explore-id="' + esc(item.id) + '">TRACE CONNECTIONS / ' + links.length + ' LINKS ↗</button>';
    if (links.length) html += links.slice(0, 5).map(link =>
      '<button type="button" class="relation-link" data-related-id="' + esc(link.item.id) + '"><small>' +
      esc(link.label || link.kind) + '</small>' + esc(link.item.title) + '</button>').join("");
    else html += '<span class="relation-empty">NO CONNECTIONS RECORDED YET</span>';
    html += '</section>';
    if (locations.length) html += '<section class="artifact-locations"><span class="artifact-section-label">LOCATION INDEX</span>' +
      locations.map(place => '<button type="button" class="location-link" data-place="' + esc(place) + '">' + esc(place) + '</button>').join("") +
      '<button type="button" class="location-link location-map-link" data-open-map="geography">OPEN MEMORY MAP ↗</button></section>';
    return html;
  }

  async function openItem(item, receipt) {
    if (!item) return;
    if (artifact.classList.contains("open")) {
      artifactContent.querySelectorAll("audio,video").forEach(media => { try { media.pause(); } catch (_) { } });
      window.JIHANKI_AUDIO.clearMedia();
    } else {
      lastFocusedElement = document.activeElement;
    }
    activeArtifact = { item, receipt: receipt || null };
    const renderToken = ++artifactRenderToken;
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
      (window.JIHANKI_COLLECTION?.objectMarkup(item.id, receipt?.code) || "") +
      '<h1 class="artifact-title">' + esc(item.title || "UNTITLED") + '</h1>' +
      '<div class="artifact-meta">' + esc(author) + ' / ' + esc(date) + ' / ' + esc(item.machineCategory || item.category || item.type || "ARCHIVE") + '</div>' +
      '<div id="artifact-body">LOADING MEMORY...</div>' +
      (unavailable ? '<div class="artifact-unavailable"><strong>' + esc(window.JIHANKI_INVENTORY.label(item)) + '</strong><br>' + esc(window.JIHANKI_INVENTORY.message(item)) + '</div>' : '') +
      renderRelations(item) +
      '<div class="artifact-feedback" role="status" aria-live="polite"></div>' +
      '<div class="artifact-actions"></div>';
    artifact.classList.add("open");
    artifact.setAttribute("aria-hidden", "false");
    updateArtifactActions();
    artifactClose?.focus();
    announce("Opened memory: " + (item.title || "Untitled") + ". " + (unavailable ? window.JIHANKI_INVENTORY.label(item) : "Credit balance " + credits) + ".");
    await renderBody(item, renderToken);
  }

  function purchase(item) {
    if (!item) return;
    if (!allItems().some(record => record.id === item.id)) {
      showMessage("MEMORY NOT IN CIRCULATION", "THIS RECORD IS PRESERVED ONLY", "TRANSACTION CANCELLED");
      window.JIHANKI_EVENTS.record("purchase-blocked", { itemId: item.id, reason: "not-in-live-catalogue" });
      return;
    }
    if (!window.JIHANKI_INVENTORY.isAvailable(item)) {
      showMessage(window.JIHANKI_INVENTORY.label(item), window.JIHANKI_INVENTORY.message(item), "MEMORY NOT DISPENSED");
      window.JIHANKI_EVENTS.record("purchase-blocked", { itemId: item.id, status: window.JIHANKI_INVENTORY.status(item) });
      return;
    }
    if (credits < 1) {
      if (artifact.classList.contains("open") && activeArtifact?.item?.id === item.id) {
        artifactFeedback("NO CREDIT — INSERT A COIN BEFORE DISPENSING");
        updateArtifactActions();
      } else {
        showMessage("NO CREDIT", "INSERT A COIN FIRST", "ONE COIN / ONE MEMORY");
      }
      window.JIHANKI_EVENTS.record("purchase-blocked", { itemId: item.id, reason: "no-credit" });
      return;
    }
    credits -= 1;
    updateCreditDisplay();
    lastDispensed = item.id;
    selectedId = item.id;
    const receipt = window.JIHANKI_RECEIPTS.create(item);
    window.JIHANKI_COLLECTION.add(item, receipt);
    window.JIHANKI_EVENTS.record("memory-dispensed", { itemId: item.id, receipt: receipt.code, creditsRemaining: credits });
    openItem(item, receipt);
  }

  function dispense() {
    // Explicitly selected catalogue items are purchased as selected.
    // The physical PICK UP button with no selection chooses a fresh random memory.
    if (selectedId && currentView !== "idle" && activeArtifact?.item?.id === selectedId) {
      const selected = allItems().find(item => String(item.id) === String(selectedId));
      if (selected) { purchase(selected); return; }
    }
    let pool = activeCategory ? window.JIHANKI_CATEGORIES.items(activeCategory) : allItems();
    pool = window.JIHANKI_INVENTORY.available(pool);
    // Avoid an immediate repeat when there is more than one available record.
    if (pool.length > 1 && lastDispensed) {
      const withoutPrevious = pool.filter(item => item.id !== lastDispensed);
      if (withoutPrevious.length) pool = withoutPrevious;
    }
    if (!pool.length) {
      const categoryItems = activeCategory ? window.JIHANKI_CATEGORIES.items(activeCategory) : allItems();
      const unavailable = categoryItems.find(item => !window.JIHANKI_INVENTORY.isAvailable(item));
      if (unavailable) showMessage(window.JIHANKI_INVENTORY.label(unavailable), window.JIHANKI_INVENTORY.message(unavailable), "SELECT ANOTHER MEMORY");
      else showMessage("SOLD OUT", "NO MEMORY IN STOCK", "PLEASE RETURN LATER");
      return;
    }
    const item = window.JIHANKI_PERSONALITY?.choose(pool, lastDispensed) || pool[Math.floor(Math.random() * pool.length)];
    purchase(item);
  }

  function showLocation(place) {
    closeArtifact();
    currentView = "location";
    activeCategory = null; selectedId = null;
    window.JIHANKI_AUDIO.setState("browsing");
    const records = window.JIHANKI_GEOGRAPHY.entries(place);
    const html = records.map((item, index) => '<button class="archive-item" type="button" data-archive-id="' + esc(item.id) + '">' +
      String(index + 1).padStart(2, "0") + '&nbsp;&nbsp;' + esc(item.title) + stockTag(item) +
      '<small>' + esc(item.date || "UNDATED") + '</small></button>').join("");
    screen.innerHTML = '<div class="archive"><div class="archive-header"><span class="archive-title">' + esc(place.toUpperCase()) + '</span><span class="archive-status">' + records.length + ' RECORDS</span></div>' +
      (records.length ? html : '<div class="archive-item">NO MEMORY RECORDED</div>') + '</div>';
    window.JIHANKI_EVENTS.record("location-opened", { place, count: records.length });
    announce(place + ". " + records.length + " associated records.");
    updateCreditDisplay();
  }

  function showRotation() {
    closeArtifact();
    currentView = "rotation";
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
    announce("Archive rotation for " + current.date + ". " + current.items.length + " current fragments and " + residue.length + " residue fragments.");
    updateCreditDisplay();
  }

  function showCollection() {
    closeArtifact(); currentView = "collection"; activeCategory = null; selectedId = null;
    window.JIHANKI_AUDIO.setState("collection");
    const records = window.JIHANKI_COLLECTION.all(), objects = window.JIHANKI_COLLECTION.objects();
    const html = records.map((record, index) => {
      const item = window.JIHANKI_COLLECTION.resolve(record) || record, object = window.JIHANKI_COLLECTION.objectFor(record.id);
      return '<button class="archive-item collection-item" type="button" data-archive-id="' + esc(item.id) + '">' +
        String(index + 1).padStart(2, "0") + '&nbsp;&nbsp;' + esc(record.title || item.title || "UNTITLED") +
        '<span class="collection-count">×' + Number(record.purchaseCount || 1) + '</span>' +
        '<small>LAST ACQUIRED / ' + esc(new Date(record.lastCollectedAt).toLocaleDateString()) + (object ? ' · OBJECT ' + esc(object.serial) : '') + '</small></button>';
    }).join("");
    const storageNote = window.JIHANKI_COLLECTION.storageAvailable() ? "STORED IN THIS BROWSER" : "SESSION ONLY / STORAGE UNAVAILABLE";
    screen.innerHTML = '<div class="archive collection-screen"><div class="archive-header"><span class="archive-title">MY COLLECTION</span><span class="archive-status">' + records.length + ' WORKS</span></div>' +
      '<div class="collection-summary">' + window.JIHANKI_COLLECTION.totalPurchases() + ' ACQUISITIONS / ' + objects.length + ' MEMORY OBJECTS / ' + esc(storageNote) + '</div>' +
      (records.length ? html : '<div class="archive-item collection-empty">NO MEMORIES COLLECTED YET</div>') +
      (objects.length ? '<div class="collection-summary">COLLECTIBLE OBJECTS / ' + objects.length + '</div>' +
        objects.map(object => '<button type="button" class="archive-item collectible-list-item" data-collectible-open="' + esc(object.id) + '">' +
          esc(object.stamp) + ' · ' + esc(object.title) + '<small>OBJECT ' + esc(object.serial) + ' / ' + esc(object.archiveDate) + '</small></button>').join("") : '') +
      '<div class="collection-actions"><button type="button" data-collection-action="export">EXPORT</button><button type="button" data-collection-action="import">IMPORT</button>' +
      '<button type="button" data-collection-action="clear">CLEAR</button><input id="collection-import-file" type="file" accept="application/json,.json" hidden></div></div>';
    window.JIHANKI_EVENTS.record("collection-opened", { works: records.length, objects: objects.length, acquisitions: window.JIHANKI_COLLECTION.totalPurchases() });
    announce("Personal collection. " + records.length + " works. " + objects.length + " collectible objects.");
    updateCreditDisplay();
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
    currentView = "service";
    closeArtifact();
    window.JIHANKI_EVENTS.record("maintenance-opened", {});
    window.JIHANKI_AUDIO.setState("service");
    window.JIHANKI_AUDIO.sfx("home");
    window.JIHANKI_MAINTENANCE.render("overview");
    announce("Internal service terminal.");
  }

  function exitMaintenance() {
    maintenanceActive = false;
    currentView = "idle";
    activeCategory = null;
    selectedId = null;
    showHome();
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
    acceptCoin("physical");
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
    const searchOpen = event.target.closest("[data-search-open]");
    if (searchOpen) { const item = byId(searchOpen.dataset.searchOpen); if (item) openItem(item); return; }
    const explore = event.target.closest("[data-explore-id]");
    if (explore) { const item = byId(explore.dataset.exploreId); if (item) openArchaeology(item); return; }
    const back = event.target.closest("[data-panel-back]");
    if (back) { const item = byId(back.dataset.panelBack); if (item) openItem(item); return; }
    const mapPlace = event.target.closest("[data-map-place]");
    if (mapPlace) { showLocation(mapPlace.dataset.mapPlace); return; }
    const mapMode = event.target.closest("[data-map-mode]");
    if (mapMode) { openMap(mapMode.dataset.mapMode); return; }
    const openMapButton = event.target.closest("[data-open-map]");
    if (openMapButton) { openMap(openMapButton.dataset.openMap); return; }
    const objectDownload = event.target.closest("[data-collectible-download]");
    if (objectDownload) { window.JIHANKI_COLLECTION.downloadObject(objectDownload.dataset.collectibleDownload); return; }
    const personalityReset = event.target.closest("[data-personality-reset]");
    if (personalityReset) {
      if (window.confirm("Reset only this browser's JIHANKI machine memory? Collection and receipts will remain unchanged.")) {
        window.JIHANKI_PERSONALITY.reset();
        openMachineMemory();
      }
      return;
    }
    const installAction = event.target.closest("[data-install-action]");
    if (installAction) {
      if (installAction.dataset.installAction === "start") window.JIHANKI_SOUNDSCAPE.start(artifactContent);
      else window.JIHANKI_SOUNDSCAPE.stop(artifactContent);
      return;
    }
    const retry = event.target.closest("[data-media-retry]");
    if (retry) {
      const failedImage = artifactContent.querySelector("#artifact-body img.artifact-media");
      const failedMedia = artifactContent.querySelector("#artifact-body audio, #artifact-body video");
      if (failedImage) {
        const base = failedImage.getAttribute("src").split(/[?#]/)[0];
        failedImage.src = base + "?retry=" + Date.now();
        const status = artifactContent.querySelector(".artifact-media-status");
        if (status) status.textContent = "RETRYING IMAGE LOAD…";
      } else if (failedMedia) {
        failedMedia.load();
        const status = artifactContent.querySelector(".media-load-status");
        if (status) status.textContent = "RETRYING MEDIA LOAD…";
      }
      return;
    }
    const target = event.target.closest("button,a");
    if (!target) return;
    if (target.dataset.action === "insert-credit-current") {
      acceptCoin("artifact");
      updateArtifactActions();
      return;
    }
    if (target.dataset.action === "purchase-current") { purchase(byId(selectedId)); return; }
    if (target.dataset.objectSource) { const item = byId(target.dataset.objectSource); if (item) openItem(item); return; }
    if (target.dataset.relatedId) { const item = byId(target.dataset.relatedId); if (item) openItem(item); return; }
    if (target.dataset.place) { showLocation(target.dataset.place); return; }
    if (target.dataset.receiptAction === "print") { window.JIHANKI_RECEIPTS.print(target.dataset.receiptId); return; }
    if (target.dataset.receiptAction === "download") { window.JIHANKI_RECEIPTS.download(target.dataset.receiptId); return; }
  });

  artifactContent.addEventListener("input", event => {
    if (event.target.id === "archive-search-input") {
      const results = artifactContent.querySelector("#archive-search-results");
      if (results) results.innerHTML = window.JIHANKI_DISCOVERY.renderSearchResults(event.target.value);
    }
    if (event.target.matches("[data-install-volume]")) window.JIHANKI_SOUNDSCAPE.setVolume(event.target);
  });

  screen.addEventListener("change", async event => {
    if (event.target.id !== "collection-import-file" || !event.target.files?.[0]) return;
    try {
      const result = await window.JIHANKI_COLLECTION.importFile(event.target.files[0]);
      showCollection();
      announce("Collection imported. " + result.records + " records and " + result.objects + " objects read.");
    } catch (error) {
      announce("Collection import failed. " + error.message);
      window.alert("JIHANKI import failed: " + error.message);
    } finally { event.target.value = ""; }
  });

  screen.addEventListener("click", event => {
    const homeAction = event.target.closest("[data-home-action]");
    if (homeAction) {
      const action = homeAction.dataset.homeAction;
      if (action === "rotation") { showRotation(); return; }
      if (action === "collection") { showCollection(); return; }
      if (action === "map") { openMap("geography"); return; }
      if (action === "search") { openSearch(); return; }
      if (action === "installation") { openSoundscape(); return; }
      if (action === "personality") { openMachineMemory(); return; }
      if (action === "audio") {
        const muted = window.JIHANKI_AUDIO.toggleMute();
        window.JIHANKI_EVENTS.record("ambient-control", { muted });
        if (maintenanceActive) window.JIHANKI_MAINTENANCE.render("ambient");
        else showHome();
        return;
      }
    }
    const collectibleOpen = event.target.closest("[data-collectible-open]");
    if (collectibleOpen) {
      const object = window.JIHANKI_COLLECTION.objects().find(entry => entry.id === collectibleOpen.dataset.collectibleOpen);
      if (object) {
        openSystemPanel("COLLECTIBLE MEMORY OBJECT",
          window.JIHANKI_COLLECTION.objectMarkup(object.archiveId, object.receiptCode) +
          '<div class="exploration-return"><button type="button" data-object-source="' + esc(object.archiveId) + '">OPEN SOURCE MEMORY ↗</button></div>');
      }
      return;
    }
    const collectionAction = event.target.closest("[data-collection-action]");
    if (collectionAction) {
      if (collectionAction.dataset.collectionAction === "export") {
        window.JIHANKI_COLLECTION.exportFile();
        showCollection();
      } else if (collectionAction.dataset.collectionAction === "import") {
        screen.querySelector("#collection-import-file")?.click();
      } else if (collectionAction.dataset.collectionAction === "clear") {
        if (window.confirm("Clear this browser's collection and collectible objects? Receipts and event history will remain unchanged.")) {
          window.JIHANKI_COLLECTION.clear(); showCollection();
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
    if (artifact.classList.contains("open") && event.key === "Tab") {
      const focusable = [...artifact.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
        .filter(node => node.getClientRects().length > 0);
      if (focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !artifact.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !artifact.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    }
    if (event.key === "Escape" && artifact.classList.contains("open")) { closeArtifact(); return; }
    if (event.key.toLowerCase() === "m" && !event.ctrlKey && !event.metaKey && !event.altKey &&
      !artifact.classList.contains("open") && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      const muted = window.JIHANKI_AUDIO.toggleMute();
      window.JIHANKI_EVENTS.record("ambient-control", { muted, source: "keyboard" });
      if (maintenanceActive) window.JIHANKI_MAINTENANCE.render("ambient");
      else if (!activeCategory) showHome();
    }
  });

  window.JIHANKI_MACHINE = {
    openItem, purchase, dispense, showCategory, showLocation, showRotation, showCollection,
    openSearch, openMap, openArchaeology, openSoundscape, openMachineMemory,
    getState() { return { credits, selectedId, activeCategory, currentView, maintenanceActive, ambient: window.JIHANKI_AUDIO.getState() }; }
  };
  window.JIHANKI_EVENTS.record("machine-booted", { items: allItems().length });
  updateCreditDisplay();
  showHome();
})();