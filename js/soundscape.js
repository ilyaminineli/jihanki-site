/* M48 — Live, visitor-operated sound installation.
   Selection changes are immediate; a restart reconciles every track from current UI state. */
(function () {
  "use strict";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[char]);
  const runtimes = new WeakMap();
  const trackStates = new WeakMap();

  function tracks() {
    return (window.JIHANKI_ARCHIVE || []).filter(item =>
      ["music","sound"].includes(item.machineCategory || item.category) &&
      item.file && /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(item.file)
    );
  }

  function runtime(root) {
    let value = runtimes.get(root);
    if (!value) {
      value = { running:false, generation:0, active:new Set(), failed:new Set() };
      runtimes.set(root,value);
    }
    return value;
  }

  function trackState(audio) {
    let value = trackStates.get(audio);
    if (!value) {
      value = { generation:0 };
      trackStates.set(audio,value);
    }
    return value;
  }

  function rows(root) {
    return [...(root?.querySelectorAll(".installation-track") || [])];
  }

  function selectedRows(root) {
    return rows(root).filter(row => row.querySelector("[data-install-select]")?.checked);
  }

  function setStatus(root, message) {
    const target = root?.querySelector(".installation-status");
    if (target) target.textContent = message;
  }

  function updateStatus(root) {
    const state = runtime(root);
    const selected = selectedRows(root).length;
    const active = state.active.size;
    if (!state.running) return;
    if (!selected) {
      setStatus(root,"NO FRAGMENTS SELECTED / THE ROOM IS QUIET");
    } else if (active) {
      const failed = state.failed.size;
      setStatus(root,"PLAYING / "+active+" OF "+selected+" SELECTED LAYERS"+
        (failed ? " / "+failed+" FAILED" : ""));
    } else if (state.failed.size) {
      setStatus(root,"NO TRACK STARTED / CHECK FILE AND BROWSER PLAYBACK PERMISSIONS");
    } else {
      setStatus(root,"STARTING / "+selected+" SELECTED LAYERS");
    }
  }

  function stopTrack(root,row,rewind) {
    const audio = row?.querySelector("audio");
    if (!audio) return;
    const meta = trackState(audio);
    meta.generation += 1;
    const state = runtime(root);
    state.active.delete(row.dataset.installTrack);
    state.failed.delete(row.dataset.installTrack);
    try { audio.pause(); } catch (_) { }
    if (rewind !== false) {
      try { audio.currentTime = 0; } catch (_) { }
    }
    row.dataset.installPlaying = "false";
    const indicator = row.querySelector("[data-install-track-status]");
    if (indicator) indicator.textContent = "READY / OFF";
  }

  async function playTrack(root,row,runGeneration,rewind) {
    const state = runtime(root);
    const selector = row.querySelector("[data-install-select]");
    const audio = row.querySelector("audio");
    if (!selector?.checked || !audio || !state.running || state.generation !== runGeneration) {
      stopTrack(root,row,true);
      updateStatus(root);
      return false;
    }

    const meta = trackState(audio);
    const token = ++meta.generation;
    const volume = row.querySelector("[data-install-volume]");
    const loop = row.querySelector("[data-install-loop]");
    audio.loop = !!loop?.checked;
    audio.volume = Math.max(0,Math.min(100,Number(volume?.value ?? 35)))/100;
    if (rewind !== false) {
      try { audio.currentTime = 0; } catch (_) { }
    }

    row.dataset.installPlaying = "pending";
    const indicator = row.querySelector("[data-install-track-status]");
    if (indicator) indicator.textContent = "STARTING…";

    try {
      const promise = audio.play();
      if (promise && typeof promise.then === "function") await promise;
      if (meta.generation !== token || !state.running || state.generation !== runGeneration ||
          !selector.checked) {
        try { audio.pause(); } catch (_) { }
        return false;
      }
      state.failed.delete(row.dataset.installTrack);
      state.active.add(row.dataset.installTrack);
      row.dataset.installPlaying = "true";
      if (indicator) indicator.textContent = "PLAYING";
      updateStatus(root);
      return true;
    } catch (error) {
      if (meta.generation !== token || state.generation !== runGeneration) return false;
      state.active.delete(row.dataset.installTrack);
      state.failed.add(row.dataset.installTrack);
      row.dataset.installPlaying = "false";
      if (indicator) indicator.textContent = "UNAVAILABLE";
      updateStatus(root);
      return false;
    }
  }

  function bind(root) {
    rows(root).forEach(row => {
      const audio=row.querySelector("audio");
      if (!audio || audio.dataset.installBound === "true") return;
      audio.dataset.installBound = "true";
      audio.addEventListener("ended",() => {
        const state=runtime(root);
        state.active.delete(row.dataset.installTrack);
        row.dataset.installPlaying="false";
        const indicator=row.querySelector("[data-install-track-status]");
        if(indicator)indicator.textContent="ENDED";
        updateStatus(root);
      });
      audio.addEventListener("error",() => {
        const state=runtime(root);
        state.active.delete(row.dataset.installTrack);
        state.failed.add(row.dataset.installTrack);
        row.dataset.installPlaying="false";
        const indicator=row.querySelector("[data-install-track-status]");
        if(indicator)indicator.textContent="FILE ERROR";
        updateStatus(root);
      });
    });
  }

  function render() {
    const list = tracks();
    const selected = new Set(list.slice(0,Math.min(3,list.length)).map(item => item.id));
    return '<section class="sound-installation">'+
      '<div class="sound-lab-masthead"><span>JHK / SOUND LABORATORY</span><span>'+list.length+' SOURCE FRAGMENTS</span></div>'+
      '<h2>BUILD A LIVING ARCHIVE</h2>'+
      '<p class="sound-lab-explainer">Layer field recordings, environmental sound and music into a small listening environment. The installation is local to this page; nothing is uploaded.</p>'+
      '<div class="sound-lab-instructions"><strong>LIVE SELECTION</strong><span>CHECK / ADD A LAYER</span><span>UNCHECK / REMOVE IT IMMEDIATELY</span><span>START / REBUILD THE MIX FROM THE CURRENT SELECTION</span></div>'+
      '<div class="installation-tracks">'+
      list.map((item,index) =>
        '<article class="installation-track" data-install-track="'+esc(item.id)+'" data-install-playing="false">'+
          '<label class="installation-select"><input type="checkbox" data-install-select value="'+esc(item.id)+'" '+
            (selected.has(item.id)?"checked":"")+'><span class="installation-track-copy"><strong>'+esc(item.title)+'</strong>'+
            '<small>'+esc(String(item.machineCategory||item.category||"SOUND").toUpperCase())+' / '+esc(item.date||"UNDATED")+'</small></span>'+
            '<span class="installation-index">'+String(index+1).padStart(2,"0")+'</span></label>'+
          '<div class="installation-track-controls">'+
            '<label class="installation-volume">LEVEL <input type="range" min="0" max="100" value="35" data-install-volume aria-label="Volume for '+esc(item.title)+'"></label>'+
            '<label class="installation-loop"><input type="checkbox" data-install-loop checked> LOOP</label>'+
            '<small class="installation-track-status" data-install-track-status>READY / OFF</small>'+
          '</div><audio preload="none" src="'+esc(item.file)+'" hidden></audio></article>'
      ).join("")+
      '</div><div class="installation-transport"><div class="installation-actions">'+
        '<button type="button" data-install-action="start">START INSTALLATION ↗</button>'+
        '<button type="button" data-install-action="stop">STOP</button>'+
      '</div><div class="installation-status" role="status" aria-live="polite">READY / SELECT THE LAYERS YOU WANT TO HEAR</div></div></section>';
  }

  async function start(root) {
    if (!root) return 0;
    const state = runtime(root);
    state.running = true;
    state.generation += 1;
    const generation = state.generation;
    state.active.clear();
    state.failed.clear();

    const allRows = rows(root);
    allRows.forEach(row => stopTrack(root,row,true));
    const selected = selectedRows(root);
    if (!selected.length) {
      setStatus(root,"SELECT AT LEAST ONE SOUND FRAGMENT");
      return 0;
    }
    setStatus(root,"REBUILDING / "+selected.length+" SELECTED LAYERS");
    await Promise.all(selected.map(row => playTrack(root,row,generation,true)));
    if (state.generation === generation) updateStatus(root);
    return state.active.size;
  }

  function setSelection(input) {
    const row = input?.closest(".installation-track");
    const root = input?.closest(".sound-installation");
    if (!row || !root) return false;
    const state = runtime(root);
    if (input.checked && state.running) {
      playTrack(root,row,state.generation,true);
    } else {
      stopTrack(root,row,true);
      updateStatus(root);
    }
    return true;
  }

  function setLoop(input) {
    const row = input?.closest(".installation-track");
    const audio = row?.querySelector("audio");
    if (!row || !audio) return false;
    audio.loop = !!input.checked;
    return true;
  }

  function setVolume(input) {
    const audio = input?.closest(".installation-track")?.querySelector("audio");
    if (!audio) return false;
    audio.volume = Math.max(0,Math.min(100,Number(input.value)))/100;
    return true;
  }

  function stop(root,quiet) {
    if (!root) return;
    const state = runtime(root);
    state.running = false;
    state.generation += 1;
    state.active.clear();
    state.failed.clear();
    rows(root).forEach(row => stopTrack(root,row,true));
    if (!quiet) setStatus(root,"STOPPED / THE ROOM IS QUIET");
  }

  function dispose(root) {
    if (root) stop(root,true);
  }

  function getState(root) {
    if (!root) return {running:false,selectedIds:[],activeIds:[],failedIds:[]};
    const state = runtime(root);
    return {
      running:state.running,
      selectedIds:selectedRows(root).map(row=>row.dataset.installTrack),
      activeIds:[...state.active],
      failedIds:[...state.failed]
    };
  }

  window.JIHANKI_SOUNDSCAPE = {render,bind,start,stop,dispose,setSelection,setLoop,setVolume,getState,tracks};
})();
