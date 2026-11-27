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
    // Keep request-interception regressions deterministic; the dedicated offline test below
    // uses its own context with service workers enabled.
    const context=await browser.newContext({viewport:{width:device.width,height:device.height},
      deviceScaleFactor:device.isMobile?2:1,isMobile:device.isMobile,hasTouch:device.hasTouch,serviceWorkers:"block"});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(BASE,{waitUntil:"domcontentloaded"});
    await page.locator("#machine-image").waitFor({state:"attached"});
    await page.waitForFunction(()=>window.JIHANKI_MACHINE&&window.JIHANKI_ARCHIVE?.length>0);
    // Random one-off kiosk anomalies can replace the HOME screen between unrelated
    // assertions. Keep this layout/interaction suite deterministic; live behaviour is unchanged.
    await page.evaluate(()=>{if(window.JIHANKI_ANOMALIES)window.JIHANKI_ANOMALIES.maybe=()=>false;});
    const geometry=await page.evaluate(()=>{
      const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
      return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
        canvas:box("#viewport"),coin:box("#coin-button"),home:box("#home-button"),products:document.querySelectorAll(".product").length,
        scale:Number(getComputedStyle(document.documentElement).getPropertyValue("--scale")),
        scrollMode:document.documentElement.classList.contains("machine-scroll")};
    });
    assert(geometry.products===8,device.name+": expected eight physical selectors");
    assert(geometry.scrollWidth<=device.width+1,device.name+": horizontal page overflow");
    assert(geometry.canvas.x>=-1&&geometry.canvas.right<=device.width+1,device.name+": machine clipped horizontally");
    assert(geometry.coin.width>=43&&geometry.coin.height>=43,device.name+": COIN hit target too small");
    assert(geometry.home.width>=43&&geometry.home.height>=43,device.name+": HOME hit target too small");
    const physicalControlStyle=await page.evaluate(()=>{
      return ["coin-button","home-button"].map(id=>{
        const button=document.getElementById(id),style=getComputedStyle(button);
        return {id,border:style.borderTopColor,background:style.backgroundColor,outline:style.outlineStyle,
          hitWidth:button.getBoundingClientRect().width,hitHeight:button.getBoundingClientRect().height};
      });
    });
    assert(physicalControlStyle.every(item=>item.border==="rgba(0, 0, 0, 0)"&&item.background==="rgba(0, 0, 0, 0)"&&item.outline==="none"),
      device.name+": COIN or HOME exposes the rectangular hit-area frame: "+JSON.stringify(physicalControlStyle));
    await page.locator("#coin-button").hover();
    const pointerControlStyle=await page.evaluate(()=>["coin-button","home-button"].map(id=>{
      const style=getComputedStyle(document.getElementById(id));
      return {id,border:style.borderTopColor,background:style.backgroundColor,outline:style.outlineStyle};
    }));
    assert(pointerControlStyle.every(item=>item.border==="rgba(0, 0, 0, 0)"&&item.background==="rgba(0, 0, 0, 0)"&&item.outline==="none"),
      device.name+": pointer hover exposed a COIN or HOME highlight square: "+JSON.stringify(pointerControlStyle));
    const homeHierarchy=await page.evaluate(()=>({
      soundLab:document.querySelector(".home-primary [data-home-action='installation']")?.textContent.trim()||"",
      collection:!!document.querySelector(".home-actions [data-home-action='collection']"),
      map:!!document.querySelector(".home-actions [data-home-action='map']"),
      search:!!document.querySelector(".home-actions [data-home-action='search']"),
      sound:document.querySelector(".home-audio")?.textContent.trim()||"",
      soundButton:!!document.querySelector(".home-audio"),
      chronology:document.querySelector(".home-archive-tools [data-home-action='temporal']")?.textContent.trim()||"",
      machineMemory:!!document.querySelector('[data-home-action="personality"]')
    }));
    assert(homeHierarchy.soundLab.includes("SOUND LAB")&&homeHierarchy.collection&&homeHierarchy.map&&homeHierarchy.search,
      device.name+": main home-screen tools are incomplete");
    assert(await page.locator(".home-primary [data-home-action]").count()===1,
      device.name+": the Sound Lab should be the single audio entry on the home screen");
    assert(await page.locator(".home-primary [data-home-action='listening']").count()===0,
      device.name+": a duplicate Listening Room home button is still present");
    await page.locator(".home-primary [data-home-action='installation']").click();
    await page.locator(".sound-suite").waitFor();
    assert(await page.locator("[data-sound-suite-mode='mix']").getAttribute("aria-selected")==="true",
      device.name+": Sound Lab should open in LIVE MIX mode");
    assert(await page.locator("[data-sound-suite-panel='archive']").isHidden(),
      device.name+": archive listening should start hidden inside the shared panel");
    await page.locator("[data-sound-suite-mode='archive']").click();
    assert(await page.locator("[data-sound-suite-panel='archive']").isVisible(),
      device.name+": archive listening tab did not reveal sequential playback");
    assert(await page.locator("[data-sound-suite-panel='mix']").isHidden(),
      device.name+": live mixer remained visible behind archive listening");
    await page.locator("[data-sound-suite-mode='mix']").click();
    assert(await page.locator("[data-sound-suite-panel='mix']").isVisible(),
      device.name+": LIVE MIX tab did not return to the layered mixer");
    await page.keyboard.press("Escape");
    await page.locator(".home-boot").waitFor();
    assert(homeHierarchy.chronology==="CHRONOLOGY"&&!homeHierarchy.machineMemory,
      device.name+": home-screen archive/memory hierarchy was not simplified");
    assert(homeHierarchy.soundButton&&homeHierarchy.sound.startsWith("SOUND /"),
      device.name+": the labelled ambience / machine-sound switch is missing");
    const soundButtonBox=await page.locator(".home-audio").boundingBox();
    assert(soundButtonBox&&soundButtonBox.width>=55&&soundButtonBox.height>=18,
      device.name+": the sound switch is too small to find or tap");
    const initialMuted=await page.evaluate(()=>window.JIHANKI_AUDIO.isMuted());
    await page.locator(".home-audio").click();
    assert(await page.evaluate(()=>window.JIHANKI_AUDIO.isMuted())!==initialMuted,
      device.name+": sound switch did not toggle ambience and machine effects");
    assert((await page.locator(".home-audio").textContent()).trim()==="SOUND / "+(initialMuted?"ON":"OFF"),
      device.name+": sound switch label did not reflect its state");
    await page.locator(".home-audio").click();
    assert(await page.evaluate(()=>window.JIHANKI_AUDIO.isMuted())===initialMuted,
      device.name+": sound switch could not restore its previous state");
    const wordmarkAudit=await page.evaluate(()=>{
      const word=document.querySelector(".home-boot .boot-japanese").getBoundingClientRect();
      const credit=document.querySelector("#credit-display").getBoundingClientRect();
      const screen=document.querySelector("#screen").getBoundingClientRect();
      return {word:{left:word.left,right:word.right,top:word.top,bottom:word.bottom},
        credit:{left:credit.left,right:credit.right,top:credit.top,bottom:credit.bottom},
        screen:{left:screen.left,right:screen.right}};
    });
    assert(wordmarkAudit.word.left>=wordmarkAudit.screen.left-1&&wordmarkAudit.word.right<=wordmarkAudit.screen.right+1,
      device.name+": 自販機 wordmark extends outside the CRT");
    assert(!(wordmarkAudit.word.right>wordmarkAudit.credit.left&&wordmarkAudit.word.left<wordmarkAudit.credit.right&&
      wordmarkAudit.word.bottom>wordmarkAudit.credit.top&&wordmarkAudit.word.top<wordmarkAudit.credit.bottom),
      device.name+": 自販機 wordmark overlaps the credit counter");
    const widthScale=Math.min(device.width/429,1);
    const fitScale=Math.min(widthScale,device.height/932,1);
    const shouldScroll=(device.width<=560||(device.width>device.height&&device.height<620))&&
      (932*widthScale+24>device.height);
    const expectedScale=shouldScroll?widthScale:fitScale;
    assert(Math.abs(geometry.scale-expectedScale)<0.012,
      device.name+": machine scale is inconsistent with the 429 x 932 coordinate system");
    assert(Math.abs(geometry.canvas.width-429*expectedScale)<2,
      device.name+": rendered machine width does not match the calculated scale");

    // M35: keep failed transaction feedback in the active viewer and preserve credit/selection.
    const transactionId=await page.evaluate(()=>{
      const item=window.JIHANKI_ARCHIVE.find(record=>window.JIHANKI_INVENTORY.isAvailable(record));
      if(!item)throw new Error("No available record for transaction regression test.");
      return item.id;
    });
    const transactionBaseline=await page.evaluate(()=>({
      receipts:window.JIHANKI_RECEIPTS.all().length,
      selected:window.JIHANKI_MACHINE.getState().selectedId
    }));
    await page.evaluate(id=>{
      const item=window.JIHANKI_ARCHIVE.find(record=>record.id===id);
      window.JIHANKI_MACHINE.openItem(item);
    },transactionId);
    await page.locator("#artifact.open [data-action='insert-credit-current']").waitFor();
    assert(await page.evaluate(()=>window.JIHANKI_MACHINE.getState().overlay==="record"),
      device.name+": record viewer did not enter the explicit record-overlay state");
    await page.locator("#artifact.open [data-action='insert-credit-current']").click();
    await page.waitForFunction(()=>window.JIHANKI_MACHINE.getState().credits===1);
    assert(await page.evaluate(()=>window.JIHANKI_MACHINE.getState().transaction.status==="credit-accepted"),
      device.name+": accepted coin was not represented in the transaction state");
    const machineScreenBeforeBlock=await page.locator("#screen-content").innerHTML();
    await page.evaluate(id=>{
      const item=window.JIHANKI_ARCHIVE.find(record=>record.id===id);
      window.__transactionOriginalStock=item.stock?{...item.stock}:null;
      item.stock={...(item.stock||{}),status:"sold-out"};
      window.JIHANKI_MACHINE.purchase(item);
    },transactionId);
    await page.waitForFunction(()=>document.querySelector(".artifact-feedback")?.textContent.includes("SOLD OUT"));
    const blockedTransaction=await page.evaluate(()=>({
      credits:window.JIHANKI_MACHINE.getState().credits,
      selectedId:window.JIHANKI_MACHINE.getState().selectedId,
      receipts:window.JIHANKI_RECEIPTS.all().length,
      blocked:window.JIHANKI_EVENTS.all().some(event=>event.type==="purchase-blocked"&&event.detail?.status==="sold-out")
    }));
    assert(blockedTransaction.credits===1,device.name+": sold-out transaction consumed a credit");
    assert(blockedTransaction.selectedId===transactionId,device.name+": failed transaction lost the selected memory");
    assert(blockedTransaction.receipts===transactionBaseline.receipts&&blockedTransaction.blocked,
      device.name+": failed transaction generated a receipt or omitted its failure event");
    assert(await page.locator("#screen-content").innerHTML()===machineScreenBeforeBlock,
      device.name+": failed transaction replaced the machine screen behind the open viewer");
    await page.evaluate(id=>{
      const item=window.JIHANKI_ARCHIVE.find(record=>record.id===id);
      if(window.__transactionOriginalStock===null)delete item.stock;
      else item.stock=window.__transactionOriginalStock;
      delete window.__transactionOriginalStock;
      window.JIHANKI_MACHINE.openItem(item);
    },transactionId);
    await page.locator("#artifact.open [data-action='purchase-current']").waitFor();
    await page.locator("#artifact.open [data-action='purchase-current']").click();
    await page.locator(".receipt-ticket").waitFor();
    const completedTransaction=await page.evaluate(id=>{
      const events=window.JIHANKI_EVENTS.all().map(event=>event.type);
      return{
        credits:window.JIHANKI_MACHINE.getState().credits,
        selectedId:window.JIHANKI_MACHINE.getState().selectedId,
        overlay:window.JIHANKI_MACHINE.getState().overlay,
        transaction:window.JIHANKI_MACHINE.getState().transaction,
        receiptCount:window.JIHANKI_RECEIPTS.all().length,
        collected:window.JIHANKI_COLLECTION.contains(id),
        order:["coin-accepted","receipt-generated","collection-added","memory-dispensed"].map(type=>events.lastIndexOf(type))
      };
    },transactionId);
    assert(completedTransaction.credits===0&&completedTransaction.selectedId===transactionId,
      device.name+": successful dispense left an inconsistent credit or selection state");
    assert(completedTransaction.receiptCount===transactionBaseline.receipts+1&&completedTransaction.collected,
      device.name+": successful dispense did not produce one receipt and one collection record");
    assert(completedTransaction.overlay==="record"&&completedTransaction.transaction.status==="dispensed"&&
      completedTransaction.transaction.itemId===transactionId&&completedTransaction.transaction.receiptCode,
      device.name+": successful transaction confirmation is not represented in the active record viewer");
    assert(completedTransaction.order.every((index,i,array)=>index>=0&&(i===0||index>array[i-1])),
      device.name+": transaction events were not recorded in credit/receipt/collection/dispense order");
    const [receiptDownload]=await Promise.all([
      page.waitForEvent("download"),
      page.locator(".receipt-ticket [data-receipt-action='download']").click()
    ]);
    assert(receiptDownload.suggestedFilename().endsWith(".txt"),device.name+": receipt export used an unexpected filename");
    await page.waitForFunction(()=>window.JIHANKI_MACHINE.getState().transaction.status==="receipt-download-started");
    assert((await page.locator("[data-transaction-confirmation]").textContent()).includes("RECEIPT DOWNLOAD STARTED"),
      device.name+": receipt-save outcome was not confirmed in the viewer");
    await page.evaluate(id=>window.JIHANKI_MACHINE.purchase(window.JIHANKI_ARCHIVE.find(record=>record.id===id)),transactionId);
    await page.waitForFunction(()=>document.querySelector(".artifact-feedback")?.textContent.includes("NO CREDIT"));
    const retryState=await page.evaluate(()=>({
      credits:window.JIHANKI_MACHINE.getState().credits,
      receipts:window.JIHANKI_RECEIPTS.all().length,
      selectedId:window.JIHANKI_MACHINE.getState().selectedId
    }));
    assert(retryState.credits===0&&retryState.receipts===transactionBaseline.receipts+1&&retryState.selectedId===transactionId,
      device.name+": a no-credit retry altered the completed transaction");
    const rejectedState=await page.evaluate(()=>window.JIHANKI_MACHINE.getState().transaction);
    assert(rejectedState.status==="blocked"&&rejectedState.reason==="no-credit",
      device.name+": no-credit retry did not produce an explicit blocked outcome");
    await page.keyboard.press("Escape");
    assert(await page.evaluate(()=>window.JIHANKI_MACHINE.getState().overlay==="none"),
      device.name+": closing the record did not return the overlay to none");
    await page.locator("#home-button").click();

    // Rapid source changes must stop the previous audio layer before the next one is displayed.
    const audioSwap=await page.evaluate(()=>{
      const audioItems=window.JIHANKI_ARCHIVE.filter(item=>item.type==="audio"&&item.file);
      if(audioItems.length<2)return{skipped:true};
      window.JIHANKI_MACHINE.openItem(audioItems[0]);
      const media=document.querySelector("#artifact-body audio");
      if(!media)return{missing:true};
      let playing=false,pauseCalls=0;
      media.play=()=>{playing=true;return Promise.resolve();};
      media.pause=()=>{playing=false;pauseCalls++;};
      media.play();
      window.JIHANKI_MACHINE.openItem(audioItems[1]);
      return{playing,pauseCalls,second:document.querySelector("#artifact-body audio")?.getAttribute("src"),expected:audioItems[1].file};
    });
    assert(!audioSwap.skipped&&!audioSwap.missing&&audioSwap.pauseCalls>0&&!audioSwap.playing&&audioSwap.second===audioSwap.expected,
      device.name+": rapid media selection left a previous audio source active");
    await page.keyboard.press("Escape");

    // A delayed failure from an older Markdown request must not overwrite the newer selection.
    const markdownRace=await page.evaluate(()=>{
      const items=window.JIHANKI_ARCHIVE.filter(item=>typeof item.file==="string"&&item.file.endsWith(".md"));
      const oldItem=items.find((item,index)=>items.slice(index+1).some(other=>other.file!==item.file))||
        items.find(item=>items.some(other=>other.file!==item.file));
      const newItem=oldItem&&items.find(item=>item.file!==oldItem.file);
      if(!oldItem||!newItem)return{skipped:true};
      return{oldId:oldItem.id,newId:newItem.id,newTitle:newItem.title,oldFile:oldItem.file,newFile:newItem.file};
    });
    if(!markdownRace.skipped){
      await page.route("**/"+markdownRace.oldFile,async route=>{
        await new Promise(resolve=>setTimeout(resolve,120));
        await route.abort();
      });
      await page.evaluate(({oldId,newId})=>{
        window.JIHANKI_MACHINE.openItem(window.JIHANKI_ARCHIVE.find(item=>item.id===oldId));
        window.JIHANKI_MACHINE.openItem(window.JIHANKI_ARCHIVE.find(item=>item.id===newId));
      },markdownRace);
      await page.waitForFunction(title=>document.querySelector(".artifact-title")?.textContent.trim()===title,markdownRace.newTitle);
      await page.waitForTimeout(180);
      const stillCurrent=await page.evaluate(()=>({
        title:document.querySelector(".artifact-title")?.textContent.trim(),
        body:document.querySelector("#artifact-body")?.textContent||""
      }));
      assert(stillCurrent.title===markdownRace.newTitle&&!stillCurrent.body.includes("MEMORY COULD NOT BE READ"),
        device.name+": stale Markdown failure replaced the newer selected memory");
      await page.unroute("**/"+markdownRace.oldFile);
      await page.keyboard.press("Escape");
      await page.locator("#home-button").click();
    }

    // The centre feedback, top-right count and visible coin tokens all share one balance.
    await page.locator("#coin-button").click();
    await page.waitForFunction(()=>window.JIHANKI_MACHINE.getState().credits===1);
    const firstCoinAudit=await page.evaluate(()=>({
      balance:window.JIHANKI_MACHINE.getState().credits,
      tokens:document.querySelectorAll("#credit-display [data-credit-token]").length,
      counter:document.querySelector(".credit-count")?.textContent.trim(),
      feedback:document.querySelector("#screen-content .boot-subtitle")?.textContent.trim()
    }));
    assert(firstCoinAudit.balance===1&&firstCoinAudit.tokens===1&&firstCoinAudit.counter==="CREDITS / 1"&&firstCoinAudit.feedback==="1 CREDIT",
      device.name+": first coin feedback and counters do not agree: "+JSON.stringify(firstCoinAudit));
    await page.locator("#coin-button").click();
    await page.waitForFunction(()=>window.JIHANKI_MACHINE.getState().credits===2);
    const secondCoinAudit=await page.evaluate(()=>({
      balance:window.JIHANKI_MACHINE.getState().credits,
      tokens:document.querySelectorAll("#credit-display [data-credit-token]").length,
      counter:document.querySelector(".credit-count")?.textContent.trim(),
      feedback:document.querySelector("#screen-content .boot-subtitle")?.textContent.trim()
    }));
    assert(secondCoinAudit.balance===2&&secondCoinAudit.tokens===2&&secondCoinAudit.counter==="CREDITS / 2"&&secondCoinAudit.feedback==="2 CREDITS",
      device.name+": second coin feedback contains a duplicate or off-by-one credit: "+JSON.stringify(secondCoinAudit));
    const coinPile=await page.evaluate(()=>[...document.querySelectorAll("#credit-display [data-credit-token]")]
      .map(token=>parseFloat(getComputedStyle(token).width)));
    assert(coinPile.length===2,device.name+": two inserted credits were not drawn as two coin tokens");
    assert(coinPile[0]>coinPile[1],device.name+": accumulated coin tokens do not progressively shrink");
    await page.locator("#memory-button").click();
    await page.waitForFunction(()=>window.JIHANKI_MACHINE.getState().credits===1);
    assert(await page.locator("#credit-display [data-credit-token]").count()===1,
      device.name+": dispensing a memory did not consume one visible coin");
    await page.keyboard.press("Escape");
    await page.locator("#memory-button").click();
    await page.waitForFunction(()=>window.JIHANKI_MACHINE.getState().credits===0);
    assert(await page.locator("#credit-display [data-credit-token]").count()===0,
      device.name+": the final credit token remained after dispensing");
    await page.keyboard.press("Escape");
    await page.locator("#home-button").click();
    await page.locator('[data-home-action="temporal"]').waitFor();
    // M50 is a static catalogue view: every source record appears once in the chronology,
    // while the visitor-local clock is presentation-only and creates no persistent state.
    const temporalStateBefore=await page.evaluate(()=>({keys:Object.keys(localStorage).sort().join("|"),events:window.JIHANKI_EVENTS.count()}));
    const temporalStats=await page.evaluate(()=>window.JIHANKI_TEMPORAL.stats());
    const sourceCount=await page.evaluate(()=>window.JIHANKI_ARCHIVE.length);
    assert(temporalStats.total===sourceCount,device.name+": temporal archive omitted catalogue records");
    assert(temporalStats.dated+temporalStats.unplaced===temporalStats.total,
      device.name+": temporal date accounting is incomplete");
    await page.locator('[data-home-action="temporal"]').click();
    await page.locator(".temporal-archive").waitFor();
    const temporalView=await page.evaluate(()=>({
      records:document.querySelectorAll(".temporal-year [data-temporal-open],.temporal-unplaced [data-temporal-open]").length,
      images:document.querySelectorAll(".temporal-year .temporal-record--image img").length,
      phase:document.querySelector(".temporal-now>strong")?.textContent||"",
      localNote:document.querySelector(".temporal-now small")?.textContent||"",
      explanation:document.querySelector(".temporal-purpose")?.textContent||"",
      title:document.querySelector(".temporal-wordmark")?.textContent?.trim()||"",
      nav:[...document.querySelectorAll(".temporal-nav button")].map(button=>button.textContent.trim())
    }));
    assert(temporalView.records===temporalStats.total,device.name+": chronology does not expose every record");
    assert(temporalView.images===temporalStats.images,device.name+": contact sheet omitted source imagery");
    assert(temporalView.title==="ARCHIVIO",device.name+": archival masthead missing");
    assert(temporalView.explanation.includes("not a diary of your visits")&&temporalView.explanation.includes("reading suggestion"),
      device.name+": chronology purpose is not explained to visitors");
    assert(temporalView.nav.join("|").includes("MAPPA")&&temporalView.nav.join("|").includes("RANDOM")&&
      temporalView.nav.join("|").includes("TIMELINE"),device.name+": archive navigation incomplete");
    assert(["DAWN","MORNING","AFTERNOON","DAY","EVENING","NIGHT"].includes(temporalView.phase),
      device.name+": visitor-local time phase missing");
    assert(temporalView.localNote.includes("NOT TRANSMITTED"),device.name+": local-time privacy note missing");
    const temporalStateAfter=await page.evaluate(()=>({keys:Object.keys(localStorage).sort().join("|"),events:window.JIHANKI_EVENTS.count()}));
    assert(temporalStateBefore.keys===temporalStateAfter.keys&&temporalStateBefore.events===temporalStateAfter.events,
      device.name+": opening temporal archive wrote visitor state or event history");
    const temporalImagePaths=await page.evaluate(()=>[...document.querySelectorAll(".temporal-year .temporal-record--image img")]
      .map(image=>image.getAttribute("src")));
    assert(temporalImagePaths.every(source=>source&&source.startsWith("media/")&&!source.includes("..")),
      device.name+": contact sheet contains a remote or invalid image source");
    for(const source of temporalImagePaths){
      const resolved=path.resolve(ROOT,decodeURIComponent(source));
      assert(resolved.startsWith(ROOT+path.sep),device.name+": contact-sheet image escaped the archive root");
      await stat(resolved);
    }
    await mkdir(path.join(ROOT,"test-results"),{recursive:true});
    await page.screenshot({path:path.join(ROOT,"test-results","temporal-"+device.name+".png")});
    await page.locator("[data-temporal-scroll]").click();
    assert(await page.locator("#temporal-timeline").count()===1,device.name+": TIMELINE anchor missing");
    const firstTemporalRecord=page.locator(".temporal-year [data-temporal-open]").first();
    await firstTemporalRecord.waitFor();
    const expectedTemporalTitle=await firstTemporalRecord.locator("strong").textContent();
    await firstTemporalRecord.click();
    await page.locator(".artifact-title").waitFor();
    assert((await page.locator(".artifact-title").textContent()).trim()===expectedTemporalTitle.trim(),
      device.name+": chronology opened a different source memory");
    await page.keyboard.press("Escape");

    // RANDOM and MAPPA navigate to existing machine views; neither adds temporal state.
    await page.locator('[data-home-action="temporal"]').click();
    await page.locator("[data-temporal-random]").click();
    await page.locator(".artifact-title").waitFor();
    assert((await page.locator(".artifact-title").textContent()).trim().length>0,
      device.name+": RANDOM did not open an archive record");
    await page.keyboard.press("Escape");
    await page.locator('[data-home-action="temporal"]').click();
    await page.locator("[data-temporal-map]").click();
    await page.locator(".memory-map-panel").waitFor();
    await page.keyboard.press("Escape");

    await page.locator('[data-home-action="map"]').click();
    await page.locator(".memory-map-panel").waitFor();
    assert(await page.locator(".map-memory-mode").count()===1,device.name+": homepage map should open in Memory Network mode");
    assert(await page.locator(".map-pin").count()>=70,device.name+": homepage Memory Network did not load the full place set");
    await page.waitForFunction(()=>{
      const image=document.querySelector(".map-prefecture-backdrop img");
      return !!image&&image.complete&&image.naturalWidth>0&&image.naturalHeight>0;
    });
    const japanBase=await page.locator(".map-prefecture-backdrop img").evaluate(image=>({
      source:new URL(image.currentSrc).pathname,
      width:image.naturalWidth,
      height:image.naturalHeight
    }));
    assert(japanBase.source.endsWith("/assets/maps/japan-prefectures.svg")&&japanBase.width>400&&japanBase.height>500,
      device.name+": supplied Japan prefecture SVG did not load as the map base");
    const map=await page.evaluate(()=>{
      const canvas=document.querySelector(".map-canvas"),viewport=canvas.getBoundingClientRect();
      const layer=canvas.querySelector(".map-pan-layer"),surface=layer.getBoundingClientRect();
      return{box:{left:viewport.left,top:viewport.top,right:viewport.right,bottom:viewport.bottom},
        surface:{left:surface.left,top:surface.top,right:surface.right,bottom:surface.bottom},
        overflow:getComputedStyle(canvas).overflow,
        pins:[...layer.querySelectorAll(".map-pin")].map(node=>{const p=node.getBoundingClientRect();return{name:node.getAttribute("data-map-place"),left:p.left,right:p.right,top:p.top,bottom:p.bottom,width:p.width,height:p.height};}),
        labelPins:[...layer.querySelectorAll(".map-pin-place-card")].map(node=>{const p=node.getBoundingClientRect();return{name:node.getAttribute("data-map-place"),left:p.left,right:p.right,top:p.top,bottom:p.bottom,width:p.width,height:p.height};}),
        keyCount:document.querySelectorAll(".map-place-list button").length,
        modalWidth:document.querySelector(".artifact-window").clientWidth,
        modalScrollWidth:document.querySelector(".artifact-window").scrollWidth};
    });
    assert(map.keyCount>0,device.name+": map key empty");
    assert(map.modalScrollWidth<=map.modalWidth+1,device.name+": map caused horizontal overflow");
    const mapLabels=page.locator(".map-pin-place-card");
    const mapDots=page.locator(".map-pin-dot-only");
    const crtLabels=await mapLabels.evaluateAll(nodes=>nodes.length>=15&&nodes.every(node=>
      node.querySelector(".map-pin-jp")&&node.querySelector(".map-pin-count")&&
      getComputedStyle(node).borderRadius!=="50%"&&node.offsetWidth>=100));
    assert(crtLabels,device.name+": CRT Japanese/English primary place cards are missing");
    assert(await mapDots.count()>=45,device.name+": exact-location map points are missing from the Japan map");
    assert(map.overflow==="hidden",device.name+": pannable map viewport must clip its inner surface");
    assert(map.surface.left>=map.box.left-1&&map.surface.right<=map.box.right+1&&
      map.surface.top>=map.box.top-1&&map.surface.bottom<=map.box.bottom+1,
      device.name+": the full Japan prefecture outline should fit in country-level views");
    assert(await page.locator(".map-view-controls [data-map-fit]").count()===1,device.name+": map fit control missing");
    const initialZoom=Number((await page.locator("[data-map-zoom-level]").textContent()).replace("%",""));
    await page.locator('[data-map-zoom="out"]').click();
    const zoomedOut=Number((await page.locator("[data-map-zoom-level]").textContent()).replace("%",""));
    assert(zoomedOut<initialZoom,device.name+": zoom-out control did not reduce scale");
    await page.locator('[data-map-zoom="in"]').click();
    const zoomedIn=Number((await page.locator("[data-map-zoom-level]").textContent()).replace("%",""));
    assert(zoomedIn>zoomedOut,device.name+": zoom-in control did not increase scale");
    await page.locator("[data-map-fit]").click();
    const relationAudit=await page.evaluate(()=>{
      const names=new Set([...document.querySelectorAll(".map-memory-mode .map-pin")].map(pin=>pin.dataset.mapPlace));
      const expected=window.JIHANKI_RELATIONSHIPS.placeEdges().filter(edge=>names.has(edge.from)&&names.has(edge.to)).length;
      const drawn=document.querySelectorAll(".map-memory-mode .map-connections line").length;
      return{expected,drawn};
    });
    assert(relationAudit.drawn===relationAudit.expected&&relationAudit.expected>=30,
      device.name+": a curated geographic relationship is missing from Memory Network: "+JSON.stringify(relationAudit));
    for(const pin of map.pins){
      // Pins live on the intentionally wider pan surface, not necessarily inside
      // the currently visible viewport. Check the actual coordinate surface.
      assert(pin.left>=map.surface.left-1&&pin.right<=map.surface.right+1,device.name+": map pin outside pan surface: "+JSON.stringify({pin,surface:map.surface}));
      assert(pin.top>=map.surface.top-1&&pin.bottom<=map.surface.bottom+1,device.name+": map pin outside pan surface: "+JSON.stringify({pin,surface:map.surface}));
    }
    for(let i=0;i<map.labelPins.length;i++)for(let j=i+1;j<map.labelPins.length;j++){
      const a=map.labelPins[i],b=map.labelPins[j];
      const overlapX=Math.min(a.right,b.right)-Math.max(a.left,b.left);
      const overlapY=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
      assert(!(overlapX>1&&overlapY>1),device.name+": primary Japanese map cards overlap: "+JSON.stringify({a,b}));
    }
    await mkdir(path.join(ROOT,"test-results"),{recursive:true});
    await page.screenshot({path:path.join(ROOT,"test-results","map-"+device.name+".png")});
    await page.locator('[data-map-mode="memory"]').click();
    assert(await page.locator(".map-memory-mode").count()===1,device.name+": memory map mode failed");
    assert(await page.evaluate(()=>document.querySelector("#artifact").contains(document.activeElement)),device.name+": map dialog did not own keyboard focus");
    await page.locator('[data-map-mode="trails"]').click();
    const trailsFit=await page.evaluate(()=>{
      const canvas=document.querySelector(".map-canvas").getBoundingClientRect();
      return [...document.querySelectorAll(".map-trails-mode .map-pin")].map(node=>{
        const box=node.getBoundingClientRect();
        return box.left>=canvas.left-1&&box.right<=canvas.right+1&&box.top>=canvas.top-1&&box.bottom<=canvas.bottom+1;
      });
    });
    assert(trailsFit.length===10&&trailsFit.every(Boolean),device.name+": one or more Trail stops opened outside the fitted viewport");
    const summitPhotos=await page.locator(".map-trail-photo-grid button").evaluateAll(nodes=>nodes.map(node=>node.dataset.mapPhoto));
    assert(summitPhotos.join(",")==="photo-219,photo-220,photo-221,photo-222,photo-223",device.name+": Saiko summit evidence photos are missing or reordered: "+summitPhotos.join(","));
    assert(await page.locator(".map-trail-stages li").count()===4,device.name+": Saiko summit field sequence is incomplete");
    await page.locator('[data-map-mode="memory"]').click();
    const placeIndexState=await page.evaluate(()=>({
      exists:!!document.querySelector(".map-place-index"),
      open:document.querySelector(".map-place-index")?.open??true,
      odawara:window.JIHANKI_GEOGRAPHY.entries("Miyukihama").map(item=>item.id).sort(),
      okinawa:window.JIHANKI_GEOGRAPHY.entries("Okinawa").map(item=>item.id)
    }));
    assert(placeIndexState.exists&&!placeIndexState.open,
      device.name+": the complete place index should be collapsed by default");
    assert(placeIndexState.odawara.join(",")==="photo-202,photo-247,photo-250"&&placeIndexState.okinawa.length===0,
      device.name+": Miyukihama records are not grouped under Odawara or Okinawa still has false memories");
    const mapBeforeReturn=await page.evaluate(()=>window.JIHANKI_MAP.snapshot(document.querySelector("#artifact-content")));
    await page.evaluate(()=>{
      const pin=document.querySelector(".map-pin-place-card");
      if(!pin)throw new Error("No labelled map place to test return navigation.");
      pin.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true}));
    });
    await page.locator("#screen-content [data-return-map]").waitFor();
    await page.locator("#screen-content [data-return-map]").click();
    await page.locator(".map-memory-mode").waitFor();
    const mapAfterReturn=await page.evaluate(()=>window.JIHANKI_MAP.snapshot(document.querySelector("#artifact-content")));
    assert(mapBeforeReturn?.mode==="memory"&&mapAfterReturn?.mode==="memory"&&
      Math.abs(mapBeforeReturn.scale-mapAfterReturn.scale)<.001&&
      Math.abs(mapBeforeReturn.x-mapAfterReturn.x)<1&&Math.abs(mapBeforeReturn.y-mapAfterReturn.y)<1,
      device.name+": map expedition return did not restore the previous place, zoom and position");
    await page.keyboard.press("Escape");
    assert(await page.locator("#artifact.open").count()===0,device.name+": Escape failed to close map");
    await page.locator('[data-home-action="search"]').click();
    const searchMobileAudit=await page.evaluate(()=>{
      const input=document.querySelector("#archive-search-input");
      return {fontSize:parseFloat(getComputedStyle(input).fontSize),focused:document.activeElement===input,scale:window.visualViewport?.scale||1};
    });
    if(device.hasTouch){
      assert(searchMobileAudit.fontSize>=16,device.name+": search input is below iOS's no-auto-zoom size");
      assert(!searchMobileAudit.focused,device.name+": archive search opened with the iPhone keyboard focused");
    }
    assert(Math.abs(searchMobileAudit.scale-1)<.02,device.name+": opening search zoomed the whole page");
    await page.locator("#archive-search-input").fill("Fuji");
    assert(await page.locator("[data-search-open]").count()>0,device.name+": search returned no Fuji records");
    await page.keyboard.press("Escape");
    // SOUND LAB is the primary creative tool; its transport always follows the visible checkbox state.
    assert(await page.locator('[data-home-action="personality"]').count()===0,
      device.name+": redundant Machine Memory entry should not appear on the home screen");
    await page.locator('[data-home-action="installation"]').click();
    const installRows=page.locator(".installation-track");
    assert(await installRows.count()>0,device.name+": Sound Lab has no source fragments");
    const firstInstallRow=installRows.first();
    const firstInstallId=await firstInstallRow.getAttribute("data-install-track");
    await page.locator('[data-install-action="start"]').click();
    await page.waitForFunction(()=>window.JIHANKI_SOUNDSCAPE.getState(document.querySelector(".sound-installation")).running);
    const firstInstallCheckbox=firstInstallRow.locator("[data-install-select]");
    await firstInstallCheckbox.uncheck();
    await page.waitForFunction(id=>{
      const row=document.querySelector('[data-install-track="'+id+'"]');
      return row&&!row.querySelector("[data-install-select]").checked&&row.querySelector("audio").paused;
    },firstInstallId);
    let soundState=await page.evaluate(()=>window.JIHANKI_SOUNDSCAPE.getState(document.querySelector(".sound-installation")));
    assert(!soundState.selectedIds.includes(firstInstallId)&&!soundState.activeIds.includes(firstInstallId),
      device.name+": unchecked source remained in the running installation");
    await firstInstallCheckbox.check();
    await page.waitForFunction(id=>window.JIHANKI_SOUNDSCAPE.getState(document.querySelector(".sound-installation")).selectedIds.includes(id),firstInstallId);
    const firstInstallAudio=firstInstallRow.locator("audio");
    const firstInstallLoop=firstInstallRow.locator("[data-install-loop]");
    await firstInstallLoop.uncheck();
    assert(await firstInstallAudio.evaluate(audio=>audio.loop===false),
      device.name+": loop checkbox did not update the live audio element");
    const firstInstallVolume=firstInstallRow.locator("[data-install-volume]");
    await firstInstallVolume.evaluate(input=>{input.value="0";input.dispatchEvent(new Event("input",{bubbles:true}));});
    assert(await firstInstallAudio.evaluate(audio=>audio.volume===0),
      device.name+": volume slider did not update immediately");
    // Restart reconciles all rows and must not resurrect a removed source.
    await firstInstallCheckbox.uncheck();
    await page.locator('[data-install-action="start"]').click();
    await page.waitForFunction(()=>window.JIHANKI_SOUNDSCAPE.getState(document.querySelector(".sound-installation")).running);
    soundState=await page.evaluate(()=>window.JIHANKI_SOUNDSCAPE.getState(document.querySelector(".sound-installation")));
    assert(!soundState.selectedIds.includes(firstInstallId)&&!soundState.activeIds.includes(firstInstallId),
      device.name+": restart reintroduced a source that is unchecked");
    await page.locator('[data-install-action="stop"]').click();
    soundState=await page.evaluate(()=>window.JIHANKI_SOUNDSCAPE.getState(document.querySelector(".sound-installation")));
    const everyTrackPaused=await installRows.locator("audio").evaluateAll(audios=>audios.every(audio=>audio.paused));
    assert(!soundState.running&&everyTrackPaused,
      device.name+": STOP did not pause every installation layer");

    // The modal focus cycle must include native form controls, not only buttons and links.
    await page.evaluate(()=>{
      const tail=document.createElement("input");
      tail.type="text";
      tail.id="dialog-focus-trap-tail";
      tail.setAttribute("aria-label","Focus trap regression control");
      document.querySelector("#artifact-content").append(tail);
      tail.focus();
    });
    await page.keyboard.press("Tab");
    assert(await page.evaluate(()=>document.activeElement.id==="artifact-close"),
      device.name+": Tab escaped the dialog after a native form control");
    await page.keyboard.press("Shift+Tab");
    assert(await page.evaluate(()=>document.activeElement.id==="dialog-focus-trap-tail"),
      device.name+": Shift+Tab did not wrap to the last native form control");
    await page.keyboard.press("Escape");
    await page.route("**/missing-test-image.png*",route=>route.fulfill({status:404,body:"missing"}));
    await page.route("**/assets/placeholder.png*",route=>route.fulfill({status:404,body:"missing"}));
    await page.evaluate(()=>{
      window.__originalMapRender=window.JIHANKI_MAP.render;
      window.JIHANKI_MAP.render=()=>'<div class="memory-map-panel"><figure class="markdown-image-frame">'+
        '<img class="markdown-image" src="missing-test-image.png" alt="Broken image regression">'+
        '<span class="artifact-media-status" role="status" aria-live="polite"></span></figure></div>';
      window.JIHANKI_MACHINE.openMap("geography");
    });
    await page.waitForFunction(()=>document.querySelector(".markdown-image-frame .artifact-media-status")?.textContent.includes("IMAGE AND PLACEHOLDER UNAVAILABLE"));
    assert(await page.locator(".markdown-image-frame [data-media-retry]").count()===1,
      device.name+": broken panel image did not expose an image-specific retry");
    await page.locator(".markdown-image-frame [data-media-retry]").click();
    await page.waitForFunction(()=>document.querySelector(".markdown-image-frame .artifact-media-status")?.textContent.includes("IMAGE AND PLACEHOLDER UNAVAILABLE"));
    await page.keyboard.press("Escape");
    await page.unroute("**/missing-test-image.png*");
    await page.unroute("**/assets/placeholder.png*");
    await page.evaluate(()=>{
      if(window.__originalMapRender)window.JIHANKI_MAP.render=window.__originalMapRender;
      delete window.__originalMapRender;
    });

    // Populate a local collection fixture, then exercise the private museum through its UI.
    await page.evaluate(()=>{
      const item=window.JIHANKI_ARCHIVE[0];
      window.JIHANKI_COLLECTION.add(item,{code:"MUSEUM-TEST-"+item.id});
    });
    await page.locator('[data-home-action="collection"]').click();
    await page.locator('[data-museum-tab="overview"]').waitFor();
    assert(await page.locator(".museum-trail-preview [data-museum-tab='trail']").count()===1,
      device.name+": Collection overview does not expose the unified Visit Trail");
    assert(await page.locator(".museum-content .museum-row").count()===0,
      device.name+": duplicate recent-visit list remains on Collection overview");
    await page.locator('.museum-tabs [data-museum-tab="trail"]').click();
    const expectedTrailRows=await page.evaluate(()=>Math.min(100,window.JIHANKI_MUSEUM.trail().length));
    assert(expectedTrailRows>0&&await page.locator(".museum-row").count()===expectedTrailRows,
      device.name+": Visit Trail is not available as the single history view");
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
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  // Before the runtime cache is populated by a second page load, a first controlled
  // offline request must still be served by the precached application shell.
  await context.setOffline(true);
  const firstVisitShell=await page.evaluate(async path=>{
    const response=await fetch(path,{cache:"no-store"});
    const source=await response.text();
    return{ok:response.ok,hasInteractionModel:source.includes("JIHANKI_INTERACTION")};
  },"js/interaction-model.js");
  assert(firstVisitShell.ok&&firstVisitShell.hasInteractionModel,
    "pre-cached shell script unavailable offline on the first controlled visit");
  await context.setOffline(false);
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
