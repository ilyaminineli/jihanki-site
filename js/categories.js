/* JIHANKI CATEGORY CONTRACT
   One explicit mapping connects physical selectors to archive records.
   Unknown categories stay visible to service diagnostics, never silently mixed. */
(function () {
  const CATEGORIES = {
    video: { label: "VIDEO", aliases: ["video"] },
    photo: { label: "PHOTO", aliases: ["photo", "image"] },
    utau: { label: "UTAU", aliases: ["utau", "voicebank"] },
    text: { label: "TEXT", aliases: ["text", "yokai"] },
    music: { label: "MUSIC", aliases: ["music"] },
    sound: { label: "SOUND", aliases: ["sound"] },
    notes: { label: "NOTES", aliases: ["notes", "note"] },
    performance: { label: "PERFORMANCE", aliases: ["performance"] }
  };
  const ALIAS_TO_CATEGORY = {};
  Object.entries(CATEGORIES).forEach(([key, cfg]) => {
    cfg.aliases.forEach(alias => ALIAS_TO_CATEGORY[alias] = key);
  });

  function categoryFor(item) {
    const raw = String(item?.category || item?.type || "").toLowerCase();
    return ALIAS_TO_CATEGORY[raw] || "unclassified";
  }

  function normalize() {
    if (!Array.isArray(window.JIHANKI_ARCHIVE)) window.JIHANKI_ARCHIVE = [];
    const archive = window.JIHANKI_ARCHIVE;
    const seen = new Set();
    for (let i = archive.length - 1; i >= 0; i--) {
      const item = archive[i];
      if (!item?.id || seen.has(item.id)) archive.splice(i, 1);
      else seen.add(item.id);
    }
    const pendingShrine = {
      id: "aokigahara-shrine-restock",
      title: "05 — SHRINE / RITUAL",
      date: "2026",
      type: "project",
      category: "music",
      author: "eli",
      group: "AOKIGAHARA / PENTALOGY",
      description: "The fifth environment of the Aokigahara / Fuji Sonic Pi pentalogy. The composition and environment belong to the project; the public render is still pending.",
      projectPath: "projects/aokigahara/index.html",
      file: "documents/projects/aokigahara.md",
      stock: {
        status: "restocking",
        quantity: 0,
        label: "FIFTH ENVIRONMENT",
        note: "Public render pending"
      },
      metadata: {
        locations: ["Mount Fuji", "Shrine"],
        related: ["aokigahara-pentalogy", "daily-2026-07-26"]
      }
    };
    if (!archive.some(item => item.id === pendingShrine.id)) archive.push(pendingShrine);

    archive.forEach(item => {
      item.machineCategory = categoryFor(item);
      item.stock = item.stock || { status: item.isNew ? "new" : "available", quantity: null };
      item.stock.status = String(item.stock.status || "available").toLowerCase();
      item.metadata = item.metadata || {};
      if (!Array.isArray(item.metadata.locations)) item.metadata.locations = [];
      if (!Array.isArray(item.metadata.related)) item.metadata.related = [];
    });

    const july26 = archive.find(item => item.id === "daily-2026-07-26");
    if (july26) july26.title = "TOYS / RITUALS / SHRINES";

    const chapterAdditions = [
      { id: "daily-2026-07-27", title: "MANYŌ / MOUNTAIN ASCENT", date: "2026-07-27", type: "text", category: "notes", author: "archive", project: "japan-expedition", file: "documents/notes/daily/2026-07-27.md" },
      { id: "daily-2026-07-28", title: "TOKYO / ACCEPTED & REJECTED PLACES", date: "2026-07-28", type: "text", category: "notes", author: "archive", project: "japan-expedition", file: "documents/notes/daily/2026-07-28.md" }
    ];
    chapterAdditions.forEach(chapter => {
      if (!archive.some(item => item.id === chapter.id)) {
        chapter.machineCategory = "notes";
        chapter.stock = { status: "available", quantity: null };
        chapter.metadata = { locations: [], related: [] };
        archive.push(chapter);
      }
    });
    ["first-jihanki", "expedition-0722"].forEach(id => {
      const i = archive.findIndex(item => item.id === id);
      if (i >= 0) archive.splice(i, 1);
    });
    archive.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.id).localeCompare(String(b.id)));
    if (window.ARCHIVE?.notes) window.ARCHIVE.notes = archive.filter(item => item.machineCategory === "notes");
  }

  window.JIHANKI_CATEGORIES = {
    config: CATEGORIES,
    categoryFor,
    items(category) {
      const all = window.JIHANKI_ARCHIVE || [];
      return category ? all.filter(item => categoryFor(item) === category) : all.slice();
    },
    unknown() {
      return (window.JIHANKI_ARCHIVE || []).filter(item => categoryFor(item) === "unclassified");
    }
  };
  normalize();
})();