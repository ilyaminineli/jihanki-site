/* M44 — Schematic geography and archive-memory network. Not a surveying or navigation map. */
(function () {
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const POSITIONS={
    "Lake Saiko":[34,46],"Aokigahara":[27,67],"Fuji Five Lakes":[45,25],"Kawaguchiko":[59,50],
    "Lake Kawaguchi":[58,41],"Oishi Park":[52,30],"Kawaguchiko Music Forest Museum":[66,34],
    "Arakurayama Sengen Park":[71,48],"Fujisan Sengen Shrine":[56,64],"Kawaguchiko Nostalgic Toys Museum":[62,42],
    "Kawaguchiko Automobile Museum":[48,62],"Narusawa":[42,68],"Kamo River":[31,9],
    "Mount Fuji":[49,80],"Uno-Misaki Tunnel":[15,49],"Yamanashi":[71,70],"Tokyo":[78,14],
    "Ryugu Cave":[16,19],"Koyodai":[29,31],"Shrine":[63,80],"Shrines":[75,55],
    "Haneda":[79,37],"Shinjuku":[72,25],
    "Katori":[74,55],"Katori Station":[77,43],"Katori Jingu":[79,67],
    "Hard Off Kawaguchiko Store":[76,49],"Nojima Fujiyoshida Store":[73,65],
    "Iyashi no Sato":[23,58],"Fujisan Museum":[68,80],
    "Kyoto":[38,15],"Genko-an":[35,6],"Kinkaku-ji":[34,10],"Japan Kanji Museum & Library":[42,22],"Kanji Museum":[42,22],"Banbutsu Sōzō-bō":[34,23],"Osaka":[17,15],"Osaka Castle":[19,12],"Ueno Castle (Iga-Ueno)":[25,19],"PICA Fuji Saiko":[32,46],"Fujisan Dragon Tower":[82,82],"Tagonoura Minato Park":[82,88],"Fuji City":[85,82],"Tokyo Skytree":[80,18],"Tokyo":[78,14],"Sumida Ward":[84,15]
  };
  const JP_LABELS={
    "Lake Saiko":"西湖","Aokigahara":"青木ヶ原樹海","Fuji Five Lakes":"富士五湖",
    "Kawaguchiko":"河口湖周辺","Lake Kawaguchi":"河口湖","Oishi Park":"大石公園",
    "Kawaguchiko Music Forest Museum":"河口湖音楽と森の美術館","Arakurayama Sengen Park":"新倉山浅間公園",
    "Fujisan Sengen Shrine":"北口本宮冨士浅間神社","Kawaguchiko Nostalgic Toys Museum":"懐かし玩具館",
    "Kawaguchiko Automobile Museum":"河口湖自動車博物館","Narusawa":"鳴沢村","Kamo River":"鴨川",
    "Mount Fuji":"富士山","Uno-Misaki Tunnel":"名称不詳トンネル","Yamanashi":"山梨県","Tokyo":"東京",
    "Ryugu Cave":"竜宮洞穴","Koyodai":"紅葉台","Shrine":"神社","Shrines":"神社群",
    "Haneda":"羽田","Shinjuku":"新宿","Katori":"香取","Katori Station":"香取駅","Katori Jingu":"香取神宮",
    "Hard Off Kawaguchiko Store":"ハードオフ河口湖店","Nojima Fujiyoshida Store":"ノジマ富士吉田店",
    "Iyashi no Sato":"西湖いやしの里根場","Fujisan Museum":"富士山ミュージアム",
    "Kyoto":"京都","Genko-an":"源光庵","Kinkaku-ji":"金閣寺",
    "Japan Kanji Museum & Library":"漢字ミュージアム","Kanji Museum":"漢字ミュージアム",
    "Banbutsu Sōzō-bō":"万物創造房","Osaka":"大阪","Osaka Castle":"大阪城",
    "Ueno Castle (Iga-Ueno)":"伊賀上野城","PICA Fuji Saiko":"PICA富士西湖",
    "Fujisan Dragon Tower":"富士山ドラゴンタワー","Tagonoura Minato Park":"田子の浦みなと公園",
    "Fuji City":"富士市","Shizuoka":"静岡県","Tokyo Skytree":"東京スカイツリー","Sumida Ward":"墨田区",
    "Iga-Ueno":"伊賀上野","Iga City":"伊賀市","Mie":"三重県",
    "Sheremetyevo":"シェレメーチエヴォ","Moscow":"モスクワ"
  };
  const labelFor=name=>JP_LABELS[name]||name;
  function associationLines(places){
    const edges=new Set();
    (window.JIHANKI_ARCHIVE||[]).forEach(item=>{
      const locations=(window.JIHANKI_GEOGRAPHY?.locations(item)||[]).filter(place=>places.includes(place)&&POSITIONS[place]);
      if(locations.length<2)return;
      for(let i=1;i<locations.length;i++)edges.add([locations[0],locations[i]].sort().join("|"));
    });
    return[...edges].map(value=>value.split("|"));
  }

  /* Stable screen-space relaxation keeps dense clusters apart without implying
     that the schematic positions are surveyed coordinates. */
  function declutter(places){
    const width=760,height=420,minGap=28;
    const nodes=places.map(place=>{
      const anchor=POSITIONS[place.name];
      return{name:place.name,x:anchor[0],y:anchor[1],anchorX:anchor[0],anchorY:anchor[1]};
    });
    for(let pass=0;pass<240;pass++){
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const a=nodes[i],b=nodes[j];
          let dx=(a.x-b.x)*width/100,dy=(a.y-b.y)*height/100;
          let distance=Math.hypot(dx,dy);
          if(distance>=minGap)continue;
          if(distance<0.01){
            const angle=((i+1)*37+(j+1)*19)*Math.PI/180;
            dx=Math.cos(angle)*0.01;dy=Math.sin(angle)*0.01;distance=0.01;
          }
          const push=(minGap-distance)*0.48,ux=dx/distance,uy=dy/distance;
          a.x+=ux*push*100/width;a.y+=uy*push*100/height;
          b.x-=ux*push*100/width;b.y-=uy*push*100/height;
        }
      }
      nodes.forEach(node=>{
        node.x+=(node.anchorX-node.x)*0.012;
        node.y+=(node.anchorY-node.y)*0.012;
        node.x=Math.max(2,Math.min(98,node.x));
        node.y=Math.max(5,Math.min(95,node.y));
      });
    }
    return Object.fromEntries(nodes.map(node=>[node.name,[node.x,node.y]]));
  }
  const TRAILS=[{id:"kansai-road-loop",title:"KAWAGUCHIKO / KYOTO / OSAKA / KAWAGUCHIKO",stops:["Kawaguchiko","Kyoto","Osaka","Kawaguchiko"],description:"A confirmed car journey from Kawaguchiko to Kyoto and Osaka, returning to Kawaguchiko. A regional memory trail, not a reconstructed road route."}];
  function trailMarkup(){
    return TRAILS.map(trail=>'<article class="map-trail-card"><span class="map-eyebrow">CONFIRMED / CAR JOURNEY</span><strong>'+esc(trail.title)+'</strong><p>'+esc(trail.description)+'</p><div class="map-trail-stops">'+trail.stops.map((name,index)=>'<button type="button" data-map-place="'+esc(name)+'"><span>'+String(index+1).padStart(2,"0")+'</span><strong>'+esc(name)+'</strong></button>').join("")+'</div><button type="button" class="map-trail-open" data-map-trail-note="daily-2026-08-road-trip">OPEN JOURNEY NOTE ↗</button></article>').join("");
  }
  const PIN_REFERENCES=[
    {label:"River fork / stepping-stone spot",detail:"Forwarded caption: “the river seems to split here; you can run over the stones.” Proper place name is not included in the export.",source:"Caption from Lera’s forwarded 28 July message",url:"https://maps.app.goo.gl/7BkvvvGWqwyns6Tr6",status:"caption-derived label"},
    {label:"Small moss-and-greenery temple",detail:"Forwarded caption describes a small temple with abundant greenery and moss. Proper place name is not included in the export.",source:"Caption from Lera’s forwarded 28 July message",url:"https://maps.app.goo.gl/hgUVYaz56wiCcFx88",status:"caption-derived label"},
    {label:"High viewpoint / climb",detail:"Forwarded caption: “if you want to climb high”. The exact hill or viewpoint name is absent.",source:"Caption from Lera’s forwarded 28 July message",url:"https://maps.app.goo.gl/QU3n2yq2Vv9hvqSaA",status:"caption-derived label"},
    {label:"Temple with furin wind chimes",detail:"Forwarded caption identifies a temple with furin (wind chimes), but gives no official name.",source:"Caption from Lera’s forwarded 28 July message",url:"https://maps.app.goo.gl/ZANj2HHwnuK8NXv98",status:"caption-derived label"},
    {label:"Unlabelled source pin 01",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / useful geo points",url:"https://maps.app.goo.gl/nzSTNoQn3DDkDr319",status:"name not present in source"},
    {label:"Unlabelled source pin 02",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / useful geo points",url:"https://maps.app.goo.gl/NxffYw2xwQnp7BBHA",status:"name not present in source"},
    {label:"Unlabelled source pin 03",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / useful geo points",url:"https://maps.app.goo.gl/CCM7rNVE1hp3TGJm8",status:"name not present in source"},
    {label:"Unlabelled source pin 04",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / useful geo points",url:"https://maps.app.goo.gl/GL1wpqxcX4yaGzUM9",status:"name not present in source"},
    {label:"Unlabelled source pin 05",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / useful geo points",url:"https://maps.app.goo.gl/LBdQVHSo63f8sj7F8",status:"name not present in source"},
    {label:"Unlabelled source pin 06",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / useful geo points",url:"https://maps.app.goo.gl/bbrmvkJqbakeac5c8",status:"name not present in source"},
    {label:"Unlabelled source pin 07",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / follow-up pins",url:"https://maps.app.goo.gl/ACqCythj3BHYuKWm9",status:"name not present in source"},
    {label:"Unlabelled source pin 08",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / follow-up pins",url:"https://maps.app.goo.gl/JwRkUPw8KZGsKcCj9",status:"name not present in source"},
    {label:"Unlabelled source pin 09",detail:"The same short link was posted twice; it is retained here as one unique reference.",source:"20 July / follow-up pins",url:"https://maps.app.goo.gl/saWMYR4qqtfnxDwH9",status:"name not present in source"},
    {label:"Unlabelled source pin 10",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / follow-up pins",url:"https://maps.app.goo.gl/tmFYzaggYucgoJGi9",status:"name not present in source"},
    {label:"Unlabelled source pin 11",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / later pins",url:"https://maps.app.goo.gl/mqtdWfEqJyiyERo96",status:"name not present in source"},
    {label:"Unlabelled source pin 12",detail:"The 20 July export includes only a Google Maps short link; no place name or caption is present.",source:"20 July / later pins",url:"https://maps.app.goo.gl/QAQmrA2nJrF9uDhH7?g_st=it",status:"name not present in source"}
  ];
  function pinsMarkup(){
    return '<div class="map-pin-reference-intro"><span class="map-eyebrow">SOURCE-LINK REGISTER / 20–31 JUL 2026</span><p>Captioned pins have descriptive labels. The original short links are preserved below. Pins with no source caption remain individually numbered and are not given invented place names.</p><button type="button" class="map-trail-open" data-map-pin-note="daily-2026-07-31-map-pins">OPEN COMPLETE FIELD NOTE ↗</button></div>'+
      PIN_REFERENCES.map((pin,index)=>'<article class="map-pin-reference"><div><span class="map-eyebrow">'+String(index+1).padStart(2,"0")+' / '+esc(pin.source)+'</span><strong>'+esc(pin.label)+'</strong><small>'+esc(pin.status)+'</small><p>'+esc(pin.detail)+'</p></div><a href="'+esc(pin.url)+'" target="_blank" rel="noopener noreferrer">OPEN ORIGINAL MAP PIN ↗</a></article>').join("");
  }
  function render(mode){
    const selected=mode==="memory"?"memory":mode==="trails"?"trails":mode==="pins"?"pins":"geography";
    const places=(window.JIHANKI_GEOGRAPHY?.places()||[]).filter(place=>POSITIONS[place.name]).sort((a,b)=>b.count-a.count);
    const names=places.map(place=>place.name);
    const mapPlaces=selected==="trails"?["Kawaguchiko","Kyoto","Osaka"].map(name=>places.find(place=>place.name===name)).filter(Boolean):selected==="pins"?[]:places;
    const layout=declutter(mapPlaces);
    const point=name=>layout[name]||POSITIONS[name];
    const connections=selected==="memory"?associationLines(names):selected==="trails"?TRAILS.flatMap(trail=>trail.stops.slice(1).map((stop,index)=>[trail.stops[index],stop])):[];
    const paths=connections.map(([a,b])=>{
      const p=point(a),q=point(b);return'<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'"></line>';
    }).join("");
    const nodes=mapPlaces.map((place,index)=>{
      const p=point(place.name),number=String(index+1).padStart(2,"0");
      return'<button class="map-pin" style="left:'+p[0]+'%;top:'+p[1]+'%" type="button" data-map-place="'+esc(place.name)+
        '" aria-label="Open '+esc(place.name)+' archive location" title="'+esc(place.name)+'"><span class="map-pin-index">'+number+
        '</span><span class="map-pin-dot" aria-hidden="true"></span><strong>'+esc(labelFor(place.name))+'</strong><small>'+place.count+' 件</small></button>';
    }).join("");
    const key=mapPlaces.map((place,index)=>'<button type="button" data-map-place="'+esc(place.name)+'"><span>'+
      String(index+1).padStart(2,"0")+'</span><strong>'+esc(labelFor(place.name))+'</strong><small>'+place.count+' 件</small></button>').join("");
    return'<section class="memory-map-panel"><div class="map-toolbar"><div><span class="map-eyebrow">JHK / 地理の記憶</span><strong>'+
      (selected==="memory"?"記憶ネットワーク":selected==="trails"?"旅の道筋":selected==="pins"?"地図ピン":"地域索引")+'</strong></div><div class="map-mode-switch"><button type="button" data-map-mode="geography" '+
      (selected==="geography"?'aria-pressed="true"':"")+' >場所</button><button type="button" data-map-mode="memory" '+
      (selected==="memory"?'aria-pressed="true"':"")+' >記憶</button><button type="button" data-map-mode="trails" '+(selected==="trails"?'aria-pressed="true"':"")+' >道筋</button><button type="button" data-map-mode="pins" '+(selected==="pins"?'aria-pressed="true"':"")+' >ピン</button></div></div>'+(selected==="pins"?'<div class="map-pin-references">'+pinsMarkup()+'</div>':'<div class="map-canvas '+
      (selected==="memory"?"map-memory-mode":selected==="trails"?"map-trails-mode":"map-place-mode")+'"><div class="map-pan-layer"><div class="map-region-label map-label-west">富士山周辺</div>'+
      '<div class="map-region-label map-label-east">関東</div><svg class="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+paths+'</svg>'+nodes+
      '</div></div><p class="map-disclaimer">'+(selected==="memory"?"線は共通する記録のつながりを示します。道路や移動経路ではありません。":"模式図／おおよその位置関係／縮尺なし。")+
      '</p><div class="map-place-list" aria-label="地名一覧">'+key+'</div>'+(selected==="trails"?'<div class="map-trail-list">'+trailMarkup()+'</div>':"")+'</div>')+'</section>';
  }
  function bind(root){
    const canvas=root?.querySelector?.(".map-canvas"),layer=canvas?.querySelector?.(".map-pan-layer");
    if(!canvas||!layer||canvas.dataset.panBound==="true")return;
    canvas.dataset.panBound="true";let active=null;
    const read=()=>({x:Number(layer.dataset.panX||0),y:Number(layer.dataset.panY||0)});
    const write=(x,y)=>{layer.dataset.panX=String(x);layer.dataset.panY=String(y);layer.style.transform="translate3d("+x+"px,"+y+"px,0)";};
    canvas.addEventListener("pointerdown",event=>{if(event.target.closest("button,a"))return;if(event.pointerType==="mouse"&&event.button!==0)return;
      const p=read();active={id:event.pointerId,x:event.clientX,y:event.clientY,px:p.x,py:p.y};canvas.setPointerCapture?.(event.pointerId);layer.classList.add("is-dragging");event.preventDefault();});
    canvas.addEventListener("pointermove",event=>{if(!active||event.pointerId!==active.id)return;const dx=event.clientX-active.x,dy=event.clientY-active.y;
      const minX=Math.min(0,canvas.clientWidth-layer.offsetWidth),minY=Math.min(0,canvas.clientHeight-layer.offsetHeight);
      write(Math.max(minX,Math.min(0,active.px+dx)),Math.max(minY,Math.min(0,active.py+dy)));});
    const finish=event=>{if(active&&event.pointerId===active.id){active=null;layer.classList.remove("is-dragging");}};
    canvas.addEventListener("pointerup",finish);canvas.addEventListener("pointercancel",finish);canvas.addEventListener("lostpointercapture",finish);
  }
  window.JIHANKI_MAP={render,bind,positions:POSITIONS,trails:TRAILS,pinReferences:PIN_REFERENCES};
})();