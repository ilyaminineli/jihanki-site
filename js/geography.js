/* Geographic index, using only places already named by project/archive records. */
(function () {
  const PLACE_BY_ID = {
    "fuji-six-yokai-video": ["Mount Fuji", "Yamanashi"],
    "mountain-remembers-mv": ["Mount Fuji", "Aokigahara", "Lake Saiko", "Fuji Five Lakes"],
    "endless-road": ["Lake Saiko", "Kawaguchiko", "Mount Fuji"],
    "gonshan": ["Japan / 2026 expedition"],
    "tunnel": ["Uno-Misaki Tunnel", "Yamanashi"],
    "hotaru": ["Japan / 2026 expedition"],
    "aokigahara-pentalogy": ["Mount Fuji", "Aokigahara", "Lake Saiko", "Fuji Five Lakes"],
    "aokigahara-shrine-restock": ["Mount Fuji", "Shrine"],
    "daily-2026-07-20": ["Sheremetyevo", "Moscow"],
    "daily-2026-07-21": ["Haneda", "Shinjuku", "Kawaguchiko"],
    "daily-2026-07-22": ["Lake Saiko", "Aokigahara"],
    "daily-2026-07-23": ["Lake Saiko", "Kawaguchiko"],
    "daily-2026-07-24": ["Tokyo"],
    "daily-2026-07-25": ["Uno-Misaki Tunnel"],
    "daily-2026-07-26": ["Yamanashi", "Shrines"],
    "daily-2026-07-27": ["Mount Fuji", "Yamanashi"],
    "daily-2026-07-28": ["Tokyo"],
    "daily-2026-07-29": ["Ryugu Cave", "Koyodai"]
  };
  const PLACES = {
    "Mount Fuji": "Mountain and surrounding landscape records",
    "Aokigahara": "Forest, memory and procedural sound records",
    "Lake Saiko": "Residency, lakeside observations and field material",
    "Fuji Five Lakes": "Regional audiovisual and expedition records",
    "Kawaguchiko": "Expedition notes and travel records",
    "Tokyo": "Urban expedition notes",
    "Uno-Misaki Tunnel": "Tunnel recordings and audiovisual work",
    "Ryugu Cave": "Expedition notes",
    "Koyodai": "Expedition notes",
    "Haneda": "Arrival and departure records",
    "Shinjuku": "Urban expedition notes",
    "Yamanashi": "Regional archive records",
    "Shrine": "Ritual and Shrine project material",
    "Sheremetyevo": "Departure records",
    "Moscow": "Departure records",
    "Shrines": "Expedition notes and ritual observations",
    "Japan / 2026 expedition": "Material whose precise location is not recorded"
  };
  function locations(item) {
    const existing = item?.metadata?.locations || [];
    const mapped = PLACE_BY_ID[item?.id] || (item?.machineCategory === "photo" ? ["Japan / 2026 expedition"] : []);
    const unique = [...new Set([...existing, ...mapped])];
    if (item && Array.isArray(item.metadata?.locations)) item.metadata.locations = unique;
    return unique;
  }
  function entries(place) {
    return (window.JIHANKI_ARCHIVE || []).filter(item =>
      locations(item).some(location => location.toLowerCase() === String(place).toLowerCase())
    );
  }
  window.JIHANKI_GEOGRAPHY = {
    places() {
      const counts = {};
      (window.JIHANKI_ARCHIVE || []).forEach(item => locations(item).forEach(place => counts[place] = (counts[place] || 0) + 1));
      return Object.keys(counts).sort().map(name => ({ name, description: PLACES[name] || "Archive records", count: counts[name] }));
    },
    locations,
    entries,
    description(place) { return PLACES[place] || "Archive records associated with this location."; }
  };
  (window.JIHANKI_ARCHIVE || []).forEach(locations);
})();