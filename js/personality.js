/* M45 — A quiet, local machine personality. No account, remote tracking or cross-site identity. */
(function () {
  const KEY="jihanki.personality.v1",LIMIT=24,fresh=()=>({version:1,opened:0,purchases:0,categories:{},recent:[],lastCategory:""});
  let state=fresh();
  function load(){try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved?.version===1)state={...fresh(),...saved,categories:saved.categories||{},recent:Array.isArray(saved.recent)?saved.recent:[]};}catch(_){state=fresh();}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){}}
  function remember(id,category,purchased){
    if(!id)return;state.opened+=1;if(purchased)state.purchases+=1;
    const key=String(category||"archive");state.categories[key]=Number(state.categories[key]||0)+1;state.lastCategory=key;
    state.recent=[id,...state.recent.filter(value=>value!==id)].slice(0,LIMIT);save();
  }
  window.addEventListener("jihanki:event",event=>{
    const detail=event.detail||{};
    const id=detail.detail?.itemId;
    if(detail.type==="memory-dispensed"){
      state.purchases+=1;save();return;
    }
    if(detail.type!=="memory-opened")return;
    const item=(window.JIHANKI_ARCHIVE||[]).find(record=>record.id===id);
    remember(id,item?.machineCategory||item?.category,false);
  });
  function choose(pool,avoidId){
    const candidates=(pool||[]).filter(item=>item&&item.id!==avoidId),list=candidates.length?candidates:(pool||[]);
    if(!list.length)return null;
    const weights=list.map(item=>(state.recent.includes(item.id)?0.55:2.2)/(1+Math.sqrt(Number(state.categories[item.machineCategory||item.category||"archive"]||0))*0.18));
    const total=weights.reduce((sum,value)=>sum+value,0);let cursor=Math.random()*total;
    for(let i=0;i<list.length;i++){cursor-=weights[i];if(cursor<=0)return list[i];}
    return list[list.length-1];
  }
  function homeLine(){
    const hour=new Date().getHours();
    if(hour<5)return "NIGHT CIRCUIT / MEMORY SIGNALS ACTIVE";
    if(state.opened>=16)return "THE MACHINE RECOGNISES YOUR ROUTE";
    if(state.lastCategory&&Number(state.categories[state.lastCategory]||0)>=6)return "A FAMILIAR SIGNAL RETURNS / "+state.lastCategory.toUpperCase();
    if(state.opened>=5)return "SOME FRAGMENTS HAVE BEEN VISITED BEFORE";
    return "SELECT A MEMORY";
  }
  function profile(){const frequent=Object.entries(state.categories).sort((a,b)=>b[1]-a[1])[0];return{opened:state.opened,purchases:state.purchases,recent:state.recent.slice(),frequentCategory:frequent?.[0]||null};}
  load();window.JIHANKI_PERSONALITY={choose,homeLine,profile,reset(){state=fresh();save();}};
})();