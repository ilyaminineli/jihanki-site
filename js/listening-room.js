/* M71 — Listening Room.
   A sequential archive player for existing public renders and sound fragments.
   Sound Lab remains the place for live multi-layer mixing. No audio is generated,
   uploaded, transformed or assigned new provenance here. */
(function () {
  "use strict";

  const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i;
  const PENTALOGY_ID = "aokigahara-pentalogy";
  const PENTALOGY_GROUP = "AOKIGAHARA / PENTALOGY";
  const PENDING_RENDER = {
    title: "05 — SHRINE / RITUAL",
    note: "Public render pending. The fifth environment remains part of the project, but no playable render is archived."
  };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[char]);

  function catalogue() {
    return (window.JIHANKI_ARCHIVE || []).filter(item =>
      item && item.type === "audio" && typeof item.file === "string" && AUDIO_EXT.test(item.file)
    );
  }

  function slug(value) {
    return String(value || "archive").toLowerCase()
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "archive";
  }

  function rooms() {
    const groups = new Map();
    catalogue().forEach(item => {
      const label = String(item.group || "UNSORTED ARCHIVE");
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(item);
    });
    return [...groups.entries()].map(([label, tracks]) => ({
      id: "room-" + slug(label),
      label,
      tracks: tracks.slice()
    }));
  }

  function projectRecord() {
    return (window.JIHANKI_ARCHIVE || []).find(item => item.id === PENTALOGY_ID) || null;
  }

  function renderRoom(room, index) {
    const isPentalogy = room.label === PENTALOGY_GROUP;
    return '<section class="listening-room-card" data-listening-room-card="' + esc(room.id) + '">' +
      '<header class="listening-room-card-header"><div><span class="listening-room-index">ROOM ' +
      String(index + 1).padStart(2, "0") + ' / ' + room.tracks.length + ' SOURCE' +
      (room.tracks.length === 1 ? "" : "S") + '</span><h3>' + esc(room.label) + '</h3></div>' +
      '<button type="button" data-listening-play-room="' + esc(room.id) + '">PLAY SET ↗</button></header>' +
      '<ol class="listening-room-track-list">' + room.tracks.map((item, trackIndex) =>
        '<li><button type="button" data-listening-play-track="' + esc(item.id) + '" data-listening-room-id="' + esc(room.id) +
        '" aria-pressed="false"><span class="listening-track-number">' + String(trackIndex + 1).padStart(2, "0") +
        '</span><span class="listening-track-copy"><strong>' + esc(item.title || "UNTITLED RECORDING") +
        '</strong><small>' + esc(item.description || item.date || "ARCHIVE AUDIO") + '</small></span><span class="listening-track-action">PLAY</span></button></li>'
      ).join("") + '</ol>' +
      (isPentalogy ? '<div class="listening-pending"><span>05 / ' + esc(PENDING_RENDER.title) +
        '</span><small>' + esc(PENDING_RENDER.note) + '</small></div>' : '') +
      '</section>';
  }

  function render() {
    const list = rooms();
    const tracks = catalogue();
    const project = projectRecord();
    const cover = project?.image
      ? '<img class="listening-room-cover" src="' + esc(project.image) + '" alt="Aokigahara / Fuji Sonic Pi album cover" loading="lazy">'
      : "";
    return '<section class="listening-room">' +
      '<div class="listening-room-masthead"><span>JHK / LISTENING ROOM</span><span>' + tracks.length + ' PUBLIC AUDIO SOURCES</span></div>' +
      '<h2>ARCHIVE / LISTENING</h2>' +
      '<p class="listening-room-intro">A sequential player for the recordings already held by the archive. Source groups and descriptions follow the catalogue; they do not imply additional locations or undocumented relationships. For live multi-layer mixing, enter the Sound Lab.</p>' +
      '<section class="listening-now" aria-label="Listening player">' +
        '<div class="listening-now-heading"><span>NOW PLAYING</span><span data-listening-position>NO SELECTION</span></div>' +
        '<div class="listening-now-meta"><strong data-listening-title>SELECT A RECORDING</strong><small data-listening-description>Playback begins only after you choose a source.</small></div>' +
        '<audio data-listening-audio controls preload="none" aria-label="Listening Room audio player"></audio>' +
        '<div class="listening-transport">' +
          '<button type="button" data-listening-action="previous" disabled>← PREVIOUS</button>' +
          '<button type="button" data-listening-action="next" disabled>NEXT →</button>' +
          '<button type="button" data-listening-action="stop" disabled>STOP</button>' +
        '</div>' +
        '<div class="listening-status" data-listening-status role="status" aria-live="polite">READY / NO SOURCE SELECTED</div>' +
      '</section>' +
      (project ? '<section class="listening-album-note">' + cover +
        '<div><span>ALBUM / PROCEDURAL PROJECT</span><strong>' + esc(project.title) +
        '</strong><small>Four released environments are playable below. The fifth render is not available.</small>' +
        (project.projectPath ? '<a href="' + esc(project.projectPath) + '" target="_blank" rel="noopener noreferrer">OPEN FULL DOSSIER ↗</a>' : '') +
        '</div></section>' : '') +
      '<div class="listening-room-sections">' + list.map(renderRoom).join("") + '</div>' +
      '<p class="listening-room-footnote">The queue advances through the selected room in catalogue order. Playback is local to this page; no listening history or saved mix is created.</p>' +
      '</section>';
  }

  const bound = new WeakSet();
  function bind(root) {
    const scope = root?.querySelector?.(".listening-room");
    if (!scope || bound.has(scope)) return false;
    bound.add(scope);

    const audio = scope.querySelector("[data-listening-audio]");
    const status = scope.querySelector("[data-listening-status]");
    const title = scope.querySelector("[data-listening-title]");
    const description = scope.querySelector("[data-listening-description]");
    const position = scope.querySelector("[data-listening-position]");
    const previous = scope.querySelector('[data-listening-action="previous"]');
    const next = scope.querySelector('[data-listening-action="next"]');
    const stop = scope.querySelector('[data-listening-action="stop"]');
    let queue = [];
    let index = -1;
    let generation = 0;

    function announce(message) {
      if (status) status.textContent = message;
    }
    function setTransport() {
      if (previous) previous.disabled = index < 0;
      if (next) next.disabled = index < 0 || index >= queue.length - 1;
      if (stop) stop.disabled = index < 0;
      if (position) position.textContent = index < 0 ? "NO SELECTION" :
        String(index + 1).padStart(2, "0") + " / " + String(queue.length).padStart(2, "0");
      scope.querySelectorAll("[data-listening-play-track]").forEach(button => {
        button.setAttribute("aria-pressed", String(index >= 0 && button.dataset.listeningPlayTrack === queue[index]?.id));
      });
    }
    function loadCurrent(autoplay) {
      const item = queue[index];
      if (!item || !audio) return false;
      generation += 1;
      const token = generation;
      try { audio.pause(); } catch (_) { }
      audio.src = item.file;
      audio.dataset.listeningTrack = item.id;
      if (title) title.textContent = item.title || "UNTITLED RECORDING";
      if (description) description.textContent = [item.group, item.description].filter(Boolean).join(" / ");
      announce("LOADING / " + (item.title || item.id));
      setTransport();
      audio.load();
      if (autoplay) {
        const promise = audio.play();
        if (promise && typeof promise.catch === "function") promise.catch(() => {
          if (generation === token) announce("PLAYBACK BLOCKED OR SOURCE UNAVAILABLE / USE THE PLAYER CONTROLS TO RETRY");
        });
        window.JIHANKI_EVENTS?.record("listening-room-track-started", { itemId: item.id, group: item.group || null });
      }
      return true;
    }
    function startRoom(roomId, trackId) {
      const room = rooms().find(entry => entry.id === roomId);
      if (!room || !room.tracks.length) return false;
      queue = room.tracks.slice();
      const selected = trackId ? queue.findIndex(item => item.id === trackId) : 0;
      index = selected >= 0 ? selected : 0;
      return loadCurrent(true);
    }
    function move(delta) {
      if (index < 0) return;
      const target = index + delta;
      if (target < 0) {
        try { audio.currentTime = 0; } catch (_) { }
        const promise = audio.play();
        if (promise && typeof promise.catch === "function") promise.catch(() => announce("PLAYBACK COULD NOT START"));
        return;
      }
      if (target >= queue.length) return;
      index = target;
      loadCurrent(true);
    }
    function stopPlayback() {
      generation += 1;
      try { audio.pause(); audio.currentTime = 0; } catch (_) { }
      queue = [];
      index = -1;
      if (title) title.textContent = "SELECT A RECORDING";
      if (description) description.textContent = "Playback stopped.";
      announce("STOPPED / THE ROOM IS QUIET");
      setTransport();
      window.JIHANKI_EVENTS?.record("listening-room-stopped", {});
    }

    audio.addEventListener("play", () => {
      const item = queue[index];
      announce(item ? "PLAYING / " + item.title : "PLAYING");
    });
    audio.addEventListener("pause", () => {
      if (!audio.ended && index >= 0 && audio.currentTime > 0) announce("PAUSED / " + queue[index].title);
    });
    audio.addEventListener("ended", () => {
      if (index >= 0 && index < queue.length - 1) {
        index += 1;
        loadCurrent(true);
      } else if (index >= 0) {
        announce("END OF ROOM / " + queue[index].title);
      }
    });
    audio.addEventListener("error", () => {
      if (index >= 0) announce("SOURCE COULD NOT BE LOADED / " + queue[index].title);
    });

    root.addEventListener("click", event => {
      const roomButton = event.target.closest?.("[data-listening-play-room]");
      if (roomButton && scope.contains(roomButton)) {
        startRoom(roomButton.dataset.listeningPlayRoom);
        return;
      }
      const trackButton = event.target.closest?.("[data-listening-play-track]");
      if (trackButton && scope.contains(trackButton)) {
        startRoom(trackButton.dataset.listeningRoomId, trackButton.dataset.listeningPlayTrack);
        return;
      }
      const action = event.target.closest?.("[data-listening-action]");
      if (!action || !scope.contains(action)) return;
      if (action.dataset.listeningAction === "previous") move(-1);
      else if (action.dataset.listeningAction === "next") move(1);
      else if (action.dataset.listeningAction === "stop") stopPlayback();
    });
    return true;
  }

  window.JIHANKI_LISTENING_ROOM = {
    catalogue, rooms, render, bind,
    sourceCount() { return catalogue().length; }
  };
})();
