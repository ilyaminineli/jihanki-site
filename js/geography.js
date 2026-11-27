/* Geographic index from named archive records. Map positions are schematic, not surveyed coordinates. */
(function () {
  const PLACE_BY_ID = {
    "fuji-six-yokai-video": ["Mount Fuji", "Yamanashi", "Nojima Fujiyoshida Store"],
    "mountain-remembers-mv": ["Mount Fuji", "Aokigahara", "Lake Saiko", "Fuji Five Lakes", "Kawaguchiko", "Nojima Fujiyoshida Store"],
    "endless-road": ["Lake Saiko", "Kawaguchiko", "Mount Fuji"],
    "gonshan": ["Japan / 2026 expedition"], "tunnel": ["Uno-Misaki Tunnel", "Yamanashi"],
    "hotaru": ["Japan / 2026 expedition"],
    "aokigahara-pentalogy": ["Mount Fuji", "Aokigahara", "Lake Saiko", "Fuji Five Lakes"],
    "aokigahara-shrine-restock": ["Mount Fuji", "Shrine"],
    "daily-2026-07-20": ["Sheremetyevo", "Moscow"],
    "daily-2026-07-21": ["Haneda", "Shinjuku", "Kawaguchiko"],
    "daily-2026-07-22": ["Lake Saiko", "Aokigahara"],
    "daily-2026-07-23": ["Lake Saiko", "Kawaguchiko", "Iyashi no Sato", "Fujisan Museum", "Kawaguchiko Music Forest Museum", "Hard Off Kawaguchiko Store", "Nojima Fujiyoshida Store"],
    "daily-2026-07-24": ["Tokyo"], "daily-2026-07-25": ["Uno-Misaki Tunnel"],
    "daily-2026-07-26": ["Yamanashi", "Shrines"],
    "daily-2026-07-27": ["Mount Fuji", "Yamanashi"],
    "daily-2026-07-28": ["Tokyo"], "daily-2026-07-29": ["Ryugu Cave", "Koyodai"],
    "daily-2026-08-18": ["Lake Saiko"],
    "daily-2026-08-road-trip": ["Kawaguchiko", "Kyoto", "Osaka"],
  };
  const PLACES = {
    "Mount Fuji": "Mountain and surrounding landscape records",
    "Aokigahara": "Forest, memory and procedural sound records",
    "Lake Saiko": "Residency, lakeside observations and field material",
    "Lake Kawaguchi": "The separate lake identified in the 2026 lantern-floating photographs",
    "Oishi Park": "Lake Kawaguchi lantern-floating event venue; identified by event signage and official 2026 event information",
    "Fuji Five Lakes": "Regional audiovisual and expedition records",
    "Kawaguchiko": "Expedition notes and travel records",
    "Katori": "The town locality visible in street and station signage",
    "Katori Station": "JR Katori Station, identified by the かとり station sign and matching station interior photographs",
    "Katori Jingu": "The vermilion tower-gate shrine identified by the Katori photo sequence",
    "Kawaguchiko Music Forest Museum": "Music boxes, mechanical organs and a confirmed expedition visit",
    "Hard Off Kawaguchiko Store": "Second-hand electronics and found objects; confirmed expedition visit",
    "Nojima Fujiyoshida Store": "Laptop purchase and the material origin of two later video works",
    "Iyashi no Sato": "Traditional village and folk crafts; confirmed expedition visit",
    "Fujisan Museum": "Fuji worship and regional cultural history; confirmed expedition visit",
    "Kyoto": "Kansai road journey, hotel stay, friendship and found Nintendo DS",
    "Osaka": "Kansai road journey and live music",
    "Tokyo": "Urban expedition notes",
    "Uno-Misaki Tunnel": "Tunnel recordings and audiovisual work", "Ryugu Cave": "Expedition notes",
    "Koyodai": "Expedition notes", "Haneda": "Arrival and departure records", "Shinjuku": "Urban expedition notes",
    "Yamanashi": "Regional archive records", "Shrine": "Ritual and Shrine project material",
    "Sheremetyevo": "Departure records", "Moscow": "Departure records", "Shrines": "Ritual observations",
    "Japan / 2026 expedition": "Material whose precise location is not recorded"
  };
  function locations(item) {
    const existing = Array.isArray(item?.metadata?.locations) ? item.metadata.locations : [];
    const mapped = PLACE_BY_ID[item?.id] || (item?.machineCategory === "photo" ? ["Japan / 2026 expedition"] : []);
    const unique = [...new Set([...existing, ...mapped])];
    if (item?.metadata && Array.isArray(item.metadata.locations)) item.metadata.locations = unique;
    return unique;
  }
  function entries(place) {
    const key = String(place || "").toLowerCase();
    return (window.JIHANKI_ARCHIVE || []).filter(item => locations(item).some(location => location.toLowerCase() === key));
  }
  window.JIHANKI_GEOGRAPHY = {
    places() {
      const counts = {};
      (window.JIHANKI_ARCHIVE || []).forEach(item => locations(item).forEach(place => counts[place] = (counts[place] || 0) + 1));
      return Object.keys(counts).sort().map(name => ({ name, description: PLACES[name] || "Archive records", count: counts[name] }));
    },
    locations, entries,
    description(place) { return PLACES[place] || "Archive records associated with this location."; }
  };
  (window.JIHANKI_ARCHIVE || []).forEach(locations);
})();