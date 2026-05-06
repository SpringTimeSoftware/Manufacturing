import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coveragePath = resolve(root, "test", "mobile-action-flow-coverage.json");
const coverage = JSON.parse(readFileSync(coveragePath, "utf8"));

const flowIds = new Set(coverage.flows.map((flow) => flow.id));
const missing = coverage.requiredFlowIds.filter((flowId) => !flowIds.has(flowId));
if (missing.length > 0) {
  throw new Error(`Missing required mobile flow coverage: ${missing.join(", ")}`);
}

const incomplete = coverage.flows.filter((flow) => flow.screenIds.length === 0 || flow.assertions.length === 0);
if (incomplete.length > 0) {
  throw new Error(`Incomplete mobile flow coverage entries: ${incomplete.map((flow) => flow.id).join(", ")}`);
}

console.log(`Validated ${coverage.flows.length} mobile action-flow coverage entries.`);
