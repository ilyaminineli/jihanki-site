(function () {
const D = {
    "fuji-six-yokai-video":
      "A fictional yokai-documentary work presented as an homage to Japanese yokai folklore and ghost-story television. The film introduces six invented beings associated with Mount Fuji and deliberately uses the tone of a field documentary or late-night mystery programme. The names, folklore and documentary evidence are entirely fictional, forming part of the wider Fuji-region archive where real places and invented mythology overlap.",
    "mountain-remembers-mv":
      "A fragmentary audiovisual journey through the Fuji region, built from roads, forests, shrines, tunnels, lakes, vending machines, field recordings and traces of people encountered during the Japan expedition. It is deliberately not a conventional travel diary: places become characters and the boundary between physical landscape and remembered landscape becomes uncertain. The work connects Mount Fuji, the Fuji Five Lakes, Aokigahara, Saiko, Kawaguchiko, Shojiko, Motosuko, surrounding roads, shrines, tunnels and vending machines into one fictional audiovisual landscape.",

    "endless-road":
      "A journey-based music video featuring Akane Iirai and Takismana, assembled from footage connected with the Japan trip. It belongs with the other travel-derived audiovisual works in this archive.",
    gonshan:
      "Experimental visual music inspired by Kitahara Hakushu’s Higanbana from Memories (1911). The musical language uses the In-sen pentatonic scale, while Takismana and Eugene provide UTAU voices. Newspaper fragments, footprints and crimson higanbana form a digital collage around frozen time and cyclical loss: grief becomes an endless ritual between the living and the dead.",
    tunnel:
      "An audiovisual exploration of the Uno-Misaki Tunnel in the Yamanashi mountains, imagined as a giant recording device. The walls become a fictional archive preserving footsteps, coins, engines and a courier’s bicycle from different decades. Doubling figures represent layers of time returning to the surface, while a camera-like click suggests that the tunnel itself is photographing its visitors. The soundtrack combines tracker music with field recordings from inside the tunnel.",
    hotaru:
      "A conceptual audiovisual journey along a river at twilight, where fireflies become voices from the other side. The work connects them with Japanese legends, mono no aware and the bittersweet beauty of impermanence, combining liminal-space imagery with experimental VocalSynth / UTAU sound. Music and lyrics are by Takismana; the video combines dance, editing and cinematography.",
    shiki:
      "A Takismana audiovisual work preserved in the current JIHANKI archive. The repository README identifies it as part of the same developing video body but does not yet provide a complete project statement, so the archive intentionally avoids inventing a fuller interpretation.",
  };

  const esc = value => window.JIHANKI_MARKDOWN.escape(value);
  function render(item) {
    const description = D[item.id] || item.description || "";
    const voices = Array.isArray(item.voices) ? item.voices.join(" · ") : "";
    return '<div class="video-artifact"><div class="video-artifact-meta">VIDEO / ARCHIVE</div>' +
      (description ? '<section class="video-artifact-description"><span class="video-artifact-description-label">DESCRIPTION</span>' + esc(description) + '</section>' : '') +
      (voices ? '<div class="video-artifact-voices">UTAU VOICES / ' + esc(voices) + '</div>' : '') +
      '<video class="video-artifact-frame" controls playsinline preload="metadata" src="' + esc(item.file) + '"></video></div>';
  }
  window.JIHANKI_VIDEO = { render, description(item) { return D[item?.id] || item?.description || ""; } };
})();