#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(path, "utf8");
const [theme,index,sw,guide,projectHtml,projectCss,archiveCss] = await Promise.all([
  read("css/jihanki-analog.css"), read("index.html"), read("sw.js"),
  read("documents/design/JIHANKI-ANALOG-DESIGN-SYSTEM.md"),
  read("projects/aokigahara/index.html"), read("projects/aokigahara/aokigahara.css"),
  read("css/archive-system.css")
]);

assert.match(theme, /--jhk-screen:\s*#080808/i, "Shared CRT surface token is missing.");
assert.match(theme, /--jhk-font-mono:\s*"Courier New"/, "Shared terminal font token is missing.");
assert.match(theme, /\.temporal-archive[\s\S]*?font-family:var\(--jhk-font-mono\)/,
  "Chronology must use the shared mono face.");
assert.match(theme, /\.temporal-wordmark[\s\S]*?font:[^;]*var\(--jhk-font-mono\)/,
  "Chronology display wordmark must use the shared mono face.");
assert.match(theme, /\.memory-map-panel \.map-canvas[\s\S]*?#070707 !important/,
  "Memory Network must use the monochrome map surface.");
assert.match(theme, /\.map-prefecture-backdrop img \{\s*filter:grayscale\(1\)/,
  "Map geography must be rendered in grayscale.");
assert.match(theme, /\.museum-intro p \{[^}]*var\(--jhk-font-mono\)/,
  "Museum explanatory copy must use the shared mono face.");
assert.match(theme, /\.collectible-inscription \{[^}]*var\(--jhk-font-mono\)/,
  "Collectible inscriptions must use the shared mono face.");

const archiveLink=index.indexOf('href="css/archive-system.css"');
const themeLink=index.indexOf('href="css/jihanki-analog.css"');
assert(archiveLink>=0&&themeLink>archiveLink,"Shared theme must load after feature-specific archive styles.");
assert(sw.includes('"./css/jihanki-analog.css"'),"Shared theme must be precached for offline use.");
assert.match(sw,/jihanki-shell-v19/,"Service-worker shell cache must be versioned for the new stylesheet.");
assert(projectHtml.includes('../../css/jihanki-analog.css'),"Standalone Aokigahara dossier must load shared design tokens.");
assert.match(projectCss,/--bg:\s*var\(--jhk-ink/,"Project palette must derive from shared JIHANKI tokens.");
assert.match(guide,/Intentional exceptions[\s\S]*Printed receipts[\s\S]*Exported Curator's Cabinet cards/,
  "The design guide must preserve explicit print/export exceptions.");
assert.match(guide,/Memory Network[\s\S]*monochrome map canvas/,"The design guide must define Memory Network appearance.");
assert.match(archiveCss,/\.sound-suite-tabs/,"Integrated Sound Lab mode component is retained.");
assert(theme.includes("padding:max(10px,env(safe-area-inset-top))"),
  "Artifact overlay must respect safe-area insets.");
assert(theme.includes("max-height:calc(100dvh - 24px)"),
  "Artifact window must be constrained to the visible viewport.");
assert(theme.includes(".map-expedition-return button")&&theme.includes("background:var(--jhk-panel) !important"),
  "Map return must use the shared neutral panel palette.");
assert(theme.includes(".location-archive")&&theme.includes("padding:40px 12px 12px"),
  "CRT location list must reserve headroom for the physical credit display.");

assert(!/font:[^;]*(?:Impact|Arial Narrow|Georgia|sans-serif)/i.test(archiveCss)&&
  !/font-family:\s*(?:Impact|Arial|Helvetica|Georgia)/i.test(archiveCss),
  "Feature-specific archive CSS must not reintroduce the legacy editorial font stack.");
const mapLegacy=archiveCss.slice(archiveCss.indexOf("/* M56 —"),archiveCss.indexOf("/* M65 —"));
assert(!mapLegacy.includes("99, 178, 122")&&!mapLegacy.includes("#36d77b"),
  "Legacy map phosphor rules must not retain a green palette.");

console.log("JIHANKI analog design tests passed: shared tokens, Chronology, Memory Network, Museum, offline cache and project dossier.");
