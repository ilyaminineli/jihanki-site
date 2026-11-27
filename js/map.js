/* M44 — Schematic geography and archive-memory network. Not a surveying or navigation map. */
(function () {
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const POSITIONS={
    "Lake Saiko":[37,43],"Aokigahara":[30,64],"Fuji Five Lakes":[52,26],"Kawaguchiko":[64,45],
    "Mount Fuji":[50,78],"Uno-Misaki Tunnel":[15,45],"Yamanashi":[77,68],"Tokyo":[86,10],
    "Ryugu Cave":[18,15],"Koyodai":[30,25],"Shrine":[66,78],"Shrines":[82,48],
    "Haneda":[91,34],"Shinjuku":[76,20],
    "Kawaguchiko Music Forest Museum":[60,30],"Hard Off Kawaguchiko Store":[78,50],
    "Nojima Fujiyoshida Store":[84,65],"Iyashi no Sato":[24,55],"Fujisan Museum":[72,82],
    "Kyoto":[40,12],"Osaka":[18,8]
  };
  function associationLines(places){
    const edges=new Set();
    (window.JIHANKI_ARCHIVE||[]).forEach(item=>{
      const locations=(window.JIHANKI_GEOGRAPHY?.locations(item)||[]).filter(place=>places.includes(place)&&POSITIONS[place]);
      if(locations.length<2)return;
      for(let i=1;i<locations.length;i++)edges.add([locations[0],locations[i]].sort().join("|"));
    });
    return[...edges].map(value=>value.split("|"));
  }
  const TRAILS=[{id:"kansai-road-loop",title:"KAWAGUCHIKO / KYOTO / OSAKA / KAWAGUCHIKO",stops:["Kawaguchiko","Kyoto","Osaka","Kawaguchiko"],description:"A confirmed car journey from Kawaguchiko to Kyoto and Osaka, returning to Kawaguchiko. A regional memory trail, not a reconstructed road route."}];
  function trailMarkup(){
    return TRAILS.map(trail=>'<article class="map-trail-card"><span class="map-eyebrow">CONFIRMED / CAR JOURNEY</span><strong>'+esc(trail.title)+'</strong><p>'+esc(trail.description)+'</p><div class="map-trail-stops">'+trail.stops.map((name,index)=>'<button type="button" data-map-place="'+esc(name)+'"><span>'+String(index+1).padStart(2,"0")+'</span><strong>'+esc(name)+'</strong></button>').join("")+'</div><button type="button" class="map-trail-open" data-map-trail-note="daily-2026-08-road-trip">OPEN JOURNEY NOTE ↗</button></article>').join("");
  }
  function render(mode){
    const selected=mode==="memory"?"memory":mode==="trails"?"trails":"geography";
    const places=(window.JIHANKI_GEOGRAPHY?.places()||[]).filter(place=>POSITIONS[place.name]).sort((a,b)=>b.count-a.count);
    const names=places.map(place=>place.name);
    const paths=(selected==="memory"?associationLines(names):selected==="trails"?TRAILS.flatMap(trail=>trail.stops.slice(1).map((stop,index)=>[trail.stops[index],stop])):[]).map(([a,b])=>{
      const p=POSITIONS[a],q=POSITIONS[b];return'<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'"></line>';
    }).join("");
    const mapPlaces=selected==="trails"?["Kawaguchiko","Kyoto","Osaka"].map(name=>places.find(place=>place.name===name)).filter(Boolean):places;
    const nodes=mapPlaces.map((place,index)=>{
      const p=POSITIONS[place.name],number=String(index+1).padStart(2,"0");
      return'<button class="map-pin" style="left:'+p[0]+'%;top:'+p[1]+'%" type="button" data-map-place="'+esc(place.name)+
        '" aria-label="Open '+esc(place.name)+' archive location" title="'+esc(place.name)+'"><span class="map-pin-index">'+number+
        '</span><span class="map-pin-dot" aria-hidden="true"></span><strong>'+esc(place.name)+'</strong><small>'+place.count+' RECORDS</small></button>';
    }).join("");
    const key=mapPlaces.map((place,index)=>'<button type="button" data-map-place="'+esc(place.name)+'"><span>'+
      String(index+1).padStart(2,"0")+'</span><strong>'+esc(place.name)+'</strong><small>'+place.count+' RECORDS</small></button>').join("");
    return'<section class="memory-map-panel"><div class="map-toolbar"><div><span class="map-eyebrow">JHK / GEOGRAPHIC MEMORY</span><strong>'+
      (selected==="memory"?"MEMORY NETWORK":selected==="trails"?"EXPEDITION TRAILS":"REGIONAL INDEX")+'</strong></div><div class="map-mode-switch"><button type="button" data-map-mode="geography" '+
      (selected==="geography"?'aria-pressed="true"':"")+' >PLACE</button><button type="button" data-map-mode="memory" '+
      (selected==="memory"?'aria-pressed="true"':"")+' >MEMORY</button><button type="button" data-map-mode="trails" '+(selected==="trails"?'aria-pressed="true"':"")+' >TRAILS</button></div></div><div class="map-canvas '+
      (selected==="memory"?"map-memory-mode":selected==="trails"?"map-trails-mode":"map-place-mode")+'"><div class="map-region-label map-label-west">FUJI REGION</div>'+
      '<div class="map-region-label map-label-east">KANTO</div><svg class="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+paths+'</svg>'+nodes+
      '</div><p class="map-disclaimer">'+(selected==="memory"?"LINES REPRESENT SHARED ARCHIVE REFERENCES, NOT ROADS OR ROUTES.":"SCHEMATIC PLACE INDEX / APPROXIMATE RELATIVE POSITIONS / NOT TO SCALE.")+
      '</p><div class="map-place-list" aria-label="Map location index">'+key+'</div>'+(selected==="trails"?'<div class="map-trail-list">'+trailMarkup()+'</div>':"")+'</section>';
  }
  window.JIHANKI_MAP={render,positions:POSITIONS,trails:TRAILS};
})();