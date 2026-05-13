#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoot = path.join(repoRoot, "src/web/src");
const ignoredDirs = new Set(["node_modules", "dist"]);

const operationalFilePattern =
  /(NotificationProvider|NotificationCenter|platformAdapters|dashboardAdapters|commercialPlanningAdapters|dispatchAdapters|qualityAdapters|planning|production|operations|inventory|workQueue|alerts)/i;

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

    if ((entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) && !entry.name.includes(".test.")) {
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

const failures = [];

for (const file of collectFiles(scanRoot)) {
  const rel = relative(file);
  if (!operationalFilePattern.test(rel)) {
    continue;
  }

  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((sourceLine, index) => {
    if (!/\bcatch\b/.test(sourceLine)) {
      return;
    }

    let end = Math.min(lines.length - 1, index + 20);
    for (let cursor = index + 1; cursor <= end; cursor += 1) {
      if (/^\s*}\s*(?:\)|;)?\s*$/.test(lines[cursor])) {
        end = cursor;
        break;
      }
    }

    const localCatchBlock = lines.slice(index, end + 1).join("\n");
    if (/\breturn\s+(?:filterSeeded|seeded[A-Z]\w*|asPaged\s*\(\s*seeded[A-Z]\w*)/.test(localCatchBlock)) {
      failures.push({
        file: rel,
        line: index + 1,
        message: "catch block returns seeded operational rows"
      });
    }
  });

  const silentFallbackPatterns = [
    {
      name: "promise catch returns seeded operational rows",
      regex: /\.catch\s*\([^)]*=>\s*(?:filterSeeded|seeded[A-Z]\w*|asPaged\s*\(\s*seeded[A-Z]\w*)/gi
    },
    {
      name: "live data fallback uses seeded rows through nullish coalescing",
      regex: /\bquery\.data(?:\?\.[A-Za-z0-9_]+)?\s*\?\?\s*seeded[A-Z]\w*/gi
    }
  ];

  for (const pattern of silentFallbackPatterns) {
    for (const match of text.matchAll(pattern.regex)) {
      failures.push({
        file: rel,
        line: lineNumber(text, match.index ?? 0),
        message: pattern.name
      });
    }
  }
}

const notificationProvider = path.join(scanRoot, "notifications", "NotificationProvider.tsx");
if (existsSync(notificationProvider)) {
  const text = readFileSync(notificationProvider, "utf8");
  if (!/\.catch\s*\(\s*\(\)\s*=>\s*{[\s\S]{0,400}setNotifications\s*\(\s*\[\s*\]\s*\)/.test(text)) {
    failures.push({
      file: relative(notificationProvider),
      line: 1,
      message: "Notification live-load failure must clear rows instead of preserving seeded operational alerts."
    });
  }
}

const platformAdapters = path.join(scanRoot, "platform", "platformAdapters.ts");
if (existsSync(platformAdapters)) {
  const text = readFileSync(platformAdapters, "utf8");
  if (!/if\s*\(\s*hasLiveSession\s*\(\s*\)\s*\)\s*{[\s\S]{0,900}throw new Error\("Approval queue could not be loaded/.test(text)) {
    failures.push({
      file: relative(platformAdapters),
      line: 1,
      message: "Approval live-load failure must throw an unavailable state instead of returning seeded approval rows."
    });
  }
}

if (failures.length > 0) {
  console.error(`ERP live-data truth audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure.file}:${failure.line} ${failure.message}.`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP live-data truth audit passed.");
