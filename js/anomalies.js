/* Rare authored machine responses. They never alter or erase archive data. */
(function () {
  const RESPONSES = [
    ["UNREGISTERED MEMORY DETECTED", "SOURCE NOT FOUND"],
    ["RETURN SLOT NOT EMPTY", "PLEASE CHECK THE LOWER COMPARTMENT"],
    ["ARCHIVE ROTATION INTERRUPTED", "PREVIOUS MEMORY STILL PRESENT"],
    ["THE MACHINE REMEMBERS", "NO FURTHER DETAILS AVAILABLE"],
    ["UNKNOWN ARCHIVE CODE", "RECORD PRESERVED AS FRAGMENT"]
  ];
  let lastAt = 0;
  function maybe(trigger) {
    const now = Date.now();
    if (now - lastAt < 90000 || Math.random() > 0.012) return false;
    lastAt = now;
    const message = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    window.JIHANKI_EVENTS?.record("anomaly", { trigger, message: message[0] });
    const screen = document.getElementById("screen-content");
    if (screen) screen.innerHTML = '<div class="boot anomaly-screen"><div class="boot-title">' + window.JIHANKI_MARKDOWN.escape(message[0]) + '</div><div class="boot-subtitle">' + window.JIHANKI_MARKDOWN.escape(message[1]) + '</div><div class="boot-loading">JHK / SIGNAL UNSTABLE</div></div>';
    return true;
  }
  window.JIHANKI_ANOMALIES = { maybe };
})();