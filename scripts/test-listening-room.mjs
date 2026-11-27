#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("js/listening-room.js", "utf8");
const soundscapeSource = await readFile("js/soundscape.js", "utf8");
const album = [
  ["aokigahara-01-fujisan", "01 — FUJISAN / GEOLOGICAL", "media/music/fuji-sonicpi-01.opus"],
  ["aokigahara-02-aokigahara", "02 — AOKIGAHARA / BIOLOGICAL", "media/music/fuji-sonicpi-02.opus"],
  ["aokigahara-03-saiko", "03 — SAIKO / REFLECTIVE", "media/music/fuji-sonicpi-03.opus"],
  ["aokigahara-04-village", "04 — VILLAGE / SOCIAL", "media/music/fuji-sonicpi-04.opus"]
].map(([id, title, file]) => ({ id, title, type:"audio", category:"music", group:"AOKIGAHARA / PENTALOGY", file, description:title }));
const samples = [
  { id:"sound-01", title:"Bird 1 (full)", type:"audio", category:"sound", group:"Environment / weather", file:"media/sound/samples_cleaned/Bird 1 (full).opus", description:"Full bird recording." },
  { id:"sound-02", title:"Bird 1 (cut)", type:"audio", category:"sound", group:"Environment / weather", file:"media/sound/samples_cleaned/Bird 1 (cut).opus", description:"Short edited bird fragment." },
  { id:"sound-06", title:"Dialogue reconstruct 1", type:"audio", category:"sound", group:"Voices / animal traces", file:"media/sound/samples_cleaned/Dialogue reconstruct 1.opus", description:"Reconstructed dialogue fragment, take 1." },
  { id:"sound-10", title:"Alarm (fully isolated)", type:"audio", category:"sound", group:"Objects / signals", file:"media/sound/samples_cleaned/Alarm (fully isolated).opus", description:"Isolated alarm sample." },
  { id:"sound-13", title:"Do, MusicBox", type:"audio", category:"sound", group:"Musical fragments", file:"media/sound/samples_cleaned/Do, MusicBox.opus", description:"Single music-box tone." },
  { id:"sound-05", title:"door", type:"audio", category:"sound", group:"Environment / contact", file:"media/sound/samples_cleaned/door.opus", description:"Door sound." },
  { id:"session-tongue-drums", title:"Session with Tongue Drums", type:"audio", category:"music", group:"SESSIONS / STANDALONE", file:"media/sound/Session with Tongue Drums.opus", description:"A standalone tongue-drum session by Takismana." }
];
const archive = [
  { id:"aokigahara-pentalogy", title:"FUJI SONIC PI — AOKIGAHARA PENTALOGY", type:"project", category:"music", image:"media/photo/releases/aokigahara_pentalogy.jpg", projectPath:"projects/aokigahara/index.html" },
  ...album, ...samples,
  { id:"not-audio", title:"Document", type:"text", category:"notes", file:"documents/notes/example.md" },
  { id:"unsupported-file", title:"Unsupported", type:"audio", category:"sound", file:"media/sound/example.pdf" },
  { id:"no-file", title:"No source", type:"audio", category:"sound" }
];
const window = { JIHANKI_ARCHIVE: archive };
const context = vm.createContext({ window });
vm.runInContext(source, context);
vm.runInContext(soundscapeSource, context);

const room = window.JIHANKI_LISTENING_ROOM;
assert(room, "Listening Room module should initialise.");
assert.equal(room.catalogue().length, 11, "Only actual audio records with supported file extensions should be included.");
assert.equal(room.sourceCount(), 11);
assert.deepEqual(JSON.parse(JSON.stringify(room.catalogue().slice(0,4).map(track => track.file))),
  album.map(track => track.file), "The pentalogy's public audio sources should retain their released file paths.");
const groups = room.rooms();
assert.equal(groups.length, 7, "Archive audio should be divided by its existing source group labels.");
const albumRoom = groups.find(entry => entry.label === "AOKIGAHARA / PENTALOGY");
assert(albumRoom, "The four public pentalogy renders should have their own room.");
assert.deepEqual(JSON.parse(JSON.stringify(albumRoom.tracks.map(track => track.id))),
  album.map(track => track.id), "Album playback order should follow the published pentalogy sequence.");
const weather = groups.find(entry => entry.label === "Environment / weather");
assert.deepEqual(JSON.parse(JSON.stringify(weather.tracks.map(track => track.id))), ["sound-01", "sound-02"]);
assert(groups.some(entry => entry.label === "SESSIONS / STANDALONE"),
  "The tongue-drum session should stay separate from the pentalogy.");
const html = room.render();
for (const track of album) assert(html.includes(track.title), "Listening Room must render " + track.title);
assert(html.includes("05 / SHRINE / RITUAL"), "The missing fifth environment should remain visible as pending.");
assert.match(html, /Public render pending/, "The room must not invent a Shrine audio file.");
assert(html.includes("sound-06") && html.includes("Dialogue reconstruct 1"));
assert.match(html, /ARCHIVE LISTENING/, "Archive listening should be discoverable as a Sound Lab mode.");
const suiteHtml = window.JIHANKI_SOUNDSCAPE.render();
assert.match(suiteHtml, /data-sound-suite-mode="mix"/, "Sound Lab should expose a LIVE MIX mode.");
assert.match(suiteHtml, /data-sound-suite-mode="archive"/, "Sound Lab should expose an ARCHIVE LISTENING mode.");
assert.match(suiteHtml, /data-sound-suite-panel="mix"/, "Live mixing panel should remain available.");
assert.match(suiteHtml, /data-sound-suite-panel="archive" hidden/, "Archive listening should share the same panel and start hidden.");
assert.equal((suiteHtml.match(/class="sound-suite-tabs"/g)||[]).length, 1, "The two audio modes should share one compact tab bar.");
assert.match(html, /no listening history or saved mix is created/i,
  "Listening Room must not silently create visitor tracking or saved mixes.");

console.log("M71 Listening Room tests passed: existing source filtering, archive groupings, pentalogy order, pending fifth render and no invented audio.");
