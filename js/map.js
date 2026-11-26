/* M44 — Schematic geography and archive-memory network. Not a surveying or navigation map. */
(function () {
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const POSITIONS={
    "Lake Saiko":[37,43],"Aokigahara":[30,64],"Fuji Five Lakes":[52,26],"Kawaguchiko":[64,45],
    "Mount Fuji":[50,78],"Uno-Misaki Tunnel":[15,45],"Yamanashi":[77,68],"Tokyo":[86,10],
    "Ryugu Cave":[18,15],"Koyodai":[30,25],"Shrine":[66,78],"Shrines":[73,59],
    "Haneda":[91,34],"Shinjuku":[76,20]
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
    const places=(window.JIHANKI_GEOGRAPHY?.places()||[]).filter(place=>POSITIONS[place.name]).sort((a,b)=>b.count-a.count);
    const names=places.map(place=>place.name);
    const paths=(selected==="memory"?associationLines(names):[]).map(([a,b])=>{
      const p=POSITIONS[a],q=POSITIONS[b];return'<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'"></line>';
    }).join("");
    const nodes=places.map((place,index)=>{
      const p=POSITIONS[place.name],number=String(index+1).padStart(2,"0");
      return'<button class="map-pin" style="left:'+p[0]+'%;top:'+p[1]+'%" type="button" data-map-place="'+esc(place.name)+
        '" aria-label="Open '+esc(place.name)+' archive location" title="'+esc(place.name)+'"><span class="map-pin-index">'+number+
        '</span><span class="map-pin-dot" aria-hidden="true"></span><strong>'+esc(place.name)+'</strong><small>'+place.count+' RECORDS</small></button>';
    }).join("");
    const key=places.map((place,index)=>'<button type="button" data-map-place="'+esc(place.name)+'"><span>'+
      String(index+1).padStart(2,"0")+'</span><strong>'+esc(place.name)+'</strong><small>'+place.count+' RECORDS</small></button>').join("");
    return'<section class="memory-map-panel"><div class="map-toolbar"><div><span class="map-eyebrow">JHK / GEOGRAPHIC MEMORY</span><strong>'+
      (selected==="memory"?"MEMORY NETWORK":"REGIONAL INDEX")+'</strong></div><div class="map-mode-switch"><button type="button" data-map-mode="geography" '+
      (selected==="geography"?'aria-pressed="true"':"")+' >PLACE</button><button type="button" data-map-mode="memory" '+
      (selected==="memory"?'aria-pressed="true"':"")+' >MEMORY</button></div></div><div class="map-canvas '+
      (selected==="memory"?"map-memory-mode":"map-place-mode")+'"><div class="map-region-label map-label-west">FUJI REGION</div>'+
      '<div class="map-region-label map-label-east">KANTO</div><svg class="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+paths+'</svg>'+nodes+
      '</div><p class="map-disclaimer">'+(selected==="memory"?"LINES REPRESENT SHARED ARCHIVE REFERENCES, NOT ROADS OR ROUTES.":"SCHEMATIC PLACE INDEX / APPROXIMATE RELATIVE POSITIONS / NOT TO SCALE.")+
      '</p><div class="map-place-list" aria-label="Map location index">'+key+'</div></section>';
  }
  window.JIHANKI_MAP={render,positions:POSITIONS};
})();