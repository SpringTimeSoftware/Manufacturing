#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoots = ["src/web/src", "src/server"].map((entry) => path.join(repoRoot, entry)).filter(existsSync);
const ignoredDirs = new Set(["node_modules", "dist", "bin", "obj", ".git"]);
const allowedExtensions = new Set([".ts", ".tsx", ".cs"]);

const transactionSpecs = [
  { name: "Quote", aliases: ["quote"], contractNames: ["QuoteDto", "QuoteUpsertRequest"] },
  { name: "Sales Order", aliases: ["sales order", "salesOrder"], contractNames: ["SalesOrderDto"] },
  { name: "Blanket Order", aliases: ["blanket order", "blanketOrder"], contractNames: ["BlanketOrderDto"] },
  { name: "Forecast", aliases: ["forecast", "DemandForecast"], contractNames: ["DemandForecastDto"] },
  { name: "Purchase Requisition", aliases: ["purchase requisition", "PurchaseRequisition"], contractNames: ["PurchaseRequisitionDto", "PurchaseRequisitionUpsertRequest"] },
  { name: "Purchase Order", aliases: ["purchase order", "PurchaseOrder"], contractNames: ["PurchaseOrderDto", "PurchaseOrderUpsertRequest"] },
  { name: "Subcontract Order", aliases: ["subcontract", "outside processing", "SubcontractOrder"], contractNames: ["SubcontractOrderDto", "SubcontractOrderUpsertRequest"] },
  { name: "Material Issue", aliases: ["material issue", "MaterialIssue"], contractNames: ["MaterialIssueDto", "MaterialIssueRequest"] },
  { name: "Material Return", aliases: ["material return", "MaterialReturn"], contractNames: ["MaterialReturnDto", "MaterialReturnRequest"] },
  { name: "Stock Transfer", aliases: ["stock transfer", "StockTransfer"], contractNames: ["StockTransferRequest"] },
  { name: "Production Receipt", aliases: ["production receipt", "ProductionReceipt"], contractNames: ["ProductionReceiptDto", "ProductionReceiptCreateRequest"] },
  { name: "Scrap/Rework", aliases: ["scrap", "rework", "ScrapEntry", "ReworkOrder"], contractNames: ["ScrapEntryDto", "ScrapEntryCreateRequest", "ReworkOrderDto", "ReworkOrderCreateRequest"] },
  { name: "Dispatch / Pack List", aliases: ["dispatch", "pack list", "PackList"], contractNames: ["PackListDto", "PackListUpsertRequest", "ShipmentDto", "ShipmentUpsertRequest"] }
];

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

    if (allowedExtensions.has(path.extname(entry.name)) && !entry.name.includes(".test.")) {
      files.push(fullPath);
    }
  }
  return files;
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function relative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}

const files = sourceRoots.flatMap(collectFiles);
const allSource = files.map((file) => ({ file, text: readFileSync(file, "utf8") }));
const contractText = allSource
  .filter(({ file }) => relative(file).includes("contracts") || relative(file).includes("Contracts"))
  .map(({ text }) => text)
  .join("\n");

const failures = [];

const antiPatterns = [
  { name: "direct lines[0] access", regex: /\blines\s*\[\s*0\s*\]/gi },
  { name: "firstLine variable/workspace", regex: /\bfirstLine\b/gi },
  { name: "first quote line copy", regex: /First\s+quote\s+line/gi },
  { name: "index === 0 line-only update", regex: /\bindex\s*={2,3}\s*0\b/gi },
  { name: "first-line save payload", regex: /lines\s*:\s*\[\s*firstLine/gi },
  { name: "preserves only existing lines after first line", regex: /existingLines\s*\.\s*slice\s*\(\s*1\s*\)/gi },
  { name: "save mentions first line only", regex: /save[\s\S]{0,120}first\s+line/gi }
];

function hasLineCollection(spec) {
  return spec.contractNames.some((contractName) => {
    const tsInterface = new RegExp(`(?:interface|type)\\s+${contractName}\\b[\\s\\S]{0,1400}\\b(?:lines|schedules)\\s*:`, "i");
    const csharpRecord = new RegExp(`${contractName}\\b[\\s\\S]{0,1400}\\bIReadOnlyCollection<[^>]+>\\s+(?:Lines|Schedules)\\b`, "i");
    return tsInterface.test(contractText) || csharpRecord.test(contractText);
  });
}

function sourceForSpec(spec) {
  const aliasRegexes = spec.aliases.map((alias) => new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  return allSource.filter(({ file, text }) => {
    const rel = relative(file);
    if (!rel.startsWith("src/web/src/")) {
      return false;
    }

    return aliasRegexes.some((regex) => regex.test(rel) || regex.test(text));
  });
}

for (const spec of transactionSpecs) {
  const relevant = sourceForSpec(spec);
  const combined = relevant.map(({ text }) => text).join("\n");
  const hasLines = hasLineCollection(spec);

  if (hasLines && relevant.length === 0) {
    failures.push({
      file: "src/web/src",
      line: 1,
      message: `${spec.name}: transaction DTO exposes lines/schedules, but no inspected web source was found.`
    });
    continue;
  }

  if (hasLines && !/\bAdd\s+(?:quote\s+|order\s+|PO\s+|PR\s+|pack\s+)?line\b/i.test(combined)) {
    failures.push({
      file: relevant[0] ? relative(relevant[0].file) : "src/web/src",
      line: 1,
      message: `${spec.name}: transaction DTO exposes lines/schedules, but the page lacks an Add Line action.`
    });
  }

  if (hasLines && !/\bRemove\s+(?:quote\s+|order\s+|PO\s+|PR\s+|pack\s+)?line\b/i.test(combined)) {
    failures.push({
      file: relevant[0] ? relative(relevant[0].file) : "src/web/src",
      line: 1,
      message: `${spec.name}: transaction DTO exposes lines/schedules, but the page lacks a Remove Line action.`
    });
  }

  for (const { file, text } of relevant) {
    for (const pattern of antiPatterns) {
      for (const match of text.matchAll(pattern.regex)) {
        failures.push({
          file: relative(file),
          line: lineNumber(text, match.index ?? 0),
          message: `${spec.name}: ${pattern.name}.`
        });
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`ERP transaction line-depth audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure.file}:${failure.line} ${failure.message}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP transaction line-depth audit passed.");
