/* M50 — Temporal archive. Static catalogue + the visitor's local clock only.
   No network calls, cookies, localStorage, IndexedDB or visitor profile are used. */
(function () {
  "use strict";

  const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  function parseDate(value) {
    const raw = String(value == null ? "" : value).trim();
    let match = raw.match(/^(\d{4})$/);
    if (match) {
      const year = Number(match[1]);
      return year >= 1 && year <= 9999 ? {year,month:0,day:0,precision:"year",raw} : null;
    }
    match = raw.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]), month = Number(match[2]);
      return year >= 1 && month >= 1 && month <= 12 ? {year,month,day:0,precision:"month",raw} : null;
    }
    match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
    const check = new Date(Date.UTC(year,month-1,day));
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month-1 || check.getUTCDate() !== day) return null;
    return {year,month,day,precision:"day",raw};
  }

  function dateLabel(parsed) {
    if (!parsed) return "DATE NOT PARSED";
    if (parsed.precision === "year") return parsed.year + " / YEAR ONLY";
    if (parsed.precision === "month") return MONTHS[parsed.month-1] + " " + parsed.year + " / MONTH ONLY";
    const date = new Date(Date.UTC(parsed.year,parsed.month-1,parsed.day));
    return new Intl.DateTimeFormat(undefined,{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(date).toUpperCase();
  }

  function localMoment(now) {
    const hour = now.getHours();
    let phase = "DAY";
    if (hour >= 5 && hour <= 7) phase = "DAWN";
    else if (hour >= 8 && hour <= 11) phase = "MORNING";
    else if (hour >= 12 && hour <= 16) phase = "AFTERNOON";
    else if (hour >= 17 && hour <= 20) phase = "EVENING";
    else phase = "NIGHT";
    return {
      phase,
      date: new Intl.DateTimeFormat(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(now),
      time: new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit"}).format(now),
      dayKey: now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0")
    };
  }

  function hash(value) {
    let result = 2166136261;
    for (let index=0; index<value.length; index++) {
      result ^= value.charCodeAt(index);
      result = Math.imul(result,16777619);
    }
    return result >>> 0;
  }

  function catalogue() {
    return Array.isArray(window.JIHANKI_ARCHIVE)
      ? window.JIHANKI_ARCHIVE.filter(item => item && typeof item.id === "string" && item.id)
      : [];
  }

  function ordered(items) {
    return items.slice().sort((a,b) => {
      const pa=parseDate(a.date), pb=parseDate(b.date);
      if (pa && pb) {
        const ka=pa.year*10000+pa.month*100+pa.day, kb=pb.year*10000+pb.month*100+pb.day;
        return kb-ka || String(a.title||"").localeCompare(String(b.title||""));
      }
      if (pa) return -1;
      if (pb) return 1;
      return String(a.title||"").localeCompare(String(b.title||""));
    });
  }

  function recordButton(item) {
    const parsed=parseDate(item.date);
    const rawDate=parsed ? dateLabel(parsed) : (item.date ? "DATE AS RECORDED / "+String(item.date) : "DATE NOT RECORDED");
    const category=String(item.machineCategory||item.category||item.type||"ARCHIVE").replace(/[-_]/g," ").toUpperCase();
    return '<button class="temporal-record" type="button" data-temporal-open="'+escapeHtml(item.id)+'">'+
      '<span class="temporal-record-date">'+escapeHtml(rawDate)+'</span>'+
      '<strong>'+escapeHtml(item.title||"UNTITLED")+'</strong>'+
      '<small>'+escapeHtml(category)+'</small></button>';
  }

  function render() {
    const all=catalogue();
    const dated=[], unplaced=[];
    all.forEach(item => {
      const parsed=parseDate(item.date);
      if (parsed) dated.push({item,parsed});
      else unplaced.push(item);
    });

    const years=new Map();
    dated.forEach(entry => {
      if (!years.has(entry.parsed.year)) years.set(entry.parsed.year,[]);
      years.get(entry.parsed.year).push(entry);
    });
    const yearNumbers=[...years.keys()].sort((a,b)=>b-a);
    const latestYear=yearNumbers[0]||null;
    const lowestYear=yearNumbers.length?yearNumbers[yearNumbers.length-1]:null;
    const now=localMoment(new Date());
    const dayPool=ordered(all);
    const companion=dayPool.length?dayPool[hash(now.dayKey+":"+now.phase+":"+dayPool.length)%dayPool.length]:null;
    const exact=dated.filter(entry=>entry.parsed.precision==="day");
    const firstDate=exact.length?exact.map(entry=>entry.parsed.raw).sort()[0]:null;
    const lastDate=exact.length?exact.map(entry=>entry.parsed.raw).sort().slice(-1)[0]:null;

    let chronology="";
    if (!dated.length) {
      chronology='<div class="temporal-empty">NO VALID ARCHIVE DATES ARE RECORDED YET. THE CATALOGUE REMAINS AVAILABLE THROUGH ITS ORIGINAL INDEX.</div>';
    } else {
      for (let year=latestYear; year>=lowestYear; year--) {
        const entries=years.get(year)||[];
        if (!entries.length) {
          chronology+='<div class="temporal-gap"><strong>'+year+'</strong><span>NO RECORD IN THE CATALOGUE CARRIES A DATE FOR THIS YEAR.</span></div>';
          continue;
        }
        const buckets=new Map();
        entries.forEach(entry => {
          const key=entry.parsed.month?String(entry.parsed.month).padStart(2,"0"):"00";
          if (!buckets.has(key)) buckets.set(key,[]);
          buckets.get(key).push(entry);
        });
        const months=[...buckets.keys()].sort((a,b)=>Number(b)-Number(a));
        let records="";
        months.forEach(key => {
          const monthEntries=buckets.get(key).sort((a,b)=>{
            const ka=a.parsed.day||0, kb=b.parsed.day||0;
            return kb-ka || String(a.item.title||"").localeCompare(String(b.item.title||""));
          });
          const label=key==="00"?"YEAR-ONLY DATES":MONTHS[Number(key)-1];
          records+='<div class="temporal-month"><h3>'+label+'</h3>'+monthEntries.map(entry=>recordButton(entry.item)).join("")+'</div>';
        });
        chronology+='<details class="temporal-year" '+(year===latestYear?"open":"")+'><summary><span>'+year+'</span><small>'+entries.length+' RECORD'+(entries.length===1?"":"S")+'</small></summary>'+records+'</details>';
      }
    }

    const companionMarkup=companion
      ? '<div class="temporal-companion"><span>AN ECHO FOR THIS HOUR / '+now.phase+'</span>'+recordButton(companion)+
        '<p>This is a presentational selection made from the public catalogue. It does not claim that the work was recorded at this hour.</p></div>'
      : '<div class="temporal-empty">THE ARCHIVE HAS NO RECORDS TO SURFACE.</div>';
    const range=firstDate&&lastDate?firstDate+" — "+lastDate:(dated.length?"DATES RECORDED AT YEAR OR MONTH PRECISION":"NO FULL DATES RECORDED");
    const unplacedMarkup=unplaced.length
      ? '<details class="temporal-unplaced"><summary><span>UNPLACED / DATE NOT PARSED</span><small>'+unplaced.length+' RECORD'+(unplaced.length===1?"":"S")+'</small></summary>'+ordered(unplaced).map(recordButton).join("")+'</details>'
      : "";

    return '<section class="temporal-archive">'+
      '<div class="temporal-now"><span>VISITOR-LOCAL TIME / PRESENTATION ONLY</span><strong>'+escapeHtml(now.phase)+'</strong>'+
      '<p>'+escapeHtml(now.date)+' · '+escapeHtml(now.time)+'</p><small>THE CLOCK IS READ IN THIS BROWSER AND IS NOT SENT TO A SERVER.</small></div>'+
      companionMarkup+
      '<div class="temporal-summary"><div><span>CATALOGUE</span><strong>'+all.length+'</strong></div>'+
      '<div><span>DATED RECORDS</span><strong>'+dated.length+'</strong></div>'+
      '<div><span>UNPLACED / UNDATED</span><strong>'+unplaced.length+'</strong></div></div>'+
      '<div class="temporal-range"><span>RECORDED CHRONOLOGY</span><strong>'+escapeHtml(range)+'</strong>'+
      '<p>Dates are shown at the precision supplied by the archive. Missing years remain visible as gaps; no events or recording times are inferred.</p></div>'+
      '<div class="temporal-timeline-heading">ARCHIVE CHRONOLOGY / NEWEST FIRST</div>'+chronology+unplacedMarkup+
      '<p class="temporal-footnote">TIME CHANGES THIS VIEW ONLY. THE COMPLETE CATALOGUE, ORIGINAL DATES AND CATEGORY SELECTORS REMAIN UNCHANGED.</p>'+
      '</section>';
  }

  window.JIHANKI_TEMPORAL = {
    render,
    parseDate,
    stats() {
      const all=catalogue(), dated=all.filter(item=>parseDate(item.date));
      return {total:all.length,dated:dated.length,unplaced:all.length-dated.length,
        years:[...new Set(dated.map(item=>parseDate(item.date).year))].sort((a,b)=>a-b)};
    },
    localPhase() { return localMoment(new Date()).phase; }
  };
})();
