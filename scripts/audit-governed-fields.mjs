#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoot = path.join(repoRoot, "src/web/src");
const ignoredDirs = new Set(["node_modules", "dist"]);

const governedLabelPatterns = [
  /^category$/,
  /^subcategory$/,
  /^item group(?:\/category)?$/,
  /^product family$/,
  /^business segment$/,
  /^reporting bucket$/,
  /^(stock |purchase |sales |order |issue |receipt |packaging |forecast |planning )?uom$/,
  /^warehouse$/,
  /^default warehouse$/,
  /^bin$/,
  /^default bin$/,
  /^customer$/,
  /^supplier$/,
  /^tax category$/,
  /^currency$/,
  /^payment terms?$/,
  /^price list$/,
  /^discount scheme$/,
  /^work center$/,
  /^machine$/,
  /^qc plan$/,
  /^reason code$/
];

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

function normalizeLabel(label) {
  return label.replace(/\s+/g, " ").replace(/\*/g, "").trim().toLowerCase();
}

function isGovernedLabel(label) {
  const normalized = normalizeLabel(label);
  return governedLabelPatterns.some((pattern) => pattern.test(normalized));
}

function firstLabelText(block) {
  const span = block.match(/<span[^>]*>\s*([^<]+?)\s*<\/span>/i);
  if (span) {
    return span[1];
  }

  const aria = block.match(/aria-label\s*=\s*["']([^"']+)["']/i);
  return aria?.[1] ?? "";
}

const failures = [];

for (const file of collectFiles(scanRoot)) {
  const text = readFileSync(file, "utf8");
  const labelBlocks = text.matchAll(/<label\b[\s\S]*?<\/label>/gi);

  for (const match of labelBlocks) {
    const block = match[0];
    const label = firstLabelText(block);
    if (!label || !isGovernedLabel(label) || !/<input\b/i.test(block)) {
      continue;
    }

    failures.push({
      file: relative(file),
      line: lineNumber(text, match.index ?? 0),
      message: `Governed field "${normalizeLabel(label)}" is rendered as an unrestricted input instead of ErpLookupField/select.`
    });
  }

  const textInputCalls = text.matchAll(/\btextInput\s*\(\s*["']([^"']+)["'][\s\S]{0,220}?\)/gi);
  for (const match of textInputCalls) {
    const label = match[1];
    if (isGovernedLabel(label)) {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Governed field "${normalizeLabel(label)}" uses textInput helper instead of a governed lookup/select.`
      });
    }
  }
}

if (failures.length > 0) {
  console.error(`ERP governed-field audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure.file}:${failure.line} ${failure.message}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP governed-field audit passed.");
