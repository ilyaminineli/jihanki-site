/* M44 — Schematic geography and archive-memory network. Not a surveying or navigation map. */
(function () {
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const POSITIONS={
    "Lake Saiko":[34,46],"Aokigahara":[27,67],"Fuji Five Lakes":[45,25],"Kawaguchiko":[59,50],
    "Lake Yamanaka":[76,48],"Lake Shōji":[35,61],"Uno-Misaki Tunnel":[24,55],
    "Onsen Yurari":[44,68],"Akihabara":[84,18],"First summit near Saiko":[30,38],
    "Lake Kawaguchi":[58,41],"Oishi Park":[52,30],"Kawaguchiko Music Forest Museum":[66,34],
    "Arakurayama Sengen Park":[71,48],"Fujisan Sengen Shrine":[56,64],"Kawaguchiko Nostalgic Toys Museum":[62,42],
    "Kawaguchiko Automobile Museum":[48,62],"Narusawa":[42,68],"Kamo River":[31,9],
    "Mount Fuji":[49,80],"Niikura Tunnel":[15,49],"Yamanashi":[71,70],"Tokyo":[78,14],
    "Ryugu Cave":[16,19],"Koyodai":[29,31],"Shrine":[63,80],"Shrines":[75,55],"Haneda":[79,37],"Shinjuku":[72,25],
    "Katori":[74,55],"Katori Station":[77,43],"Katori Jingu":[79,67],"Hard Off Kawaguchiko Store":[76,49],
    "Nojima Fujiyoshida Store":[73,65],"Iyashi no Sato":[23,58],"Fujisan Museum":[68,80],
    "Kyoto":[38,15],"Genko-an":[35,6],"Kinkaku-ji":[34,10],"Japan Kanji Museum & Library":[42,22],
    "Kanji Museum":[42,22],"Banbutsu Sōzō-bō":[34,23],"Osaka":[17,15],"Osaka Castle":[19,12],
    "Odawara Castle":[11,42],"Odawara":[13,46],"Ueno Castle (Iga-Ueno)":[25,19],"Ueno-ebisumachi":[29,24],
    "PICA Fuji Saiko":[32,46],"Fujisan Dragon Tower":[82,82],"Tagonoura Minato Park":[82,88],"Fuji City":[85,82],
    "Satyam 1":[39,35],"Kamikuishiki":[36,42],"Gokodai":[53,23],"Mount Ashiwada":[53,29],
    "Fujikawaguchiko":[59,48],"Fujiyoshida":[67,56],"McDonald’s 139 Fujiyoshida":[67,54],"Mt Fuji Station":[65,62],
    "Otsuki–Fujiyoshida junction":[76,50],"Yokosawa Sabo":[33,61],"Tokyo Skytree":[80,18],"Sumida Ward":[84,15],
    "Fugaku Wind Cave":[25,65],"Mt. Fuji Panoramic Ropeway":[60,41],"Tenjoyama":[62,39],
    "Tagonoura Port":[82,85],"Nagahama":[51,44],"Kadoya Shoten":[49,46],
    "CRYSTA Nagahori":[13,17],"Shinsaibashi":[12,15],
    "Senbon Kitaoji":[35,17],"Kitaoji Shinmachi":[36,20],
    "Demachiyanagi":[43,15],"Sanjo":[40,13],"Otsu":[48,13],
    "Okinawa":[7,88],"Onna":[9,84],"Miyuki Beach":[11,82],
    "Former Kamikuishiki complex":[36,42]
  };
  /* English / romaji remains the primary map vocabulary. Japanese is secondary detail only. */
  const JP_LABELS={
    "Lake Saiko":"西湖","Aokigahara":"青木ヶ原樹海","Fuji Five Lakes":"富士五湖","Kawaguchiko":"河口湖周辺",
    "Lake Yamanaka":"山中湖","Lake Shōji":"精進湖","Uno-Misaki Tunnel":"宇の岬トンネル",
    "Onsen Yurari":"ゆらり","Akihabara":"秋葉原","First summit near Saiko":"西湖近くの最初の山頂",
    "Lake Kawaguchi":"河口湖","Oishi Park":"大石公園","Kawaguchiko Music Forest Museum":"河口湖音楽と森の美術館",
    "Arakurayama Sengen Park":"新倉山浅間公園","Fujisan Sengen Shrine":"北口本宮冨士浅間神社",
    "Kawaguchiko Nostalgic Toys Museum":"懐かし玩具館","Kawaguchiko Automobile Museum":"河口湖自動車博物館",
    "Narusawa":"鳴沢村","Kamo River":"鴨川","Mount Fuji":"富士山","Niikura Tunnel":"新倉河口湖トンネル",
    "Yamanashi":"山梨県","Tokyo":"東京","Ryugu Cave":"竜宮洞穴","Koyodai":"紅葉台","Gokodai":"五湖台",
    "Shrine":"神社","Shrines":"神社群","Haneda":"羽田","Shinjuku":"新宿","Katori":"香取",
    "Katori Station":"香取駅","Katori Jingu":"香取神宮","Hard Off Kawaguchiko Store":"ハードオフ河口湖店",
    "Nojima Fujiyoshida Store":"ノジマ富士吉田店","Iyashi no Sato":"西湖いやしの里根場",
    "Fujisan Museum":"富士山ミュージアム","Kyoto":"京都","Genko-an":"源光庵","Kinkaku-ji":"金閣寺",
    "Japan Kanji Museum & Library":"漢字ミュージアム","Kanji Museum":"漢字ミュージアム",
    "Banbutsu Sōzō-bō":"万物創造房","Osaka":"大阪","Osaka Castle":"大阪城",
    "Odawara Castle":"小田原城","Ueno Castle (Iga-Ueno)":"伊賀上野城","Ueno-ebisumachi":"上野恵美須町",
    "PICA Fuji Saiko":"PICA富士西湖","Fujisan Dragon Tower":"富士山ドラゴンタワー",
    "Tagonoura Minato Park":"田子の浦みなと公園","Fuji City":"富士市","Shizuoka":"静岡県",
    "Tokyo Skytree":"東京スカイツリー","Sumida Ward":"墨田区","Iga-Ueno":"伊賀上野","Iga City":"伊賀市",
    "Mie":"三重県","Satyam 1":"サティヤム1","Kamikuishiki":"上九一色","Mount Ashiwada":"足和田山",
    "McDonald’s 139 Fujiyoshida":"マクドナルド139富士吉田店","Fujiyoshida":"富士吉田","Mt Fuji Station":"富士山駅",
    "Yokosawa Sabo":"横沢砂防堰堤","Odawara":"小田原","Fujikawaguchiko":"富士河口湖町",
    "Fugaku Wind Cave":"富岳風穴","Mt. Fuji Panoramic Ropeway":"富士山パノラマロープウェイ","Tenjoyama":"天上山",
    "Tagonoura Port":"田子の浦港","Nagahama":"長浜","Kadoya Shoten":"かどや商店",
    "CRYSTA Nagahori":"クリスタ長堀","Shinsaibashi":"心斎橋",
    "Senbon Kitaoji":"千本北大路","Kitaoji Shinmachi":"北大路新町",
    "Demachiyanagi":"出町柳","Sanjo":"三条","Otsu":"大津",
    "Miyuki Beach":"みゆきビーチ","Onna":"恩納村","Okinawa":"沖縄"
  };
  const labelFor=name=>name;
  const subLabelFor=name=>JP_LABELS[name]||"";
  // These are named sub-places already represented by a regional anchor on
  // the schematic. Keep them in the full index, but avoid drawing stacked pins.
  const DETAIL_ONLY=new Set([
    "PICA Fuji Saiko","Tagonoura Minato Park","Tokyo Skytree","Sumida Ward","McDonald’s 139 Fujiyoshida","Mt Fuji Station","Otsuki–Fujiyoshida junction","Yokosawa Sabo","Kamikuishiki","Mount Ashiwada","Fujikawaguchiko",
    "Kinkaku-ji","Japan Kanji Museum & Library","Kanji Museum","Banbutsu Sōzō-bō","Tenjoyama","Tagonoura Port","Kadoya Shoten","Shinsaibashi","CRYSTA Nagahori","Kamikuishiki","Senbon Kitaoji","Kitaoji Shinmachi","Demachiyanagi","Sanjo","Otsu","Okinawa","Onna","Miyuki Beach","Onsen Yurari","Akihabara"
  ]);
  function geographicLines(places){
    const names=new Set(places.map(place=>place.name));
    return (window.JIHANKI_RELATIONSHIPS?.placeEdges()||[])
      .filter(edge=>names.has(edge.from)&&names.has(edge.to))
      .map(edge=>({from:edge.from,to:edge.to,kind:edge.kind,label:edge.label}));
  }

  /* Stable screen-space relaxation keeps dense clusters apart without implying
     that the schematic positions are surveyed coordinates. */
  function declutter(places){
    const width=760,height=420,minGap=75;
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
  const TRAILS=window.JIHANKI_RELATIONSHIPS?.trails?.()||[];
  function trailMarkup(){
    return TRAILS.map(trail=>'<article class="map-trail-card"><span class="map-eyebrow">'+esc(trail.mode||trail.kind)+'</span><strong>'+esc(trail.title)+'</strong><p>'+esc(trail.description)+'</p><div class="map-trail-stops">'+
      trail.stops.map((name,index)=>'<button type="button" data-map-place="'+esc(name)+'"><span>'+String(index+1).padStart(2,"0")+'</span><strong>'+esc(labelFor(name))+'</strong></button>').join("")+
      '</div></article>').join("");
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
    const places=(window.JIHANKI_GEOGRAPHY?.places()||[]).filter(place=>POSITIONS[place.name]&&place.name!=="Kanji Museum").sort((a,b)=>b.count-a.count);
    const trailNames=[...new Set(TRAILS.flatMap(trail=>trail.stops))];
    const mapPlaces=selected==="trails"
      ?trailNames.map(name=>places.find(place=>place.name===name)).filter(Boolean)
      :selected==="pins"?[]
      :selected==="memory"?places.filter(place=>!["Kanji Museum"].includes(place.name))
      :places.filter(place=>!DETAIL_ONLY.has(place.name));
    const indexPlaces=selected==="trails"?mapPlaces:places;
    const layout=declutter(mapPlaces);
    const point=name=>layout[name]||POSITIONS[name];
    const connections=selected==="memory"
      ?geographicLines(mapPlaces)
      :selected==="trails"
        ?TRAILS.flatMap(trail=>trail.stops.slice(1).map((stop,index)=>({from:trail.stops[index],to:stop,kind:"chronology",label:trail.kind})))
        :[];
    const paths=connections.map(edge=>{
      const a=point(edge.from),b=point(edge.to);
      if(!a||!b)return "";
      const kind=esc(edge.kind||"within");
      const marker=edge.kind==="chronology"?' marker-end="url(#map-route-arrow)"':"";
      return '<line class="map-edge-'+kind+'" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'"'+marker+'></line>';
    }).join("");
    const nodes=mapPlaces.map(place=>{
      const p=point(place.name),number=String(indexPlaces.indexOf(place)+1).padStart(2,"0");
      const density=place.count>=8?"cluster":place.count>=3?"active":"quiet";
      const jp=subLabelFor(place.name);
      const mobileLabel=jp||place.name;
      const edgeX=p[0]<38?" map-pin-edge-left":p[0]>62?" map-pin-edge-right":"";
      const edgeY=p[1]<10?" map-pin-edge-top":p[1]>90?" map-pin-edge-bottom":"";
      return '<button class="map-pin map-pin-'+density+edgeX+edgeY+'" style="left:'+p[0]+'%;top:'+p[1]+'%" type="button" data-map-place="'+esc(place.name)+
        '" aria-label="Open '+esc(place.name)+' archive location" title="'+esc(place.name)+'"><span class="map-pin-dot" aria-hidden="true"></span>'+
        '<span class="map-pin-copy"><strong>'+esc(place.name)+'</strong>'+(jp?'<small class="map-pin-jp">'+esc(jp)+'</small>':'')+
        '<small class="map-pin-count">'+place.count+' memories</small></span><span class="map-pin-index">'+number+
        '</span><span class="map-pin-mobile-label">'+esc(mobileLabel)+'</span></button>';
    }).join("");
    const key=indexPlaces.map((place,index)=>'<button type="button" data-map-place="'+esc(place.name)+'"><span>'+
      String(index+1).padStart(2,"0")+'</span><strong>'+esc(place.name)+'</strong><small>'+place.count+' memories</small></button>').join("");
    const legend=selected==="memory"
      ?'<span><i class="legend-place"></i> WITHIN / ADMINISTRATIVE AREA</span><span><i class="legend-link"></i> OVERLOOKS / CONNECTED</span><span><i class="legend-transit"></i> TRANSIT CORRIDOR</span><span>PHOTO SEQUENCES ARE RECORD LINKS, NOT GEOGRAPHIC LINES</span>'
      :selected==="trails"
        ?'<span><i class="legend-trail"></i> ORDERED VISIT / TRAVEL SEQUENCE</span><span>SCHEMATIC ORDER ONLY / NOT A GPS ROUTE</span>'
        :'<span><i class="legend-place"></i> PLACE ANCHOR</span><span>JAPANESE LABELS / ARCHIVE LOCATION INDEX</span>';
    return '<section class="memory-map-panel"><div class="map-toolbar"><div><span class="map-eyebrow">JHK / GEOGRAPHIC MEMORY</span><strong>'+
      (selected==="memory"?"GEOGRAPHIC RELATIONS":selected==="trails"?"CHRONOLOGICAL SEQUENCES":selected==="pins"?"SOURCE PINS":"REGIONAL INDEX")+
      '</strong></div><div class="map-mode-switch"><button type="button" data-map-mode="geography" '+(selected==="geography"?'aria-pressed="true"':"")+
      '>PLACE</button><button type="button" data-map-mode="memory" '+(selected==="memory"?'aria-pressed="true"':"")+
      '>RELATIONS</button><button type="button" data-map-mode="trails" '+(selected==="trails"?'aria-pressed="true"':"")+
      '>SEQUENCES</button><button type="button" data-map-mode="pins" '+(selected==="pins"?'aria-pressed="true"':"")+
      '>PINS</button></div></div>'+(selected==="pins"?'<div class="map-pin-references">'+pinsMarkup()+'</div>':
      '<div class="map-legend">'+legend+'</div><div class="map-canvas '+(selected==="memory"?"map-memory-mode":selected==="trails"?"map-trails-mode":"map-place-mode")+
      '"><div class="map-pan-layer"><div class="map-region-label map-label-west">FUJI FIVE LAKES / YAMANASHI</div>'+
      '<div class="map-region-label map-label-east">KANTO / KANSAI / OKINAWA</div><svg class="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+
      '<defs><marker id="map-route-arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 z"></path></marker></defs>'+
      paths+'</svg>'+nodes+'</div></div><p class="map-disclaimer">'+
      (selected==="memory"?"Lines describe named geographical relationships such as containment, outlooks and transit corridors. They are not shared-photo links.":
       selected==="trails"?"Arrows preserve the documented order of visits or travel. They are not measured roads, walking paths or exact transfer itineraries.":
       "SCHEMATIC / RELATIVE POSITION ONLY / NOT TO SCALE.")+
      '</p><div class="map-place-list" aria-label="地名一覧">'+key+'</div>'+(selected==="trails"?'<div class="map-trail-list">'+trailMarkup()+'</div>':""))+
      '</section>';
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