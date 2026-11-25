/* M32 — Ambient machine states.
   A single original loop changes level and playback character as the machine changes mode.
   Visitor mute preference is local; media playback ducks rather than stops the ambience. */
(function () {
  const SOUND = {
    button: "media/sound/jihanki-sfx/button-sound.opus",
    buttonFallback: "media/sound/jihanki-sfx/button-sound.wav",
    coin: "media/sound/jihanki-sfx/entering-money.opus",
    coinFallback: "media/sound/jihanki-sfx/entering-money.wav",
    home: "media/sound/jihanki-sfx/homebutton.opus",
    homeFallback: "media/sound/jihanki-sfx/homebutton.wav",
    loop: "media/sound/jihanki-sfx/jihanki-music-loop.opus",
    loopFallback: "media/sound/jihanki-sfx/jihanki-music-loop.wav"
  };
  const PROFILES = {
    idle:       { volume: 0.095, rate: 1.000 },
    browsing:   { volume: 0.070, rate: 0.995 },
    reading:    { volume: 0.040, rate: 0.985 },
    dispensing: { volume: 0.145, rate: 1.010 },
    service:    { volume: 0.035, rate: 0.975 },
    rotation:   { volume: 0.060, rate: 0.990 },
    collection: { volume: 0.060, rate: 0.990 },
    anomaly:    { volume: 0.025, rate: 0.970 }
  };
  const MUTE_KEY = "jihanki.audio.muted.v1";
  const loop = new Audio();
  loop.loop = true;
  loop.preload = "none";
  let fallback = loop.canPlayType('audio/ogg; codecs="opus"') === "";
  let requested = false;
  let muted = false;
  let manualDuck = false;
  let lastSfx = 0;
  let machineState = "idle";
  let stableState = "idle";
  let stateGeneration = 0;
  const activeMedia = new Set();

  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (_) {}
  loop.src = fallback ? SOUND.loopFallback : SOUND.loop;
  loop.muted = muted;
  loop.volume = PROFILES.idle.volume;
  loop.playbackRate = PROFILES.idle.rate;

  loop.addEventListener("error", () => {
    if (!fallback) {
      fallback = true;
      loop.src = SOUND.loopFallback;
      loop.load();
      if (requested) start();
    }
  });

  function targetVolume() {
    const profile = PROFILES[machineState] || PROFILES.idle;
    const ducked = manualDuck || activeMedia.size > 0;
    return muted ? 0 : profile.volume * (ducked ? 0.28 : 1);
  }
  function start() {
    requested = true;
    if (!loop.paused) return;
    try {
      const promise = loop.play();
      if (promise?.catch) promise.catch(() => {});
    } catch (_) {}
  }
  function setState(next, durationMs) {
    const state = PROFILES[next] ? next : "idle";
    const previous = machineState;
    const transient = Number.isFinite(durationMs) && durationMs > 0;
    if (!transient) stableState = state;
    if (state !== machineState) {
      machineState = state;
      const profile = PROFILES[state];
      try { loop.playbackRate = profile.rate; } catch (_) {}
      window.JIHANKI_EVENTS?.record("ambient-state-changed", { from: previous, to: state });
    }
    const generation = ++stateGeneration;
    if (transient) {
      const returnState = stableState;
      window.setTimeout(() => {
        if (generation === stateGeneration) setState(returnState);
      }, durationMs);
    }
    return machineState;
  }
  function toggleMute(forceValue) {
    muted = typeof forceValue === "boolean" ? forceValue : !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (_) {}
    loop.muted = muted;
    window.JIHANKI_EVENTS?.record(muted ? "ambient-muted" : "ambient-unmuted", {});
    return muted;
  }
  function duck(value) {
    manualDuck = !!value;
  }
  function bindMedia(root) {
    if (!root) return;
    root.querySelectorAll("audio,video").forEach(media => {
      media.addEventListener("play", () => activeMedia.add(media));
      const release = () => activeMedia.delete(media);
      media.addEventListener("pause", release);
      media.addEventListener("ended", release);
      media.addEventListener("emptied", release);
    });
  }
  function clearMedia() {
    activeMedia.clear();
    manualDuck = false;
  }
  function sfx(name) {
    if (muted) return;
    const now = Date.now();
    if (now - lastSfx < 45) return;
    lastSfx = now;
    const src = fallback && SOUND[name + "Fallback"] ? SOUND[name + "Fallback"] : SOUND[name];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = name === "coin" ? 0.55 : 0.4;
      const promise = audio.play();
      if (promise?.catch) promise.catch(() => {});
    } catch (_) {}
  }

  // Gentle envelope keeps transitions audible without abrupt level jumps.
  window.setInterval(() => {
    const target = targetVolume();
    const next = loop.volume + (target - loop.volume) * 0.16;
    try { loop.volume = Math.abs(target - next) < 0.001 ? target : next; } catch (_) {}
  }, 60);

  window.JIHANKI_AUDIO = {
    start, setState, getState() {
      return { state: machineState, muted, foregroundCount: activeMedia.size, targetVolume: targetVolume() };
    },
    toggleMute, isMuted() { return muted; },
    duck, clearMedia, sfx, bindMedia,
    stop() { loop.pause(); requested = false; }
  };
  document.addEventListener("pointerdown", start, { passive: true, once: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && requested && loop.paused && !muted) start();
  });
})();