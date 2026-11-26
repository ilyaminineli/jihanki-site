/* Small safe Markdown renderer for the archive's intentionally simple dialect. */
(function () {
  const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  function safeURL(path, base) {
    const raw = String(path || "").trim();
    if (/^(javascript|data):/i.test(raw)) return "#";
    try { const url = new URL(raw, base); return ["http:", "https:"].includes(url.protocol) ? url.href : "#"; }
    catch (_) { return "#"; }
  }
  function inline(text, base) {
    let value = esc(text), tokens = [];
    const token = html => { const key = "@@JH" + tokens.length + "@@"; tokens.push(html); return key; };
    value = value.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, path) => token('<img class="markdown-image" src="' + esc(safeURL(path, base)) + '" alt="' + esc(alt) + '">'));
    value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, path) => {
      const href = safeURL(path, base), ext = path.split("?")[0].split(".").pop().toLowerCase();
      if (/^(mp3|wav|ogg|m4a|aac|flac|opus)$/.test(ext)) return token('<div class="markdown-audio"><div class="markdown-audio-label">' + label + '</div><audio controls preload="metadata" src="' + esc(href) + '"></audio></div>');
      return token('<a class="markdown-link" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
    });
    value = value.replace(/`([^`]+)`/g, (_, code) => token("<code>" + esc(code) + "</code>"));
    value = value.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>").replace(/__([^_\n]+?)__/g, "<strong>$1</strong>");
    value = value.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>").replace(/_([^_\n]+?)_/g, "<em>$1</em>");
    return value.replace(/@@JH(\d+)@@/g, (_, index) => tokens[Number(index)]);
  }
  function render(markdown, base) {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    let html = "", paragraph = [], list = null;
    const flush = () => { if (paragraph.length) { html += "<p>" + inline(paragraph.join(" "), base) + "</p>"; paragraph = []; } };
    const close = () => { if (list) html += "</" + list + ">"; list = null; };
    for (const raw of lines) {
      const line = raw.trim(); if (!line) { flush(); close(); continue; }
      if (/^---+$/.test(line)) { flush(); close(); html += "<hr>"; continue; }
      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) { flush(); close(); const n = heading[1].length; html += "<h" + n + ">" + inline(heading[2], base) + "</h" + n + ">"; continue; }
      const unordered = line.match(/^[-*+]\s+(.*)$/), ordered = line.match(/^\d+\.\s+(.*)$/);
      if (unordered || ordered) {
        flush(); const kind = unordered ? "ul" : "ol";
        if (list !== kind) { close(); html += "<" + kind + ">"; list = kind; }
        html += "<li>" + inline((unordered || ordered)[1], base) + "</li>"; continue;
      }
      close(); paragraph.push(line);
    }
    flush(); close(); return html;
  }
  window.JIHANKI_MARKDOWN = { render, escape: esc, safeURL };
})();