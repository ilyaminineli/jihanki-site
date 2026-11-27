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
    "daily-2026-07-26": ["Yamanashi", "Shrines", "Arakurayama Sengen Park", "Fujisan Sengen Shrine"],
    "daily-2026-07-27": ["Mount Fuji", "Yamanashi"],
    "daily-2026-07-28": ["Tokyo"], "daily-2026-07-29": ["Ryugu Cave", "Koyodai"],
    "daily-2026-08-18": ["Lake Saiko"],
    "daily-2026-08-road-trip": ["Kawaguchiko", "Kyoto", "Osaka", "Genko-an", "Kinkaku-ji", "Osaka Castle", "Ueno Castle (Iga-Ueno)", "Japan Kanji Museum & Library", "Banbutsu Sōzō-bō"],
  };
  const PLACES = {
    "Mount Fuji": "Mountain and surrounding landscape records",
    "Aokigahara": "Forest, memory and procedural sound records",
    "Lake Saiko": "Residency, lakeside observations and field material",
    "Lake Kawaguchi": "The separate lake identified in the 2026 lantern-floating photographs",
    "Oishi Park": "Lake Kawaguchi lantern-floating event venue; identified by event signage and official 2026 event information",
    "Fuji Five Lakes": "Regional audiovisual and expedition records",
    "Kawaguchiko": "Expedition notes and travel records",
    "Arakurayama Sengen Park": "Chureito Pagoda and the 26 July night viewpoint over Mount Fuji and Fujiyoshida",
    "Fujisan Sengen Shrine": "The first shrine visit recorded on 26 July; the red torii and water channel appear in the photo sequence",
    "Kamo River": "Kyoto riverside photographs with Kyoto Tower in view",
    "Kawaguchiko Nostalgic Toys Museum": "Toy, monster-figure, electronic-game and Japanese record displays; called Kawaguchiko Retro Toys Museum in the expedition note",
    "Kawaguchiko Automobile Museum": "Automobile collection and seasonal Flight Hall aircraft displays in Narusawa",
    "Narusawa": "Yamanashi locality of the Kawaguchiko Automobile Museum / Flight Hall",
    "Katori": "The town locality visible in street and station signage",
    "Katori Station": "JR Katori Station, identified by the かとり station sign and matching station interior photographs",
    "Katori Jingu": "The vermilion tower-gate shrine identified by the Katori photo sequence",
    "Kawaguchiko Music Forest Museum": "Music boxes, mechanical organs and a confirmed expedition visit",
    "Hard Off Kawaguchiko Store": "Second-hand electronics and found objects; confirmed expedition visit",
    "Nojima Fujiyoshida Store": "Laptop purchase and the material origin of two later video works",
    "Iyashi no Sato": "Saiko Iyashi no Sato Nenba; the full name is legible on the welcome sign and the visit is confirmed in the 23 July note",
    "Fujisan Museum": "Fuji worship and regional cultural history; confirmed expedition visit",
    "Kyoto": "Kansai road journey, hotel stay, friendship and found Nintendo DS",
    "Genko-an": "Kyoto temple visit confirmed by the traveller; its round and square windows provide a distinctive photo check",
    "Kinkaku-ji": "Rokuon-ji / Golden Pavilion in Kyoto; the gold pavilion photograph is directly identifiable",
    "Japan Kanji Museum & Library": "Interactive kanji museum in Gion, Kyoto; the 2025 Kanji of the Year display identifies the visit",
    "Kanji Museum": "Japan Kanji Museum & Library in Gion, Kyoto",
    "Banbutsu Sōzō-bō": "Kyoto shop 万物創造房 run by a friend; the interior is a shop memory, not a museum",
    "Gion": "Kyoto district associated with Gion Matsuri and the lantern photograph",
    "PICA Fuji Saiko": "PICA Fuji Saiko campground and accommodation site, named by the illuminated sign at Lake Saiko",
    "Fujiyoshida": "Yamanashi city at the foot of Mount Fuji; location of Fuji-Q Highland",
    "Fujisan Dragon Tower": "Angular observation tower at Tagonoura Minato Park, Fuji City, Shizuoka",
    "Tagonoura Minato Park": "Fuji City coastal park containing Fujisan Dragon Tower",
    "Fuji City": "Shizuoka city on Suruga Bay; location of Tagonoura Minato Park",
    "Shizuoka": "Prefecture containing Fuji City and Tagonoura Minato Park",
    "Tokyo Skytree": "Recognisable Tokyo landmark visible above the residential street",
    "Sumida Ward": "Tokyo ward named by the waste-sorting notice in photo-157; Honjo and Mukojima police stations are also printed on the sign",
    "Yamanashi": "Prefecture named by the Environment Agency / Yamanashi marker and erosion-control structure signs",
    "Iga-Ueno": "Iga City district in Mie Prefecture; location of Ueno Castle",
    "Iga City": "Mie city containing Iga-Ueno and Ueno Castle",
    "Mie": "Prefecture containing Iga-Ueno Castle",
    "Osaka": "Kansai road journey; no concert attendance is recorded",
    "Osaka Castle": "Osaka-jo; one of the two castle visits confirmed by the traveller",
    "Ueno Castle (Iga-Ueno)": "Ueno Castle in Iga City, Mie Prefecture; a separate visit confirmed by the traveller",
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