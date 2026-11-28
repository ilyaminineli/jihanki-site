/* M50 — Temporal archive.
   Static catalogue + visitor-local clock. No requests, cookies or persistent visitor state. */
(function () {
  "use strict";

  const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const IMAGE_EXT = /\.(?:jpe?g|png|webp|gif|svg)$/i;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function localAsset(item) {
    const candidate = String(item?.image || (IMAGE_EXT.test(String(item?.file || "")) ? item.file : "") || "").trim();
    if (!candidate || !candidate.startsWith("media/") || candidate.split("/").includes("..") ||
      /^[a-z][a-z0-9+.-]*:/i.test(candidate) || candidate.startsWith("//")) return "";
    return encodeURI(candidate).replace(/#/g, "%23").replace(/\?/g, "%3F");
  }

  function parseDate(value) {
    const raw = String(value == null ? "" : value).trim();
    let match = raw.match(/^(\d{4})$/);
    if (match) {
      const year = Number(match[1]);
      return year >= 1 && year <= 9999 ? { year, month: 0, day: 0, precision: "year", raw } : null;
    }
    match = raw.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]), month = Number(match[2]);
      return year >= 1 && month >= 1 && month <= 12 ? { year, month, day: 0, precision: "month", raw } : null;
    }
    match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    const check = new Date(0);
    check.setUTCHours(0, 0, 0, 0);
    check.setUTCFullYear(year, month - 1, day);
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
    return { year, month, day, precision: "day", raw };
  }

  function dateLabel(parsed) {
    if (!parsed) return "DATE NOT PARSED";
    if (parsed.precision === "year") return parsed.year + " / YEAR ONLY";
    if (parsed.precision === "month") return MONTHS[parsed.month - 1] + " " + parsed.year + " / MONTH ONLY";
    const date = new Date(0);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(parsed.year, parsed.month - 1, parsed.day);
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date).toUpperCase();
  }

  function localMoment(now) {
    const hour = now.getHours();
    let phase = "NIGHT";
    if (hour >= 5 && hour <= 7) phase = "DAWN";
    else if (hour >= 8 && hour <= 11) phase = "MORNING";
    else if (hour >= 12 && hour <= 16) phase = "AFTERNOON";
    else if (hour >= 17 && hour <= 20) phase = "EVENING";
    return {
      phase,
      date: new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now),
      time: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(now),
      hour,
      dayKey: now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0")
    };
  }

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index++) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function catalogue() {
    return Array.isArray(window.JIHANKI_ARCHIVE)
      ? window.JIHANKI_ARCHIVE.filter(item => item && typeof item.id === "string" && item.id)
      : [];
  }

  function ordered(items) {
    return items.slice().sort((a, b) => {
      const pa = parseDate(a.date), pb = parseDate(b.date);
      if (pa && pb) {
        const ka = pa.year * 10000 + pa.month * 100 + pa.day, kb = pb.year * 10000 + pb.month * 100 + pb.day;
        return kb - ka || String(a.title || "").localeCompare(String(b.title || ""));
      }
      if (pa) return -1;
      if (pb) return 1;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }

  function recordButton(item, index) {
    const parsed = parseDate(item.date);
    const recordedDate = parsed ? dateLabel(parsed) : (item.date ? "DATE AS RECORDED / " + String(item.date) : "DATE NOT RECORDED");
    const category = String(item.machineCategory || item.category || item.type || "ARCHIVE").replace(/[-_]/g, " ").toUpperCase();
    const source = localAsset(item);
    const media = source
      ? '<span class="temporal-record-media"><img src="' + escapeHtml(source) + '" alt="" loading="lazy" decoding="async"><span class="artifact-media-status temporal-image-status" role="status" aria-live="polite"></span></span>'
      : '<span class="temporal-record-media temporal-record-placeholder" aria-hidden="true"><span>JHK</span><small>' +
      escapeHtml(String(index == null ? item.id : String(index + 1).padStart(2, "0"))) + '</small></span>';
    return '<button class="temporal-record' + (source ? ' temporal-record--image' : '') + '" type="button" data-temporal-open="' + escapeHtml(item.id) + '" aria-label="Open ' + escapeHtml(item.title || "Untitled") + ', ' + escapeHtml(recordedDate) + '">' +
      media + '<span class="temporal-record-copy"><span class="temporal-record-date">' + escapeHtml(recordedDate) + '</span>' +
      '<strong>' + escapeHtml(item.title || "UNTITLED") + '</strong>' +
      '<small>' + escapeHtml(category) + (item.author ? ' / ' + escapeHtml(String(item.author).toUpperCase()) : '') + '</small></span></button>';
  }

  function render() {
    const all = catalogue();
    const dated = [], unplaced = [];
    all.forEach(item => {
      const parsed = parseDate(item.date);
      if (parsed) dated.push({ item, parsed });
      else unplaced.push(item);
    });

    const years = new Map();
    dated.forEach(entry => {
      if (!years.has(entry.parsed.year)) years.set(entry.parsed.year, []);
      years.get(entry.parsed.year).push(entry);
    });
    const yearNumbers = [...years.keys()].sort((a, b) => b - a);
    const latestYear = yearNumbers[0] || null;
    const lowestYear = yearNumbers.length ? yearNumbers[yearNumbers.length - 1] : null;
    const now = localMoment(new Date());
    const dayPool = ordered(all);
    const companion = dayPool.length ? dayPool[hash(now.dayKey + ":" + now.hour + ":" + now.phase + ":" + dayPool.length) % dayPool.length] : null;
    const imageCount = all.filter(item => !!localAsset(item)).length;
    const dateOrder = dated.map(entry => entry.parsed).sort((a, b) =>
      (a.year * 10000 + a.month * 100 + a.day) - (b.year * 10000 + b.month * 100 + b.day));
    const firstDate = dateOrder.length ? dateLabel(dateOrder[0]) : null;
    const lastDate = dateOrder.length ? dateLabel(dateOrder[dateOrder.length - 1]) : null;

    let chronology = "";
    if (!dated.length) {
      chronology = '<div class="temporal-empty">NO VALID ARCHIVE DATES ARE RECORDED YET. THE CATALOGUE REMAINS AVAILABLE THROUGH ITS ORIGINAL INDEX.</div>';
    } else {
      for (let year = latestYear; year >= lowestYear; year--) {
        const entries = years.get(year) || [];
        if (!entries.length) {
          chronology += '<div class="temporal-gap"><strong>' + year + '</strong><span>NO RECORD IN THE CATALOGUE CARRIES A DATE FOR THIS YEAR.</span></div>';
          continue;
        }
        const buckets = new Map();
        entries.forEach(entry => {
          const key = entry.parsed.month ? String(entry.parsed.month).padStart(2, "0") : "00";
          if (!buckets.has(key)) buckets.set(key, []);
          buckets.get(key).push(entry);
        });
        const months = [...buckets.keys()].sort((a, b) => Number(b) - Number(a));
        let records = "";
        months.forEach(key => {
          const monthEntries = buckets.get(key).sort((a, b) => {
            const ka = a.parsed.day || 0, kb = b.parsed.day || 0;
            return kb - ka || String(a.item.title || "").localeCompare(String(b.item.title || ""));
          });
          const label = key === "00" ? "YEAR-ONLY DATES" : MONTHS[Number(key) - 1];
          records += '<section class="temporal-month"><header class="temporal-month-header"><h3>' + label + '</h3><small>' +
            monthEntries.length + ' RECORD' + (monthEntries.length === 1 ? "" : "S") + '</small></header>' +
            '<div class="temporal-contact-sheet">' + monthEntries.map((entry, index) => recordButton(entry.item, index)).join("") + '</div></section>';
        });
        chronology += '<details class="temporal-year" ' + (year === latestYear ? "open" : "") + '><summary>' +
          '<span class="temporal-year-number">' + year + '</span><span class="temporal-year-meta"><strong>' + entries.length +
          ' ARCHIVE RECORDS</strong><small>OPEN YEAR / CONTACT SHEET</small></span></summary>' +
          '<div class="temporal-year-body"><div class="temporal-year-stamp" aria-hidden="true">' + String(year).slice(-2) + '</div>' +
          '<div class="temporal-year-months">' + records + '</div></div></details>';
      }
    }

    const companionMarkup = companion
      ? '<section class="temporal-echo"><div class="temporal-section-label"><span>AN ECHO FOR THIS HOUR</span><strong>' + escapeHtml(now.time) + ' / ' + escapeHtml(now.phase) + '</strong></div>' +
      recordButton(companion) + '<p>A present-day selection from the catalogue. It is not a recording-time claim.</p></section>'
      : '<div class="temporal-empty">THE ARCHIVE HAS NO RECORDS TO SURFACE.</div>';
    const range = firstDate && lastDate ? firstDate + " — " + lastDate : "NO DATED RECORDS";
    const unplacedMarkup = unplaced.length
      ? '<details class="temporal-unplaced"><summary><span>UNPLACED / DATE NOT PARSED</span><small>' + unplaced.length + ' RECORD' + (unplaced.length === 1 ? "" : "S") + '</small></summary>' +
      '<div class="temporal-contact-sheet">' + ordered(unplaced).map((item, index) => recordButton(item, index)).join("") + '</div></details>'
      : "";

    return '<section class="temporal-archive">' +
      '<div class="temporal-marquee" aria-hidden="true"><span>JIHANKI ARCHIVE / FIELD INDEX / SOUND / IMAGE / PLACE / MEMORY / JIHANKI ARCHIVE / FIELD INDEX / SOUND / IMAGE / PLACE / MEMORY /</span></div>' +
      '<header class="temporal-masthead">' +
      '<div class="temporal-kicker"><span>JHK / FIELD ARCHIVE</span><span>CHRONOLOGICAL REGISTER / VOL. 01</span></div>' +
      '<h1 class="temporal-wordmark"><span>ARCHIVIO</span></h1>' +
      '<div class="temporal-subline"><span>THE MACHINE REMEMBERS</span><span>SAIKO / FUJI / AOKIGAHARA / JAPAN</span></div>' +
      '<nav class="temporal-nav" aria-label="Archive navigation">' +
      '<button type="button" data-temporal-map>MAPPA ↗</button>' +
      '<button type="button" data-temporal-random>RANDOM ↗</button>' +
      '<button type="button" data-temporal-scroll>TIMELINE ↓</button>' +
      '</nav></header>' +
      '<div class="temporal-lead-grid">' +
      '<section class="temporal-now"><span class="temporal-section-label">VISITOR-LOCAL TIME / PRESENTATION ONLY</span>' +
      '<strong>' + escapeHtml(now.phase) + '</strong><p>' + escapeHtml(now.date) + ' / ' + escapeHtml(now.time) + '</p>' +
      '<small>READ IN THIS BROWSER / NOT TRANSMITTED / NOT SAVED</small></section>' +
      '<div class="temporal-locality"><span>THE ARCHIVE IS NOT A CLOCK</span><strong>' + all.length + ' FRAGMENTS</strong>' +
      '<p>Time changes the order of attention, never the underlying record.</p><small>RECORDED RANGE / ' + escapeHtml(range) + '</small></div></div>' +
      '<section class="temporal-purpose"><strong>WHAT IS CHRONOLOGY?</strong>' +
      '<p>This is a date index of the records preserved in JIHANKI, not a diary of your visits. Open a year or month to browse its original entries.</p>' +
      '<p>THE HOURLY ECHO is one reading suggestion selected by this browser\'s local clock. It does not change an archive date, the daily rotation or your visit history.</p></section>' +
      companionMarkup +
      '<div class="temporal-summary"><span>' + all.length + ' RECORDS</span><span>' + imageCount + ' IMAGE SOURCES</span>' +
      '<span>' + dated.length + ' DATED / ' + unplaced.length + ' UNPLACED</span></div>' +
      '<div id="temporal-timeline" class="temporal-timeline-heading"><div><span>01 / CHRONOLOGICAL INDEX</span><strong>TIMELINE</strong></div>' +
      '<small>NEWEST FIRST / ORIGINAL DATES ONLY</small></div>' + chronology + unplacedMarkup +
      '<p class="temporal-footnote">ALL RECORDS REMAIN AVAILABLE. DATE PRECISION IS PRESERVED. MISSING YEARS ARE SHOWN AS GAPS, NOT AS EVENTS.</p>' +
      '</section>';
  }

  window.JIHANKI_TEMPORAL = {
    render,
    parseDate,
    stats() {
      const all = catalogue(), dated = all.filter(item => parseDate(item.date));
      return {
        total: all.length, dated: dated.length, unplaced: all.length - dated.length,
        images: all.filter(item => !!localAsset(item)).length,
        years: [...new Set(dated.map(item => parseDate(item.date).year))].sort((a, b) => a - b)
      };
    },
    localPhase() { return localMoment(new Date()).phase; }
  };
})();
