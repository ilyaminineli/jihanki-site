/* M43 — Curated, typed links. Connections are editorial, not automatic category matches. */
(function () {
  const LINKS = {
    "mountain-remembers-mv": [
      { id: "voice-takismana", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "voice-iirai", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "voice-eugene", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "aokigahara-pentalogy", kind: "shared-project", label: "SOUND WORLD" }
    ],
    "endless-road": [
      { id: "voice-iirai", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "voice-takismana", kind: "shared-voice", label: "UTAU VOICE" }
    ],
    "gonshan": [
      { id: "voice-takismana", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "voice-eugene", kind: "shared-voice", label: "UTAU VOICE" }
    ],
    "hotaru": [
      { id: "voice-takismana", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "voice-iirai", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "voice-eugene", kind: "shared-voice", label: "UTAU VOICE" }
    ],
    "aokigahara-pentalogy": [
      { id: "aokigahara-shrine-restock", kind: "same-project", label: "PENTALOGY CHAPTER" },
      { id: "daily-2026-07-22", kind: "field-origin", label: "FIELD NOTE" },
      { id: "daily-2026-07-26", kind: "field-origin", label: "FIELD NOTE" }
    ],
    "aokigahara-shrine-restock": [
      { id: "aokigahara-pentalogy", kind: "same-project", label: "PARENT PROJECT" },
      { id: "daily-2026-07-26", kind: "field-origin", label: "FIELD NOTE" }
    ],
    "tunnel": [{ id: "daily-2026-07-25", kind: "source-observation", label: "FIELD NOTE" }],
    "daily-2026-07-27": [{ id: "daily-2026-08-18", kind: "ritual-return", label: "LAST RECORDED RITUAL" }],
    "daily-2026-08-18": [{ id: "daily-2026-07-27", kind: "ritual-origin", label: "FIRST RECORDED RITUAL" }],
    "fuji-six-yokai-video": [
      { id: "fuji-six-yokai-script", kind: "production-document", label: "SCRIPT" },
      { id: "fuji-six-yokai-document", kind: "project-document", label: "PROJECT DOSSIER" }
    ],
    "fuji-six-yokai-script": [
      { id: "fuji-six-yokai-video", kind: "production-document", label: "FILM" },
      { id: "fuji-six-yokai-document", kind: "project-document", label: "PROJECT DOSSIER" }
    ]
  };
  function explicitLinks(item) {
    const all = window.JIHANKI_ARCHIVE || [];
    const ids = Array.isArray(item?.metadata?.related) ? item.metadata.related : [];
    const combined = [
      ...ids.map(id => ({ id, kind: "related-record", label: "RELATED RECORD" })),
      ...(LINKS[item?.id] || [])
    ];
    const seen = new Set();
    return combined.filter(link => {
      if (!link.id || link.id === item?.id || seen.has(link.id) || !all.some(record => record.id === link.id)) return false;
      seen.add(link.id); return true;
    }).map(link => ({ ...link, item: all.find(record => record.id === link.id) }));
  }
  function links(item) {
    const all = window.JIHANKI_ARCHIVE || [];
    const merged = new Map();
    [...explicitLinks(item), ...Object.entries(LINKS).flatMap(([sourceId, targets]) => {
      const match = targets.find(target => target.id === item?.id);
      const source = match && all.find(record => record.id === sourceId);
      return source ? [{ id: source.id, item: source, kind: match.kind, label: match.label }] : [];
    })].forEach(link => { if (!merged.has(link.id)) merged.set(link.id, link); });
    return [...merged.values()];
  }
  function related(item) { return links(item).map(link => link.item).filter(Boolean); }
  function validate() {
    const all = window.JIHANKI_ARCHIVE || [], ids = new Set(all.map(item => item.id));
    const unresolvedSources = Object.keys(LINKS).filter(id => !ids.has(id));
    const unresolvedTargets = [];
    Object.entries(LINKS).forEach(([from, targets]) => targets.forEach(link => {
      if (!ids.has(link.id)) unresolvedTargets.push({ from, to: link.id, source: "curated" });
    }));
    all.forEach(item => (item.metadata?.related || []).forEach(to => {
      if (!ids.has(to)) unresolvedTargets.push({ from: item.id, to, source: "metadata" });
    }));
    return { unresolvedSources, unresolvedTargets };
  }
  window.JIHANKI_RELATIONSHIPS = { links, related, validate,
    forId(id) { const item = (window.JIHANKI_ARCHIVE || []).find(record => record.id === id); return item ? related(item) : []; }
  };
})();