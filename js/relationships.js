/* M45 — Typed archive links, geographic relationships and chronological trails. */
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
      { id: "voice-eugene", kind: "shared-voice", label: "UTAU VOICE" },
      { id: "daily-2026-07-22", kind: "field-origin", label: "FIELD ORIGIN" }
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
    ],
    "daily-2026-07-23": [
      { id: "daily-2026-08-03", kind: "later-visit-by-local-host", label: "KOBA-SAN / LATER DRIVE" }
    ],
    "daily-2026-08-03": [
      { id: "daily-2026-07-23", kind: "guide-to-later-visit", label: "KOBA-SAN'S LOCAL MAP" },
      { id: "photo-127", kind: "field-visit-photograph", label: "SATYAM 1 / EARLIER VIEW" },
      { id: "photo-173", kind: "field-visit-photograph", label: "SATYAM 1 / PRESENT-DAY CLEARING" }
    ],
    "photo-127": [
      { id: "photo-173", kind: "same-site-context", label: "SAME SATYAM 1 PLACE / PRESENT-DAY VIEW" },
      { id: "daily-2026-08-03", kind: "field-visit-context", label: "KOBA-SAN VISIT / 3 AUGUST" }
    ],
    "photo-173": [
      { id: "photo-127", kind: "same-site-context", label: "SAME SATYAM 1 PLACE / EARLIER VIEW" },
      { id: "daily-2026-08-03", kind: "field-visit-context", label: "KOBA-SAN VISIT / 3 AUGUST" }
    ],
    "photo-206": [{ id: "photo-251", kind: "same-tunnel-visit", label: "UNO-MISAKI / SAME 25 JULY VISIT" }, { id: "tunnel", kind: "source-audiovisual-work", label: "TUNNEL / FIELD RECORDING AND AV WORK" }],
    "photo-251": [{ id: "photo-206", kind: "same-tunnel-visit", label: "UNO-MISAKI / INTERIOR VIEW" }, { id: "tunnel", kind: "source-audiovisual-work", label: "TUNNEL / FIELD RECORDING AND AV WORK" }],
    "photo-207": [{ id: "photo-228", kind: "same-subject", label: "SHIKI / SECOND DEER PHOTOGRAPH" }, { id: "shiki", kind: "subject-audiovisual-work", label: "SHIKI / AUDIOVISUAL WORK" }],
    "photo-228": [{ id: "photo-207", kind: "same-subject", label: "SHIKI / FIRST DEER PHOTOGRAPH" }, { id: "shiki", kind: "subject-audiovisual-work", label: "SHIKI / AUDIOVISUAL WORK" }],
    "photo-219": [{ id: "photo-220", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-221", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-222", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-223", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }],
    "photo-220": [{ id: "photo-219", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-221", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-222", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-223", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }],
    "photo-221": [{ id: "photo-219", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-220", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-222", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-223", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }],
    "photo-222": [{ id: "photo-219", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-220", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-221", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-223", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }],
    "photo-223": [{ id: "photo-219", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-220", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-221", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }, { id: "photo-222", kind: "same-hike-sequence", label: "FIRST SUMMIT NEAR SAIKO" }],
    "photo-226": [{ id: "photo-227", kind: "same-region-reference", label: "LAKE YAMANAKA / NAVIGATION DISPLAY" }],
    "photo-227": [{ id: "photo-226", kind: "same-region-reference", label: "LAKE YAMANAKA / PARK SIGN" }],
    "photo-234": [{ id: "photo-193", kind: "same-locality", label: "KITAOJI SHINMACHI / EARLIER AREA PHOTOGRAPH" }],
    "photo-246": [{ id: "voice-takismana", kind: "music-performance-equipment", label: "TAKISMANA / NINTENDO DS MUSIC USE" }, { id: "voice-takismana", kind: "music-performance-equipment", label: "SHARED CREATIVE HISTORY" }],
    "photo-248": [{ id: "photo-169", kind: "same-business-location", label: "MCDONALD’S 139 FUJIYOSHIDA / SAME BRANCH" }],
    "photo-249": [{ id: "photo-198", kind: "same-neighbourhood-context", label: "SHINSAIBASHI / UNDERGROUND PARKING AREA" }],
    "photo-247": [{ id: "photo-250", kind: "same-locality-outing", label: "MIYUKIHAMA / BEACH SIGN" }, { id: "photo-202", kind: "same-locality-outing", label: "MIYUKIHAMA / SCHOOL-SIGN STREET" }],
    "photo-250": [{ id: "photo-247", kind: "same-locality-outing", label: "MIYUKIHAMA / NEARBY RESIDENTIAL STREET" }, { id: "photo-202", kind: "same-locality-outing", label: "MIYUKIHAMA / SCHOOL-SIGN STREET" }],
    "photo-192": [
      { id: "photo-137", kind: "same-place-memory", label: "GENKO-AN / ROUND AND SQUARE WINDOWS" },
      { id: "photo-151", kind: "same-place-memory", label: "GENKO-AN / VERANDA" },
      { id: "photo-152", kind: "same-place-memory", label: "GENKO-AN / ENGAWA" },
      { id: "photo-153", kind: "same-place-memory", label: "GENKO-AN / TATAMI CORRIDOR" },
      { id: "daily-2026-08-road-trip", kind: "guestbook-date-context", label: "KYOTO VISIT / AUGUST 2026" }
    ],
    "photo-179": [
      { id: "photo-180", kind: "same-event-photo-sequence", label: "SAME FESTIVAL / SECOND FRAME" },
      { id: "event-2026-08-15-nagahama-furusato-festival", kind: "event-documentation", label: "NAGAHAMA FURUSATO FESTIVAL" },
    ],
    "photo-180": [
      { id: "photo-179", kind: "same-event-photo-sequence", label: "SAME FESTIVAL / FIRST FRAME" },
      { id: "event-2026-08-15-nagahama-furusato-festival", kind: "event-documentation", label: "NAGAHAMA FURUSATO FESTIVAL" },
    ],
    "event-2026-08-15-nagahama-furusato-festival": [
      { id: "photo-179", kind: "event-photograph", label: "FIREWORKS / FRAME 1" },
      { id: "photo-180", kind: "event-photograph", label: "FIREWORKS / FRAME 2" },
    ],
    "photo-181": [
      { id: "photo-182", kind: "same-tunnel-installation", label: "NIIKURA TUNNEL / R-7 TELEPHONE" },
      { id: "photo-18", kind: "same-tunnel-location", label: "NIIKURA TUNNEL / EARLIER PHOTOGRAPH" }
    ],
    "photo-182": [
      { id: "photo-181", kind: "same-tunnel-installation", label: "NIIKURA TUNNEL / HYDRANT CABINET" },
      { id: "photo-18", kind: "same-tunnel-location", label: "NIIKURA TUNNEL / EARLIER PHOTOGRAPH" }
    ],
    "photo-18": [
      { id: "photo-181", kind: "same-tunnel-location", label: "NIIKURA TUNNEL / NEWER DETAIL" },
      { id: "photo-182", kind: "same-tunnel-location", label: "NIIKURA TUNNEL / NEWER DETAIL" }
    ],
    "photo-184": [
      { id: "photo-128", kind: "same-viewpoint-location", label: "FUJISAN DRAGON TOWER" },
      { id: "photo-130", kind: "same-viewpoint-location", label: "FUJISAN DRAGON TOWER" }
    ],
    "photo-190": [
      { id: "photo-194", kind: "same-transit-corridor-context", label: "DEMACHIYANAGI / SANJO / OTSU CORRIDOR" }
    ],
    "photo-194": [
      { id: "photo-190", kind: "same-transit-corridor-context", label: "DEMACHIYANAGI / SANJO / OTSU CORRIDOR" }
    ],
    "photo-196": [
      { id: "photo-197", kind: "same-photo-sequence", label: "OSAKA CASTLE / SECOND FRAME" },
      { id: "daily-2026-08-road-trip", kind: "field-visit-photograph", label: "OSAKA CASTLE / KANSAI ROAD TRIP" }
    ],
    "photo-197": [
      { id: "photo-196", kind: "same-photo-sequence", label: "OSAKA CASTLE / MOAT AND BOAT" },
      { id: "daily-2026-08-road-trip", kind: "field-visit-photograph", label: "OSAKA CASTLE / KANSAI ROAD TRIP" }
    ],
    "photo-198": [
      { id: "photo-199", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-200", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-201", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-199": [
      { id: "photo-198", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-200", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-201", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-200": [
      { id: "photo-198", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-199", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-201", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-201": [
      { id: "photo-198", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-199", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id: "photo-200", kind: "same-neighbourhood", label: "SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-174": [
      { id: "daily-2026-07-24", kind: "field-visit-photograph", label: "AOKIGAHARA CAVE VISIT" }
    ],
    "daily-2026-07-24": [
      { id: "photo-174", kind: "field-visit-photograph", label: "FUGAKU WIND CAVE / SIGNED LOCATION" }
    ],
    "photo-177": [
      { id: "daily-2026-07-22", kind: "field-context", label: "SAIKO / LOCAL TRANSPORT CONTEXT" },
      { id: "daily-2026-07-23", kind: "field-context", label: "SAIKO / KOBA-SAN LOCAL MAP" }
    ],
    "photo-178": [
      { id: "daily-2026-07-21", kind: "ticket-evidence", label: "HANEDA → SHINJUKU ARRIVAL TICKET" }
    ],
    "daily-2026-07-21": [
      { id: "photo-178", kind: "ticket-evidence", label: "AIRPORT LIMOUSINE TICKET" }
    ],
    "photo-185": [
      { id: "photo-186", kind: "same-port-context", label: "TAGONOURA PORT / OFFICE MARKER" },
      { id: "photo-147", kind: "same-coastal-area", label: "TAGONOURA MINATO PARK / DRAGON TOWER AREA" },
      { id: "photo-148", kind: "same-coastal-area", label: "TAGONOURA MINATO PARK / DRAGON TOWER AREA" }
    ],
    "photo-186": [
      { id: "photo-185", kind: "same-port-context", label: "TAGONOURA PORT / HAZARD MAP" },
      { id: "photo-147", kind: "same-coastal-area", label: "TAGONOURA MINATO PARK / DRAGON TOWER AREA" },
      { id: "photo-148", kind: "same-coastal-area", label: "TAGONOURA MINATO PARK / DRAGON TOWER AREA" }
    ],
    "photo-187": [
      { id: "photo-188", kind: "same-photo-sequence", label: "TENJOYAMA ROPEWAY / SECOND FRAME" },
      { id: "photo-135", kind: "same-lake-context", label: "LAKE KAWAGUCHI / SEPARATE LAKESIDE SCENE" }
    ],
    "photo-188": [
      { id: "photo-187", kind: "same-photo-sequence", label: "TENJOYAMA ROPEWAY / PANORAMA" },
      { id: "photo-135", kind: "same-lake-context", label: "LAKE KAWAGUCHI / SEPARATE LAKESIDE SCENE" }
    ],
    "photo-135": [
      { id: "photo-187", kind: "same-lake-context", label: "LAKE KAWAGUCHI / ROPEWAY OVERLOOK" },
      { id: "photo-188", kind: "same-lake-context", label: "LAKE KAWAGUCHI / ROPEWAY STATION" }
    ],
    "photo-193": [
      { id: "photo-49", kind: "shared-theme", label: "JIHANKI / VENDING-MACHINE SUBJECT" },
      { id: "photo-50", kind: "shared-theme", label: "JIHANKI / VENDING-MACHINE SUBJECT" },
      { id: "photo-57", kind: "shared-theme", label: "JIHANKI / VENDING-MACHINE SUBJECT" },
      { id: "photo-58", kind: "shared-theme", label: "JIHANKI / VENDING-MACHINE SUBJECT" }
    ],
    "photo-195": [
      { id: "daily-2026-08-road-trip", kind: "regional-journey-context", label: "KYOTO–OSAKA JOURNEY / EXACT VENUE UNKNOWN" }
    ],
    "daily-2026-08-01": [
      { id: "takismana-fujisan", kind: "companion-first-person-account", label: "TAKISMANA / COMPLETE 1 AUGUST CLIMB ACCOUNT" }
    ],
    "takismana-katori": [
      { id: "photo-32", kind: "shrine-visit-photograph", label: "KATORI JINGU / VERMILION APPROACH GATE" },
      { id: "photo-33", kind: "shrine-visit-photograph", label: "KATORI JINGU / MAIN GATE" },
      { id: "photo-34", kind: "shrine-visit-photograph", label: "KATORI JINGU / GATE DETAIL" },
      { id: "photo-35", kind: "shrine-visit-photograph", label: "KATORI JINGU / STONE TORII AND GROUNDS" },
      { id: "photo-36", kind: "locality-evidence", label: "KATORI / STREET SIGN" },
      { id: "photo-37", kind: "station-evidence", label: "KATORI STATION / SIGN" },
      { id: "photo-68", kind: "station-context", label: "KATORI STATION / PLATFORM-SIDE EXIT" },
      { id: "photo-69", kind: "station-context", label: "KATORI STATION / WAITING ROOM" },
      { id: "photo-70", kind: "locality-context", label: "KATORI / SCHOOL-ROUTE SIGN" },
      { id: "photo-71", kind: "locality-context", label: "KATORI / TRADITIONAL HOUSE" },
      { id: "photo-72", kind: "locality-context", label: "KATORI / FIELDS AND WOODED EDGE" },
      { id: "photo-73", kind: "locality-context", label: "KATORI / ROADSIDE GARDEN" },
      { id: "photo-74", kind: "locality-context", label: "KATORI / STONE BOUNDARY WALL" },
      { id: "photo-38", kind: "airport-context-photograph", label: "TOKYO AIRPORT / TERMINAL CONTEXT; AIRPORT NOT NAMED IN TEXT" },
      { id: "photo-39", kind: "airport-context-photograph", label: "TOKYO AIRPORT / TERMINAL CONTEXT; AIRPORT NOT NAMED IN TEXT" },
      { id: "photo-40", kind: "airport-context-photograph", label: "TOKYO AIRPORT / TERMINAL CONTEXT; AIRPORT NOT NAMED IN TEXT" },
      { id: "photo-41", kind: "airport-context-photograph", label: "TOKYO AIRPORT / TERMINAL CONTEXT; AIRPORT NOT NAMED IN TEXT" },
      { id: "first-jihanki-note", kind: "shared-concept", label: "JIHANKI / RESPAWN-POINT MOTIF" }
    ],
    "takismana-fujisan": [
      { id: "daily-2026-08-01", kind: "companion-daily-chapter", label: "1 AUGUST / DAILY EXPEDITION CHAPTER" },
      { id: "photo-141", kind: "upper-ascent-photograph", label: "MOUNT FUJI / UPPER ASCENT" },
      { id: "photo-145", kind: "upper-ascent-photograph", label: "MOUNT FUJI / FOGBOUND VOLCANIC RIDGE" },
      { id: "photo-146", kind: "upper-ascent-photograph", label: "MOUNT FUJI / RED SCORIA" },
      { id: "photo-104", kind: "summit-photograph", label: "MOUNT FUJI / CRATER" },
      { id: "photo-121", kind: "summit-photograph", label: "MOUNT FUJI / CRATER RIM" },
      { id: "photo-122", kind: "summit-photograph", label: "MOUNT FUJI / LAVA RIDGE ABOVE CLOUDS" },
      { id: "photo-123", kind: "summit-photograph", label: "MOUNT FUJI / SUMMIT TORII" },
      { id: "photo-169", kind: "post-climb-meal-context", label: "FUJI-VIEW MCDONALD’S / RETURN STOP" },
      { id: "mountain-remembers-mv", kind: "shared-landscape-work", label: "MOUNT FUJI / AUDIOVISUAL MEMORY" }
    ]
  };

  const PLACE_LINKS = [
    { from: "Fugaku Wind Cave", to: "Aokigahara", kind: "within", label: "WITHIN" },
    { from: "Satyam 1", to: "Kamikuishiki", kind: "within", label: "FORMER LOCALITY" },
    { from: "Kamikuishiki", to: "Fujikawaguchiko", kind: "within", label: "NOW WITHIN" },
    { from: "Kadoya Shoten", to: "Nagahama", kind: "within", label: "LOCATED IN" },
    { from: "Nagahama", to: "Fujikawaguchiko", kind: "within", label: "DISTRICT OF" },
    { from: "Senbon Kitaoji", to: "Kyoto", kind: "within", label: "KYOTO CITY" },
    { from: "Kitaoji Shinmachi", to: "Kyoto", kind: "within", label: "KYOTO CITY" },
    { from: "Niikura Tunnel", to: "Yamanashi", kind: "within", label: "IN PREFECTURE" },
    { from: "Onsen Yurari", to: "Yamanashi", kind: "within", label: "IN PREFECTURE" },
    { from: "Akihabara", to: "Tokyo", kind: "within", label: "TOKYO DISTRICT" },
    { from: "Shinjuku", to: "Tokyo", kind: "within", label: "TOKYO DISTRICT" },
    { from: "First summit near Saiko", to: "Lake Saiko", kind: "near", label: "NEAR SAIKO" },
    { from: "Uno-Misaki Tunnel", to: "Yamanashi", kind: "within", label: "IN PREFECTURE" },
    { from: "Lake Yamanaka", to: "Yamanashi", kind: "within", label: "IN PREFECTURE" },
    { from: "Lake Shōji", to: "Yamanashi", kind: "within", label: "IN PREFECTURE" },
    { from: "Fujisan Dragon Tower", to: "Tagonoura Minato Park", kind: "within", label: "INSIDE PARK" },
    { from: "Tagonoura Minato Park", to: "Fuji City", kind: "within", label: "IN CITY" },
    { from: "Tagonoura Port", to: "Fuji City", kind: "within", label: "IN CITY" },
    { from: "Mt. Fuji Panoramic Ropeway", to: "Tenjoyama", kind: "located-on", label: "ON MOUNTAIN" },
    { from: "Tenjoyama", to: "Lake Kawaguchi", kind: "overlooks", label: "LOOKOUT OVER" },
    { from: "CRYSTA Nagahori", to: "Shinsaibashi", kind: "connected-to", label: "CONNECTED AREA" },
    { from: "Shinsaibashi", to: "Osaka", kind: "within", label: "OSAKA DISTRICT" },
    { from: "Osaka Castle", to: "Osaka", kind: "within", label: "IN CITY" },
    { from: "Genko-an", to: "Kyoto", kind: "within", label: "IN CITY" },
    { from: "Kinkaku-ji", to: "Kyoto", kind: "within", label: "IN CITY" },
    { from: "Demachiyanagi", to: "Sanjo", kind: "transit-corridor", label: "TRANSIT CORRIDOR" },
    { from: "Sanjo", to: "Otsu", kind: "transit-corridor", label: "TRANSIT CORRIDOR" },
    { from: "Miyukihama", to: "Odawara", kind: "within", label: "IN CITY" },
    { from: "Fujikawaguchiko", to: "Yamanashi", kind: "within", label: "IN PREFECTURE" },
    { from: "Katori Station", to: "Katori Jingu", kind: "near", label: "APPROX. HALF-HOUR WALK / TAKISMANA’S ACCOUNT" },
    { from: "Katori Station", to: "Katori", kind: "within", label: "KATORI LOCALITY" },
    { from: "Katori Jingu", to: "Katori", kind: "within", label: "KATORI LOCALITY" },
    { from: "Kashima Jingū", to: "Katori Jingu", kind: "connected-to", label: "TOGOKU SANSHA / TWO SHRINES VISITED IN THE ACCOUNT" }
  ];

  const TRAILS = [
    {
      id: "arrival-2026-07-21",
      kind: "arrival-sequence",
      title: "HANEDA → SHINJUKU → KAWAGUCHIKO",
      stops: ["Haneda", "Shinjuku", "Kawaguchiko"],
      mode: "ARRIVAL / AIRPORT LIMOUSINE THEN CONTINUATION",
      description: "The 21 July ticket confirms Haneda Terminal 3 to Shinjuku Station West Exit at 21:00. The onward arrival in Kawaguchiko is recorded in the daily note; no unrecorded transfer time or exact route is invented."
    },
    {
      id: "koba-satyam-visit-2026-08-03",
      kind: "host-led-field-visit",
      title: "SAIKO RESIDENCY → SATYAM 1",
      stops: ["Lake Saiko", "Satyam 1"],
      mode: "CAR / DRIVEN BY KOBA-SAN",
      description: "On 3 August Koba-san drove the travellers to the former Kamikuishiki compound. The traveller recalls roughly half an hour from the Saiko residence. This is a visit sequence, not a plotted road route."
    },
    {
      id: "kansai-road-loop",
      kind: "confirmed-car-loop",
      title: "KAWAGUCHIKO → KYOTO → OSAKA → KAWAGUCHIKO",
      stops: ["Kawaguchiko", "Kyoto", "Osaka", "Kawaguchiko"],
      mode: "CONFIRMED CAR JOURNEY",
      description: "A long drive away from the lakes. Kyoto, Osaka, small discoveries — then the road back to Kawaguchiko."
    },
    {
      id: "saiko-first-summit-2026-07-27",
      kind: "hiking-sequence",
      title: "SAIKONEON → FIRST SUMMIT NEAR SAIKO",
      stops: ["Lake Saiko", "First summit near Saiko"],
      mode: "27 JULY / DOCUMENTED HIKING OUTING",
      mapLine: false,
      description: "The 27 July account records a direct ascent from Saikoneon, a difficult slope, a ridge trail and two remembered checkpoints. The two map pins are regional references only: no route line, summit coordinate or exact trail is asserted. The five Addition_5 photographs below form an outing evidence set, not a verified frame-by-frame route sequence; the road-bridge and direction-sign images are contextual evidence, not plotted trail points.",
      stages: [
        { title: "DEPARTURE / SAIKONEON", detail: "The ascent began directly from the Saikoneon residence. Lake Saiko is retained as regional context, not as a precise trailhead coordinate." },
        { title: "ASCENT / FINDING THE RIDGE TRAIL", detail: "The ground was steep and sliding. Eli found a metal hook and used it to help Taki climb; a trail was eventually found through the ridge." },
        { title: "MANYŌSHŪ STONE", detail: "One of the two important checkpoints recorded in the daily note. The stone preserves a tanka associated with Mount Fuji." },
        { title: "CLOUD VIEWPOINT", detail: "The second recorded checkpoint: a viewpoint with a wooden structure, where clouds passed through the landscape and several videos were recorded." }
      ],
      photoIds: ["photo-219", "photo-220", "photo-221", "photo-222", "photo-223"]
    },
    {
      id: "first-tokyo-road-trip-2026-07-24",
      kind: "first-car-journey",
      title: "KAWAGUCHIKO → TOKYO → AKIHABARA",
      stops: ["Kawaguchiko", "Tokyo", "Akihabara", "Shinjuku"],
      mode: "FIRST CAR JOURNEY TO TOKYO",
      description: "The 24 July daily chapter records the first road trip from Kawaguchiko to Tokyo, the Akihabara visit and the later descent / transit toward Shinjuku. Addition_5 (22) places a Bamiyan sign somewhere along the journey, not at a confirmed stop; no exact road or intermediate route is drawn."
    },
    {
      id: "takismana-katori-final-day",
      kind: "final-day-memory-sequence",
      title: "LAKE SAIKO → TOKYO → KASHIMA → KATORI → TOKYO",
      stops: ["Lake Saiko", "Tokyo", "Kashima Jingū", "Katori Station", "Katori Jingu", "Katori Station", "Tokyo"],
      mode: "FINAL-DAY / BUS, LOCAL TRAIN AND TAXI",
      mapLine: false,
      description: "Takismana’s full account follows an early bus from Kawaguchiko to Tokyo, a bus to Kashima, a local train to Katori and the shrine visit, then the return to Kashima and a taxi back to Tokyo airport. The source calls it the last day in Japan but gives no exact date or airport name. Ordered memory stops only; no road or transit route is plotted.",
      stages: [
        { title: "DEPARTURE / LAKE SAIKO TO TOKYO", detail: "An early bus brought both travellers from Kawaguchiko to Tokyo. Their suitcases were left at a luggage counter and sent to the hotel." },
        { title: "KASHIMA / TOGOKU SANSHA CONTEXT", detail: "A bus from Tokyo and a local train brought them to Kashima. They visited Kashima Jingū; the account places it and Katori Jingū within the historical Togoku Sansha pilgrimage context. Ikisu Jinja is named as the third shrine, but is not described as a visit." },
        { title: "KATORI / THE SHRINE WALK", detail: "From Katori Station, the walk to Katori Jingū took about half an hour in intense heat. The dojo and shops were closed; the account recalls the offering box and a goshuin." },
        { title: "RETURN / CASH-ONLY TICKETS", detail: "Back in Kashima, the travellers could not buy a bus ticket by card or top up their transport cards without cash. A taxi became the way back to Tokyo." },
        { title: "AIRPORT / ONE LAST JIHANKI", detail: "At the Tokyo airport, they rested, visited the observation deck and used a few coins found in their luggage for one last vending-machine drink." }
      ],
      photoIds: ["photo-32", "photo-33", "photo-35", "photo-36", "photo-37", "photo-68", "photo-69"]
    },
    {
      id: "takismana-fujisan-climb-2026-08-01",
      kind: "summit-climb-memory-sequence",
      title: "FUJIKAWAGUCHIKO → MOUNT FUJI / SUMMIT → FUJI-VIEW MCDONALD’S",
      stops: ["Fujikawaguchiko", "Mount Fuji", "McDonald’s 139 Fujiyoshida"],
      mode: "1 AUGUST / BUS, SUMMIT CLIMB AND RETURN",
      mapLine: false,
      description: "The 1 August daily chapter and Takismana’s complete account describe the bus approach, ascent to the summit shrine and crater, difficult descent on the wrong trail, several buses back to Fujikawaguchiko and the Fuji-view McDonald’s stop. The trailhead and exact descent route are not identified, so this is an ordered memory sequence rather than a plotted hiking route.",
      stages: [
        { title: "APPROACH / FUJIKAWAGUCHIKO", detail: "The car was left in Fujikawaguchiko before the bus climbed through the forest to the crowded trailhead. The exact trailhead is not named." },
        { title: "ASCENT / VOLCANIC GRAVEL", detail: "The account recalls rocky slopes, loose volcanic gravel, increasingly expensive water and vending machines at the upper stations." },
        { title: "SUMMIT / SHRINE AND CRATER", detail: "At the summit, the travellers visited a shrine, bought goshuin slips and walked to the crater edge. The exact shrine name is not established by the photos." },
        { title: "DESCENT / WRONG TURN", detail: "A fork led them onto a trail descending into a neighbouring prefecture. The account does not identify the trail or bus stop." },
        { title: "RETURN / BUSES AND THE FUJI VIEW", detail: "Several buses brought them back to Fujikawaguchiko. They then drove to the McDonald’s with a view of Fuji." }
      ],
      photoIds: ["photo-141", "photo-145", "photo-146", "photo-104", "photo-121", "photo-122", "photo-123", "photo-169"]
    }
  ];

  function allRecords() { return window.JIHANKI_ARCHIVE || []; }
  function byId(id) { return allRecords().find(record => record.id === id) || null; }
  function metadataIds(item) { return Array.isArray(item?.metadata?.related) ? item.metadata.related : []; }
  function explicitLinks(item) {
    const manual = LINKS[item?.id] || [];
    const automatic = metadataIds(item).map(id => ({ id, kind: "related-record", label: "RELATED RECORD" }));
    const seen = new Set();
    return [...manual, ...automatic].filter(link => {
      if (!link.id || link.id === item?.id || seen.has(link.id) || !byId(link.id)) return false;
      seen.add(link.id); return true;
    }).map(link => ({ ...link, item: byId(link.id) }));
  }
  function links(item) {
    if (!item) return [];
    const merged = new Map();
    explicitLinks(item).forEach(link => merged.set(link.id, link));
    Object.entries(LINKS).forEach(([sourceId, targets]) => {
      const match = targets.find(target => target.id === item.id);
      const source = match && byId(sourceId);
      if (source && !merged.has(source.id)) merged.set(source.id, { id: source.id, item: source, kind: match.kind, label: match.label });
    });
    allRecords().forEach(candidate => {
      if (metadataIds(candidate).includes(item.id) && !merged.has(candidate.id)) {
        merged.set(candidate.id, { id: candidate.id, item: candidate, kind: "related-record", label: "RELATED RECORD" });
      }
    });
    return [...merged.values()];
  }
  function related(item) { return links(item).map(link => link.item).filter(Boolean); }
  function placeEdges() { return PLACE_LINKS.slice(); }
  function placeLinksFor(item) {
    const places = window.JIHANKI_GEOGRAPHY?.locations(item) || [];
    return PLACE_LINKS.filter(edge => places.includes(edge.from) || places.includes(edge.to));
  }
  function trails() { return TRAILS.map(trail => ({ ...trail, stops: trail.stops.slice() })); }
  function validate() {
    const ids = new Set(allRecords().map(record => record.id));
    const unresolvedSources = Object.keys(LINKS).filter(id => !ids.has(id));
    const unresolvedTargets = [];
    Object.entries(LINKS).forEach(([from, targets]) => targets.forEach(link => {
      if (!ids.has(link.id)) unresolvedTargets.push({ from, to: link.id, source: "curated" });
    }));
    allRecords().forEach(item => metadataIds(item).forEach(to => {
      if (!ids.has(to)) unresolvedTargets.push({ from: item.id, to, source: "metadata" });
    }));
    const knownPlaces = new Set(window.JIHANKI_GEOGRAPHY?.places().map(place => place.name) || []);
    const unresolvedPlaces = PLACE_LINKS.filter(edge => !knownPlaces.has(edge.from) || !knownPlaces.has(edge.to));
    return { unresolvedSources, unresolvedTargets, unresolvedPlaces };
  }
  window.JIHANKI_RELATIONSHIPS = {
    links, related, placeEdges, placeLinksFor, trails, validate,
    forId(id) { const item = byId(id); return item ? related(item) : []; },
    linkDefinitions: LINKS
  };
})();
