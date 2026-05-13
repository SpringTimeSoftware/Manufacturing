#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoot = path.join(repoRoot, "src/web/src");
const ignoredDirs = new Set(["node_modules", "dist", "bin", "obj", ".git"]);
const failures = [];

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if ((entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) && !entry.name.includes(".test.")) {
      files.push(fullPath);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function inspectActionObject(text, file) {
  const rel = relative(file);
  if (rel.includes("/layout/navigation.") || rel.includes("Adapters.")) {
    return;
  }

  const uploadLabel = /label\s*:\s*["']([^"']*(?:upload|media|document|attachment|proof)[^"']*)["']/gi;
  for (const match of text.matchAll(uploadLabel)) {
    const start = Math.max(0, (match.index ?? 0) - 240);
    const end = Math.min(text.length, (match.index ?? 0) + 520);
    const block = text.slice(start, end);
    const objectStart = text.lastIndexOf("{", match.index ?? 0);
    const objectEnd = text.indexOf("}", match.index ?? 0);
    const actionObject = objectStart >= 0 && objectEnd > objectStart ? text.slice(objectStart, objectEnd + 1) : block;
    const label = match[1];
    if (/\broute\s*:/i.test(actionObject)) {
      continue;
    }
    if (!/ErpActionBar|ErpFileActionState|<button/i.test(block) && !/\bonClick\s*:|\bonAction\s*:|\bonFileSelect\s*:/i.test(actionObject)) {
      continue;
    }
    const hasHandler = /\bonClick\s*:/i.test(actionObject) || /\bonAction\s*:/i.test(actionObject) || /\bonFileSelect\s*:/i.test(actionObject);
    const disabled = /\bdisabled\s*:\s*true/i.test(actionObject) || /\benabled\s*=\s*\{?\s*false\s*\}?/i.test(block);
    const hasReason = /\breason\s*:/i.test(actionObject) || /\bdisabledReason\s*=/.test(block);
    const realFileControl = /<ErpFileActionState\b/i.test(block) || /<input\b[^>]*\btype\s*=\s*["']file["']/i.test(block);

    if (!hasHandler && !(disabled && hasReason) && !realFileControl) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Upload/media action "${label}" is visible without a handler, file control, or disabled reason.`
      });
    }
  }
}

if (!existsSync(scanRoot)) {
  console.error("Web source root is missing.");
  process.exit(1);
}

for (const file of collectFiles(scanRoot)) {
  const text = readFileSync(file, "utf8");
  inspectActionObject(text, file);
}

if (failures.length > 0) {
  console.error(`ERP upload truth audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure.file}:${failure.line} ${failure.message}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP upload truth audit passed.");
