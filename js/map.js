/* M44 — Schematic geography and archive-memory network. Not a surveying or navigation map. */
(function () {
  const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const MAP_SURFACE = { width: 2800, height: 3305 };
  const GEO_VIEWBOX = { minLon: 123.658963, maxLon: 145.820743, minLat: 24.217586, maxLat: 45.523885 };
  // Coordinates are WGS84 lat/lon. "site" entries are sourced place coordinates;
  // "locality" entries are town/area anchors; "area" entries preserve uncertain
  // archive locations without pretending to be exact photo GPS.
  const GEO_COORDS = {
    "Akihabara": [35.70189, 139.77437, "site"],
    "Aokigahara": [35.484, 138.653, "area"],
    "Arakurayama Sengen Park": [35.50051, 138.80157, "site"],
    "Banbutsu Sōzō-bō": [35.011, 135.769, "area"],
    "CRYSTA Nagahori": [34.67516, 135.50279, "site"],
    "Demachiyanagi": [35.0307, 135.77333, "site"],
    "First summit near Saiko": [35.499, 138.681, "area"],
    "Fugaku Wind Cave": [35.4745, 138.663, "locality"],
    "Fuji City": [35.1611, 138.6763, "locality"],
    "Gion": [35.0036, 135.7778, "locality"],
    "Fuji Five Lakes": [35.465, 138.72, "area"],
    "Fujikawaguchiko": [35.501, 138.755, "locality"],
    "Fujisan Dragon Tower": [35.151, 138.682, "locality"],
    "Fujisan Museum": [35.477, 138.804, "locality"],
    "Fujisan Sengen Shrine": [35.4726, 138.7921, "site"],
    "Fujiyoshida": [35.487, 138.807, "locality"],
    "Genko-an": [35.054, 135.735, "locality"],
    "Gokodai": [35.505, 138.685, "area"],
    "Haneda": [35.5514, 139.7885, "site"],
    "Hard Off Kawaguchiko Store": [35.503, 138.765, "locality"],
    "Iyashi no Sato": [35.528, 138.670, "locality"],
    "Iga City": [34.768, 136.129, "locality"],
    "Iga-Ueno": [34.77019, 136.12713, "locality"],
    "Japan Kanji Museum & Library": [35.0036, 135.7778, "site"],
    "Kadoya Shoten": [35.508, 138.722, "area"],
    "Kamikuishiki": [35.445, 138.585, "area"],
    "Kamo River": [35.016, 135.772, "locality"],
    "Kanji Museum": [35.0036, 135.7778, "site"],
    "Katori": [35.8978, 140.4993, "locality"],
    "Katori Jingu": [35.8886, 140.5289, "site"],
    "Katori Station": [35.89799, 140.532, "site"],
    "Kawaguchiko": [35.503, 138.755, "locality"],
    "Kawaguchiko Automobile Museum": [35.456, 138.744, "locality"],
    "Kawaguchiko Music Forest Museum": [35.520, 138.772, "site"],
    "Kawaguchiko Nostalgic Toys Museum": [35.507, 138.760, "site"],
    "Kinkaku-ji": [35.03959, 135.72951, "site"],
    "Kitaoji Shinmachi": [35.0445, 135.754, "locality"],
    "Koyodai": [35.500, 138.680, "area"],
    "Kyoto": [35.0116, 135.7681, "locality"],
    "Lake Kawaguchi": [35.51667, 138.75, "site"],
    "Lake Saiko": [35.49902, 138.68694, "site"],
    "Lake Shōji": [35.48967, 138.60705, "site"],
    "Lake Yamanaka": [35.42511, 138.84962, "site"],
    "McDonald’s 139 Fujiyoshida": [35.489, 138.806, "locality"],
    "Mie": [34.7303, 136.5086, "prefecture"],
    "Miyukihama": [35.250, 139.158, "locality"],
    "Mount Ashiwada": [35.505, 138.686, "area"],
    "Mount Fuji": [35.3628, 138.7308, "site"],
    "Mt Fuji Station": [35.481, 138.795, "site"],
    "Mt. Fuji Panoramic Ropeway": [35.517, 138.775, "site"],
    "Nagahama": [35.514, 138.718, "area"],
    "Narusawa": [35.481, 138.69, "locality"],
    "Niikura Tunnel": [35.495, 138.805, "area"],
    "Nojima Fujiyoshida Store": [35.484, 138.809, "locality"],
    "Odawara": [35.255, 139.159, "locality"],
    "Odawara Castle": [35.251, 139.1536, "site"],
    "Oishi Park": [35.531, 138.741, "site"],

    "Onsen Yurari": [35.477, 138.692, "site"],
    "Osaka": [34.6937, 135.5023, "locality"],
    "Osaka Castle": [34.68737, 135.52586, "site"],
    "Otsu": [35.0174, 135.8547, "locality"],
    "Otsuki–Fujiyoshida junction": [35.610, 138.94, "area"],
    "PICA Fuji Saiko": [35.495, 138.685, "site"],
    "Ryugu Cave": [35.495, 138.653, "locality"],
    "Sanjo": [35.009, 135.772, "locality"],
    "Satyam 1": [35.445, 138.585, "area"],
    "Shiga": [35.0174, 135.8547, "prefecture"],
    "Shizuoka": [34.9756, 138.3831, "prefecture"],
    "Senbon Kitaoji": [35.048, 135.744, "locality"],
    "Shinjuku": [35.69026, 139.70051, "site"],
    "Shinsaibashi": [34.675, 135.5013, "locality"],
    "Shrines": [35.4726, 138.7921, "area"],
    "Sumida Ward": [35.710, 139.810, "area"],
    "Tagonoura Minato Park": [35.14084, 138.69377, "site"],
    "Tagonoura Port": [35.14084, 138.69377, "site"],
    "Tenjoyama": [35.518, 138.777, "locality"],
    "Tokyo": [35.6812, 139.7671, "locality"],
    "Tokyo Skytree": [35.71005, 139.81071, "site"],
    "Ueno Castle (Iga-Ueno)": [34.77019, 136.12713, "site"],
    "Ueno-ebisumachi": [34.7586, 136.1311, "locality"],
    "Uno-Misaki Tunnel": [35.466, 138.602, "area"],
    "Yamanashi": [35.6652, 138.571, "prefecture"],
    "Yokosawa Sabo": [35.501, 138.701, "area"]
  };
  const MAIN_LABELS = new Set([
    "Yamanashi", "Lake Saiko", "Kyoto", "Mount Fuji", "Tokyo", "Kawaguchiko", "Katori",
    "Kawaguchiko Nostalgic Toys Museum", "Lake Kawaguchi", "Fujikawaguchiko", "Osaka",
    "Akihabara", "First summit near Saiko", "Arakurayama Sengen Park", "Fuji City",
    "Fuji Five Lakes", "Shinjuku", "Oishi Park"
  ]);
  const surfacePoint = name => {
    const value = GEO_COORDS[name];
    if (!value) return null;
    const [lat, lon] = value;
    return [
      (lon - GEO_VIEWBOX.minLon) / (GEO_VIEWBOX.maxLon - GEO_VIEWBOX.minLon) * MAP_SURFACE.width,
      (GEO_VIEWBOX.maxLat - lat) / (GEO_VIEWBOX.maxLat - GEO_VIEWBOX.minLat) * MAP_SURFACE.height
    ];
  };
  const JP_LABELS = {
    "Lake Saiko": "西湖", "Aokigahara": "青木ヶ原樹海", "Fuji Five Lakes": "富士五湖", "Kawaguchiko": "河口湖周辺",
    "Lake Yamanaka": "山中湖", "Lake Shōji": "精進湖", "Uno-Misaki Tunnel": "宇の岬トンネル",
    "Onsen Yurari": "ゆらり", "Akihabara": "秋葉原", "First summit near Saiko": "西湖近くの最初の山頂",
    "Lake Kawaguchi": "河口湖", "Oishi Park": "大石公園", "Kawaguchiko Music Forest Museum": "河口湖音楽と森の美術館",
    "Arakurayama Sengen Park": "新倉山浅間公園", "Fujisan Sengen Shrine": "北口本宮冨士浅間神社",
    "Kawaguchiko Nostalgic Toys Museum": "懐かし玩具館", "Kawaguchiko Automobile Museum": "河口湖自動車博物館",
    "Narusawa": "鳴沢村", "Kamo River": "鴨川", "Mount Fuji": "富士山", "Niikura Tunnel": "新倉河口湖トンネル",
    "Yamanashi": "山梨県", "Tokyo": "東京", "Ryugu Cave": "竜宮洞穴", "Koyodai": "紅葉台", "Gokodai": "五湖台",
    "Shrine": "神社", "Shrines": "神社群", "Haneda": "羽田", "Shinjuku": "新宿", "Katori": "香取",
    "Katori Station": "香取駅", "Katori Jingu": "香取神宮", "Hard Off Kawaguchiko Store": "ハードオフ河口湖店",
    "Nojima Fujiyoshida Store": "ノジマ富士吉田店", "Iyashi no Sato": "西湖いやしの里根場",
    "Fujisan Museum": "富士山ミュージアム", "Kyoto": "京都", "Genko-an": "源光庵", "Kinkaku-ji": "金閣寺",
    "Japan Kanji Museum & Library": "漢字ミュージアム", "Kanji Museum": "漢字ミュージアム",
    "Banbutsu Sōzō-bō": "万物創造房", "Osaka": "大阪", "Osaka Castle": "大阪城",
    "Odawara Castle": "小田原城", "Ueno Castle (Iga-Ueno)": "伊賀上野城", "Ueno-ebisumachi": "上野恵美須町",
    "PICA Fuji Saiko": "PICA富士西湖", "Fujisan Dragon Tower": "富士山ドラゴンタワー",
    "Tagonoura Minato Park": "田子の浦みなと公園", "Fuji City": "富士市", "Shizuoka": "静岡県",
    "Tokyo Skytree": "東京スカイツリー", "Sumida Ward": "墨田区", "Iga-Ueno": "伊賀上野", "Iga City": "伊賀市",
    "Mie": "三重県", "Satyam 1": "サティヤム1", "Kamikuishiki": "上九一色", "Mount Ashiwada": "足和田山",
    "McDonald’s 139 Fujiyoshida": "マクドナルド139富士吉田店", "Fujiyoshida": "富士吉田", "Mt Fuji Station": "富士山駅",
    "Yokosawa Sabo": "横沢砂防堰堤", "Odawara": "小田原", "Fujikawaguchiko": "富士河口湖町",
    "Fugaku Wind Cave": "富岳風穴", "Mt. Fuji Panoramic Ropeway": "富士山パノラマロープウェイ", "Tenjoyama": "天上山",
    "Tagonoura Port": "田子の浦港", "Nagahama": "長浜", "Kadoya Shoten": "かどや商店",
    "CRYSTA Nagahori": "クリスタ長堀", "Shinsaibashi": "心斎橋",
    "Senbon Kitaoji": "千本北大路", "Kitaoji Shinmachi": "北大路新町",
    "Demachiyanagi": "出町柳", "Sanjo": "三条", "Otsu": "大津",
    "Miyukihama": "みゆき浜",
    "Otsuki–Fujiyoshida junction": "大月・富士吉田接続点", "Former Kamikuishiki complex": "旧上九一色"
  };
  const labelFor = name => name;
  const subLabelFor = name => JP_LABELS[name] || "";
  // These are named sub-places already represented by a regional anchor on
  // the schematic. Keep them in the full index, but avoid drawing stacked pins.
  const DETAIL_ONLY = new Set([
    "PICA Fuji Saiko", "Tagonoura Minato Park", "Tokyo Skytree", "Sumida Ward", "McDonald’s 139 Fujiyoshida", "Mt Fuji Station", "Otsuki–Fujiyoshida junction", "Yokosawa Sabo", "Kamikuishiki", "Mount Ashiwada", "Fujikawaguchiko",
    "Kinkaku-ji", "Japan Kanji Museum & Library", "Kanji Museum", "Banbutsu Sōzō-bō", "Tenjoyama", "Tagonoura Port", "Kadoya Shoten", "Shinsaibashi", "CRYSTA Nagahori", "Kamikuishiki", "Senbon Kitaoji", "Kitaoji Shinmachi", "Demachiyanagi", "Sanjo", "Otsu", "Odawara", "Onsen Yurari", "Akihabara"
  ]);
  function geographicLines(places) {
    const names = new Set(places.map(place => place.name));
    return (window.JIHANKI_RELATIONSHIPS?.placeEdges() || [])
      .filter(edge => names.has(edge.from) && names.has(edge.to))
      .map(edge => ({ from: edge.from, to: edge.to, kind: edge.kind, label: edge.label }));
  }

  /* Geographic WGS84 anchors are projected onto the supplied Japan SVG. Labels move only to avoid collisions; hairline leaders retain the map position.
     Pins keep their regional relationships but are separated by their real label
     rectangles, not merely by their anchor points. */
  function labelMetrics(name, count = 1) {
    const jp = subLabelFor(name) || name;
    const english = subLabelFor(name) ? name : "";
    const units = Array.from(jp).length;
    const width = Math.max(112, Math.min(224, Math.max(units * 16.5 + 28, english.length * 5.7 + 30)));
    const charsPerLine = Math.max(1, Math.floor((width - 20) / 17));
    const jpLines = Math.max(1, Math.ceil(units / charsPerLine));
    const englishLines = english ? Math.max(1, Math.ceil(english.length * 5.7 / (width - 20))) : 0;
    const height = 14 + jpLines * 20 + (english ? 3 + englishLines * 11 : 0) + 4 + 8 + 14;
    return { jp, english, width, height: Math.max(58, height), count };
  }
  function declutter(places) {
    const width = MAP_SURFACE.width, height = MAP_SURFACE.height;
    const nodes = places.map(place => {
      const anchor = surfacePoint(place.name), metric = labelMetrics(place.name, place.count);
      let seed = 0; for (const character of place.name) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
      return {
        name: place.name, count: place.count || 0, seed, anchorX: anchor[0], anchorY: anchor[1],
        x: anchor[0], y: anchor[1], boxW: metric.width, boxH: metric.height
      };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const placed = [], margin = 10, step = 24, arc = 42, maxRadius = 500;
    const overlaps = (a, x, y, b) =>
      Math.abs(x - b.x) < (a.boxW + b.boxW) / 2 + margin &&
      Math.abs(y - b.y) < (a.boxH + b.boxH) / 2 + margin;
    const inside = (node, x, y) =>
      x >= node.boxW / 2 + 24 && x <= width - node.boxW / 2 - 24 &&
      y >= node.boxH / 2 + 24 && y <= height - node.boxH / 2 - 24;
    for (const node of nodes) {
      let chosen = null;
      // Walk concentric rings from the true map anchor and take the nearest
      // unoccupied label position. The geographic marker itself never moves.
      for (let radius = 0; radius <= maxRadius && !chosen; radius += step) {
        const samples = radius === 0 ? 1 : Math.max(8, Math.ceil(2 * Math.PI * radius / arc));
        const phase = (node.seed % 6283) / 1000;
        for (let index = 0; index < samples; index++) {
          const angle = phase + 2 * Math.PI * index / samples;
          const x = node.anchorX + (radius === 0 ? 0 : radius * Math.cos(angle));
          const y = node.anchorY + (radius === 0 ? 0 : radius * Math.sin(angle));
          if (inside(node, x, y) && placed.every(other => !overlaps(node, x, y, other))) {
            chosen = { x, y }; break;
          }
        }
      }
      // If a very dense local cluster exhausts the normal search radius,
      // favour the least-overlapping nearby position rather than moving a
      // label across the country.
      if (!chosen) {
        let best = null, bestScore = Infinity;
        for (let radius = 0; radius <= maxRadius + 180; radius += step) {
          const samples = radius === 0 ? 1 : Math.max(8, Math.ceil(2 * Math.PI * radius / arc));
          const phase = (node.seed % 6283) / 1000;
          for (let index = 0; index < samples; index++) {
            const angle = phase + 2 * Math.PI * index / samples;
            const x = node.anchorX + (radius === 0 ? 0 : radius * Math.cos(angle));
            const y = node.anchorY + (radius === 0 ? 0 : radius * Math.sin(angle));
            if (!inside(node, x, y)) continue;
            let overlapArea = 0;
            for (const other of placed) {
              const ox = (node.boxW + other.boxW) / 2 + margin - Math.abs(x - other.x);
              const oy = (node.boxH + other.boxH) / 2 + margin - Math.abs(y - other.y);
              if (ox > 0 && oy > 0) overlapArea += ox * oy;
            }
            const score = overlapArea * 10000 + radius;
            if (score < bestScore) { bestScore = score; best = { x, y }; }
          }
        }
        chosen = best || { x: node.anchorX, y: node.anchorY };
      }
      node.x = chosen.x; node.y = chosen.y; placed.push(node);
    }
    return Object.fromEntries(nodes.map(node => [node.name, [node.x, node.y]]));
  }
  const TRAILS = window.JIHANKI_RELATIONSHIPS?.trails?.() || [];
  function trailMarkup() {
    const archive = window.JIHANKI_ARCHIVE || [];
    return TRAILS.map(trail => {
      const stages = Array.isArray(trail.stages) && trail.stages.length
        ? '<ol class="map-trail-stages">' + trail.stages.map(stage => '<li><strong>' + esc(stage.title) + '</strong><span>' + esc(stage.detail) + '</span></li>').join("") + '</ol>'
        : "";
      const photos = (trail.photoIds || []).map(id => archive.find(item => item.id === id)).filter(item => item && item.file);
      const photoMarkup = photos.length
        ? '<div class="map-trail-photo-section"><span class="map-eyebrow">FIELD PHOTOGRAPHS / ADDITION_5</span><div class="map-trail-photo-grid">' + photos.map(item => {
          const filename = String(item.file).split("/").pop();
          return '<button type="button" data-map-photo="' + esc(item.id) + '" title="' + esc(item.title) + '"><img src="' + esc(item.file) + '" alt="' + esc(item.title) + '" loading="lazy" decoding="async"><span>' + esc(filename) + '</span></button>';
        }).join("") + '</div></div>'
        : "";
      return '<article class="map-trail-card"><span class="map-eyebrow">' + esc(trail.mode || trail.kind) + '</span><strong>' + esc(trail.title) + '</strong><p>' + esc(trail.description) + '</p>' + stages + photoMarkup + '<div class="map-trail-stops">' +
        trail.stops.map((name, index) => '<button type="button" data-map-place="' + esc(name) + '"><span>' + String(index + 1).padStart(2, "0") + '</span><strong>' + esc(labelFor(name)) + '</strong></button>').join("") +
        '</div></article>';
    }).join("");
  }
  const PIN_REFERENCES = [
    { label: "River fork / stepping-stone spot", detail: "Forwarded caption: “the river seems to split here; you can run over the stones.” Proper place name is not included in the export.", source: " 28 July message", url: "https://maps.app.goo.gl/7BkvvvGWqwyns6Tr6", status: "caption-derived label" },
    { label: "Small moss-and-greenery temple", detail: "Forwarded caption describes a small temple with abundant greenery and moss. Proper place name is not included in the export.", source: " 28 July message", url: "https://maps.app.goo.gl/hgUVYaz56wiCcFx88", status: "caption-derived label" },
    { label: "High viewpoint / climb", detail: "Forwarded caption: “if you want to climb high”. The exact hill or viewpoint name is absent.", source: " 28 July message", url: "https://maps.app.goo.gl/QU3n2yq2Vv9hvqSaA", status: "caption-derived label" },
    { label: "Temple with furin wind chimes", detail: "Forwarded caption identifies a temple with furin (wind chimes), but gives no official name.", source: " 28 July message", url: "https://maps.app.goo.gl/ZANj2HHwnuK8NXv98", status: "caption-derived label" },
    { label: "Unlabelled source pin 01", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / useful geo points", url: "https://maps.app.goo.gl/nzSTNoQn3DDkDr319", status: "name not present in source" },
    { label: "Unlabelled source pin 02", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / useful geo points", url: "https://maps.app.goo.gl/NxffYw2xwQnp7BBHA", status: "name not present in source" },
    { label: "Unlabelled source pin 03", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / useful geo points", url: "https://maps.app.goo.gl/CCM7rNVE1hp3TGJm8", status: "name not present in source" },
    { label: "Unlabelled source pin 04", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / useful geo points", url: "https://maps.app.goo.gl/GL1wpqxcX4yaGzUM9", status: "name not present in source" },
    { label: "Unlabelled source pin 05", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / useful geo points", url: "https://maps.app.goo.gl/LBdQVHSo63f8sj7F8", status: "name not present in source" },
    { label: "Unlabelled source pin 06", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / useful geo points", url: "https://maps.app.goo.gl/bbrmvkJqbakeac5c8", status: "name not present in source" },
    { label: "Unlabelled source pin 07", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / follow-up pins", url: "https://maps.app.goo.gl/ACqCythj3BHYuKWm9", status: "name not present in source" },
    { label: "Unlabelled source pin 08", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / follow-up pins", url: "https://maps.app.goo.gl/JwRkUPw8KZGsKcCj9", status: "name not present in source" },
    { label: "Unlabelled source pin 09", detail: "The same short link was posted twice; it is retained here as one unique reference.", source: "20 July / follow-up pins", url: "https://maps.app.goo.gl/saWMYR4qqtfnxDwH9", status: "name not present in source" },
    { label: "Unlabelled source pin 10", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / follow-up pins", url: "https://maps.app.goo.gl/tmFYzaggYucgoJGi9", status: "name not present in source" },
    { label: "Unlabelled source pin 11", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / later pins", url: "https://maps.app.goo.gl/mqtdWfEqJyiyERo96", status: "name not present in source" },
    { label: "Unlabelled source pin 12", detail: "The 20 July export includes only a Google Maps short link; no place name or caption is present.", source: "20 July / later pins", url: "https://maps.app.goo.gl/QAQmrA2nJrF9uDhH7?g_st=it", status: "name not present in source" }
  ];
  function pinsMarkup() {
    return '<div class="map-pin-reference-intro"><span class="map-eyebrow">SOURCE-LINK REGISTER / 20–31 JUL 2026</span><p>Captioned pins have descriptive labels. The original short links are preserved below. Pins with no source caption remain individually numbered and are not given invented place names.</p><button type="button" class="map-trail-open" data-map-pin-note="daily-2026-07-31-map-pins">OPEN COMPLETE FIELD NOTE ↗</button></div>' +
      PIN_REFERENCES.map((pin, index) => '<article class="map-pin-reference"><div><span class="map-eyebrow">' + String(index + 1).padStart(2, "0") + ' / ' + esc(pin.source) + '</span><strong>' + esc(pin.label) + '</strong><small>' + esc(pin.status) + '</small><p>' + esc(pin.detail) + '</p></div><a href="' + esc(pin.url) + '" target="_blank" rel="noopener noreferrer">OPEN ORIGINAL MAP PIN ↗</a></article>').join("");
  }
  function render(mode) {
    const selected = mode === "memory" ? "memory" : mode === "trails" ? "trails" : mode === "pins" ? "pins" : "geography";
    const places = (window.JIHANKI_GEOGRAPHY?.places() || []).filter(place => GEO_COORDS[place.name] && place.name !== "Kanji Museum").sort((a, b) => b.count - a.count);
    const trailNames = [...new Set(TRAILS.flatMap(trail => trail.stops))];
    const mapPlaces = selected === "trails"
      ? trailNames.map(name => places.find(place => place.name === name)).filter(Boolean)
      : selected === "pins" ? []
        : selected === "memory" ? places.filter(place => !["Kanji Museum"].includes(place.name))
          : places.filter(place => !DETAIL_ONLY.has(place.name));
    const indexPlaces = selected === "trails" ? mapPlaces : places;
    const labelPlaces = selected === "trails" ? mapPlaces : mapPlaces.filter(place => MAIN_LABELS.has(place.name));
    const layout = declutter(labelPlaces);
    const labelPoint = name => layout[name] || surfacePoint(name);
    const anchorPoint = surfacePoint;
    const hasLabel = name => selected === "trails" || MAIN_LABELS.has(name);
    const connections = selected === "memory"
      ? geographicLines(mapPlaces)
      : selected === "trails"
        ? TRAILS.filter(trail => trail.mapLine !== false).flatMap(trail => trail.stops.slice(1).map((stop, index) => ({ from: trail.stops[index], to: stop, kind: "chronology", label: trail.kind })))
        : [];
    const paths = connections.map(edge => {
      const a = anchorPoint(edge.from), b = anchorPoint(edge.to);
      if (!a || !b) return "";
      const kind = esc(edge.kind || "within");
      const marker = edge.kind === "chronology" ? ' marker-end="url(#map-route-arrow)"' : "";
      return '<line class="map-edge-' + kind + '" data-edge-from="' + esc(edge.from) + '" data-edge-to="' + esc(edge.to) + '" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"' + marker + '><title>' + esc(edge.label || edge.kind) + '</title></line>';
    }).join("");
    const leaders = labelPlaces.map(place => {
      const a = anchorPoint(place.name), p = labelPoint(place.name);
      if (!a || !p || Math.hypot(p[0] - a[0], p[1] - a[1]) < 20) return "";
      return '<line class="map-leader" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + p[0] + '" y2="' + p[1] + '"></line>';
    }).join("");
    const origins = labelPlaces.map(place => {
      const a = anchorPoint(place.name), precision = GEO_COORDS[place.name][2];
      return '<span class="map-origin-dot map-origin-precision-' + precision + '" aria-hidden="true" style="left:' + (a[0] / MAP_SURFACE.width * 100) + '%;top:' + (a[1] / MAP_SURFACE.height * 100) + '%"></span>';
    }).join("");
    const nodes = mapPlaces.map(place => {
      const anchor = anchorPoint(place.name), precision = GEO_COORDS[place.name][2];
      if (!hasLabel(place.name)) {
        return '<button class="map-pin map-pin-dot-only map-pin-precision-' + precision + '" style="left:' + (anchor[0] / MAP_SURFACE.width * 100) + '%;top:' + (anchor[1] / MAP_SURFACE.height * 100) + '%;width:14px;height:14px" type="button" data-map-place="' + esc(place.name) +
          '" aria-label="Open ' + esc(place.name) + ' archive location" title="' + esc(place.name) + '"><span aria-hidden="true"></span></button>';
      }
      const p = labelPoint(place.name), metric = labelMetrics(place.name, place.count);
      return '<button class="map-pin map-pin-place-card map-pin-precision-' + precision + '" style="left:' + (p[0] / MAP_SURFACE.width * 100) + '%;top:' + (p[1] / MAP_SURFACE.height * 100) + '%;width:' + metric.width + 'px;height:' + metric.height + 'px" type="button" data-map-place="' + esc(place.name) +
        '" aria-label="Open ' + esc(place.name) + ' archive location" title="' + esc(place.name) + '"><span class="map-pin-jp">' + esc(metric.jp) + '</span>' +
        (metric.english ? '<span class="map-pin-en">' + esc(metric.english) + '</span>' : '') +
        '<span class="map-pin-count">' + Number(place.count || 0) + ' RECORDS</span></button>';
    }).join("");
    const key = indexPlaces.map((place, index) => '<button type="button" data-map-place="' + esc(place.name) + '"><span>' +
      String(index + 1).padStart(2, "0") + '</span><strong>' + esc(place.name) + '</strong><small>' + place.count + '</small></button>').join("");
    const precisionLegend = '<span><i class="legend-precision-site"></i> NAMED SITE</span><span><i class="legend-precision-locality"></i> LOCALITY</span><span><i class="legend-precision-area"></i> APPROX. AREA</span><span><i class="legend-precision-prefecture"></i> PREFECTURE</span>';
    const legend = selected === "memory"
      ? '<span><i class="legend-place"></i> WITHIN / ADMINISTRATIVE AREA</span><span><i class="legend-near"></i> NEAR / LOCAL REFERENCE</span><span><i class="legend-connected"></i> OVERLOOKS / CONNECTED</span><span><i class="legend-transit"></i> TRANSIT CORRIDOR</span>' + precisionLegend + '<span>PHOTO SEQUENCES ARE RECORD LINKS, NOT GEOGRAPHIC LINES</span>'
      : selected === "trails"
        ? '<span><i class="legend-trail"></i> ORDERED VISIT / TRAVEL SEQUENCE</span><span>SCHEMATIC ORDER ONLY / NOT A GPS ROUTE</span>'
        : '<span><i class="legend-place"></i> MAP ANCHOR</span>' + precisionLegend + '<span>FULL PLACE NAMES / RECORD COUNTS BELOW</span>';
    return '<section class="memory-map-panel"><div class="map-toolbar"><div><span class="map-eyebrow">JHK / GEOGRAPHIC MEMORY</span><strong>' +
      (selected === "memory" ? "MEMORY NETWORK" : selected === "trails" ? "TRAVEL TRAILS" : selected === "pins" ? "SOURCE PINS" : "PLACE INDEX") +
      '</strong></div><div class="map-mode-switch"><button type="button" data-map-mode="geography" ' + (selected === "geography" ? 'aria-pressed="true"' : "") +
      '>PLACE</button><button type="button" data-map-mode="memory" ' + (selected === "memory" ? 'aria-pressed="true"' : "") +
      '>MEMORY</button><button type="button" data-map-mode="trails" ' + (selected === "trails" ? 'aria-pressed="true"' : "") +
      '>TRAILS</button><button type="button" data-map-mode="pins" ' + (selected === "pins" ? 'aria-pressed="true"' : "") +
      '>PINS</button></div></div>' + (selected === "pins" ? '<div class="map-pin-references">' + pinsMarkup() + '</div>' :
        '<div class="map-legend">' + legend + '</div><div class="map-canvas ' + (selected === "memory" ? "map-memory-mode" : selected === "trails" ? "map-trails-mode" : "map-place-mode") +
        '"><div class="map-pan-layer" style="width:' + MAP_SURFACE.width + 'px;height:' + MAP_SURFACE.height + 'px">' +
        '<div class="map-region-label map-label-west">JAPAN / 47 PREFECTURES</div><div class="map-region-label map-label-east">WGS84 ANCHORS / APPROXIMATE</div>' +
        '<div class="map-prefecture-backdrop"><img src="assets/maps/japan-prefectures.svg" alt="" aria-hidden="true"></div>' +
        '<svg class="map-leaders" viewBox="0 0 ' + MAP_SURFACE.width + ' ' + MAP_SURFACE.height + '" aria-hidden="true">' + leaders + '</svg>' +
        '<svg class="map-connections" viewBox="0 0 ' + MAP_SURFACE.width + ' ' + MAP_SURFACE.height + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs><marker id="map-route-arrow" markerWidth="16" markerHeight="16" refX="13" refY="8" orient="auto"><path d="M0,0 L16,8 L0,16 z"></path></marker></defs>' +
        paths + '</svg>' + origins + nodes + '</div>' +
        '<div class="map-view-controls" role="group" aria-label="Map zoom controls"><button type="button" data-map-zoom="out" aria-label="Zoom out" title="Zoom out">−</button><output data-map-zoom-level>100%</output><button type="button" data-map-zoom="in" aria-label="Zoom in" title="Zoom in">+</button><button type="button" data-map-fit title="Centre all visible places">FIT / CENTRE</button></div></div><p class="map-disclaimer">' +
        (selected === "memory" ? "Lines describe named geographical relationships such as containment, outlooks and transit corridors. They are not shared-photo links." :
          selected === "trails" ? "Arrows preserve the documented order of visits or travel. They are not measured roads, walking paths or exact transfer itineraries." :
            "SCHEMATIC / PAN TO EXPLORE / RELATIVE POSITION ONLY / NOT TO SCALE.") +
        '</p><details class="map-place-index"><summary>PLACE INDEX / ' + indexPlaces.length + ' LOCATIONS</summary><div class="map-place-list" aria-label="地名一覧">' + key + '</div></details>' + (selected === "trails" ? '<div class="map-trail-list">' + trailMarkup() + '</div>' : "")) +
      '</section>';
  }
  function bind(root) {
    const canvas = root?.querySelector?.(".map-canvas"), layer = canvas?.querySelector?.(".map-pan-layer");
    if (!canvas || !layer || canvas.dataset.panBound === "true") return;
    canvas.dataset.panBound = "true";
    const zoomReadout = root.querySelector("[data-map-zoom-level]");
    const MIN_SCALE = .06, MAX_SCALE = 3;
    const clampScale = value => Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));
    const read = () => ({
      x: Number(layer.dataset.panX || 0),
      y: Number(layer.dataset.panY || 0),
      scale: clampScale(Number(layer.dataset.panScale || 1))
    });
    const contentBounds = () => {
      const pins = [...layer.querySelectorAll(".map-pin")];
      if (!pins.length) return { left: 0, top: 0, right: layer.offsetWidth, bottom: layer.offsetHeight };
      const boxes = pins.map(pin => {
        const cx = parseFloat(pin.style.left) / 100 * layer.offsetWidth;
        const cy = parseFloat(pin.style.top) / 100 * layer.offsetHeight;
        return {
          left: cx - pin.offsetWidth / 2, top: cy - pin.offsetHeight / 2,
          right: cx + pin.offsetWidth / 2, bottom: cy + pin.offsetHeight / 2
        };
      });
      return {
        left: Math.min(...boxes.map(box => box.left)),
        top: Math.min(...boxes.map(box => box.top)),
        right: Math.max(...boxes.map(box => box.right)),
        bottom: Math.max(...boxes.map(box => box.bottom))
      };
    };
    // Country-level views fit the complete prefecture SVG. Trail view instead
    // frames only its stops, so a short regional sequence remains readable.
    const viewBounds = () => canvas.classList.contains("map-trails-mode")
      ? contentBounds()
      : { left: 0, top: 0, right: layer.offsetWidth, bottom: layer.offsetHeight };
    const clampPosition = (x, y, scale) => {
      const bounds = viewBounds();
      const width = bounds.right - bounds.left, height = bounds.bottom - bounds.top;
      const minX = width * scale <= canvas.clientWidth
        ? (canvas.clientWidth - width * scale) / 2 - bounds.left * scale
        : canvas.clientWidth - bounds.right * scale;
      const maxX = width * scale <= canvas.clientWidth
        ? minX
        : -bounds.left * scale;
      const minY = height * scale <= canvas.clientHeight
        ? (canvas.clientHeight - height * scale) / 2 - bounds.top * scale
        : canvas.clientHeight - bounds.bottom * scale;
      const maxY = height * scale <= canvas.clientHeight
        ? minY
        : -bounds.top * scale;
      return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) };
    };
    const write = (x, y, scale) => {
      scale = clampScale(scale);
      const bounded = clampPosition(x, y, scale);
      layer.dataset.panX = String(bounded.x);
      layer.dataset.panY = String(bounded.y);
      layer.dataset.panScale = String(scale);
      layer.style.transformOrigin = "0 0";
      layer.style.transform = "translate3d(" + bounded.x + "px," + bounded.y + "px,0) scale(" + scale + ")";
      if (zoomReadout) zoomReadout.textContent = Math.round(scale * 100) + "%";
    };
    const fit = () => {
      const bounds = viewBounds(), width = Math.max(1, bounds.right - bounds.left), height = Math.max(1, bounds.bottom - bounds.top);
      const padding = Math.min(42, Math.max(18, Math.round(Math.min(canvas.clientWidth, canvas.clientHeight) * .055)));
      const scale = clampScale(Math.min((canvas.clientWidth - padding * 2) / width, (canvas.clientHeight - padding * 2) / height, 1.5));
      const x = (canvas.clientWidth - width * scale) / 2 - bounds.left * scale;
      const y = (canvas.clientHeight - height * scale) / 2 - bounds.top * scale;
      write(x, y, scale);
    };
    const zoomAt = (nextScale, focusX = canvas.clientWidth / 2, focusY = canvas.clientHeight / 2) => {
      const current = read(), scale = clampScale(nextScale);
      const mapX = (focusX - current.x) / current.scale, mapY = (focusY - current.y) / current.scale;
      write(focusX - mapX * scale, focusY - mapY * scale, scale);
    };
    root.querySelectorAll("[data-map-zoom]").forEach(button => button.addEventListener("click", () => {
      const current = read();
      zoomAt(current.scale * (button.dataset.mapZoom === "in" ? 1.25 : .8));
    }));
    root.querySelector("[data-map-fit]")?.addEventListener("click", fit);
    canvas.addEventListener("wheel", event => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect(), current = read();
      zoomAt(current.scale * Math.exp(-event.deltaY * .0015), event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    const pointers = new Map();
    let gesture = null;
    const localPoint = event => { const rect = canvas.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; };
    const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const beginGesture = () => {
      const points = Array.from(pointers.values()), current = read();
      if (points.length >= 2) gesture = { type: "pinch", midpoint: midpoint(points[0], points[1]), distance: Math.max(1, distance(points[0], points[1])), x: current.x, y: current.y, scale: current.scale };
      else if (points.length === 1) gesture = { type: "pan", point: points[0], x: current.x, y: current.y, scale: current.scale };
      else gesture = null;
      layer.classList.toggle("is-dragging", points.length > 0);
    };
    canvas.addEventListener("pointerdown", event => {
      if (event.target.closest("button,a")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointers.set(event.pointerId, localPoint(event));
      try { canvas.setPointerCapture(event.pointerId); } catch (_) { }
      beginGesture(); event.preventDefault();
    });
    canvas.addEventListener("pointermove", event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, localPoint(event));
      const points = Array.from(pointers.values());
      if (points.length >= 2 && gesture && gesture.type === "pinch") {
        const center = midpoint(points[0], points[1]);
        const scale = clampScale(gesture.scale * distance(points[0], points[1]) / gesture.distance);
        const mapX = (gesture.midpoint.x - gesture.x) / gesture.scale;
        const mapY = (gesture.midpoint.y - gesture.y) / gesture.scale;
        write(center.x - mapX * scale, center.y - mapY * scale, scale);
      } else if (points.length === 1 && gesture && gesture.type === "pan") {
        const point = points[0];
        write(gesture.x + point.x - gesture.point.x, gesture.y + point.y - gesture.point.y, gesture.scale);
      }
      event.preventDefault();
    });
    const finish = event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.delete(event.pointerId); beginGesture();
    };
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);
    canvas.addEventListener("lostpointercapture", finish);

    canvas.__jihankiMapController = { read, write, fit };
    fit();
  }
  function snapshot(root) {
    const canvas = root?.querySelector?.(".map-canvas");
    const layer = canvas?.querySelector?.(".map-pan-layer");
    if (!canvas || !layer) return null;
    const mode = canvas.classList.contains("map-memory-mode") ? "memory" :
      canvas.classList.contains("map-trails-mode") ? "trails" : "geography";
    return {
      mode,
      x: Number(layer.dataset.panX || 0),
      y: Number(layer.dataset.panY || 0),
      scale: Number(layer.dataset.panScale || 1)
    };
  }
  function restore(root, state) {
    const canvas = root?.querySelector?.(".map-canvas");
    const controller = canvas?.__jihankiMapController;
    if (!controller || !state) return false;
    controller.write(Number(state.x) || 0, Number(state.y) || 0, Number(state.scale) || 1);
    return true;
  }
  window.JIHANKI_MAP = { render, bind, snapshot, restore, positions: GEO_COORDS, trails: TRAILS, pinReferences: PIN_REFERENCES };
})();