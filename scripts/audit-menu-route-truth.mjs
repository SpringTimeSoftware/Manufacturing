#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const navigationPath = path.join(repoRoot, "src/web/src/layout/navigation.ts");
const routerPath = path.join(repoRoot, "src/web/src/app/router.tsx");
const failures = [];

function routeLiterals(text) {
  return [...text.matchAll(/path\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]);
}

function guardedRoutes(text) {
  return [...text.matchAll(/guardedRoute\(\s*["']([^"']+)["']/g)].map((match) => `/${match[1]}`);
}

if (!existsSync(navigationPath) || !existsSync(routerPath)) {
  console.error("Navigation or router source is missing.");
  process.exit(1);
}

const navigationText = readFileSync(navigationPath, "utf8");
const routerText = readFileSync(routerPath, "utf8");
const navigationRoutes = new Set(routeLiterals(navigationText));
const routerRoutes = new Set(["/", "/login", "/forgot-password", ...guardedRoutes(routerText)]);
const navigationAliases = new Map([
  ["/platform/audit", "/platform/audit-trail"]
]);

for (const route of navigationRoutes) {
  if (!routerRoutes.has(route)) {
    failures.push(`Navigation route ${route} is not registered in the app router.`);
  }
}

for (const route of routerRoutes) {
  if (route === "/login" || route === "/forgot-password" || route.startsWith("/help/") || route.includes(":")) {
    continue;
  }
  const navigationRoute = navigationAliases.get(route) ?? route;
  if (!navigationRoutes.has(navigationRoute)) {
    failures.push(`Router route ${route} is not present in navigationItems for role-aware access mapping.`);
  }
}

if (failures.length > 0) {
  console.error(`ERP menu-route truth audit failed with ${failures.length} violation(s).`);
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) {
    console.error(`- ... ${failures.length - 80} more violation(s) hidden.`);
  }
  process.exit(1);
}

console.log("ERP menu-route truth audit passed.");
