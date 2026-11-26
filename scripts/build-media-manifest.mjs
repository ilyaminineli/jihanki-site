#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root=process.cwd(),mediaRoot=path.join(root,"media"),output=path.join(root,"data","media-manifest.json");
async function walk(directory){
  const entries=await readdir(directory,{withFileTypes:true}),files=[];
  for(const entry of entries){const full=path.join(directory,entry.name);if(entry.isDirectory())files.push(...await walk(full));else if(entry.isFile())files.push(full);}
  return files;
}
async function fingerprint(pathname){
  const bytes=await readFile(pathname);
  return{size:bytes.length,gitBlobSha:createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bytes.length+"\0"),bytes])).digest("hex")};
}
const files=[];
for(const pathname of(await walk(mediaRoot)).sort()){
  const relative=path.relative(root,pathname).split(path.sep).join("/");
  files.push({path:relative,...await fingerprint(pathname)});
}
const serialized=JSON.stringify({format:"JIHANKI-MEDIA-MANIFEST",version:1,files},null,2)+"\n";
if(process.argv.includes("--check")){
  const current=await readFile(output,"utf8").catch(()=>"");
  if(current!==serialized){console.error("Media manifest is stale. Run node scripts/build-media-manifest.mjs");process.exitCode=1;}
  else console.log("Media manifest is current ("+files.length+" assets).");
}else{
  await writeFile(output,serialized);console.log("Wrote "+files.length+" media asset records to data/media-manifest.json.");
}