/* M45 — Typed archive links, geographic relationships and chronological trails. */
(function () {
  const LINKS = {
    "mountain-remembers-mv": [
      { id:"voice-takismana", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"voice-iirai", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"voice-eugene", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"aokigahara-pentalogy", kind:"shared-project", label:"SOUND WORLD" },
      { id:"dynakyris-japan-corroborations-2026-11-27", kind:"companion-source", label:"COLLABORATOR FIELDNOTE" }
    ],
    "endless-road": [
      { id:"voice-iirai", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"voice-takismana", kind:"shared-voice", label:"UTAU VOICE" }
    ],
    "gonshan": [
      { id:"voice-takismana", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"voice-eugene", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"daily-2026-07-22", kind:"field-origin", label:"FIELD ORIGIN" }
    ],
    "hotaru": [
      { id:"voice-takismana", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"voice-iirai", kind:"shared-voice", label:"UTAU VOICE" },
      { id:"voice-eugene", kind:"shared-voice", label:"UTAU VOICE" }
    ],
    "aokigahara-pentalogy": [
      { id:"aokigahara-shrine-restock", kind:"same-project", label:"PENTALOGY CHAPTER" },
      { id:"daily-2026-07-22", kind:"field-origin", label:"FIELD NOTE" },
      { id:"daily-2026-07-26", kind:"field-origin", label:"FIELD NOTE" }
    ],
    "aokigahara-shrine-restock": [
      { id:"aokigahara-pentalogy", kind:"same-project", label:"PARENT PROJECT" },
      { id:"daily-2026-07-26", kind:"field-origin", label:"FIELD NOTE" }
    ],
    "tunnel": [{ id:"daily-2026-07-25", kind:"source-observation", label:"FIELD NOTE" }],
    "daily-2026-07-27": [{ id:"daily-2026-08-18", kind:"ritual-return", label:"LAST RECORDED RITUAL" }],
    "daily-2026-08-18": [{ id:"daily-2026-07-27", kind:"ritual-origin", label:"FIRST RECORDED RITUAL" }],
    "fuji-six-yokai-video": [
      { id:"fuji-six-yokai-script", kind:"production-document", label:"SCRIPT" },
      { id:"fuji-six-yokai-document", kind:"project-document", label:"PROJECT DOSSIER" }
    ],
    "fuji-six-yokai-script": [
      { id:"fuji-six-yokai-video", kind:"production-document", label:"FILM" },
      { id:"fuji-six-yokai-document", kind:"project-document", label:"PROJECT DOSSIER" }
    ],
    "daily-2026-07-23": [
      { id:"daily-2026-08-03", kind:"later-visit-by-local-host", label:"KOBA-SAN / LATER DRIVE" }
    ],
    "daily-2026-08-03": [
      { id:"daily-2026-07-23", kind:"guide-to-later-visit", label:"KOBA-SAN'S LOCAL MAP" },
      { id:"photo-127", kind:"field-visit-photograph", label:"SATYAM 1 / EARLIER VIEW" },
      { id:"photo-173", kind:"field-visit-photograph", label:"SATYAM 1 / PRESENT-DAY CLEARING" }
    ],
    "photo-127": [
      { id:"photo-173", kind:"same-site-context", label:"SAME SATYAM 1 PLACE / PRESENT-DAY VIEW" },
      { id:"daily-2026-08-03", kind:"field-visit-context", label:"KOBA-SAN VISIT / 3 AUGUST" }
    ],
    "photo-173": [
      { id:"photo-127", kind:"same-site-context", label:"SAME SATYAM 1 PLACE / EARLIER VIEW" },
      { id:"daily-2026-08-03", kind:"field-visit-context", label:"KOBA-SAN VISIT / 3 AUGUST" }
    ],
    "photo-intake-addition-5": [
      { id:"daily-2026-07-25", kind:"field-visit-photograph", label:"ON-SEN YURARI / UNO-MISAKI TUNNEL VISIT" },
      { id:"tunnel", kind:"project-source", label:"UNO-MISAKI / TUNNEL AUDIOVISUAL WORK" },
      { id:"daily-2026-07-24", kind:"field-encounter-context", label:"SHIKI / FUJI-AREA ENCOUNTER MEMORY" },
      { id:"shiki", kind:"subject-audiovisual-work", label:"SHIKI / DEER SUBJECT" },
      { id:"sound-08", kind:"subject-field-recording", label:"SHIKI / SOUND TAKE 1" },
      { id:"sound-09", kind:"subject-field-recording", label:"SHIKI / SOUND TAKE 2" },
      { id:"daily-2026-07-26", kind:"museum-photo-sequence", label:"KAWAGUCHIKO RETRO TOYS MUSEUM" },
      { id:"daily-2026-07-27", kind:"field-hike-photographs", label:"FIRST SUMMIT NEAR SAIKO" },
      { id:"daily-2026-07-23", kind:"museum-and-equipment-context", label:"MUSIC FOREST MUSEUM / NEW LAPTOP" },
      { id:"daily-2026-07-31", kind:"birthday-preparation-photo", label:"GAKUPO BIRTHDAY / 31 JULY" },
      { id:"daily-2026-08-road-trip", kind:"regional-and-cultural-context", label:"KYOTO / OSAKA / TAKISMANA DS MUSIC USE" },
      { id:"voice-takismana", kind:"music-performer-context", label:"TAKISMANA / NINTENDO DS MUSIC INTERFACE" },
      { id:"photo-169", kind:"same-business-location", label:"MCDONALD'S 139 FUJIYOSHIDA / SAME BRANCH" },
      { id:"photo-193", kind:"same-neighbourhood", label:"KITAOJI SHINMACHI / BUS-STOP AREA" },
      { id:"photo-198", kind:"same-neighbourhood-context", label:"SHINSAIBASHI / UNDERGROUND PARKING AREA" },
      { id:"photo-202", kind:"same-locality-and-outing", label:"MIYUKI BEACH / SAME OKINAWA OUTING" }
    ],
    "photo-192": [
      { id:"photo-137", kind:"same-place-memory", label:"GENKO-AN / ROUND AND SQUARE WINDOWS" },
      { id:"photo-151", kind:"same-place-memory", label:"GENKO-AN / VERANDA" },
      { id:"photo-152", kind:"same-place-memory", label:"GENKO-AN / ENGAWA" },
      { id:"photo-153", kind:"same-place-memory", label:"GENKO-AN / TATAMI CORRIDOR" },
      { id:"daily-2026-08-road-trip", kind:"guestbook-date-context", label:"KYOTO VISIT / AUGUST 2026" }
    ],
    "photo-179": [
      { id:"photo-180", kind:"same-event-photo-sequence", label:"SAME FESTIVAL / SECOND FRAME" },
      { id:"event-2026-08-15-nagahama-furusato-festival", kind:"event-documentation", label:"NAGAHAMA FURUSATO FESTIVAL" },
      { id:"dynakyris-japan-corroborations-2026-11-27", kind:"companion-event-corroboration", label:"16 AUGUST FIELDNOTE" }
    ],
    "photo-180": [
      { id:"photo-179", kind:"same-event-photo-sequence", label:"SAME FESTIVAL / FIRST FRAME" },
      { id:"event-2026-08-15-nagahama-furusato-festival", kind:"event-documentation", label:"NAGAHAMA FURUSATO FESTIVAL" },
      { id:"dynakyris-japan-corroborations-2026-11-27", kind:"companion-event-corroboration", label:"16 AUGUST FIELDNOTE" }
    ],
    "event-2026-08-15-nagahama-furusato-festival": [
      { id:"photo-179", kind:"event-photograph", label:"FIREWORKS / FRAME 1" },
      { id:"photo-180", kind:"event-photograph", label:"FIREWORKS / FRAME 2" },
      { id:"dynakyris-japan-corroborations-2026-11-27", kind:"companion-event-corroboration", label:"INDEPENDENT PREVIOUS-EVENING ACCOUNT" }
    ],
    "photo-181": [
      { id:"photo-182", kind:"same-tunnel-installation", label:"NIIKURA TUNNEL / R-7 TELEPHONE" },
      { id:"photo-18", kind:"same-tunnel-location", label:"NIIKURA TUNNEL / EARLIER PHOTOGRAPH" }
    ],
    "photo-182": [
      { id:"photo-181", kind:"same-tunnel-installation", label:"NIIKURA TUNNEL / HYDRANT CABINET" },
      { id:"photo-18", kind:"same-tunnel-location", label:"NIIKURA TUNNEL / EARLIER PHOTOGRAPH" }
    ],
    "photo-18": [
      { id:"photo-181", kind:"same-tunnel-location", label:"NIIKURA TUNNEL / NEWER DETAIL" },
      { id:"photo-182", kind:"same-tunnel-location", label:"NIIKURA TUNNEL / NEWER DETAIL" }
    ],
    "photo-183": [
      { id:"kadoya-shoten-miura-contact", kind:"personal-contact-record", label:"MIURA / ORIGINAL JAPANESE SELF-INTRODUCTION" }
    ],
    "kadoya-shoten-miura-contact": [
      { id:"photo-183", kind:"shop-photograph", label:"KADOYA SHOTEN / SIGN" }
    ],
    "photo-184": [
      { id:"photo-128", kind:"same-viewpoint-location", label:"FUJISAN DRAGON TOWER" },
      { id:"photo-130", kind:"same-viewpoint-location", label:"FUJISAN DRAGON TOWER" }
    ],
    "photo-190": [
      { id:"photo-194", kind:"same-transit-corridor-context", label:"DEMACHIYANAGI / SANJO / OTSU CORRIDOR" }
    ],
    "photo-194": [
      { id:"photo-190", kind:"same-transit-corridor-context", label:"DEMACHIYANAGI / SANJO / OTSU CORRIDOR" }
    ],
    "photo-196": [
      { id:"photo-197", kind:"same-photo-sequence", label:"OSAKA CASTLE / SECOND FRAME" },
      { id:"daily-2026-08-road-trip", kind:"field-visit-photograph", label:"OSAKA CASTLE / KANSAI ROAD TRIP" }
    ],
    "photo-197": [
      { id:"photo-196", kind:"same-photo-sequence", label:"OSAKA CASTLE / MOAT AND BOAT" },
      { id:"daily-2026-08-road-trip", kind:"field-visit-photograph", label:"OSAKA CASTLE / KANSAI ROAD TRIP" }
    ],
    "photo-198": [
      { id:"photo-199", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-200", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-201", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-199": [
      { id:"photo-198", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-200", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-201", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-200": [
      { id:"photo-198", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-199", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-201", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-201": [
      { id:"photo-198", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-199", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" },
      { id:"photo-200", kind:"same-neighbourhood", label:"SHINSAIBASHI AREA / DIFFERENT PLACE" }
    ],
    "photo-174": [
      { id:"daily-2026-07-24", kind:"field-visit-photograph", label:"AOKIGAHARA CAVE VISIT" }
    ],
    "daily-2026-07-24": [
      { id:"photo-174", kind:"field-visit-photograph", label:"FUGAKU WIND CAVE / SIGNED LOCATION" }
    ],
    "photo-177": [
      { id:"daily-2026-07-22", kind:"field-context", label:"SAIKO / LOCAL TRANSPORT CONTEXT" },
      { id:"daily-2026-07-23", kind:"field-context", label:"SAIKO / KOBA-SAN LOCAL MAP" }
    ],
    "photo-178": [
      { id:"daily-2026-07-21", kind:"ticket-evidence", label:"HANEDA → SHINJUKU ARRIVAL TICKET" }
    ],
    "daily-2026-07-21": [
      { id:"photo-178", kind:"ticket-evidence", label:"AIRPORT LIMOUSINE TICKET" }
    ],
    "photo-185": [
      { id:"photo-186", kind:"same-port-context", label:"TAGONOURA PORT / OFFICE MARKER" },
      { id:"photo-147", kind:"same-coastal-area", label:"TAGONOURA MINATO PARK / DRAGON TOWER AREA" },
      { id:"photo-148", kind:"same-coastal-area", label:"TAGONOURA MINATO PARK / DRAGON TOWER AREA" }
    ],
    "photo-186": [
      { id:"photo-185", kind:"same-port-context", label:"TAGONOURA PORT / HAZARD MAP" },
      { id:"photo-147", kind:"same-coastal-area", label:"TAGONOURA MINATO PARK / DRAGON TOWER AREA" },
      { id:"photo-148", kind:"same-coastal-area", label:"TAGONOURA MINATO PARK / DRAGON TOWER AREA" }
    ],
    "photo-187": [
      { id:"photo-188", kind:"same-photo-sequence", label:"TENJOYAMA ROPEWAY / SECOND FRAME" },
      { id:"photo-135", kind:"same-lake-context", label:"LAKE KAWAGUCHI / SEPARATE LAKESIDE SCENE" }
    ],
    "photo-188": [
      { id:"photo-187", kind:"same-photo-sequence", label:"TENJOYAMA ROPEWAY / PANORAMA" },
      { id:"photo-135", kind:"same-lake-context", label:"LAKE KAWAGUCHI / SEPARATE LAKESIDE SCENE" }
    ],
    "photo-135": [
      { id:"photo-187", kind:"same-lake-context", label:"LAKE KAWAGUCHI / ROPEWAY OVERLOOK" },
      { id:"photo-188", kind:"same-lake-context", label:"LAKE KAWAGUCHI / ROPEWAY STATION" }
    ],
    "photo-193": [
      { id:"photo-49", kind:"shared-theme", label:"JIHANKI / VENDING-MACHINE SUBJECT" },
      { id:"photo-50", kind:"shared-theme", label:"JIHANKI / VENDING-MACHINE SUBJECT" },
      { id:"photo-57", kind:"shared-theme", label:"JIHANKI / VENDING-MACHINE SUBJECT" },
      { id:"photo-58", kind:"shared-theme", label:"JIHANKI / VENDING-MACHINE SUBJECT" }
    ],
    "photo-195": [
      { id:"daily-2026-08-road-trip", kind:"regional-journey-context", label:"KYOTO–OSAKA JOURNEY / EXACT VENUE UNKNOWN" }
    ]
  };

  const PLACE_LINKS = [
    {from:"Fugaku Wind Cave",to:"Aokigahara",kind:"within",label:"WITHIN"},
    {from:"Satyam 1",to:"Kamikuishiki",kind:"within",label:"FORMER LOCALITY"},
    {from:"Kamikuishiki",to:"Fujikawaguchiko",kind:"within",label:"NOW WITHIN"},
    {from:"Kadoya Shoten",to:"Nagahama",kind:"within",label:"LOCATED IN"},
    {from:"Nagahama",to:"Fujikawaguchiko",kind:"within",label:"DISTRICT OF"},
    {from:"Senbon Kitaoji",to:"Kyoto",kind:"within",label:"KYOTO CITY"},
    {from:"Kitaoji Shinmachi",to:"Kyoto",kind:"within",label:"KYOTO CITY"},
    {from:"Niikura Tunnel",to:"Yamanashi",kind:"within",label:"IN PREFECTURE"},
    {from:"Onsen Yurari",to:"Yamanashi",kind:"within",label:"IN PREFECTURE"},
    {from:"Akihabara",to:"Tokyo",kind:"within",label:"TOKYO DISTRICT"},
    {from:"First summit near Saiko",to:"Lake Saiko",kind:"near",label:"NEAR SAIKO"},
    {from:"Uno-Misaki Tunnel",to:"Yamanashi",kind:"within",label:"IN PREFECTURE"},
    {from:"Lake Yamanaka",to:"Yamanashi",kind:"within",label:"IN PREFECTURE"},
    {from:"Lake Shōji",to:"Yamanashi",kind:"within",label:"IN PREFECTURE"},
    {from:"Fujisan Dragon Tower",to:"Tagonoura Minato Park",kind:"within",label:"INSIDE PARK"},
    {from:"Tagonoura Minato Park",to:"Fuji City",kind:"within",label:"IN CITY"},
    {from:"Tagonoura Port",to:"Fuji City",kind:"within",label:"IN CITY"},
    {from:"Mt. Fuji Panoramic Ropeway",to:"Tenjoyama",kind:"located-on",label:"ON MOUNTAIN"},
    {from:"Tenjoyama",to:"Lake Kawaguchi",kind:"overlooks",label:"LOOKOUT OVER"},
    {from:"CRYSTA Nagahori",to:"Shinsaibashi",kind:"connected-to",label:"CONNECTED AREA"},
    {from:"Shinsaibashi",to:"Osaka",kind:"within",label:"OSAKA DISTRICT"},
    {from:"Osaka Castle",to:"Osaka",kind:"within",label:"IN CITY"},
    {from:"Genko-an",to:"Kyoto",kind:"within",label:"IN CITY"},
    {from:"Kinkaku-ji",to:"Kyoto",kind:"within",label:"IN CITY"},
    {from:"Demachiyanagi",to:"Sanjo",kind:"transit-corridor",label:"TRANSIT CORRIDOR"},
    {from:"Sanjo",to:"Otsu",kind:"transit-corridor",label:"TRANSIT CORRIDOR"},
    {from:"Miyuki Beach",to:"Onna",kind:"within",label:"IN MUNICIPALITY"},
    {from:"Onna",to:"Okinawa",kind:"within",label:"IN PREFECTURE"},
    {from:"Fujigawaguchiko",to:"Yamanashi",kind:"within",label:"IN PREFECTURE"}
  ];

  const TRAILS = [
    {
      id:"arrival-2026-07-21",
      kind:"arrival-sequence",
      title:"HANEDA → SHINJUKU → KAWAGUCHIKO",
      stops:["Haneda","Shinjuku","Kawaguchiko"],
      mode:"ARRIVAL / AIRPORT LIMOUSINE THEN CONTINUATION",
      description:"The 21 July ticket confirms Haneda Terminal 3 to Shinjuku Station West Exit at 21:00. The onward arrival in Kawaguchiko is recorded in the daily note; no unrecorded transfer time or exact route is invented."
    },
    {
      id:"koba-satyam-visit-2026-08-03",
      kind:"host-led-field-visit",
      title:"SAIKO RESIDENCY → SATYAM 1",
      stops:["Lake Saiko","Satyam 1"],
      mode:"CAR / DRIVEN BY KOBA-SAN",
      description:"On 3 August Koba-san drove the travellers to the former Kamikuishiki compound. The traveller recalls roughly half an hour from the Saiko residence. This is a visit sequence, not a plotted road route."
    },
    {
      id:"kansai-road-loop",
      kind:"confirmed-car-loop",
      title:"KAWAGUCHIKO → KYOTO → OSAKA → KAWAGUCHIKO",
      stops:["Kawaguchiko","Kyoto","Osaka","Kawaguchiko"],
      mode:"CONFIRMED CAR JOURNEY",
      description:"A confirmed regional car journey. The ordered stops are preserved, including the return to Kawaguchiko; the line is not a measured road trace."
    }
,
    {
      id:"saiko-first-summit-2026-07-27",
      kind:"hiking-sequence",
      title:"LAKE SAIKO → FIRST SUMMIT NEAR SAIKO",
      stops:["Lake Saiko","First summit near Saiko"],
      mode:"HIKING / FIRST SUMMIT OUTING",
      description:"The traveller confirms addition_5 (17)–(21) belong to the first summit visit near Saiko, linked to the 27 July ascent chapter. The direction board shows Yamanakako and Myōjin-yama, but the exact summit name and trail are not resolved. This line is a schematic memory sequence, not a surveyed path."
    },
    {
      id:"first-tokyo-road-trip-2026-07-24",
      kind:"first-car-journey",
      title:"KAWAGUCHIKO → TOKYO → AKIHABARA",
      stops:["Kawaguchiko","Tokyo","Akihabara"],
      mode:"FIRST CAR JOURNEY TO TOKYO",
      description:"The 24 July daily chapter records the first road trip from Kawaguchiko to Tokyo and the subsequent Akihabara visit. Addition_5 (22) places a Bamiyan sign somewhere along the journey, not at a confirmed stop; no exact road or intermediate route is drawn."
    }  ];

  function allRecords(){return window.JIHANKI_ARCHIVE||[];}
  function byId(id){return allRecords().find(record=>record.id===id)||null;}
  function metadataIds(item){return Array.isArray(item?.metadata?.related)?item.metadata.related:[];}
  function explicitLinks(item){
    const manual=LINKS[item?.id]||[];
    const automatic=metadataIds(item).map(id=>({id,kind:"related-record",label:"RELATED RECORD"}));
    const seen=new Set();
    return [...manual,...automatic].filter(link=>{
      if(!link.id||link.id===item?.id||seen.has(link.id)||!byId(link.id))return false;
      seen.add(link.id);return true;
    }).map(link=>({...link,item:byId(link.id)}));
  }
  function links(item){
    if(!item)return[];
    const merged=new Map();
    explicitLinks(item).forEach(link=>merged.set(link.id,link));
    Object.entries(LINKS).forEach(([sourceId,targets])=>{
      const match=targets.find(target=>target.id===item.id);
      const source=match&&byId(sourceId);
      if(source&&!merged.has(source.id))merged.set(source.id,{id:source.id,item:source,kind:match.kind,label:match.label});
    });
    allRecords().forEach(candidate=>{
      if(metadataIds(candidate).includes(item.id)&&!merged.has(candidate.id)){
        merged.set(candidate.id,{id:candidate.id,item:candidate,kind:"related-record",label:"RELATED RECORD"});
      }
    });
    return [...merged.values()];
  }
  function related(item){return links(item).map(link=>link.item).filter(Boolean);}
  function placeEdges(){return PLACE_LINKS.slice();}
  function placeLinksFor(item){
    const places=window.JIHANKI_GEOGRAPHY?.locations(item)||[];
    return PLACE_LINKS.filter(edge=>places.includes(edge.from)||places.includes(edge.to));
  }
  function trails(){return TRAILS.map(trail=>({...trail,stops:trail.stops.slice()}));}
  function validate(){
    const ids=new Set(allRecords().map(record=>record.id));
    const unresolvedSources=Object.keys(LINKS).filter(id=>!ids.has(id));
    const unresolvedTargets=[];
    Object.entries(LINKS).forEach(([from,targets])=>targets.forEach(link=>{
      if(!ids.has(link.id))unresolvedTargets.push({from,to:link.id,source:"curated"});
    }));
    allRecords().forEach(item=>metadataIds(item).forEach(to=>{
      if(!ids.has(to))unresolvedTargets.push({from:item.id,to,source:"metadata"});
    }));
    const knownPlaces=new Set(window.JIHANKI_GEOGRAPHY?.places().map(place=>place.name)||[]);
    const unresolvedPlaces=PLACE_LINKS.filter(edge=>!knownPlaces.has(edge.from)||!knownPlaces.has(edge.to));
    return {unresolvedSources,unresolvedTargets,unresolvedPlaces};
  }
  window.JIHANKI_RELATIONSHIPS={links,related,placeEdges,placeLinksFor,trails,validate,
    forId(id){const item=byId(id);return item?related(item):[];},
    linkDefinitions:LINKS
  };
})();
