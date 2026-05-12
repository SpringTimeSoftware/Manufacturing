import { useMemo, useState, type ReactElement } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { demoScenarios } from "../demo/demoScenarios";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useNotifications } from "../notifications/NotificationProvider";
import { useWorkspacePreference } from "../platform/WorkspacePreferenceContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import { navigationItems, type NavigationItem } from "./navigation";

const navigationGroups: Array<{ label: string; sourceSections: string[]; visibleCount: number }> = [
  { label: "OVERVIEW", sourceSections: ["Dashboards"], visibleCount: 5 },
  { label: "PLANNING", sourceSections: ["Planning", "Sales"], visibleCount: 6 },
  { label: "ENGINEERING & PRODUCTION", sourceSections: ["Engineering", "Production"], visibleCount: 7 },
  { label: "MASTER DATA", sourceSections: ["Organization", "Measurement", "Masters", "Resources"], visibleCount: 7 },
  { label: "COMMERCIAL SETUP", sourceSections: ["Commercial Setup"], visibleCount: 5 },
  { label: "PROCUREMENT", sourceSections: ["Procurement"], visibleCount: 4 },
  { label: "INVENTORY", sourceSections: ["Inventory"], visibleCount: 5 },
  { label: "QUALITY", sourceSections: ["Quality"], visibleCount: 5 },
  { label: "DISPATCH", sourceSections: ["Dispatch"], visibleCount: 4 },
  { label: "PLATFORM", sourceSections: ["Platform"], visibleCount: 5 },
  { label: "REPORTS", sourceSections: ["Reports"], visibleCount: 4 }
];

type NavigationIconName =
  | "approval"
  | "attachment"
  | "audit"
  | "barcode"
  | "bin"
  | "bom"
  | "boq"
  | "branch"
  | "capacity"
  | "classification"
  | "company"
  | "customer"
  | "bell"
  | "dashboard"
  | "department"
  | "dispatch"
  | "discount"
  | "document"
  | "downtime"
  | "eco"
  | "engineering"
  | "forecast"
  | "help"
  | "home"
  | "inventory"
  | "item"
  | "itemAttribute"
  | "itemGroup"
  | "itemVariant"
  | "jobCard"
  | "leadTime"
  | "machine"
  | "machineBoard"
  | "measurementProfile"
  | "mrp"
  | "operation"
  | "master"
  | "mps"
  | "platform"
  | "planning"
  | "priceList"
  | "procurement"
  | "production"
  | "quality"
  | "quote"
  | "reasonCode"
  | "reports"
  | "roles"
  | "routing"
  | "salesOrder"
  | "search"
  | "settings"
  | "shift"
  | "supplier"
  | "taxTerms"
  | "tool"
  | "translation"
  | "uomClass"
  | "uomConversion"
  | "users"
  | "warehouse"
  | "workCenter"
  | "workOrder"
  | "workflow";

function groupNavigationItems() {
  const grouped = navigationGroups
    .map((group) => ({
      ...group,
      items: navigationItems.filter((item) => group.sourceSections.includes(item.section))
    }))
    .filter((group) => group.items.length > 0);

  const groupedSections = new Set(navigationGroups.flatMap((group) => group.sourceSections));
  const ungrouped = navigationItems.filter((item) => !groupedSections.has(item.section));

  if (ungrouped.length > 0) {
    grouped.push({
      label: "OTHER WORKSPACES",
      sourceSections: [],
      visibleCount: 5,
      items: ungrouped
    });
  }

  return grouped;
}

function getNavigationParent(item: NavigationItem, groupLabel: string) {
  if (groupLabel === "PLANNING") {
    return item.section === "Sales" ? "Demand and Sales" : "Planning Control";
  }

  if (groupLabel === "ENGINEERING & PRODUCTION") {
    return item.section === "Engineering" ? "Engineering" : "Production Execution";
  }

  if (groupLabel === "MASTER DATA") {
    if (item.section === "Organization") {
      return "Organization";
    }

    if (item.section === "Measurement") {
      return "Units and Measurement";
    }

    if (item.section === "Resources") {
      return "Resources";
    }

    if (item.path.includes("/partners/")) {
      return "Business Partners";
    }

    return "Item Foundation";
  }

  if (groupLabel === "COMMERCIAL SETUP") {
    return item.path.includes("tax-currency-terms") ? "Tax, Currency, and Terms" : "Pricing and Discounts";
  }

  if (groupLabel === "PLATFORM") {
    if (item.path.includes("notifications") || item.path.includes("approvals")) {
      return "Alerts and Decisions";
    }

    if (item.path.includes("users") || item.path.includes("roles")) {
      return "Access Control";
    }

    if (item.path.includes("workflow") || item.path.includes("audit") || item.path.includes("translations")) {
      return "Governance";
    }

    if (item.path.includes("settings") || item.path.includes("context-switch")) {
      return "Workspace Settings";
    }

    return "Utilities";
  }

  return item.section;
}

function groupVisibleItemsByParent(items: NavigationItem[], groupLabel: string) {
  const parents = new Map<string, NavigationItem[]>();

  for (const item of items) {
    const parent = getNavigationParent(item, groupLabel);
    parents.set(parent, [...(parents.get(parent) ?? []), item]);
  }

  return Array.from(parents.entries()).map(([label, parentItems]) => ({
    items: parentItems,
    label
  }));
}

function getNavigationIcon(item: NavigationItem, section: string): NavigationIconName {
  const iconByPath: Record<string, NavigationIconName> = {
    "/": "home",
    "/commercial/discount-schemes": "discount",
    "/commercial/price-lists": "priceList",
    "/commercial/tax-currency-terms": "taxTerms",
    "/dashboards/executive-cockpit": "dashboard",
    "/dashboards/order-delivery": "salesOrder",
    "/dashboards/stage-wise": "machineBoard",
    "/dispatch/pack-lists": "dispatch",
    "/dispatch/planning": "planning",
    "/dispatch/shipments": "dispatch",
    "/engineering/alternate-items": "itemVariant",
    "/engineering/bom-comparison": "bom",
    "/engineering/bom-editor": "bom",
    "/engineering/boms": "bom",
    "/engineering/documents": "document",
    "/engineering/eco-revisions": "eco",
    "/engineering/operations": "operation",
    "/engineering/routings": "routing",
    "/help": "help",
    "/inventory/balances": "warehouse",
    "/inventory/cycle-counts": "inventory",
    "/inventory/material-issue": "inventory",
    "/inventory/material-return": "inventory",
    "/inventory/stock-transfer": "warehouse",
    "/inventory/traceability": "search",
    "/masters/barcodes": "barcode",
    "/masters/classifications": "classification",
    "/masters/item-attributes": "itemAttribute",
    "/masters/item-groups": "itemGroup",
    "/masters/item-variants": "itemVariant",
    "/masters/items": "item",
    "/masters/reason-codes": "reasonCode",
    "/measurements/profiles": "measurementProfile",
    "/measurements/uom-classes": "uomClass",
    "/measurements/uom-conversions": "uomConversion",
    "/organization/bins": "bin",
    "/organization/branches": "branch",
    "/organization/companies": "company",
    "/organization/departments": "department",
    "/organization/shifts": "shift",
    "/organization/warehouses": "warehouse",
    "/partners/customers": "customer",
    "/partners/supplier-lead-times": "leadTime",
    "/partners/suppliers": "supplier",
    "/planning/boq-requirements": "boq",
    "/planning/capacity": "capacity",
    "/planning/mps": "mps",
    "/planning/mrp": "mrp",
    "/planning/mrp-results": "mrp",
    "/platform/approvals": "approval",
    "/platform/attachments": "attachment",
    "/platform/audit-trail": "audit",
    "/platform/context-switch": "settings",
    "/platform/notifications": "bell",
    "/platform/roles": "roles",
    "/platform/settings": "settings",
    "/platform/tenant-settings": "settings",
    "/platform/translations": "translation",
    "/platform/users": "users",
    "/platform/workflow-numbering": "workflow",
    "/procurement/purchase-orders": "procurement",
    "/procurement/requisitions": "procurement",
    "/procurement/subcontract-plan": "supplier",
    "/production/downtime": "downtime",
    "/production/job-cards": "jobCard",
    "/production/machine-board": "machineBoard",
    "/production/machine-status": "machine",
    "/production/occupancy": "capacity",
    "/production/receipts": "production",
    "/production/rework-orders": "reasonCode",
    "/production/scrap-by-products": "production",
    "/production/shift-production": "shift",
    "/production/work-orders": "workOrder",
    "/quality/final-inspections": "quality",
    "/quality/in-process-inspections": "quality",
    "/quality/incoming-inspections": "quality",
    "/quality/ncr": "reasonCode",
    "/quality/plans": "quality",
    "/reports/print-pack": "reports",
    "/resources/machines": "machine",
    "/resources/tools": "tool",
    "/resources/work-centers": "workCenter",
    "/sales/available-to-promise": "capacity",
    "/sales/blanket-orders": "salesOrder",
    "/sales/forecasts": "forecast",
    "/sales/orders": "salesOrder",
    "/sales/quotes": "quote",
    "/search": "search"
  };

  const mapped = iconByPath[item.path];

  if (mapped) {
    return mapped;
  }

  if (item.path === "/") {
    return "home";
  }

  if (item.path.includes("dashboard")) {
    return "dashboard";
  }

  if (item.path.includes("planning") || item.path.includes("sales")) {
    return "planning";
  }

  if (item.path.includes("engineering")) {
    return "engineering";
  }

  if (item.path.includes("production")) {
    return "production";
  }

  if (item.path.includes("quality")) {
    return "quality";
  }

  if (item.path.includes("dispatch")) {
    return "dispatch";
  }

  if (item.path.includes("inventory")) {
    return "inventory";
  }

  if (item.path.includes("procurement")) {
    return "procurement";
  }

  if (item.path === "/platform/notifications") {
    return "bell";
  }

  if (item.path === "/platform/approvals") {
    return "approval";
  }

  if (item.path === "/platform/attachments") {
    return "attachment";
  }

  if (item.path === "/platform/users") {
    return "users";
  }

  if (item.path === "/platform/roles") {
    return "roles";
  }

  if (item.path === "/platform/audit-trail") {
    return "audit";
  }

  if (item.path === "/platform/workflow-numbering") {
    return "workflow";
  }

  if (item.path.includes("/platform/settings") || item.path.includes("/platform/tenant-settings")) {
    return "settings";
  }

  if (item.path.includes("platform")) {
    return "platform";
  }

  if (item.path.includes("reports")) {
    return "reports";
  }

  if (item.path.includes("commercial")) {
    return "master";
  }

  if (section.includes("MASTER")) {
    return "master";
  }

  return "dashboard";
}

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8
  };

  const paths: Record<NavigationIconName, ReactElement> = {
    approval: (
      <>
        <path {...common} d="M7 4h10v16H7V4Z" />
        <path {...common} d="M9.5 8h5" />
        <path {...common} d="m9.5 13 1.5 1.5 3.5-4" />
      </>
    ),
    attachment: (
      <>
        <path {...common} d="m8 12 5.8-5.8a3 3 0 0 1 4.2 4.2l-7.3 7.3a4.2 4.2 0 0 1-5.9-5.9l6.6-6.6" />
        <path {...common} d="m10 14 5.6-5.6" />
      </>
    ),
    audit: (
      <>
        <path {...common} d="M6 4h9l3 3v13H6V4Z" />
        <path {...common} d="M15 4v4h3" />
        <path {...common} d="M8.5 12h7" />
        <path {...common} d="M8.5 16h4" />
      </>
    ),
    barcode: (
      <>
        <path {...common} d="M5 5v14" />
        <path {...common} d="M8 5v14" />
        <path {...common} d="M12 5v14" />
        <path {...common} d="M16 5v14" />
        <path {...common} d="M19 5v14" />
      </>
    ),
    bell: (
      <>
        <path {...common} d="M6.5 10.5a5.5 5.5 0 0 1 11 0v3.2l1.5 2.8H5l1.5-2.8v-3.2Z" />
        <path {...common} d="M10 19a2 2 0 0 0 4 0" />
      </>
    ),
    bin: (
      <>
        <path {...common} d="M4.5 8.5h15" />
        <path {...common} d="M6.5 8.5 8 20h8l1.5-11.5" />
        <path {...common} d="M9 5h6l1 3.5H8l1-3.5Z" />
      </>
    ),
    bom: (
      <>
        <path {...common} d="M12 4v4" />
        <path {...common} d="M7 10h10v4H7v-4Z" />
        <path {...common} d="M7 14v3" />
        <path {...common} d="M17 14v3" />
        <path {...common} d="M4.5 17h5v3h-5v-3Z" />
        <path {...common} d="M14.5 17h5v3h-5v-3Z" />
      </>
    ),
    boq: (
      <>
        <path {...common} d="M5 4h14v16H5V4Z" />
        <path {...common} d="M8 8h8" />
        <path {...common} d="M8 12h8" />
        <path {...common} d="M8 16h5" />
      </>
    ),
    branch: (
      <>
        <path {...common} d="M12 5v14" />
        <path {...common} d="M12 9h5l2 3-2 3h-5" />
        <path {...common} d="M12 7H7l-2 3 2 3h5" />
      </>
    ),
    capacity: (
      <>
        <path {...common} d="M4 18h16" />
        <path {...common} d="M6 18V9" />
        <path {...common} d="M10 18V5" />
        <path {...common} d="M14 18v-7" />
        <path {...common} d="M18 18V7" />
      </>
    ),
    classification: (
      <>
        <path {...common} d="M5 5h6v6H5V5Z" />
        <path {...common} d="M13 5h6v6h-6V5Z" />
        <path {...common} d="M5 13h6v6H5v-6Z" />
        <path {...common} d="M13 13h6v6h-6v-6Z" />
      </>
    ),
    company: (
      <>
        <path {...common} d="M5 20V5h10v15" />
        <path {...common} d="M15 10h4v10" />
        <path {...common} d="M8 8h2" />
        <path {...common} d="M8 12h2" />
        <path {...common} d="M8 16h2" />
      </>
    ),
    customer: (
      <>
        <path {...common} d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path {...common} d="M4 19a5 5 0 0 1 10 0" />
        <path {...common} d="M15 9h5" />
        <path {...common} d="M15 13h4" />
      </>
    ),
    dashboard: (
      <>
        <path {...common} d="M4 13.5h5.5V4H4v9.5Z" />
        <path {...common} d="M14.5 20H20v-9.5h-5.5V20Z" />
        <path {...common} d="M4 20h5.5v-3.5H4V20Z" />
        <path {...common} d="M14.5 7.5H20V4h-5.5v3.5Z" />
      </>
    ),
    department: (
      <>
        <path {...common} d="M5 6h14v4H5V6Z" />
        <path {...common} d="M5 14h6v5H5v-5Z" />
        <path {...common} d="M13 14h6v5h-6v-5Z" />
        <path {...common} d="M12 10v4" />
      </>
    ),
    dispatch: (
      <>
        <path {...common} d="M3.5 7.5h11v9h-11v-9Z" />
        <path {...common} d="M14.5 10.5h3.2l2.8 3v3h-6v-6Z" />
        <path {...common} d="M6.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path {...common} d="M17.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
      </>
    ),
    discount: (
      <>
        <path {...common} d="M5 19 19 5" />
        <path {...common} d="M8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path {...common} d="M16 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </>
    ),
    document: (
      <>
        <path {...common} d="M6 4h9l3 3v13H6V4Z" />
        <path {...common} d="M15 4v4h3" />
        <path {...common} d="M9 12h6" />
        <path {...common} d="M9 16h4" />
      </>
    ),
    downtime: (
      <>
        <path {...common} d="M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z" />
        <path {...common} d="M12 8v4l2.5 2" />
        <path {...common} d="M6 4 4 6" />
        <path {...common} d="m18 4 2 2" />
      </>
    ),
    eco: (
      <>
        <path {...common} d="M6 5h8l4 4v10H6V5Z" />
        <path {...common} d="M14 5v5h4" />
        <path {...common} d="m8.5 15 2 2 4.5-5" />
      </>
    ),
    engineering: (
      <>
        <path {...common} d="m5 19 6-6" />
        <path {...common} d="m14 5 5 5" />
        <path {...common} d="m10.8 7.8 5.4 5.4" />
        <path {...common} d="M7 17.5 5.5 19 4 17.5 5.5 16 7 17.5Z" />
        <path {...common} d="M12.4 6.2 14 4.6 19.4 10 17.8 11.6" />
      </>
    ),
    forecast: (
      <>
        <path {...common} d="M4 17c2.5-5 5-7 8-5s5.5 0 8-5" />
        <path {...common} d="M5 20h14" />
        <path {...common} d="M7 14v6" />
        <path {...common} d="M12 12v8" />
        <path {...common} d="M17 9v11" />
      </>
    ),
    help: (
      <>
        <path {...common} d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        <path {...common} d="M9.8 10a2.2 2.2 0 1 1 3.8 1.5c-.8.7-1.6 1.2-1.6 2.5" />
        <path {...common} d="M12 17h.1" />
      </>
    ),
    home: (
      <>
        <path {...common} d="m4 11 8-7 8 7" />
        <path {...common} d="M6.5 10.5V20h11v-9.5" />
        <path {...common} d="M10 20v-5h4v5" />
      </>
    ),
    inventory: (
      <>
        <path {...common} d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" />
        <path {...common} d="M4 12.5 12 17l8-4.5" />
        <path {...common} d="M4 16.5 12 21l8-4.5" />
      </>
    ),
    item: (
      <>
        <path {...common} d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
        <path {...common} d="M12 12v9" />
        <path {...common} d="m4 7.5 8 4.5 8-4.5" />
      </>
    ),
    itemAttribute: (
      <>
        <path {...common} d="M5 6h14" />
        <path {...common} d="M5 12h14" />
        <path {...common} d="M5 18h14" />
        <path {...common} d="M8 4v4" />
        <path {...common} d="M16 10v4" />
        <path {...common} d="M12 16v4" />
      </>
    ),
    itemGroup: (
      <>
        <path {...common} d="M5 5h6v6H5V5Z" />
        <path {...common} d="M13 5h6v6h-6V5Z" />
        <path {...common} d="M5 13h14v6H5v-6Z" />
      </>
    ),
    itemVariant: (
      <>
        <path {...common} d="M6 5h6l6 6-6 6H6l6-6-6-6Z" />
        <path {...common} d="M12 5 18 11" />
        <path {...common} d="M12 17 18 11" />
      </>
    ),
    jobCard: (
      <>
        <path {...common} d="M6 4h12v16H6V4Z" />
        <path {...common} d="M9 8h6" />
        <path {...common} d="M9 12h6" />
        <path {...common} d="M9 16h3" />
      </>
    ),
    leadTime: (
      <>
        <path {...common} d="M5 6h14" />
        <path {...common} d="M7 6v5a5 5 0 0 0 10 0V6" />
        <path {...common} d="M7 18v-5a5 5 0 0 1 10 0v5" />
        <path {...common} d="M5 18h14" />
      </>
    ),
    machine: (
      <>
        <path {...common} d="M5 17h14" />
        <path {...common} d="M7 17V8h10v9" />
        <path {...common} d="M9 11h6" />
        <path {...common} d="M10 5h4v3h-4V5Z" />
      </>
    ),
    machineBoard: (
      <>
        <path {...common} d="M4 6h16v12H4V6Z" />
        <path {...common} d="M8 10h3" />
        <path {...common} d="M13 10h3" />
        <path {...common} d="M8 14h8" />
      </>
    ),
    measurementProfile: (
      <>
        <path {...common} d="M4 17h16" />
        <path {...common} d="M6 17V7h12v10" />
        <path {...common} d="M8 10h8" />
        <path {...common} d="M8 13h5" />
      </>
    ),
    mrp: (
      <>
        <path {...common} d="M6 5h12v4H6V5Z" />
        <path {...common} d="M6 15h12v4H6v-4Z" />
        <path {...common} d="M12 9v6" />
        <path {...common} d="m9 12 3 3 3-3" />
      </>
    ),
    master: (
      <>
        <path {...common} d="M5 5.5h14" />
        <path {...common} d="M5 12h14" />
        <path {...common} d="M5 18.5h14" />
        <path {...common} d="M8 4v3" />
        <path {...common} d="M15 10.5v3" />
        <path {...common} d="M11 17v3" />
      </>
    ),
    mps: (
      <>
        <path {...common} d="M5 5h14v14H5V5Z" />
        <path {...common} d="M8 9h8" />
        <path {...common} d="M8 13h8" />
        <path {...common} d="M8 17h4" />
      </>
    ),
    operation: (
      <>
        <path {...common} d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        <path {...common} d="M12 3.5v2" />
        <path {...common} d="M12 18.5v2" />
        <path {...common} d="M4.5 12h2" />
        <path {...common} d="M17.5 12h2" />
      </>
    ),
    platform: (
      <>
        <path {...common} d="M12 3.5 19 7v5.2c0 4-2.8 7.1-7 8.3-4.2-1.2-7-4.3-7-8.3V7l7-3.5Z" />
        <path {...common} d="m9 12 2 2 4-4" />
      </>
    ),
    planning: (
      <>
        <path {...common} d="M5 5h14v15H5V5Z" />
        <path {...common} d="M8 3v4" />
        <path {...common} d="M16 3v4" />
        <path {...common} d="M8 11h8" />
        <path {...common} d="M8 15h5" />
      </>
    ),
    priceList: (
      <>
        <path {...common} d="M6 5h12v14H6V5Z" />
        <path {...common} d="M9 9h6" />
        <path {...common} d="M9 13h6" />
        <path {...common} d="M9 17h3" />
        <path {...common} d="M16 16.5h.1" />
      </>
    ),
    procurement: (
      <>
        <path {...common} d="M6 6h15l-2 8H8L6 6Z" />
        <path {...common} d="M6 6 5.2 3.5H3" />
        <path {...common} d="M9 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        <path {...common} d="M17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      </>
    ),
    production: (
      <>
        <path {...common} d="M4 19h16" />
        <path {...common} d="M5 19V9l4 3V9l4 3V8l6 4v7" />
        <path {...common} d="M8 15h2" />
        <path {...common} d="M13 15h2" />
      </>
    ),
    quality: (
      <>
        <path {...common} d="M12 4 19 7.5v5c0 3.5-2.7 6.4-7 7.5-4.3-1.1-7-4-7-7.5v-5L12 4Z" />
        <path {...common} d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    quote: (
      <>
        <path {...common} d="M6 4h12v16H6V4Z" />
        <path {...common} d="M9 8h6" />
        <path {...common} d="M9 12h4" />
        <path {...common} d="M9 16h6" />
      </>
    ),
    reasonCode: (
      <>
        <path {...common} d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        <path {...common} d="M12 8v4" />
        <path {...common} d="M12 16h.1" />
      </>
    ),
    reports: (
      <>
        <path {...common} d="M6 4h9l3 3v13H6V4Z" />
        <path {...common} d="M15 4v4h3" />
        <path {...common} d="M9 15v2" />
        <path {...common} d="M12 12v5" />
        <path {...common} d="M15 13.5V17" />
      </>
    ),
    routing: (
      <>
        <path {...common} d="M5 6h4v4H5V6Z" />
        <path {...common} d="M15 14h4v4h-4v-4Z" />
        <path {...common} d="M9 8h3a4 4 0 0 1 4 4v2" />
        <path {...common} d="m13.5 12 2.5 2.5L18.5 12" />
      </>
    ),
    roles: (
      <>
        <path {...common} d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path {...common} d="M3.8 19a4.2 4.2 0 0 1 8.4 0" />
        <path {...common} d="M15 8h5" />
        <path {...common} d="M15 12h4" />
        <path {...common} d="M15 16h3" />
      </>
    ),
    salesOrder: (
      <>
        <path {...common} d="M6 5h12v14H6V5Z" />
        <path {...common} d="M9 9h6" />
        <path {...common} d="M9 13h6" />
        <path {...common} d="M9 17h3" />
      </>
    ),
    search: (
      <>
        <path {...common} d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" />
        <path {...common} d="m15.5 15.5 4 4" />
      </>
    ),
    settings: (
      <>
        <path {...common} d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path {...common} d="M12 3.5v2" />
        <path {...common} d="M12 18.5v2" />
        <path {...common} d="M4.6 7.2 6.2 8.3" />
        <path {...common} d="m17.8 15.7 1.6 1.1" />
        <path {...common} d="m19.4 7.2-1.6 1.1" />
        <path {...common} d="m6.2 15.7-1.6 1.1" />
      </>
    ),
    shift: (
      <>
        <path {...common} d="M12 4v4" />
        <path {...common} d="M12 16v4" />
        <path {...common} d="M4 12h4" />
        <path {...common} d="M16 12h4" />
        <path {...common} d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      </>
    ),
    supplier: (
      <>
        <path {...common} d="M4 8h10v8H4V8Z" />
        <path {...common} d="M14 10h3.5l2.5 3v3h-6v-6Z" />
        <path {...common} d="M7 18a1.5 1.5 0 1 0 0-3" />
        <path {...common} d="M17 18a1.5 1.5 0 1 0 0-3" />
      </>
    ),
    taxTerms: (
      <>
        <path {...common} d="M5 6h14v12H5V6Z" />
        <path {...common} d="M8 10h8" />
        <path {...common} d="M8 14h5" />
        <path {...common} d="m15 14 2 2 2-4" />
      </>
    ),
    tool: (
      <>
        <path {...common} d="m5 19 6-6" />
        <path {...common} d="M13 5a4 4 0 0 0 5 5l-7 7-3-3 7-7Z" />
      </>
    ),
    translation: (
      <>
        <path {...common} d="M5 5h8" />
        <path {...common} d="M9 5c-.4 3-1.8 5.5-4 7" />
        <path {...common} d="M7 8c1 1.8 2.5 3.2 4.5 4" />
        <path {...common} d="M13 19l3.5-8 3.5 8" />
        <path {...common} d="M14.2 16h4.6" />
      </>
    ),
    uomClass: (
      <>
        <path {...common} d="M5 6h14v5H5V6Z" />
        <path {...common} d="M7 15h10" />
        <path {...common} d="M7 19h6" />
      </>
    ),
    uomConversion: (
      <>
        <path {...common} d="M5 8h11" />
        <path {...common} d="m13 5 3 3-3 3" />
        <path {...common} d="M19 16H8" />
        <path {...common} d="m11 13-3 3 3 3" />
      </>
    ),
    users: (
      <>
        <path {...common} d="M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Z" />
        <path {...common} d="M3.8 19a5.2 5.2 0 0 1 10.4 0" />
        <path {...common} d="M16 10.5a2.4 2.4 0 1 0 0-4.8" />
        <path {...common} d="M17 19a4 4 0 0 0-2.2-3.6" />
      </>
    ),
    warehouse: (
      <>
        <path {...common} d="M4 9 12 4l8 5v10H4V9Z" />
        <path {...common} d="M8 19v-6h8v6" />
        <path {...common} d="M9 9h6" />
      </>
    ),
    workCenter: (
      <>
        <path {...common} d="M5 19V9l4 3V9l4 3V8l6 4v7" />
        <path {...common} d="M8 15h2" />
        <path {...common} d="M13 15h2" />
      </>
    ),
    workOrder: (
      <>
        <path {...common} d="M6 4h12v16H6V4Z" />
        <path {...common} d="M9 8h6" />
        <path {...common} d="M9 12h6" />
        <path {...common} d="m9 16 1.5 1.5L15 13" />
      </>
    ),
    workflow: (
      <>
        <path {...common} d="M5 6.5h5v5H5v-5Z" />
        <path {...common} d="M14 12.5h5v5h-5v-5Z" />
        <path {...common} d="M10 9h2.5a3.5 3.5 0 0 1 3.5 3.5" />
        <path {...common} d="M12 15H9.5A3.5 3.5 0 0 1 6 11.5" />
      </>
    )
  };

  return (
    <svg aria-hidden="true" className="app-shell__nav-svg" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function SectionChevron() {
  return (
    <svg aria-hidden="true" className="app-shell__nav-chevron" viewBox="0 0 20 20">
      <path
        d="M7 5.5 11.5 10 7 14.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAllowed, logout, session, switchContext } = useAuth();
  const { flags } = useFeatureFlags();
  const { unreadCount } = useNotifications();
  const { selectedWarehouse } = useWorkspacePreference();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set(["OVERVIEW"]));

  const currentPage = navigationItems.find((item) => item.path === location.pathname);
  const groupedNavigation = useMemo(() => groupNavigationItems(), []);
  const currentNavigationGroup = groupedNavigation.find((group) =>
    group.items.some((item) => item.path === location.pathname)
  )?.label;
  const currentContext = session?.user.activeContext;
  const availableContexts = session?.user.availableContexts ?? [];
  const companies = useMemo(() => {
    const entries = new Map<number, { id: number; label: string }>();

    for (const context of availableContexts) {
      entries.set(context.companyId, { id: context.companyId, label: context.companyName });
    }

    return Array.from(entries.values());
  }, [availableContexts]);

  const branches = availableContexts.filter(
    (entry) => entry.companyId === currentContext?.companyId
  );
  const toggleSection = (section: string) => {
    setExpandedSections((current) => {
      return current.has(section) ? new Set() : new Set([section]);
    });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <span className="app-shell__brand-mark" aria-hidden="true" />
          <div>
            <strong>STS Manufacturing ERP</strong>
            <p>Planning, production, inventory, quality, and dispatch control.</p>
          </div>
        </div>

        <nav aria-label="Primary" className="app-shell__nav">
          {groupedNavigation.map((group) => {
            const allowedItems = group.items.filter((item) => isAllowed(item.roles));
            const hasActiveItem = group.label === currentNavigationGroup;
            const isExpanded = expandedSections.has(group.label) || hasActiveItem;
            const visibleItems = isExpanded ? allowedItems : allowedItems.slice(0, group.visibleCount);
            const parentGroups = groupVisibleItemsByParent(visibleItems, group.label);

            if (allowedItems.length === 0) {
              return null;
            }

            return (
              <section className="app-shell__nav-section" key={group.label}>
                <button
                  aria-expanded={isExpanded}
                  className="app-shell__nav-section-button"
                  onClick={() => toggleSection(group.label)}
                  type="button"
                >
                  <span>{group.label}</span>
                  <span aria-hidden="true" className="app-shell__nav-section-meta">
                    <SectionChevron />
                  </span>
                </button>
                <div className="app-shell__nav-links app-shell__nav-links--nested">
                  {parentGroups.map((parent) => (
                    <div className="app-shell__nav-parent-group" key={`${group.label}-${parent.label}`}>
                      <div className="app-shell__nav-parent-label">{parent.label}</div>
                      {parent.items.map((item) => {
                        const iconName = getNavigationIcon(item, group.label);

                        return (
                          <NavLink
                            data-nav-parent={parent.label}
                            key={item.path}
                            className={({ isActive }) =>
                              `app-shell__nav-link app-shell__nav-link--child ${isActive ? "app-shell__nav-link--active" : ""}`
                            }
                            to={item.path}
                          >
                            <span className="app-shell__nav-icon" aria-hidden="true" data-nav-icon={iconName}>
                              <NavigationIcon name={iconName} />
                            </span>
                            <span className="app-shell__nav-text">{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {flags.showSeededNavigation ? (
            <div className="app-shell__nav-section app-shell__nav-demo">
              <div className="app-shell__nav-section-label">WORKFLOW SHORTCUTS</div>
              <div className="app-shell__nav-links">
                {demoScenarios.slice(0, 3).map((scenario) => (
                  <Button
                    className="app-shell__scenario-link"
                    key={scenario.id}
                    onClick={() => navigate(scenario.route)}
                    variant="quiet"
                  >
                    <span>{scenario.title}</span>
                    <span className="muted">Open</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className="app-shell__sidebar-footer">
          <span>Signed in</span>
          <strong>{session?.user.displayName ?? "Workspace user"}</strong>
          <p>Access follows approved company, branch, and role scope.</p>
        </div>
      </aside>

      <main className="app-shell__content" id="main-content" tabIndex={-1}>
        <div className="app-topbar">
          <div className="app-topbar__hero">
            <div className="app-topbar__context">
              <div className="app-topbar__title">
                <small>{currentNavigationGroup ? `${currentNavigationGroup} workspace` : "Manufacturing workspace"}</small>
                <h1>{currentPage?.label ?? "Role home dashboard"}</h1>
                {selectedWarehouse ? (
                  <div className="context-chip-row">
                    <Badge tone="neutral">{`Warehouse ${selectedWarehouse.warehouseCode}`}</Badge>
                  </div>
                ) : null}
              </div>

              <div className="app-topbar__controls" aria-label="Workspace controls">
                <div className="app-topbar__context-switch">
                  <div className="app-topbar__selector-grid">
                    <label>
                      <span className="app-topbar__control-label">Company</span>
                      <select
                        onChange={(event) => {
                          const nextCompanyId = Number(event.target.value);
                          const firstBranch = availableContexts.find(
                            (context) => context.companyId === nextCompanyId
                          );

                          if (firstBranch) {
                            void switchContext({
                              companyId: firstBranch.companyId,
                              branchId: firstBranch.branchId
                            });
                          }
                        }}
                        value={currentContext?.companyId ?? ""}
                      >
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="app-topbar__control-label">Branch</span>
                      <select
                        onChange={(event) => {
                          void switchContext({
                            companyId: Number(currentContext?.companyId),
                            branchId: Number(event.target.value)
                          });
                        }}
                        value={currentContext?.branchId ?? ""}
                      >
                        {branches.map((branch) => (
                          <option key={branch.branchId} value={branch.branchId}>
                            {branch.branchName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="app-topbar__action-row">
                    {flags.enableNotificationCenter ? (
                      <Button variant="secondary" onClick={() => setNotificationsOpen(true)}>
                        Notifications
                        {unreadCount > 0 ? <Badge tone="warn">{String(unreadCount)}</Badge> : null}
                      </Button>
                    ) : null}
                    <Button variant="quiet" onClick={() => navigate("/platform/context-switch")}>
                      Switch
                    </Button>
                    <Button variant="ghost" onClick={() => void logout()}>
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Outlet />

        {flags.enableNotificationCenter ? (
          <Drawer
            description="Role-aware inbox for operational alerts, approvals, and reminders."
            isOpen={isNotificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            title="Notification center"
          >
            <NotificationCenter compact />
          </Drawer>
        ) : null}
      </main>
    </div>
  );
}
