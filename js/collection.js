/* M46 — Local collection and uniquely serialized memory objects. No visitor data is transmitted. */
(function () {
  const KEY = "jihanki.collection.v1", OBJECTS_KEY = "jihanki.collectibles.v1";
  let memory = [], objectMemory = [], storageAvailable = true;
  const STAMPS = {
    video:"MOVING IMAGE / ARCHIVE",photo:"LIGHT TRACE / ARCHIVE",utau:"VOICE TRACE / ARCHIVE",
    text:"PAPER TRACE / ARCHIVE",notes:"FIELD NOTE / ARCHIVE",music:"SOUND OBJECT / ARCHIVE",
    sound:"FIELD SOUND / ARCHIVE",performance:"GESTURE / ARCHIVE"
  };
  const LINES = [
    "A place remains after the journey.","This fragment was returned by the machine.",
    "The archive remembers imperfectly.","A small object from a larger memory.",
    "Nothing here is quite finished.","The signal survived the distance."
  ];
  const esc = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  function read() { try { const raw=localStorage.getItem(KEY); if(raw==null)return memory.slice(); const parsed=JSON.parse(raw); return Array.isArray(parsed)?parsed:[]; } catch(_){storageAvailable=false;return memory.slice();} }
  function readObjects() { try { const raw=localStorage.getItem(OBJECTS_KEY); if(raw==null)return objectMemory.slice(); const parsed=JSON.parse(raw); return Array.isArray(parsed)?parsed:[]; } catch(_){storageAvailable=false;return objectMemory.slice();} }
  function write(records) { memory=records.slice(); try{localStorage.setItem(KEY,JSON.stringify(memory));storageAvailable=true;return true;}catch(_){storageAvailable=false;return false;} }
  function writeObjects(records) { objectMemory=records.slice(); try{localStorage.setItem(OBJECTS_KEY,JSON.stringify(objectMemory));storageAvailable=true;return true;}catch(_){storageAvailable=false;return false;} }
  function all() { return read().slice().sort((a,b)=>String(b.lastCollectedAt||"").localeCompare(String(a.lastCollectedAt||""))); }
  function objects() { return readObjects().slice().sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||""))); }
  function createObject(item, receipt) {
    const category=item.machineCategory||item.category||item.type||"archive";
    const code=receipt?.code||("LOCAL-"+Date.now().toString(36).toUpperCase());
    const hash=Array.from(code).reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,7);
    return {id:"OBJ-"+code,archiveId:item.id,receiptCode:receipt?.code||"",title:item.title||"UNTITLED MEMORY",
      category,stamp:STAMPS[category]||"ARCHIVE FRAGMENT",inscription:LINES[hash%LINES.length],
      serial:String(hash%9999).padStart(4,"0"),createdAt:new Date().toISOString(),archiveDate:item.date||"UNDATED"};
  }
  function addFieldPass(definition) {
    const slug=String(definition?.id||"").trim().toLowerCase();
    const title=String(definition?.title||"").trim();
    const sourceIds=Array.isArray(definition?.sourceIds)
      ?[...new Set(definition.sourceIds.filter(id=>typeof id==="string"&&/^[a-z0-9][a-z0-9-]{1,79}$/i.test(id)))].slice(0,20):[];
    if(!/^[a-z0-9][a-z0-9-]{2,79}$/.test(slug)||!title||!sourceIds.length)
      throw new Error("A field impression needs a stable ID, title and source fragments.");
    const id="OBJ-FIELD-"+slug.toUpperCase(),archiveId="field-impression:"+slug;
    const existing=objects().find(object=>object.id===id);
    if(existing)return {object:existing,created:false};
    const object={
      id,archiveId,receiptCode:"",title,category:"field-impression",
      stamp:String(definition.stamp||"FIELD IMPRESSION").slice(0,100),
      inscription:String(definition.inscription||"A fragment encountered in the archive.").slice(0,240),
      serial:String(definition.serial||"LOCAL FIELD").slice(0,40),
      createdAt:new Date().toISOString(),archiveDate:String(definition.archiveDate||"UNDATED").slice(0,40),
      kind:"field-impression",sourceIds
    };
    writeObjects([...readObjects(),object].slice(-1000));
    window.JIHANKI_EVENTS?.record("field-impression-awarded",{impressionId:slug,sourceIds});
    return {object,created:true};
  }
  function add(item,receipt) {
    if(!item?.id)return null;
    const records=read(); let record=records.find(entry=>entry.id===item.id); const now=new Date().toISOString();
    if(!record) {
      record={id:item.id,title:item.title||"UNTITLED",date:item.date||"UNDATED",type:item.type||"text",
        category:item.machineCategory||item.category||item.type||"archive",author:item.author||"ARCHIVE",group:item.group||"",
        file:item.file||"",image:item.image||"",projectPath:item.projectPath||"",voices:Array.isArray(item.voices)?item.voices.slice():[],
        stock:item.stock?{...item.stock}:{status:"available",quantity:null},
        metadata:item.metadata?{...item.metadata,locations:[...(item.metadata.locations||[])],related:[...(item.metadata.related||[])]}:{locations:[],related:[]},
        firstCollectedAt:now,lastCollectedAt:now,purchaseCount:0,receiptCodes:[]};
      records.push(record);
    }
    record.title=item.title||record.title; record.lastCollectedAt=now; record.purchaseCount=Number(record.purchaseCount||0)+1;
    if(!Array.isArray(record.receiptCodes))record.receiptCodes=[];
    if(receipt?.code&&!record.receiptCodes.includes(receipt.code))record.receiptCodes.push(receipt.code);
    record.receiptCodes=record.receiptCodes.slice(-100); write(records);
    const souvenirs=readObjects();
    if(receipt?.code&&!souvenirs.some(object=>object.receiptCode===receipt.code))writeObjects([...souvenirs,createObject(item,receipt)].slice(-1000));
    window.JIHANKI_EVENTS?.record("collection-added",{itemId:item.id,purchaseCount:record.purchaseCount,receipt:receipt?.code||null,persistent:storageAvailable});
    return record;
  }
  function resolve(record) { if(!record)return null; return (window.JIHANKI_ARCHIVE||[]).find(item=>item.id===record.id)||record; }
  function objectFor(archiveId,receiptCode) { const list=objects(); return (receiptCode&&list.find(object=>object.receiptCode===receiptCode))||list.find(object=>object.archiveId===archiveId)||null; }
  function objectMarkup(archiveId,receiptCode) {
    const object=objectFor(archiveId,receiptCode); if(!object)return "";
    return '<section class="collectible-object" aria-label="Collected memory object"><div class="collectible-top"><span>自販機 / JIHANKI</span><span>'+esc(object.stamp)+'</span></div>'+
      '<div class="collectible-title">'+esc(object.title)+'</div><div class="collectible-inscription">“'+esc(object.inscription)+'”</div>'+
      '<div class="collectible-bottom"><span>ARCHIVE '+esc(object.archiveDate)+'</span><strong>NO. '+esc(object.serial)+'</strong></div>'+
      '<button type="button" data-collectible-download="'+esc(object.id)+'">SAVE MEMORY OBJECT</button></section>';
  }
  function downloadObject(id) {
    const object=objects().find(entry=>entry.id===id); if(!object)return false;
    const content=["自販機 / JIHANKI",object.stamp,object.title,"",object.inscription,"",
      "ARCHIVE DATE: "+object.archiveDate,"SERIAL: "+object.serial,"OBJECT: "+object.id,"RECEIPT: "+object.receiptCode].join("\n");
    const blob=new Blob([content],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=object.id.toLowerCase()+".txt";document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    window.JIHANKI_EVENTS?.record("collectible-exported",{objectId:id});return true;
  }
  function count(){return all().length;}
  function totalPurchases(){return all().reduce((sum,record)=>sum+Number(record.purchaseCount||0),0);}
  function clear(){
    write([]);writeObjects([]);
    try{localStorage.removeItem(KEY);localStorage.removeItem(OBJECTS_KEY);}catch(_){storageAvailable=false;}
    window.JIHANKI_EVENTS?.record("collection-cleared",{});return true;
  }
  function exportFile(){
    const records=all(),souvenirs=objects();
    const payload={format:"JIHANKI-COLLECTION",version:2,exportedAt:new Date().toISOString(),records,objects:souvenirs};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="jihanki-collection-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    window.JIHANKI_EVENTS?.record("collection-exported",{records:records.length,objects:souvenirs.length});return records.length;
  }
  function importPayload(payload){
    if(!payload||payload.format!=="JIHANKI-COLLECTION"||![1,2].includes(Number(payload.version))||!Array.isArray(payload.records)||
      payload.records.length>2000||(payload.objects!==undefined&&(!Array.isArray(payload.objects)||payload.objects.length>2000)))
      throw new Error("Unsupported or malformed JIHANKI collection file.");
    if(payload.records.some(record=>!record||typeof record.id!=="string"||!record.id||typeof record.title!=="string"))
      throw new Error("Collection records must have a stable ID and title.");
    const incomingObjects=payload.objects||[];
    if(incomingObjects.some(object=>!object||typeof object.id!=="string"||typeof object.archiveId!=="string"||typeof object.title!=="string"))
      throw new Error("Collectible objects are malformed.");
    const merged=read().map(record=>({...record}));
    payload.records.forEach(record=>{
      const existing=merged.find(entry=>entry.id===record.id);
      if(!existing)merged.push({
        id:record.id,title:record.title,date:String(record.date||"UNDATED"),type:String(record.type||"text"),
        category:String(record.category||"archive"),author:String(record.author||"ARCHIVE"),group:String(record.group||""),
        file:String(record.file||""),image:String(record.image||""),projectPath:String(record.projectPath||""),
        voices:Array.isArray(record.voices)?record.voices.filter(v=>typeof v==="string").slice(0,50):[],
        metadata:{locations:[],related:[]},firstCollectedAt:String(record.firstCollectedAt||new Date().toISOString()),
        lastCollectedAt:String(record.lastCollectedAt||new Date().toISOString()),purchaseCount:Math.max(0,Number(record.purchaseCount||0)),
        receiptCodes:Array.isArray(record.receiptCodes)?record.receiptCodes.filter(v=>typeof v==="string").slice(-100):[]
      });
      else {
        existing.purchaseCount=Math.max(Number(existing.purchaseCount||0),Number(record.purchaseCount||0));
        existing.lastCollectedAt=[existing.lastCollectedAt,record.lastCollectedAt].filter(Boolean).sort().at(-1)||existing.lastCollectedAt;
        existing.receiptCodes=[...new Set([...(existing.receiptCodes||[]),...(record.receiptCodes||[])])].slice(-100);
      }
    });
    const mergedObjects=readObjects(),seen=new Set(mergedObjects.map(object=>object.id));
    incomingObjects.forEach(object=>{
      if(seen.has(object.id))return;
      mergedObjects.push({id:object.id,archiveId:object.archiveId,receiptCode:String(object.receiptCode||""),title:object.title,
        category:String(object.category||"archive"),stamp:String(object.stamp||"ARCHIVE FRAGMENT"),inscription:String(object.inscription||""),
        serial:String(object.serial||"0000"),createdAt:String(object.createdAt||new Date().toISOString()),archiveDate:String(object.archiveDate||"UNDATED"),
        ...(object.kind==="field-impression"?{kind:"field-impression",sourceIds:Array.isArray(object.sourceIds)?object.sourceIds.filter(id=>typeof id==="string").slice(0,20):[]}:{})});
      seen.add(object.id);
    });
    if(merged.length>3000||mergedObjects.length>3000)throw new Error("The imported collection exceeds the supported size.");
    write(merged);writeObjects(mergedObjects);
    window.JIHANKI_EVENTS?.record("collection-imported",{records:payload.records.length,objects:incomingObjects.length});
    return {records:payload.records.length,objects:incomingObjects.length};
  }
  async function importFile(file){
    if(!file)throw new Error("No collection file selected.");
    let payload;try{payload=JSON.parse(await file.text());}catch(_){throw new Error("The selected file is not valid JSON.");}
    return importPayload(payload);
  }
  window.JIHANKI_COLLECTION={all,objects,add,addFieldPass,resolve,objectFor,objectMarkup,downloadObject,importFile,importPayload,count,totalPurchases,clear,exportFile,
    storageAvailable(){return storageAvailable;},contains(id){return all().some(record=>record.id===id);}};
})();