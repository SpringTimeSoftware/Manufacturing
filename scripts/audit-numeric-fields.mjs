#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoot = path.join(repoRoot, "src/web/src");
const ignoredDirs = new Set(["node_modules", "dist"]);

const numericPatterns = [
  /^(net|gross)\s+weight$/,
  /^(package\s+)?(length|width|height|thickness)$/,
  /\bquantity\b/,
  /\bqty\b/,
  /\b(unit|list|sale|purchase|manual)\s+price\b/,
  /\bprice\s+amount\b/,
  /\brate\b/,
  /\bdiscount\b/,
  /\btax\s*(percent|%)\b/,
  /\bexchange\s+rate\b/,
  /\blead\s+time\b/,
  /\bconversion\s+factor\b/,
  /^moq$/,
  /\bcycle\s+time\b/,
  /\bsetup\b/,
  /\brun\s+minutes\b/
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

function isNumericLabel(label) {
  const normalized = normalizeLabel(label);
  return numericPatterns.some((pattern) => pattern.test(normalized));
}

function firstLabelText(block) {
  const span = block.match(/<span[^>]*>\s*([^<]+?)\s*<\/span>/i);
  if (span) {
    return span[1];
  }

  const aria = block.match(/aria-label\s*=\s*["']([^"']+)["']/i);
  return aria?.[1] ?? "";
}

function inputType(block) {
  return block.match(/<input\b[^>]*\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "text";
}

const failures = [];

for (const file of collectFiles(scanRoot)) {
  const text = readFileSync(file, "utf8");
  const labelBlocks = text.matchAll(/<label\b[\s\S]*?<\/label>/gi);

  for (const match of labelBlocks) {
    const block = match[0];
    const label = firstLabelText(block);
    if (!label || !isNumericLabel(label) || !/<input\b/i.test(block)) {
      continue;
    }

    const type = inputType(block);
    if (type !== "number") {
      failures.push({
        file: relative(file),
        line: lineNumber(text, match.index ?? 0),
        message: `Numeric field "${normalizeLabel(label)}" uses input type "${type}" instead of ErpNumberField/ErpDecimalField/ErpMoneyField or type=number.`
      });
    }
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((sourceLine, index) => {
    const match = sourceLine.match(/\btextInput\s*\(\s*["']([^"']+)["']/i);
    if (!match) {
      return;
    }

    const label = match[1];
    if (isNumericLabel(label) && !/["']number["']/.test(sourceLine)) {
      failures.push({
        file: relative(file),
        line: index + 1,
        message: `Numeric field "${normalizeLabel(label)}" uses textInput without numeric type.`
      });
    }
  });
}

if (failures.length > 0) {
  console.error(`ERP numeric-field audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure.file}:${failure.line} ${failure.message}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP numeric-field audit passed.");
