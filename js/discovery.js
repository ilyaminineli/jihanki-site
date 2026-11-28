/* M43 — Archive search and typed memory archaeology. */
(function () {
  const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  function textFor(item) { const places = window.JIHANKI_GEOGRAPHY?.locations(item) || []; return [item.title, item.description, item.group, item.author, item.date, item.type, item.category, item.subtitle, item.context, ...(item.voices || []), ...places].filter(Boolean).join(" ").toLowerCase(); }
  function search(query) {
    const words = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean), all = window.JIHANKI_ARCHIVE || [];
    if (!words.length) return all.slice(0, 24);
    return all.map(item => {
      const title = String(item.title || "").toLowerCase(), source = textFor(item); let score = 0;
      words.forEach(word => { if (title.includes(word)) score += 5; else if (source.includes(word)) score += 1; }); return { item, score };
    })
      .filter(entry => entry.score > 0).sort((a, b) => b.score - a.score || String(a.item.title).localeCompare(String(b.item.title))).slice(0, 40).map(entry => entry.item);
  }
  function links(item) {
    if (!item) return [];
    // Record-to-record links are explicitly curated and typed. Shared geography
    // is presented separately as place context; it is not treated as a memory edge.
    return (window.JIHANKI_RELATIONSHIPS?.links(item) || []).filter(link => link.item).slice(0, 12);
  }
  function graph(id) { const root = (window.JIHANKI_ARCHIVE || []).find(item => item.id === id); return root ? { root, links: links(root) } : null; }
  function renderGraph(id) {
    const data = graph(id); if (!data) return '<p class="exploration-empty">THIS RECORD IS NO LONGER IN THE LIVE CATALOGUE.</p>';
    const rows = data.links.map((link, index) => '<button class="archaeology-node" type="button" data-related-id="' + esc(link.item.id) + '">' +
      '<span class="archaeology-index">' + String(index + 1).padStart(2, "0") + '</span><span class="archaeology-node-copy"><strong>' + esc(link.item.title) +
      '</strong><small>' + esc(link.label || link.kind) + (link.evidence ? " / " + esc(link.evidence) : "") + '</small></span><span class="archaeology-arrow">↗</span></button>').join("");
    const places = window.JIHANKI_GEOGRAPHY?.locations(data.root) || [];
    const placeLinks = window.JIHANKI_RELATIONSHIPS?.placeLinksFor(data.root) || [];
    const geoRows = placeLinks.slice(0, 8).map(edge => '<div class="archaeology-place-edge"><span>' + esc(edge.label || edge.kind) + '</span><strong>' + esc(edge.from) + '</strong><small>' + esc(edge.kind) + '</small><strong>' + esc(edge.to) + '</strong></div>').join("");
    return '<div class="archaeology-root"><span>SELECTED FRAGMENT</span><strong>' + esc(data.root.title) + '</strong><small>' + esc(data.root.date || "UNDATED") +
      ' / ' + esc(data.root.machineCategory || data.root.category) + '</small></div><div class="archaeology-branch-label">CURATED RECORD CONNECTIONS / ' + data.links.length + '</div>' +
      (rows || '<div class="exploration-empty">NO CURATED RECORD CONNECTIONS FOUND.</div>') +
      (placeLinks.length ? '<div class="archaeology-places"><span>GEOGRAPHIC RELATIONSHIPS / SEPARATE FROM SHARED RECORDS</span>' + geoRows + '</div>' : "") +
      (places.length ? '<div class="archaeology-places"><span>LOCATIONAL INDEX</span>' + places.map(place => '<button type="button" data-map-place="' + esc(place) + '">' + esc(place) + '</button>').join("") + '</div>' : "");
  }
  function renderSearchResults(query) {
    const records = search(query); if (!records.length) return '<div class="exploration-empty">NO MATCHING MEMORY FOUND.</div>';
    return records.map((item, index) => '<button class="search-result" type="button" data-search-open="' + esc(item.id) + '"><span>' +
      String(index + 1).padStart(2, "0") + '</span><strong>' + esc(item.title) + '</strong><small>' + esc(item.date || "UNDATED") + ' / ' +
      esc(item.machineCategory || item.category || item.type) + '</small></button>').join("");
  }
  window.JIHANKI_DISCOVERY = { search, links, graph, renderGraph, renderSearchResults };
})();