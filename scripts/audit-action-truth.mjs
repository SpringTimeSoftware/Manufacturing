#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoot = path.join(repoRoot, "src/web/src");
const ignoredDirs = new Set(["node_modules", "dist"]);

const targetActionPattern = /^(new|new draft|new .+ draft|create|save|save draft|save & continue|upload|export|print|clone|run|convert|release|approve|add line|remove line)\b/i;

function collectFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

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

    if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) {
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

function isTargetAction(label) {
  return targetActionPattern.test(label.trim());
}

const failures = [];

for (const file of collectFiles(scanRoot)) {
  const text = readFileSync(file, "utf8");
  const actionObjects = text.matchAll(/\{[^{}]*(?:label|actionLabel)\s*:\s*["']([^"']+)["'][^{}]*\}/gi);

  for (const match of actionObjects) {
    const block = match[0];
    const label = match[1];
    if (!isTargetAction(label) || /\bhidden\s*:\s*true\b/i.test(block)) {
      continue;
    }

    const hasOnClick = /\bonClick\s*:/.test(block);
    const hasDisabled = /\bdisabled\s*:/.test(block);
    const hasReason = /\breason\s*:\s*[^,}]+/.test(block);

    if (!hasOnClick && !hasDisabled) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Action "${label}" is visible without onClick, disabled state, or hidden state.`
      });
      continue;
    }

    if (hasDisabled && !hasReason && !/\bdisabled\s*:\s*false\b/.test(block)) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Action "${label}" has a disabled state without a business-safe reason.`
      });
    }

    if (/onClick\s*:\s*undefined\b/.test(block) && !hasReason) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Action "${label}" can render without a handler and without a disabled reason.`
      });
    }
  }

  const buttonTags = text.matchAll(/<(?:Button|button)\b([^>]*)>([^<>{}]{1,80})<\/(?:Button|button)>/gi);
  for (const match of buttonTags) {
    const attrs = match[1];
    const label = match[2].trim();
    if (!isTargetAction(label)) {
      continue;
    }

    const hasOnClick = /\bonClick\s*=/.test(attrs);
    const hasDisabled = /\bdisabled(?:\s*=|\b)/.test(attrs);
    const hasReason = /\btitle\s*=|\baria-describedby\s*=/.test(attrs);
    if (!hasOnClick && !hasDisabled) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Button "${label}" is visible without onClick, disabled state, or hidden state.`
      });
    }

    if (hasDisabled && !hasReason) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Button "${label}" is disabled without title or visible reason wiring.`
      });
    }
  }
}

if (failures.length > 0) {
  console.error(`ERP action-truth audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure.file}:${failure.line} ${failure.message}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP action-truth audit passed.");
