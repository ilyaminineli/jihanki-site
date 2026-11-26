import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".md":"text/markdown; charset=utf-8",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",
  ".opus":"audio/ogg",".wav":"audio/wav",".ogg":"audio/ogg",".mp3":"audio/mpeg",".mp4":"video/mp4"};
function assert(value,message){if(!value)throw new Error(message);}
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    const relative=path.normalize(pathname.replace(/^\/+/,""));
    let target=path.resolve(ROOT,relative||".");
    if(target!==ROOT&&!target.startsWith(ROOT+path.sep)){res.writeHead(403);res.end("Forbidden");return;}
    if((await stat(target)).isDirectory())target=path.join(target,"index.html");
    const body=await readFile(target);
    res.writeHead(200,{"content-type":TYPES[path.extname(target).toLowerCase()]||"application/octet-stream",
      "content-length":body.length,"cache-control":"no-cache"});res.end(body);
  }catch(_){res.writeHead(404);res.end("Not found");}
});
await new Promise(resolve=>server.listen(0,"0.0.0.0",resolve));
const BASE="http://localhost:"+server.address().port+"/";
let browser;const failures=[];
const devices=[
  {name:"small-phone",width:320,height:640,isMobile:true,hasTouch:true},
  {name:"iphone-se",width:375,height:667,isMobile:true,hasTouch:true},
  {name:"phone-portrait",width:390,height:844,isMobile:true,hasTouch:true},
  {name:"phone-landscape",width:844,height:390,isMobile:true,hasTouch:true},
  {name:"tablet",width:768,height:1024,isMobile:true,hasTouch:true},
  {name:"desktop",width:1365,height:768,isMobile:false,hasTouch:false}
];
try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  for(const device of devices){
    const context=await browser.newContext({viewport:{width:device.width,height:device.height},
      deviceScaleFactor:device.isMobile?2:1,isMobile:device.isMobile,hasTouch:device.hasTouch});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(BASE,{waitUntil:"domcontentloaded"});
    await page.locator("#machine-image").waitFor({state:"attached"});
    await page.waitForFunction(()=>window.JIHANKI_MACHINE&&window.JIHANKI_ARCHIVE?.length>0);
    const geometry=await page.evaluate(()=>{
      const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
      return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
        canvas:box("#viewport"),coin:box("#coin-button"),home:box("#home-button"),products:document.querySelectorAll(".product").length,
        scrollMode:document.documentElement.classList.contains("machine-scroll")};
    });
    assert(geometry.products===8,device.name+": expected eight physical selectors");
    assert(geometry.scrollWidth<=device.width+1,device.name+": horizontal page overflow");
    assert(geometry.canvas.x>=-1&&geometry.canvas.right<=device.width+1,device.name+": machine clipped horizontally");
    assert(geometry.coin.width>=43&&geometry.coin.height>=43,device.name+": COIN hit target too small");
    assert(geometry.home.width>=43&&geometry.home.height>=43,device.name+": HOME hit target too small");
    // M50 is a static catalogue view: every source record appears once in the chronology,
    // while the visitor-local clock is presentation-only and creates no persistent state.
    const localKeysBefore=await page.evaluate(()=>Object.keys(localStorage).sort().join("|"));
    const temporalStats=await page.evaluate(()=>window.JIHANKI_TEMPORAL.stats());
    const sourceCount=await page.evaluate(()=>window.JIHANKI_ARCHIVE.length);
    assert(temporalStats.total===sourceCount,device.name+": temporal archive omitted catalogue records");
    assert(temporalStats.dated+temporalStats.unplaced===temporalStats.total,
      device.name+": temporal date accounting is incomplete");
    await page.locator('[data-home-action="temporal"]').click();
    await page.locator(".temporal-archive").waitFor();
    const temporalView=await page.evaluate(()=>({
      records:document.querySelectorAll(".temporal-year [data-temporal-open],.temporal-unplaced [data-temporal-open]").length,
      phase:document.querySelector(".temporal-now>strong")?.textContent||"",
      localNote:document.querySelector(".temporal-now small")?.textContent||""
    }));
    assert(temporalView.records===temporalStats.total,device.name+": chronology does not expose every record");
    assert(["DAWN","MORNING","AFTERNOON","DAY","EVENING","NIGHT"].includes(temporalView.phase),
      device.name+": visitor-local time phase missing");
    assert(temporalView.localNote.includes("NOT SENT"),device.name+": local-time privacy note missing");
    const localKeysAfter=await page.evaluate(()=>Object.keys(localStorage).sort().join("|"));
    assert(localKeysBefore===localKeysAfter,device.name+": opening temporal archive created persistent visitor state");
    const firstTemporalRecord=page.locator(".temporal-year [data-temporal-open]").first();
    await firstTemporalRecord.waitFor();
    const expectedTemporalTitle=await firstTemporalRecord.locator("strong").textContent();
    await firstTemporalRecord.click();
    await page.locator("#artifact-title, .artifact-title").first().waitFor();
    assert((await page.locator(".artifact-title").textContent()).trim()===expectedTemporalTitle.trim(),
      device.name+": chronology opened a different source memory");
    await page.keyboard.press("Escape");

    await page.locator('[data-home-action="map"]').click();
    await page.locator(".memory-map-panel").waitFor();
    const map=await page.evaluate(()=>{
      const canvas=document.querySelector(".map-canvas"),r=canvas.getBoundingClientRect();
      return{box:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},
        pins:[...document.querySelectorAll(".map-pin")].map(node=>{const p=node.getBoundingClientRect();return{left:p.left,right:p.right,top:p.top,bottom:p.bottom};}),
        keyCount:document.querySelectorAll(".map-place-list button").length,
        modalWidth:document.querySelector(".artifact-window").clientWidth,
        modalScrollWidth:document.querySelector(".artifact-window").scrollWidth};
    });
    assert(map.keyCount>0,device.name+": map key empty");
    assert(map.modalScrollWidth<=map.modalWidth+1,device.name+": map caused horizontal overflow");
    for(const pin of map.pins){
      assert(pin.left>=map.box.left-1&&pin.right<=map.box.right+1,device.name+": map pin outside map width");
      assert(pin.top>=map.box.top-1&&pin.bottom<=map.box.bottom+1,device.name+": map pin outside map height");
    }
    await mkdir(path.join(ROOT,"test-results"),{recursive:true});
    await page.screenshot({path:path.join(ROOT,"test-results","map-"+device.name+".png")});
    await page.locator('[data-map-mode="memory"]').click();
    assert(await page.locator(".map-memory-mode").count()===1,device.name+": memory map mode failed");
    assert(await page.evaluate(()=>document.querySelector("#artifact").contains(document.activeElement)),device.name+": map dialog did not own keyboard focus");
    await page.keyboard.press("Escape");
    assert(await page.locator("#artifact.open").count()===0,device.name+": Escape failed to close map");
    await page.locator('[data-home-action="search"]').click();
    await page.locator("#archive-search-input").fill("Fuji");
    assert(await page.locator("[data-search-open]").count()>0,device.name+": search returned no Fuji records");
    await page.keyboard.press("Escape");
    await page.locator('[data-home-action="personality"]').click();
    assert(await page.locator("#artifact[aria-hidden='false']").count()===1,device.name+": machine memory panel failed");
    await page.keyboard.press("Escape");

    // Populate a local collection fixture, then exercise the private museum through its UI.
    await page.evaluate(()=>{
      const item=window.JIHANKI_ARCHIVE[0];
      window.JIHANKI_COLLECTION.add(item,{code:"MUSEUM-TEST-"+item.id});
    });
    await page.locator('[data-home-action="collection"]').click();
    await page.locator('[data-museum-tab="overview"]').waitFor();
    await page.locator('[data-museum-tab="works"]').click();
    const firstWork=page.locator("[data-museum-open]").first();
    await firstWork.waitFor();
    await firstWork.click();
    await page.locator("[data-museum-keep]").click();
    await page.keyboard.press("Escape");
    await page.locator('[data-home-action="collection"]').click();
    await page.locator('[data-museum-tab="kept"]').click();
    assert(await page.locator("[data-museum-open]").count()===1,device.name+": kept work not visible in museum");
    await page.locator('[data-museum-tab="shelves"]').click();
    await page.locator("#museum-shelf-name").fill("Night journeys");
    await page.locator("[data-museum-create-shelf]").click();
    await page.locator('[data-museum-tab="works"]').click();
    await page.locator("[data-museum-open]").first().click();
    await page.locator("[data-museum-shelf]").selectOption({label:"Night journeys"});
    await page.locator("[data-museum-add-shelf]").click();
    await page.keyboard.press("Escape");
    await page.locator('[data-home-action="collection"]').click();
    await page.locator('[data-museum-tab="shelves"]').click();
    assert(await page.getByText("Night journeys").count()>0,device.name+": custom shelf was not retained");
    await page.locator('[data-museum-tab="care"]').click();
    await page.evaluate(()=>{
      const before=window.JIHANKI_MUSEUM.stats();
      try{window.JIHANKI_MUSEUM.importPayload({format:"JIHANKI-MUSEUM",version:1,kept:["x"],shelves:[{id:"broken"}],trail:[]});}
      catch(_){}
      const after=window.JIHANKI_MUSEUM.stats();
      if(before.kept!==after.kept)throw new Error("Invalid museum backup changed the current museum.");
    });
    await page.keyboard.press("Escape");
    assert(errors.length===0,device.name+": browser errors: "+errors.join(" | "));
    console.log("PASS "+device.name+" "+device.width+"x"+device.height+" / "+map.keyCount+" map locations / "+Math.round(geometry.coin.width)+"px COIN target");
    await context.close();
  }

  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(BASE,{waitUntil:"domcontentloaded"});
  await page.evaluate(async()=>navigator.serviceWorker.ready);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const markdownPath=await page.evaluate(()=>{
    const item=window.JIHANKI_ARCHIVE.find(entry=>typeof entry.file==="string"&&entry.file.endsWith(".md"));
    return item?.file||"documents/notes/first-jihanki.md";
  });
  const online=await page.evaluate(async path=>{
    const response=await fetch(path,{cache:"no-cache"});return{ok:response.ok,length:(await response.text()).length};
  },markdownPath);
  assert(online.ok&&online.length>0,"Markdown failed to load online before offline test");
  await context.setOffline(true);
  const offlineMarkdown=await page.evaluate(async path=>{
    const response=await fetch(path,{cache:"no-store"});return{ok:response.ok,length:(await response.text()).length};
  },markdownPath);
  assert(offlineMarkdown.ok&&offlineMarkdown.length>0,"visited Markdown document unavailable offline");
  const offlineMachine=await page.evaluate(async()=>{
    const response=await fetch("assets/jihanki.png",{cache:"no-store"});return{ok:response.ok,length:(await response.arrayBuffer()).byteLength};
  });
  assert(offlineMachine.ok&&offlineMachine.length>0,"pre-cached machine image unavailable offline");
  await page.reload({waitUntil:"domcontentloaded"});
  assert(await page.locator(".boot-title").textContent()==="JIHANKI","offline navigation failed to recover cached shell");
  assert(errors.length===0,"offline browser errors: "+errors.join(" | "));
  await context.setOffline(false);
  console.log("PASS offline recovery / cached shell, visited Markdown and machine artwork");
  await context.close();
}catch(error){failures.push(error);}
finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
if(failures.length){console.error("RESPONSIVE/OFFLINE TESTS FAILED\n"+failures.map(error=>error.stack||error).join("\n"));process.exitCode=1;}
else console.log("JIHANKI responsive and offline browser checks passed.");
