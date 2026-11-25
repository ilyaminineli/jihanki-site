/* JIHANKI ambient loop and tactile interface sounds. */
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
  const loop = new Audio();
  loop.loop = true; loop.preload = "none"; loop.volume = 0.10;
  let fallback = loop.canPlayType('audio/ogg; codecs="opus"') === "";
  let requested = false, muted = false, lastSfx = 0;
  loop.src = fallback ? SOUND.loopFallback : SOUND.loop;
  loop.addEventListener("error", () => {
    if (!fallback) { fallback = true; loop.src = SOUND.loopFallback; loop.load(); if (requested) start(); }
  });
  function start() {
    requested = true;
    if (loop.paused) { const p = loop.play(); if (p?.catch) p.catch(() => {}); }
  }
  function duck(value) { muted = !!value; loop.muted = muted; loop.volume = muted ? 0 : 0.10; }
  function sfx(name) {
    const now = Date.now(); if (now - lastSfx < 45) return; lastSfx = now;
    const src = fallback && SOUND[name + "Fallback"] ? SOUND[name + "Fallback"] : SOUND[name];
    if (!src) return;
    const audio = new Audio(src); audio.volume = name === "coin" ? 0.55 : 0.4;
    const p = audio.play(); if (p?.catch) p.catch(() => {});
  }
  function bindMedia(root) {
    root.querySelectorAll("audio,video").forEach(media => {
      media.addEventListener("play", () => duck(true));
      media.addEventListener("pause", () => duck(false));
      media.addEventListener("ended", () => duck(false));
    });
  }
  window.JIHANKI_AUDIO = { start, duck, sfx, bindMedia, stop() { loop.pause(); requested = false; } };
  document.addEventListener("pointerdown", start, { passive: true, once: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && requested && loop.paused) start(); });
})();