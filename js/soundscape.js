/* M48 — Visitor-operated sound installation assembled from existing local archive audio. */
(function () {
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  function tracks(){return(window.JIHANKI_ARCHIVE||[]).filter(item=>["music","sound"].includes(item.machineCategory||item.category)&&
    item.file&&/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(item.file)).slice(0,16);}
  function render(){
    const list=tracks(),selected=new Set(list.slice(0,Math.min(3,list.length)).map(item=>item.id));
    return'<section class="sound-installation"><span class="map-eyebrow">JHK / SOUND LABORATORY</span><h2>ARCHIVE SOUNDSCAPE</h2>'+
      '<p>Choose fragments and let them overlap. Playback begins only after START is pressed.</p><div class="installation-tracks">'+
      list.map(item=>'<div class="installation-track" data-install-track="'+esc(item.id)+'"><label><input type="checkbox" data-install-select value="'+esc(item.id)+
        '" '+(selected.has(item.id)?"checked":"")+'><span><strong>'+esc(item.title)+'</strong><small>'+esc(item.machineCategory||item.category)+' / '+
        esc(item.date||"UNDATED")+'</small></span></label><label class="installation-volume">LEVEL <input type="range" min="0" max="100" value="35" data-install-volume></label>'+
        '<label class="installation-loop"><input type="checkbox" data-install-loop checked> LOOP</label><audio preload="none" src="'+esc(item.file)+'"></audio></div>').join("")+
      '</div><div class="installation-actions"><button type="button" data-install-action="start">START INSTALLATION</button><button type="button" data-install-action="stop">STOP</button></div>'+
      '<div class="installation-status" role="status" aria-live="polite">READY / '+list.length+' AVAILABLE FRAGMENTS</div></section>';
  }
  function start(root){
    const rows=[...root.querySelectorAll(".installation-track")].filter(row=>row.querySelector("[data-install-select]")?.checked);let started=0;
    rows.forEach(row=>{
      const audio=row.querySelector("audio");audio.loop=!!row.querySelector("[data-install-loop]")?.checked;
      audio.volume=Number(row.querySelector("[data-install-volume]")?.value||35)/100;
      audio.play().catch(()=>{
        const status=root.querySelector(".installation-status");if(status)status.textContent="A TRACK COULD NOT START / CHECK BROWSER PLAYBACK PERMISSIONS";
      });started++;
    });
    const status=root.querySelector(".installation-status");if(status)status.textContent=started?"PLAYING / "+started+" LAYERS":"SELECT AT LEAST ONE SOUND FRAGMENT";
    return started;
  }
  function stop(root){root.querySelectorAll(".installation-track audio").forEach(audio=>{audio.pause();audio.currentTime=0;});
    const status=root.querySelector(".installation-status");if(status)status.textContent="STOPPED / THE ROOM IS QUIET";}
  function setVolume(input){const audio=input.closest(".installation-track")?.querySelector("audio");if(audio)audio.volume=Number(input.value)/100;}
  window.JIHANKI_SOUNDSCAPE={render,start,stop,setVolume,tracks};
})();