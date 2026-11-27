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
  const interactionModel = window.JIHANKI_INTERACTION;
  let interactionState = interactionModel.createState();
  let credits = interactionState.credits, selectedId = interactionState.selectedId, activeCategory = null, lastDispensed = null;
  let maintenanceActive = false, serviceArmedUntil = 0, serviceHoldTimer = null, serviceActivated = false;
  let controlSequence = [];
  let currentView = interactionState.view;
  let activeArtifact = null;
  let lastFocusedElement = null;
  let artifactRenderToken = 0;
  let museumTab = "overview";

  function announce(message) {
    if (announcer) announcer.textContent = String(message || "");
  }
  function applyTransition(eventName, payload = {}) {
    const outcome = interactionModel.transition(interactionState, eventName, payload);
    interactionState = outcome.state;
    credits = interactionState.credits;
    selectedId = interactionState.selectedId;
    currentView = interactionState.view;
    if (!outcome.accepted) {
      window.JIHANKI_EVENTS?.record("machine-transition-rejected", {
        event: eventName, reason: outcome.reason, view: currentView,
        overlay: interactionState.overlay
      });
    }
    return outcome;
  }
  function transactionConfirmationMarkup() {
    const transaction = interactionState.transaction;
    if (!transaction?.receiptCode || !["dispensed", "receipt-download-started", "print-dialog-opened"].includes(transaction.status)) return "";
    const label = transaction.status === "receipt-download-started" ? "RECEIPT DOWNLOAD STARTED" :
      transaction.status === "print-dialog-opened" ? "PRINT DIALOG OPENED" : "MEMORY DISPENSED / RECEIPT CREATED";
    return '<div class="transaction-confirmation" role="status" aria-live="polite" data-transaction-confirmation>' +
      label + ' / ' + esc(transaction.receiptCode) + '</div>';
  }
  function refreshTransactionConfirmation() {
    const target = artifactContent.querySelector("[data-transaction-confirmation]");
    if (!target) return;
    const transaction = interactionState.transaction;
    target.textContent = (transaction.status === "receipt-download-started" ? "RECEIPT DOWNLOAD STARTED" :
      transaction.status === "print-dialog-opened" ? "PRINT DIALOG OPENED" : "MEMORY DISPENSED / RECEIPT CREATED") +
      " / " + transaction.receiptCode;
  }
  function updateCreditDisplay() {
    if (creditDisplay) {
      const tokens = Array.from({length:credits}, (_,index) => {
        const size = Math.max(4.5,12-index*0.8);
        return '<i class="credit-token" data-credit-token aria-hidden="true" style="--token-size:'+size+'px"></i>';
      }).join("");
      creditDisplay.innerHTML = '<span class="credit-token-stack" aria-hidden="true">'+tokens+'</span>' +
        '<span class="credit-count">CREDITS / '+credits+'</span>';
      creditDisplay.setAttribute("aria-label","Credits / "+credits);
    }
    const balance = artifactContent.querySelector(".artifact-credit-status");
    if (balance) balance.textContent = "CREDIT BALANCE / " + credits;
  }
  function audioStateForView() {
    if (maintenanceActive || currentView === "service") return "service";
    return ({ category: "browsing", location: "browsing", rotation: "rotation", collection: "collection", museum: "collection", exploration: "browsing", temporal: "idle" })[currentView] || "idle";
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
    const kept = window.JIHANKI_MUSEUM?.isKept(item.id) || false;
    const shelves = window.JIHANKI_MUSEUM?.shelves() || [];
    const museumTools = window.JIHANKI_MUSEUM
      ? '<div class="museum-artifact-tools"><button type="button" data-museum-keep>' + (kept ? "REMOVE FROM MY MUSEUM" : "KEEP IN MY MUSEUM") + '</button>' +
        '<label class="museum-shelf-picker">ADD TO SHELF <select data-museum-shelf><option value="">SELECT SHELF</option>' +
        shelves.map(shelf => '<option value="' + esc(shelf.id) + '">' + esc(shelf.name) + '</option>').join("") +
        '</select></label><button type="button" data-museum-add-shelf ' + (shelves.length ? "" : "disabled") + '>ADD</button></div>' : "";
    const returnToMuseum = currentView === "museum" ? '<button type="button" data-return-museum>← RETURN TO MY MUSEUM</button>' : "";
    actions.innerHTML = '<span class="artifact-credit-status">CREDIT BALANCE / ' + credits + '</span>' + transaction + dossier + museumTools + returnToMuseum;
  }
  function artifactFeedback(message) {
    let feedback = artifactContent.querySelector(".artifact-feedback");
    if (!feedback && artifact.classList.contains("open")) {
      feedback = document.createElement("div");
      feedback.className = "artifact-feedback";
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
      artifactContent.appendChild(feedback);
    }
    if (feedback) feedback.textContent = String(message || "");
    if (message) announce(message);
  }
  function showInteractionFeedback(title, subtitle, footer) {
    if (artifact.classList.contains("open")) {
      artifactFeedback([title, subtitle, footer].filter(Boolean).join(" — "));
      updateArtifactActions();
      return;
    }
    showMessage(title, subtitle, footer);
  }
  function acceptCoin(source) {
    window.JIHANKI_AUDIO.start();
    window.JIHANKI_AUDIO.sfx("coin");
    const feedbackInArtifact = source === "artifact" || artifact.classList.contains("open");
    if (credits >= interactionModel.LIMITS.credits) {
      applyTransition("INSERT_CREDIT", { source: source || "physical" });
      if (feedbackInArtifact) artifactFeedback("CREDIT LIMIT REACHED — DISPENSE A MEMORY FIRST");
      else showMessage("CREDIT LIMIT", "MAXIMUM 9 CREDITS", "DISPENSE A MEMORY FIRST");
      updateArtifactActions();
      window.JIHANKI_EVENTS.record("coin-rejected", { credits, reason: "credit-limit", source: source || "physical" });
      return false;
    }
    recordSequence("COIN");
    const credit = applyTransition("INSERT_CREDIT", { source: source || "physical" });
    if (!credit.accepted) return false;
    updateCreditDisplay();
    window.JIHANKI_AUDIO.setState("dispensing", 850);
    if (Date.now() < serviceArmedUntil) {
      if (feedbackInArtifact) artifactFeedback("SERVICE SEQUENCE READY — HOLD MEMORY / PICK UP");
      else showMessage("SERVICE SEQUENCE READY", "HOLD MEMORY / PICK UP", "INTERNAL SERVICE");
    } else if (feedbackInArtifact) {
      artifactFeedback("COIN ACCEPTED — " + credits + " CREDIT" + (credits === 1 ? "" : "S") + " AVAILABLE");
      updateArtifactActions();
    } else {
      showMessage("COIN ACCEPTED", credits + " CREDIT" + (credits === 1 ? "" : "S"), "PICK UP TO DISPENSE A MEMORY");
    }
    window.JIHANKI_EVENTS.record("coin-accepted", { credits, source: source || "physical" });
    if (!feedbackInArtifact && source !== "artifact" && window.JIHANKI_ANOMALIES.maybe("coin")) return true;
    return false;
  }

  function resizeJihanki() {
    const width = Math.max(1, document.documentElement.clientWidth || window.innerWidth || 429);
    const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 932);
    const narrowPhone = width <= 560;
    const shortLandscape = width > height && height < 620;
    const widthScale = Math.min(width / 429, 1);
    const fitScale = Math.min(width / 429, height / 932, 1);
    const scrollable = (narrowPhone || shortLandscape) && (932 * widthScale + 24 > height);
    const scale = scrollable ? widthScale : fitScale;
    document.documentElement.classList.toggle("machine-scroll", scrollable);
    document.body.classList.toggle("compact-canvas", scrollable);
    document.documentElement.style.setProperty("--scale", String(scale));
    const viewport = document.getElementById("viewport");
    if (scrollable) {
      viewport.style.position = "absolute";
      viewport.style.top = "12px";
      viewport.style.transform = "translateX(-50%) scale(" + scale + ")";
      viewport.style.transformOrigin = "top center";
      document.body.style.minHeight = Math.ceil(932 * scale + 24) + "px";
    } else {
      viewport.style.position = "";
      viewport.style.top = "";
      viewport.style.transform = "";
      viewport.style.transformOrigin = "";
      document.body.style.minHeight = "";
    }
  }
  window.addEventListener("resize", resizeJihanki);
  window.addEventListener("orientationchange", resizeJihanki);
  window.visualViewport?.addEventListener("resize", resizeJihanki);
  resizeJihanki();

  function showHome() {
    applyTransition("NAVIGATE_HOME");
    window.JIHANKI_AUDIO.setState("idle");
    updateCreditDisplay();
    const collectionCount = window.JIHANKI_COLLECTION.count();
    const rotation = window.JIHANKI_ROTATION.current();
    const muteLabel = window.JIHANKI_AUDIO.isMuted() ? "AMBIENCE / OFF" : "AMBIENCE / ON";
    const machineLine = window.JIHANKI_PERSONALITY?.homeLine() || "SELECT A MEMORY";
    screen.innerHTML = '<div class="boot home-boot"><div class="boot-japanese">自販機</div><div class="boot-title">JIHANKI</div><div class="boot-subtitle">MEMORY ARCHIVE</div><div class="boot-loading">' + esc(machineLine) + '</div>' +
      '<div class="home-primary"><button type="button" data-home-action="installation">ENTER SOUND LAB ↗</button>' +
        '<small>BUILD AN INSTALLATION FROM ARCHIVE SOUND</small></div>' +
      '<div class="home-actions">' +
        '<button type="button" data-home-action="collection">COLLECTION / ' + collectionCount + '</button>' +
        '<button type="button" data-home-action="map">MEMORY MAP</button>' +
        '<button type="button" data-home-action="search">SEARCH</button></div>' +
      '<div class="home-archive-tools"><span>ARCHIVE</span>' +
        '<button type="button" data-home-action="rotation">ROTATION / ' + rotation.items.length + '</button>' +
        '<button type="button" data-home-action="temporal">CHRONOLOGY</button></div>' +
      '<button type="button" class="home-audio" data-home-action="audio">' + muteLabel + '</button></div>';
    announce("JIHANKI home. Sound Lab, collection, memory map, search and archive chronology. " + collectionCount + " collected works. " + machineLine);
  }
  function showMessage(title, subtitle, footer) {
    screen.innerHTML = '<div class="boot"><div class="boot-title">' + esc(title) + '</div><div class="boot-subtitle">' + esc(subtitle || "") + '</div><div class="boot-loading">' + esc(footer || "") + '</div></div>';
    announce([title, subtitle, footer].filter(Boolean).join(". "));
    updateCreditDisplay();
  }
  function openSystemPanel(title, content, state, view) {
    if (artifact.classList.contains("open")) closeArtifact();
    applyTransition("OPEN_PANEL", { view: view || "exploration" });
    activeCategory = null;
    window.JIHANKI_AUDIO.setState(state || "browsing");
    artifactRenderToken += 1; activeArtifact = null; lastFocusedElement = document.activeElement;
    artifactContent.innerHTML = '<div class="exploration-panel"><div class="exploration-heading"><span>JHK / ARCHIVE INTERFACE</span><h1>' +
      esc(title) + '</h1></div>' + content + '</div>';
    artifactContent.querySelectorAll("img").forEach(bindImageFallback);
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
  function openMap(mode) { openSystemPanel("記憶の地図", window.JIHANKI_MAP.render(mode || "geography")); window.JIHANKI_MAP.bind(artifactContent); }
  function openArchaeology(item) {
    if (!item) return;
    openSystemPanel("MEMORY ARCHAEOLOGY", '<div class="exploration-return"><button type="button" data-panel-back="' + esc(item.id) +
      '">← RETURN TO MEMORY</button></div>' + window.JIHANKI_DISCOVERY.renderGraph(item.id));
  }
  function openSoundscape() {
    openSystemPanel("SOUND INSTALLATION", window.JIHANKI_SOUNDSCAPE.render(), "reading");
    window.JIHANKI_SOUNDSCAPE.bind(artifactContent);
    window.JIHANKI_AUDIO.bindMedia(artifactContent);
  }
  function openTemporalArchive() {
    if (!window.JIHANKI_TEMPORAL) return;
    openSystemPanel("CHRONOLOGY / 2026", window.JIHANKI_TEMPORAL.render(), "idle", "temporal");
  }

  function stockTag(item) {
    const status = window.JIHANKI_INVENTORY.status(item);
    return '<span class="archive-stock status-' + esc(status) + '">' + esc(window.JIHANKI_INVENTORY.label(item)) + '</span>';
  }
  function showCategory(category) {
    applyTransition("BROWSE_CATEGORY");
    window.JIHANKI_AUDIO.setState("browsing");
    activeCategory = category === "text-index" ? "notes" : category;
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
    if (artifactContent.querySelector(".sound-installation")) {
      window.JIHANKI_SOUNDSCAPE.dispose(artifactContent);
    }
    artifactContent.querySelectorAll("audio,video").forEach(media => { try { media.pause(); } catch (_) { } });
    window.JIHANKI_AUDIO.clearMedia();
    activeArtifact = null;
    if (wasOpen) applyTransition("CLOSE_OVERLAY");
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

  function bindImageFallback(image) {
    if (!image || image.dataset.imageFallbackBound === "1") return;
    image.dataset.imageFallbackBound = "1";
    const original = image.dataset.originalSrc || image.getAttribute("src") || "";
    image.dataset.originalSrc = original;
    const host = image.closest("figure, .markdown-image-frame, .temporal-record-media");
    let status = host?.querySelector(".artifact-media-status");
    if (!status && host) {
      status = document.createElement("span");
      status.className = "artifact-media-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      host.append(status);
    }
    if (status && host?.classList.contains("temporal-record-media")) {
      status.classList.add("temporal-image-status");
    }
    image.addEventListener("error", () => {
      if (!image.dataset.placeholderTried && !/\/assets\/placeholder\.png(?:[?#]|$)/.test(original)) {
        image.dataset.placeholderTried = "1";
        if (status) status.textContent = "IMAGE UNAVAILABLE / SHOWING ARCHIVE PLACEHOLDER";
        image.src = new URL("assets/placeholder.png", document.baseURI).href;
      } else if (status) {
        status.textContent = "IMAGE AND PLACEHOLDER UNAVAILABLE";
        // Chronology thumbnails are inside their archive-opening button; do not create nested controls.
        if (!image.closest("button") && !status.querySelector("[data-media-retry]")) {
          const retry = document.createElement("button");
          retry.type = "button";
          retry.dataset.mediaRetry = "";
          retry.textContent = "RETRY ORIGINAL";
          status.append(" ", retry);
        }
      }
    });
    image.addEventListener("load", () => {
      if (status && !image.dataset.placeholderTried) status.textContent = "";
    });
  }

  const machineImage = document.getElementById("machine-image");
  if (machineImage) bindImageFallback(machineImage);

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
      bindImageFallback(body.querySelector(".voicebank-image img"));
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
      bindImageFallback(body.querySelector("img"));
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
        body.querySelectorAll("img").forEach(bindImageFallback);
        window.JIHANKI_AUDIO.bindMedia(body);
        return;
      } catch (error) {
        if (renderToken !== artifactRenderToken || !artifact.classList.contains("open")) return;
        body.innerHTML = '<div class="artifact-text"><strong>MEMORY COULD NOT BE READ.</strong><br><br>' + esc(file) + '<br>' + esc(error.message) + '</div>';
        return;
      }
    }
    body.textContent = item.description || item.text || "NO DATA";
  }

  function renderRelations(item) {
    const links = window.JIHANKI_DISCOVERY.links(item), locations = window.JIHANKI_GEOGRAPHY.locations(item);
    const relationClass = kind => "relation-kind-" + String(kind || "related-record").replace(/[^a-z0-9-]/gi, "-");
    let html = '<section class="artifact-relations"><span class="artifact-section-label">CURATED RECORD RELATIONSHIPS</span>' +
      '<button type="button" class="relation-link archaeology-open" data-explore-id="' + esc(item.id) + '">TRACE CONNECTIONS / ' + links.length + ' LINKS ↗</button>';
    if (links.length) html += links.slice(0, 8).map(link =>
      '<button type="button" class="relation-link ' + relationClass(link.kind) + '" data-related-id="' + esc(link.item.id) + '"><small>' +
      esc(link.label || link.kind) + '</small>' + esc(link.item.title) + '</button>').join("");
    else html += '<span class="relation-empty">NO CURATED RECORD CONNECTIONS YET</span>';
    html += '</section>';
    const placeLinks = window.JIHANKI_RELATIONSHIPS?.placeLinksFor(item) || [];
    if (placeLinks.length) html += '<section class="artifact-relations artifact-geographic-relations"><span class="artifact-section-label">GEOGRAPHIC RELATIONSHIPS / NOT SHARED PHOTO LINKS</span>' +
      placeLinks.slice(0, 8).map(edge => '<div class="relation-place-edge"><small>' + esc(edge.label || edge.kind) + ' / ' + esc(edge.kind) + '</small><strong>' +
      esc(edge.from) + '</strong><span>→</span><strong>' + esc(edge.to) + '</strong></div>').join("") +
      '<button type="button" class="location-link location-map-link" data-open-map="memory">OPEN GEOGRAPHIC RELATIONS ↗</button></section>';
    if (locations.length) html += '<section class="artifact-locations"><span class="artifact-section-label">LOCATION INDEX</span>' +
      locations.map(place => '<button type="button" class="location-link" data-place="' + esc(place) + '">' + esc(place) + '</button>').join("") +
      '<button type="button" class="location-link location-map-link" data-open-map="geography">OPEN PLACE MAP ↗</button></section>';
    return html;
  }

  async function openItem(item, receipt) {
    if (!item) return;
    const stateChange = applyTransition("OPEN_RECORD", { itemId: item.id });
    if (!stateChange.accepted) return;
    if (artifact.classList.contains("open")) {
      artifactContent.querySelectorAll("audio,video").forEach(media => { try { media.pause(); } catch (_) { } });
      window.JIHANKI_AUDIO.clearMedia();
    } else {
      lastFocusedElement = document.activeElement;
    }
    activeArtifact = { item, receipt: receipt || null };
    const renderToken = ++artifactRenderToken;
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
      (receipt ? transactionConfirmationMarkup() : "") +
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
    if (!item) return false;
    const live = allItems().some(record => String(record.id) === String(item.id));
    const stockStatus = window.JIHANKI_INVENTORY.status(item);
    const available = live && window.JIHANKI_INVENTORY.isAvailable(item);
    const outcome = applyTransition("PURCHASE_ATTEMPT", {
      itemId: item.id, live, available, stockStatus, source: "purchase"
    });
    if (!outcome.accepted) {
      if (outcome.reason === "no-credit") {
        if (artifact.classList.contains("open")) {
          artifactFeedback("NO CREDIT — INSERT A COIN BEFORE DISPENSING");
          updateArtifactActions();
        } else showMessage("NO CREDIT", "INSERT A COIN FIRST", "ONE COIN / ONE MEMORY");
      } else if (outcome.reason === "transaction-busy") {
        showInteractionFeedback("TRANSACTION IN PROGRESS", "PLEASE WAIT FOR THE CURRENT MEMORY", "NO CREDIT WAS TAKEN");
      } else if (outcome.reason === "not-in-live-catalogue") {
        showInteractionFeedback("MEMORY NOT IN CIRCULATION", "THIS RECORD IS PRESERVED ONLY", "TRANSACTION CANCELLED");
      } else {
        showInteractionFeedback(window.JIHANKI_INVENTORY.label(item), window.JIHANKI_INVENTORY.message(item), "MEMORY NOT DISPENSED");
      }
      window.JIHANKI_EVENTS.record("purchase-blocked", {
        itemId: item.id, reason: outcome.reason, status: stockStatus, creditsRemaining: credits
      });
      return false;
    }
    updateCreditDisplay();
    lastDispensed = item.id;
    try {
      const receipt = window.JIHANKI_RECEIPTS.create(item);
      window.JIHANKI_COLLECTION.add(item, receipt);
      const completed = applyTransition("PURCHASE_COMPLETE", { itemId: item.id, receiptCode: receipt.code });
      if (!completed.accepted) throw new Error("Transaction state could not be completed: " + completed.reason);
      window.JIHANKI_EVENTS.record("memory-dispensed", {
        itemId: item.id, receipt: receipt.code, creditsRemaining: credits
      });
      openItem(item, receipt);
      return true;
    } catch (error) {
      const recovered = applyTransition("PURCHASE_ABORT", { itemId: item.id, reason: "purchase-commit-failed" });
      if (recovered.accepted) updateCreditDisplay();
      window.JIHANKI_EVENTS.record("purchase-failed", {
        itemId: item.id, reason: String(error?.message || error), creditsRemaining: credits, refunded: recovered.accepted
      });
      showInteractionFeedback("TRANSACTION COULD NOT COMPLETE", "YOUR CREDIT HAS BEEN RETURNED", "PLEASE TRY AGAIN");
      return false;
    }
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
      if (unavailable) showInteractionFeedback(window.JIHANKI_INVENTORY.label(unavailable), window.JIHANKI_INVENTORY.message(unavailable), "SELECT ANOTHER MEMORY");
      else showInteractionFeedback("SOLD OUT", "NO MEMORY IN STOCK", "PLEASE RETURN LATER");
      return;
    }
    const item = window.JIHANKI_PERSONALITY?.choose(pool, lastDispensed) || pool[Math.floor(Math.random() * pool.length)];
    purchase(item);
  }

  function showLocation(place) {
    closeArtifact();
    applyTransition("SHOW_LOCATION");
    activeCategory = null;
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
    applyTransition("SHOW_ROTATION");
    activeCategory = null;
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

  function museumWorkMarkup(query, category, sort) {
    const needle=String(query||"").trim().toLowerCase();
    let records=window.JIHANKI_COLLECTION.all().map(record=>({record,item:window.JIHANKI_COLLECTION.resolve(record)||record}));
    if(category&&category!=="all")records=records.filter(entry=>String(entry.item.machineCategory||entry.item.category||entry.item.type||"archive").toLowerCase()===category);
    if(needle)records=records.filter(entry=>[entry.item.title,entry.item.author,entry.item.date,entry.item.group,entry.item.category].join(" ").toLowerCase().includes(needle));
    if(sort==="title")records.sort((a,b)=>String(a.item.title).localeCompare(String(b.item.title)));
    else if(sort==="oldest")records.sort((a,b)=>String(a.record.firstCollectedAt||"").localeCompare(String(b.record.firstCollectedAt||"")));
    else if(sort==="most")records.sort((a,b)=>Number(b.record.purchaseCount||0)-Number(a.record.purchaseCount||0));
    return records.map((entry,index)=>{
      const object=window.JIHANKI_COLLECTION.objectFor(entry.record.id),item=entry.item;
      return '<button class="archive-item museum-record" type="button" data-museum-open="'+esc(item.id)+'"><span class="museum-record-number">'+
        String(index+1).padStart(2,"0")+'</span><span class="museum-record-title">'+esc(item.title||"UNTITLED")+'</span>'+
        '<span class="collection-count">×'+Number(entry.record.purchaseCount||1)+'</span><small>'+esc(item.date||"UNDATED")+' / '+
        esc(item.machineCategory||item.category||item.type||"ARCHIVE")+(object?' / OBJECT '+esc(object.serial):"")+'</small></button>';
    }).join("")||'<div class="collection-empty museum-empty">NO WORKS MATCH THIS VIEW.</div>';
  }

  function museumTabMarkup(tab) {
    const tabs=[["overview","OVERVIEW"],["works","WORKS"],["objects","OBJECTS"],["kept","SAVED"],["trail","VISIT TRAIL"],["shelves","SHELVES"],["care","CARE"]];
    return '<nav class="museum-tabs" aria-label="Personal museum sections">'+tabs.map(([id,label])=>
      '<button type="button" data-museum-tab="'+id+'" aria-pressed="'+(tab===id?"true":"false")+'">'+label+'</button>').join("")+'</nav>';
  }

  function museumRender(tab) {
    const museum=window.JIHANKI_MUSEUM,records=window.JIHANKI_COLLECTION.all(),objects=window.JIHANKI_COLLECTION.objects(),stats=museum.stats();
    const storage=museum.storageAvailable?"LOCAL / SAVED IN THIS BROWSER":"SESSION ONLY / STORAGE UNAVAILABLE";
    let content="";
    if(tab==="overview"){
      const trailCount=museum.trail().length;
      content='<div class="museum-intro"><span>JHK / YOUR PRIVATE COLLECTION</span><p>Works you have dispensed, fragments you have chosen to save, collectible objects and a single visit trail. Everything stays in this browser.</p></div>'+
        '<div class="museum-stats"><div><span>COLLECTED WORKS</span><strong>'+records.length+'</strong></div><div><span>OBJECTS</span><strong>'+objects.length+
        '</strong></div><div><span>SAVED</span><strong>'+stats.kept+'</strong></div><div><span>VISITS</span><strong>'+stats.visits+'</strong></div></div>'+
        '<section class="museum-trail-preview"><div><span>YOUR VISIT TRAIL</span><strong>'+trailCount+' RECORDED FRAGMENTS</strong></div>'+
        '<p>A chronological list of the memories you have opened. This is the only visit-history view; the separate Machine Memory screen has been removed.</p>'+
        '<button type="button" data-museum-tab="trail">OPEN VISIT TRAIL ↗</button></section>'+
        '<div class="museum-storage-note">'+storage+' / NOTHING IS SENT TO A SERVER.</div>';
    } else if(tab==="works"){
      const pref=museum.preferences(),categories=[...new Set(records.map(record=>String(record.category||"archive").toLowerCase()))].sort();
      content='<div class="museum-toolbar"><label>FIND A WORK<input id="museum-search" type="search" placeholder="Title, artist, year…" autocomplete="off"></label>'+
        '<label>CATEGORY<select id="museum-category"><option value="all">ALL CATEGORIES</option>'+categories.map(value=>
        '<option value="'+esc(value)+'" '+(pref.category===value?"selected":"")+'>'+esc(value.toUpperCase())+'</option>').join("")+'</select></label>'+
        '<label>ORDER<select id="museum-sort"><option value="recent" '+(pref.sort==="recent"?"selected":"")+'>RECENT</option>'+
        '<option value="title" '+(pref.sort==="title"?"selected":"")+'>TITLE</option><option value="oldest" '+(pref.sort==="oldest"?"selected":"")+'>FIRST ACQUIRED</option>'+
        '<option value="most" '+(pref.sort==="most"?"selected":"")+'>MOST ACQUIRED</option></select></label></div>'+
        '<div id="museum-work-list" class="museum-list">'+museumWorkMarkup("",pref.category,pref.sort)+'</div>';
    } else if(tab==="objects"){
      content=objects.length?'<div class="museum-section-heading">SERIALIZED MEMORY OBJECTS / '+objects.length+'</div>'+
        objects.map(object=>'<button type="button" class="museum-object-row" data-museum-object="'+esc(object.id)+'"><span class="museum-object-stamp">'+
        esc(object.stamp)+'</span><strong>'+esc(object.title)+'</strong><small>NO. '+esc(object.serial)+' / '+esc(object.archiveDate)+'</small></button>').join("")+
        '<div class="museum-storage-note">EACH OBJECT HAS ITS OWN RECEIPT REFERENCE AND CAN BE SAVED IN ITS SOURCE VIEW.</div>':
        '<div class="collection-empty">NO OBJECTS HAVE BEEN COLLECTED YET.</div>';
    } else if(tab==="kept"){
      const kept=museum.keptIds().map(id=>byId(id)).filter(Boolean);
      content='<div class="museum-section-heading">WORKS YOU CHOSE TO KEEP / '+kept.length+'</div>'+
        (kept.length?kept.map((item,index)=>'<button type="button" class="museum-row" data-museum-open="'+esc(item.id)+'"><span>'+
        String(index+1).padStart(2,"0")+' / '+esc(item.title)+'</span><small>'+esc(item.date||"UNDATED")+'</small></button>').join("")+
        '<div class="museum-storage-note">KEPT WORKS ARE SEPARATE FROM PURCHASES. YOU CAN KEEP AN ENTRY WITHOUT DISPENSING IT.</div>':
        '<div class="collection-empty">KEEP A WORK FROM ITS MEMORY VIEW TO PLACE IT HERE.</div>');
    } else if(tab==="trail"){
      const trail=museum.trail().slice(-100).reverse();
      content='<div class="museum-section-heading">RECENT VISIT TRAIL / '+trail.length+'</div>'+
        (trail.length?trail.map((entry,index)=>'<button type="button" class="museum-row" data-museum-open="'+esc(entry.id)+'"><span>'+
        String(index+1).padStart(2,"0")+' / '+esc(entry.title)+'</span><small>'+esc(entry.category||"ARCHIVE")+' / '+esc(new Date(entry.visitedAt).toLocaleString())+'</small></button>').join("") :
        '<div class="collection-empty">YOUR VISIT TRAIL IS EMPTY.</div>')+
        '<div class="museum-actions"><button type="button" data-museum-care="clear-trail">CLEAR VISIT TRAIL</button></div>';
    } else if(tab==="shelves"){
      const shelves=museum.shelves();
      content='<div class="museum-create-shelf"><label for="museum-shelf-name">NEW SHELF</label><div><input id="museum-shelf-name" maxlength="36" placeholder="A name for this collection">'+
        '<button type="button" data-museum-create-shelf>CREATE</button></div></div>'+
        (shelves.length?shelves.map(shelf=>{
          const items=shelf.itemIds.map(id=>byId(id)).filter(Boolean);
          return '<section class="museum-shelf"><header><div><strong>'+esc(shelf.name)+'</strong><small>'+items.length+' WORKS</small></div>'+
            '<button type="button" data-museum-delete-shelf="'+esc(shelf.id)+'" aria-label="Delete shelf '+esc(shelf.name)+'">×</button></header>'+
            (items.length?items.map(item=>'<div class="museum-shelf-item"><button type="button" data-museum-open="'+esc(item.id)+'">'+esc(item.title)+'</button>'+
              '<button type="button" data-museum-remove-shelf-item="'+esc(shelf.id)+'" data-museum-remove-id="'+esc(item.id)+'" aria-label="Remove '+esc(item.title)+' from shelf">−</button></div>').join("") :
              '<p class="museum-shelf-empty">EMPTY SHELF / ADD WORKS FROM THEIR MEMORY VIEW</p>')+'</section>';
        }).join(""):'<div class="collection-empty">CREATE A SHELF TO BUILD YOUR OWN EXHIBITION.</div>');
    } else {
      content='<div class="museum-care-section"><h2>BACKUP / RESTORE</h2><p>Export the private museum data separately from purchase records. Import merges the backup without deleting current data.</p>'+
        '<button type="button" data-museum-care="export">EXPORT MY MUSEUM</button><button type="button" data-museum-care="import">IMPORT MY MUSEUM</button>'+
        '<input id="museum-import-file" type="file" accept="application/json,.json" hidden></div>'+
        '<div class="museum-care-section"><h2>COLLECTION DATA</h2><p>Works and serialized objects are a separate data domain. Receipts remain untouched.</p>'+
        '<button type="button" data-museum-care="export-collection">EXPORT WORKS + OBJECTS</button><button type="button" data-museum-care="import-collection">IMPORT WORKS + OBJECTS</button>'+
        '<input id="collection-import-file" type="file" accept="application/json,.json" hidden></div>'+
        '<div class="museum-care-section"><h2>RESET / CLEAR</h2><p>Each action below affects only the named local data. Purchase receipts and the public archive are not cleared.</p>'+
        '<button type="button" data-museum-care="clear-kept">CLEAR KEPT WORKS</button><button type="button" data-museum-care="clear-shelves">CLEAR SHELVES</button>'+
        '<button type="button" data-museum-care="clear-trail">CLEAR VISIT TRAIL</button><button type="button" data-museum-care="clear-collection">CLEAR WORKS + OBJECTS</button>'+
        '<button type="button" data-museum-care="reset-personality">RESET MACHINE PERSONALITY</button><button type="button" data-museum-care="reset-preferences">RESET MUSEUM VIEW</button></div>'+
        '<div class="museum-storage-note">MUTE PREFERENCE / RECEIPTS / MACHINE PERSONALITY / MUSEUM / COLLECTION ARE STORED SEPARATELY IN THIS BROWSER.</div>';
    }
    return museumTabMarkup(tab)+'<div class="museum-content">'+content+'</div>';
  }
  function openMuseum(tab){
    museumTab=["overview","works","objects","kept","trail","shelves","care"].includes(tab)?tab:"overview";
    openSystemPanel("MY COLLECTION",museumRender(museumTab),"collection","museum");
    window.JIHANKI_MUSEUM.setView(museumTab);
    window.JIHANKI_EVENTS.record("museum-opened",{tab:museumTab});
  }
  function showCollection(){openMuseum("overview");}
  function openCollectibleObject(object){
    if(!object)return;
    openSystemPanel("COLLECTIBLE MEMORY OBJECT",window.JIHANKI_COLLECTION.objectMarkup(object.archiveId,object.receiptCode)+
      '<div class="exploration-return"><button type="button" data-object-source="'+esc(object.archiveId)+'">OPEN SOURCE MEMORY ↗</button>'+
      '<button type="button" data-return-museum>RETURN TO MY MUSEUM</button></div>',"collection","museum");
  }
  function handleMuseumCare(action){
    const museum=window.JIHANKI_MUSEUM;
    if(action==="export"){museum.exportFile();announce("Personal museum backup exported.");return;}
    if(action==="import"){artifactContent.querySelector("#museum-import-file")?.click();return;}
    if(action==="export-collection"){window.JIHANKI_COLLECTION.exportFile();return;}
    if(action==="import-collection"){artifactContent.querySelector("#collection-import-file")?.click();return;}
    if(action==="reset-preferences"){
      if(window.confirm("Reset museum view preference only?")){
        museum.resetPreferences();openMuseum("overview");announce("Museum view preference reset.");
      }
      return;
    }
    const actions={
      "clear-kept":["Clear saved works from this browser's museum?",()=>museum.clearKept()],
      "clear-shelves":["Delete all personal shelves? Works and souvenirs remain.",()=>museum.clearShelves()],
      "clear-trail":["Clear the local visit trail? Saved works and shelves remain.",()=>museum.clearTrail()],
      "clear-collection":["Clear collected works and souvenir objects? Receipts, shelves, saved works and visit trail remain.",()=>window.JIHANKI_COLLECTION.clear()],
      "reset-personality":["Reset machine personality only? Museum, collection and receipts remain.",()=>window.JIHANKI_PERSONALITY.reset()]
    };
    const selected=actions[action];if(!selected)return;
    if(window.confirm(selected[0])){selected[1]();openMuseum(museumTab);announce("Selected local data cleared.");}
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
    applyTransition("ENTER_SERVICE");
    window.JIHANKI_EVENTS.record("maintenance-opened", {});
    window.JIHANKI_AUDIO.setState("service");
    window.JIHANKI_AUDIO.sfx("home");
    window.JIHANKI_MAINTENANCE.render("overview");
    announce("Internal service terminal.");
  }

  function exitMaintenance() {
    maintenanceActive = false;
    applyTransition("EXIT_SERVICE");
    activeCategory = null;
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
    closeArtifact(); activeCategory = null; showHome();
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
    const temporalMap = event.target.closest("[data-temporal-map]");
    if (temporalMap) { openMap("geography"); return; }
    const temporalRandom = event.target.closest("[data-temporal-random]");
    if (temporalRandom) {
      const records = window.JIHANKI_ARCHIVE || [];
      const item = records.length ? records[Math.floor(Math.random() * records.length)] : null;
      if (item) openItem(item);
      return;
    }
    const temporalScroll = event.target.closest("[data-temporal-scroll]");
    if (temporalScroll) {
      artifactContent.querySelector("#temporal-timeline")?.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
      return;
    }
    const temporalOpen = event.target.closest("[data-temporal-open]");
    if (temporalOpen) { const item = byId(temporalOpen.dataset.temporalOpen); if (item) openItem(item); return; }
    const museumTabButton = event.target.closest("[data-museum-tab]");
    if (museumTabButton) { openMuseum(museumTabButton.dataset.museumTab); return; }
    const museumOpen = event.target.closest("[data-museum-open]");
    if (museumOpen) { const item = byId(museumOpen.dataset.museumOpen); if (item) openItem(item); return; }
    const museumObject = event.target.closest("[data-museum-object]");
    if (museumObject) {
      const object = window.JIHANKI_COLLECTION.objects().find(entry => entry.id === museumObject.dataset.museumObject);
      if (object) openCollectibleObject(object);
      return;
    }
    const museumKeep = event.target.closest("[data-museum-keep]");
    if (museumKeep && activeArtifact?.item) {
      window.JIHANKI_MUSEUM.toggleKeep(activeArtifact.item.id);
      updateArtifactActions();
      artifactFeedback(window.JIHANKI_MUSEUM.isKept(activeArtifact.item.id) ? "WORK KEPT IN YOUR MUSEUM." : "WORK REMOVED FROM YOUR MUSEUM.");
      return;
    }
    const museumAddShelf = event.target.closest("[data-museum-add-shelf]");
    if (museumAddShelf && activeArtifact?.item) {
      const shelfId = artifactContent.querySelector("[data-museum-shelf]")?.value;
      if (!shelfId) { artifactFeedback("SELECT A SHELF FIRST."); return; }
      try { window.JIHANKI_MUSEUM.addToShelf(shelfId, activeArtifact.item.id); artifactFeedback("WORK ADDED TO YOUR SHELF."); }
      catch (error) { artifactFeedback(error.message); }
      return;
    }
    const returnMuseum = event.target.closest("[data-return-museum]");
    if (returnMuseum) { openMuseum(museumTab); return; }
    const createShelf = event.target.closest("[data-museum-create-shelf]");
    if (createShelf) {
      try { window.JIHANKI_MUSEUM.createShelf(artifactContent.querySelector("#museum-shelf-name")?.value || ""); openMuseum("shelves"); }
      catch (error) { announce(error.message); }
      return;
    }
    const deleteShelf = event.target.closest("[data-museum-delete-shelf]");
    if (deleteShelf) {
      if (window.confirm("Delete this shelf? Works and souvenirs remain unchanged.")) {
        window.JIHANKI_MUSEUM.deleteShelf(deleteShelf.dataset.museumDeleteShelf); openMuseum("shelves");
      }
      return;
    }
    const removeShelfItem = event.target.closest("[data-museum-remove-shelf-item]");
    if (removeShelfItem) {
      window.JIHANKI_MUSEUM.removeFromShelf(removeShelfItem.dataset.museumRemoveShelfItem, removeShelfItem.dataset.museumRemoveId);
      openMuseum("shelves"); return;
    }
    const museumCare = event.target.closest("[data-museum-care]");
    if (museumCare) { handleMuseumCare(museumCare.dataset.museumCare); return; }
    const searchOpen = event.target.closest("[data-search-open]");
    if (searchOpen) { const item = byId(searchOpen.dataset.searchOpen); if (item) openItem(item); return; }
    const explore = event.target.closest("[data-explore-id]");
    if (explore) { const item = byId(explore.dataset.exploreId); if (item) openArchaeology(item); return; }
    const back = event.target.closest("[data-panel-back]");
    if (back) { const item = byId(back.dataset.panelBack); if (item) openItem(item); return; }
    const mapPinNote = event.target.closest("[data-map-pin-note]");
    if (mapPinNote) { const item = byId(mapPinNote.dataset.mapPinNote); if (item) openItem(item); return; }
    const mapTrailNote = event.target.closest("[data-map-trail-note]");
    if (mapTrailNote) { const item = byId(mapTrailNote.dataset.mapTrailNote); if (item) openItem(item); return; }
    const mapPlace = event.target.closest("[data-map-place]");
    if (mapPlace) { showLocation(mapPlace.dataset.mapPlace); return; }
    const mapMode = event.target.closest("[data-map-mode]");
    if (mapMode) { openMap(mapMode.dataset.mapMode); return; }
    const openMapButton = event.target.closest("[data-open-map]");
    if (openMapButton) { openMap(openMapButton.dataset.openMap); return; }
    const objectDownload = event.target.closest("[data-collectible-download]");
    if (objectDownload) { window.JIHANKI_COLLECTION.downloadObject(objectDownload.dataset.collectibleDownload); return; }
    const installAction = event.target.closest("[data-install-action]");
    if (installAction) {
      if (installAction.dataset.installAction === "start") window.JIHANKI_SOUNDSCAPE.start(artifactContent);
      else window.JIHANKI_SOUNDSCAPE.stop(artifactContent);
      return;
    }
    const retry = event.target.closest("[data-media-retry]");
    if (retry) {
      const imageHost = retry.closest("figure, .markdown-image-frame, .temporal-record-media");
      const failedImage = imageHost?.querySelector("img") || artifactContent.querySelector("#artifact-body img");
      const failedMedia = artifactContent.querySelector("#artifact-body audio, #artifact-body video");
      if (failedImage) {
        const base = failedImage.dataset.originalSrc || failedImage.getAttribute("src").split(/[?#]/)[0];
        const retryURL = new URL(base, document.baseURI);
        retryURL.searchParams.set("retry", String(Date.now()));
        delete failedImage.dataset.placeholderTried;
        failedImage.src = retryURL.href;
        const status = imageHost?.querySelector(".artifact-media-status") || retry.closest(".artifact-media-status");
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
    if (event.target.id === "museum-search") {
      const category = artifactContent.querySelector("#museum-category")?.value || "all";
      const sort = artifactContent.querySelector("#museum-sort")?.value || "recent";
      const list = artifactContent.querySelector("#museum-work-list");
      if (list) list.innerHTML = museumWorkMarkup(event.target.value, category, sort);
    }
    if (event.target.matches("[data-install-volume]")) window.JIHANKI_SOUNDSCAPE.setVolume(event.target);
  });

  artifactContent.addEventListener("change", async event => {
    if (event.target.matches("[data-install-select]")) { window.JIHANKI_SOUNDSCAPE.setSelection(event.target); return; }
    if (event.target.matches("[data-install-loop]")) { window.JIHANKI_SOUNDSCAPE.setLoop(event.target); return; }
    if (event.target.id === "museum-category" || event.target.id === "museum-sort") {
      const query = artifactContent.querySelector("#museum-search")?.value || "";
      const category = artifactContent.querySelector("#museum-category")?.value || "all";
      const sort = artifactContent.querySelector("#museum-sort")?.value || "recent";
      const list = artifactContent.querySelector("#museum-work-list");
      if (list) list.innerHTML = museumWorkMarkup(query, category, sort);
      window.JIHANKI_MUSEUM.setView(museumTab, sort, category);
      return;
    }
    if (event.target.id === "museum-import-file" && event.target.files?.[0]) {
      try {
        const result = await window.JIHANKI_MUSEUM.importFile(event.target.files[0]);
        openMuseum("care");
        announce("Museum backup imported. " + result.kept + " saved works, " + result.shelves + " shelves.");
      } catch (error) { window.alert("Museum import failed: " + error.message); }
      finally { event.target.value = ""; }
      return;
    }
    if (event.target.id === "collection-import-file" && event.target.files?.[0]) {
      try {
        const result = await window.JIHANKI_COLLECTION.importFile(event.target.files[0]);
        openMuseum("care");
        announce("Collection imported. " + result.records + " works and " + result.objects + " objects.");
      } catch (error) { window.alert("Collection import failed: " + error.message); }
      finally { event.target.value = ""; }
    }
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
      if (action === "temporal") { openTemporalArchive(); return; }
      if (action === "collection") { showCollection(); return; }
      if (action === "map") { openMap("geography"); return; }
      if (action === "search") { openSearch(); return; }
      if (action === "installation") { openSoundscape(); return; }
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
      if (object) openCollectibleObject(object);
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

  window.addEventListener("jihanki:receipt-download-started", event => {
    const code = event.detail?.receiptCode;
    const outcome = applyTransition("RECEIPT_DOWNLOAD_STARTED", { receiptCode: code });
    if (outcome.accepted) {
      window.JIHANKI_EVENTS.record("receipt-download-started", { code });
      refreshTransactionConfirmation();
      announce("Receipt download started: " + code + ".");
    }
  });
  window.addEventListener("jihanki:receipt-printed", event => {
    const code = event.detail?.receiptCode;
    const outcome = applyTransition("RECEIPT_PRINT_DIALOG_OPENED", { receiptCode: code });
    if (outcome.accepted) {
      window.JIHANKI_EVENTS.record("receipt-print-dialog-opened", { code });
      refreshTransactionConfirmation();
      announce("Receipt print dialog opened: " + code + ".");
    }
  });

  document.addEventListener("keydown", event => {
    if (artifact.classList.contains("open") && event.key === "Tab") {
      const focusable = [...artifact.querySelectorAll([
        'a[href]',
        'area[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'audio[controls]',
        'video[controls]',
        '[contenteditable="true"]',
        '[tabindex]:not([tabindex="-1"])'
      ].join(","))]
        .filter(node => node.getClientRects().length > 0 &&
          getComputedStyle(node).visibility !== "hidden" &&
          !node.closest("[inert]") &&
          node.getAttribute("aria-hidden") !== "true");
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
    openSearch, openMap, openArchaeology, openSoundscape, openMuseum, openTemporalArchive,
    getState() { return { credits, selectedId, activeCategory, currentView, overlay: interactionState.overlay,
      transaction: { ...interactionState.transaction }, purchasePending: interactionState.purchasePending,
      interactionRevision: interactionState.revision, maintenanceActive, ambient: window.JIHANKI_AUDIO.getState() }; }
  };
  window.JIHANKI_EVENTS.record("machine-booted", { items: allItems().length });
  updateCreditDisplay();
  showHome();
})();