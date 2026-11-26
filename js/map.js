/* M44 — Schematic geography and archive-memory network. Not a surveying or navigation map. */
(function () {
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const POSITIONS={
    "Lake Saiko":[37,43],"Aokigahara":[30,64],"Fuji Five Lakes":[52,26],"Kawaguchiko":[65,45],
    "Mount Fuji":[52,72],"Uno-Misaki Tunnel":[16,43],"Yamanashi":[78,66],"Tokyo":[89,18],
    "Ryugu Cave":[19,16],"Koyodai":[28,25],"Shrine":[65,68],"Shrines":[67,58],"Haneda":[95,29],"Shinjuku":[87,23]
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
  function render(mode){
    const selected=mode==="memory"?"memory":"geography";
    const places=(window.JIHANKI_GEOGRAPHY?.places()||[]).filter(place=>POSITIONS[place.name]).sort((a,b)=>b.count-a.count),names=places.map(place=>place.name);
    const paths=(selected==="memory"?associationLines(names):[]).map(([a,b])=>{
      const p=POSITIONS[a],q=POSITIONS[b];return'<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'"></line>';
    }).join("");
    const nodes=places.map(place=>{
      const p=POSITIONS[place.name];return'<button class="map-pin" style="left:'+p[0]+'%;top:'+p[1]+'%" type="button" data-map-place="'+esc(place.name)+'">'+
        '<span class="map-pin-dot"></span><strong>'+esc(place.name)+'</strong><small>'+place.count+' RECORDS</small></button>';
    }).join("");
    return'<section class="memory-map-panel"><div class="map-toolbar"><div><span class="map-eyebrow">JHK / GEOGRAPHIC MEMORY</span><strong>'+
      (selected==="memory"?"MEMORY NETWORK":"REGIONAL INDEX")+'</strong></div><div class="map-mode-switch"><button type="button" data-map-mode="geography" '+
      (selected==="geography"?'aria-pressed="true"':"")+' >PLACE</button><button type="button" data-map-mode="memory" '+
      (selected==="memory"?'aria-pressed="true"':"")+' >MEMORY</button></div></div><div class="map-canvas '+
      (selected==="memory"?"map-memory-mode":"map-place-mode")+'"><div class="map-region-label map-label-west">FUJI REGION</div>'+
      '<div class="map-region-label map-label-east">KANTO</div><svg class="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+paths+'</svg>'+nodes+
      '</div><p class="map-disclaimer">'+(selected==="memory"?"LINES REPRESENT SHARED ARCHIVE REFERENCES, NOT ROADS OR ROUTES.":"SCHEMATIC PLACE INDEX / APPROXIMATE RELATIVE POSITIONS / NOT TO SCALE.")+
      '</p><div class="map-place-list">'+places.map(place=>'<button type="button" data-map-place="'+esc(place.name)+'">'+esc(place.name)+' <small>'+place.count+'</small></button>').join("")+
      '</div></section>';
  }
  window.JIHANKI_MAP={render,positions:POSITIONS};
})();