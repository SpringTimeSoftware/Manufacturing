#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const screens = [
  { domain: "Commercial", screen: "Quote", file: "src/web/src/pages/CommercialPlanningPages.tsx", grid: "Quote line grid" },
  { domain: "Commercial", screen: "Sales Order", file: "src/web/src/pages/CommercialPlanningPages.tsx", grid: "Sales order line grid" },
  { domain: "Commercial", screen: "Blanket Order", file: "src/web/src/pages/CommercialPlanningPages.tsx", grid: "Blanket schedule line grid" },
  { domain: "Commercial", screen: "Demand Forecast", file: "src/web/src/pages/CommercialPlanningPages.tsx", grid: "Demand forecast line grid" },
  { domain: "Planning", screen: "MPS", file: "src/web/src/pages/CommercialPlanningPages.tsx", grid: "MPS schedule line grid" },
  { domain: "Procure-to-Pay", screen: "Purchase Requisition", file: "src/web/src/pages/ProcurementPages.tsx", grid: "Purchase requisition line grid" },
  { domain: "Procure-to-Pay", screen: "RFQ", file: "src/web/src/pages/ProcurementPages.tsx", grid: "RFQ line grid" },
  { domain: "Procure-to-Pay", screen: "Supplier Quotation", file: "src/web/src/pages/ProcurementPages.tsx", grid: "Supplier quotation line grid" },
  { domain: "Procure-to-Pay", screen: "Purchase Order", file: "src/web/src/pages/ProcurementPages.tsx", grid: "Purchase order line grid" },
  { domain: "Procure-to-Pay", screen: "GRN", file: "src/web/src/pages/ProcurementPages.tsx", grid: "GRN receipt line grid" },
  { domain: "Procure-to-Pay", screen: "Purchase Invoice Match", file: "src/web/src/pages/ProcurementPages.tsx", grid: "Supplier invoice match line grid" },
  { domain: "Engineering", screen: "BOM Components", file: "src/web/src/pages/EngineeringContinuationPages.tsx", grid: "BOM component line grid" },
  { domain: "Engineering", screen: "BOM Operations", file: "src/web/src/pages/EngineeringContinuationPages.tsx", grid: "BOM operation line grid" },
  { domain: "Engineering", screen: "Routing Operations", file: "src/web/src/pages/EngineeringContinuationPages.tsx", grid: "Routing operation line grid" },
  { domain: "Engineering", screen: "ECO Affected Objects", file: "src/web/src/pages/EngineeringContinuationPages.tsx", grid: "ECO affected object line grid" },
  { domain: "Inventory", screen: "Material Issue / Return / Transfer", file: "src/web/src/pages/InventoryPages.tsx", grid: "Stock posting line grid" },
  { domain: "Production", screen: "Production Receipt", file: "src/web/src/pages/ProductionOutputPages.tsx", grid: "Production receipt line grid" },
  { domain: "Quality", screen: "QC Inspection", file: "src/web/src/pages/QualityPages.tsx", grid: "Inspection result line grid" },
  { domain: "Dispatch", screen: "Pack List", file: "src/web/src/pages/DispatchPages.tsx", grid: "Pack line grid" },
  { domain: "Dispatch", screen: "Shipment", file: "src/web/src/pages/DispatchPages.tsx", grid: "Shipment line grid" }
];

const forbiddenPatterns = [
  { name: "direct lines[0] access", regex: /\blines\s*\[\s*0\s*\]/gi },
  { name: "direct components[0] access", regex: /\bcomponents\s*\[\s*0\s*\]/gi },
  { name: "direct operations[0] access", regex: /\boperations\s*\[\s*0\s*\]/gi },
  { name: "firstLine-only editor", regex: /\bfirstLine\b/gi },
  { name: "first quote line wording", regex: /First\s+quote\s+line/gi },
  { name: "index-zero line-only update", regex: /\bindex\s*={2,3}\s*0\b/gi },
  { name: "card-per-line FormShell", regex: /<Card[^>]*title=["'](?:Quote lines|Sales order lines|Purchase requisition lines|Purchase order lines|RFQ lines|Supplier quote lines|Receipt lines|Invoice match lines|Stock posting lines|Parameter results|Pack lines|Shipment lines)["'][\s\S]{0,2500}<FormShell[\s\S]{0,300}title=\{`?(?:Line|Schedule|Receipt line|Invoice line)/gi },
  { name: "engineering card-line editor marker", regex: /\b(?:bom-component-editor|bom-operation-editor|routing-step-editor)\b/gi },
  { name: "repeated line FormShell", regex: /<FormShell[^>]*initialFingerprint=\{[^}]*line[^}]*\}[^>]*title=\{`?(?:Line|Schedule|Receipt line|Invoice line|Component|Operation|Affected object)/gi }
];

function relativePath(file) {
  return file.replaceAll("\\", "/");
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

const sourceCache = new Map();
function readSource(relativeFile) {
  if (!sourceCache.has(relativeFile)) {
    const absolute = path.join(repoRoot, relativeFile);
    sourceCache.set(relativeFile, existsSync(absolute) ? readFileSync(absolute, "utf8") : "");
  }

  return sourceCache.get(relativeFile);
}

const failures = [];
const extraFiles = [
  "src/web/src/engineering/engineeringContinuationAdapters.ts"
];

for (const screen of screens) {
  const text = readSource(screen.file);
  if (!text) {
    failures.push(`${screen.domain} / ${screen.screen}: source file ${relativePath(screen.file)} is missing.`);
    continue;
  }

  if (!text.includes(screen.grid)) {
    const disabledWithReason = new RegExp(`${screen.screen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]{0,1400}disabled\\s*:\\s*true[\\s\\S]{0,800}reason\\s*:`, "i").test(text);
    if (!disabledWithReason) {
      failures.push(`${screen.domain} / ${screen.screen}: compact grid marker "${screen.grid}" was not found and no disabled-with-reason state was detected.`);
    }
  }
}

for (const file of extraFiles) {
  readSource(file);
}

for (const [relativeFile, text] of sourceCache) {
  for (const pattern of forbiddenPatterns) {
    for (const match of text.matchAll(pattern.regex)) {
      failures.push(`${relativePath(relativeFile)}:${lineNumber(text, match.index ?? 0)} ${pattern.name}.`);
    }
  }
}

if (failures.length > 0) {
  console.error(`ERP transaction line-grid audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP transaction line-grid audit passed.");
