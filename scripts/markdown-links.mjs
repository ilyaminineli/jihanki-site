/* M37 — repository-wide Markdown relative-link validation. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const IGNORED_DIRS = new Set([".git", "node_modules", ".next", "test-results", "coverage"]);
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function withoutCode(markdown) {
  return markdown
    .replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1\s*$/gm, match => match.replace(/[^\n]/g, " "))
    .replace(/(^|[^\\])`+[^\n]*?`+/g, (match, prefix) => prefix + " ".repeat(Math.max(0, match.length - prefix.length)));
}

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

export function extractMarkdownDestinations(markdown) {
  const source = withoutCode(String(markdown || ""));
  const links = [];

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== "]" || source[index + 1] !== "(") continue;
    let cursor = index + 2;
    while (/\s/.test(source[cursor] || "") && cursor < source.length) cursor += 1;
    let destination = "";

    if (source[cursor] === "<") {
      cursor += 1;
      const start = cursor;
      while (cursor < source.length && source[cursor] !== ">") {
        if (source[cursor] === "\\" && cursor + 1 < source.length) cursor += 1;
        cursor += 1;
      }
      destination = source.slice(start, cursor);
    } else {
      const start = cursor;
      let depth = 0;
      while (cursor < source.length) {
        const char = source[cursor];
        if (char === "\\" && cursor + 1 < source.length) { cursor += 2; continue; }
        if (char === "(") depth += 1;
        else if (char === ")") {
          if (depth === 0) break;
          depth -= 1;
        } else if (/\s/.test(char) && depth === 0) break;
        cursor += 1;
      }
      destination = source.slice(start, cursor);
    }

    destination = destination.replace(/\\([\\()<>])/g, "$1");
    if (destination) links.push({ destination, line: lineAt(source, index) });
    index = cursor;
  }

  const definitions = /^ {0,3}\[[^\]\n]+\]:\s*(?:<([^>]+)>|(\S+))/gm;
  let definition;
  while ((definition = definitions.exec(source))) {
    const destination = (definition[1] || definition[2] || "").replace(/\\([\\()<>])/g, "$1");
    if (destination) links.push({ destination, line: lineAt(source, definition.index) });
  }

  const htmlAttributes = /\b(?:href|src)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  while ((definition = htmlAttributes.exec(source))) {
    const destination = definition[1] || definition[2] || definition[3] || "";
    if (destination) links.push({ destination, line: lineAt(source, definition.index) });
  }

  return links;
}

function slugifyHeading(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // GitHub preserves the spaced em-dash heading separator as a double hyphen.
    .replace(/\s+—\s+/g, "--")
    .replace(/[*_~`]/g, "")
    .trim().toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-{3,}/g, "--");
}

export function markdownAnchors(source) {
  const anchors = new Set();
  const content = String(source || "");
  for (const match of content.matchAll(/^\s*<[^>]+\s(?:id|name)=["']([^"']+)["'][^>]*>/gim)) anchors.add(match[1]);

  const used = new Map();
  for (const match of content.matchAll(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    const explicit = /\s*\{#([^}]+)\}\s*$/.exec(match[2]);
    const base = explicit ? explicit[1] : slugifyHeading(match[2]);
    if (!base) continue;
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    anchors.add(count ? base + "-" + count : base);
  }
  return anchors;
}

function resolveDestination(root, sourcePath, destination) {
  const result = { path: null, fragment: "", error: null };
  if (/^(?:https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(destination)) return result;
  if (/^[a-z][a-z0-9+.-]*:/i.test(destination)) {
    result.error = "unsupported link scheme";
    return result;
  }

  let value = destination;
  const hash = value.indexOf("#");
  if (hash >= 0) {
    result.fragment = value.slice(hash + 1);
    value = value.slice(0, hash);
  }
  const query = value.indexOf("?");
  if (query >= 0) value = value.slice(0, query);
  try {
    value = decodeURIComponent(value);
    result.fragment = decodeURIComponent(result.fragment);
  } catch (_) {
    result.error = "invalid percent-encoding";
    return result;
  }

  const candidate = value.startsWith("/")
    ? path.resolve(root, "." + value)
    : value ? path.resolve(root, path.dirname(sourcePath), value) : path.resolve(root, sourcePath);
  const relative = path.relative(root, candidate);
  if (relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) {
    result.error = "link escapes the repository";
    return result;
  }
  result.path = candidate;
  return result;
}

export function validateMarkdownFile(root, sourcePath) {
  const issues = [];
  const absoluteSource = path.resolve(root, sourcePath);
  if (!existsSync(absoluteSource)) return ["Markdown source does not exist: " + sourcePath];
  const source = readFileSync(absoluteSource, "utf8");
  const links = extractMarkdownDestinations(source);

  for (const link of links) {
    const resolved = resolveDestination(root, sourcePath, link.destination);
    const label = sourcePath + ":" + link.line + ": " + link.destination;
    if (resolved.error) {
      issues.push(label + " (" + resolved.error + ")");
      continue;
    }
    if (!resolved.path) continue;

    let target = resolved.path;
    if (existsSync(target) && readdirSync(path.dirname(target), { withFileTypes: true }).some(entry => entry.name === path.basename(target) && entry.isDirectory())) {
      const candidates = [path.join(target, "index.html"), path.join(target, "README.md")];
      target = candidates.find(candidate => existsSync(candidate));
    }
    if (!target || !existsSync(target)) {
      issues.push(label + " (target does not exist)");
      continue;
    }

    if (resolved.fragment) {
      const extension = path.extname(target).toLowerCase();
      const targetSource = [".md", ".markdown"].includes(extension)
        ? readFileSync(target, "utf8")
        : [".html", ".htm"].includes(extension) ? readFileSync(target, "utf8") : "";
      if (targetSource) {
        const anchors = [".md", ".markdown"].includes(extension)
          ? markdownAnchors(targetSource)
          : new Set([...targetSource.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi)].map(match => match[1]));
        if (!anchors.has(resolved.fragment)) issues.push(label + " (fragment #" + resolved.fragment + " does not exist)");
      }
    }
  }
  return issues;
}

function collectMarkdown(root, directory, files) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) collectMarkdown(root, path.join(directory, entry.name), files);
    } else if (entry.isFile() && /\.(md|markdown)$/i.test(entry.name)) {
      files.push(path.relative(root, path.join(directory, entry.name)).split(path.sep).join("/"));
    }
  }
}

export function validateMarkdownRepository(root) {
  const files = [];
  collectMarkdown(root, root, files);
  files.sort();
  const issues = files.flatMap(file => validateMarkdownFile(root, file));
  return { files: files.length, issues };
}
