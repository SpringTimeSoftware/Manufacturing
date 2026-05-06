export interface DemoScenario {
  id: string;
  title: string;
  narrative: string;
  proofSurfaces: string[];
  route: string;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "mto-assembly",
    title: "Make-to-order fabricated assembly",
    narrative: "Sales confirmation through BOM, MRP, work order, job cards, QC, and dispatch proof.",
    proofSurfaces: ["W051", "W052", "W060", "W066", "W080", "W082", "W108", "W057"],
    route: "/dashboards/order-delivery"
  },
  {
    id: "mixed-uom",
    title: "Mixed UOM sheet / weight item",
    narrative: "Item master, planning, issue, receipt, and traceability proof for dimensional sheet inventory.",
    proofSurfaces: ["W031", "W041", "W066", "W086", "W088", "W094", "W097"],
    route: "/masters/items"
  },
  {
    id: "outside-processing",
    title: "Outside-processing flow",
    narrative: "Subcontract recommendation, vendor issue, return tracking, and final assembly continuation.",
    proofSurfaces: ["W071", "W074", "W075", "W094", "W101", "W108"],
    route: "/partners/suppliers"
  },
  {
    id: "overdue-risk",
    title: "Overdue order risk proof",
    narrative: "Supplier delay plus machine downtime surfaced in dashboards with deterministic risk explanation.",
    proofSurfaces: ["W057", "W068", "W084", "W092", "W108", "W113"],
    route: "/dashboards/stage-wise"
  }
];
