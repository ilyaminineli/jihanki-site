/* Curated cross-links between voices, audiovisual works and projects. */
(function () {
  const LINKS = {
    "mountain-remembers-mv": ["voice-takismana", "voice-iirai", "voice-eugene", "aokigahara-pentalogy"],
    "endless-road": ["voice-iirai", "voice-takismana"],
    "gonshan": ["voice-takismana", "voice-eugene"],
    "hotaru": ["voice-takismana", "voice-iirai", "voice-eugene"],
    "aokigahara-pentalogy": ["aokigahara-shrine-restock", "daily-2026-07-22", "daily-2026-07-26"],
    "aokigahara-shrine-restock": ["aokigahara-pentalogy", "daily-2026-07-26"],
    "tunnel": ["daily-2026-07-25"]
  };
  function related(item) {
    const all = window.JIHANKI_ARCHIVE || [];
    const ids = [...(item?.metadata?.related || []), ...(LINKS[item?.id] || [])];
    const unique = [...new Set(ids.filter(id => id && id !== item?.id))];
    return unique.map(id => all.find(record => record.id === id)).filter(Boolean);
  }
  window.JIHANKI_RELATIONSHIPS = {
    related,
    forId(id) {
      const item = (window.JIHANKI_ARCHIVE || []).find(record => record.id === id);
      return item ? related(item) : [];
    }
  };
})();