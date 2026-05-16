import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions
} from "@tanstack/react-query";

export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options
  });
}

export function useApiMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await options?.onSuccess?.(data, variables, onMutateResult, context);
      await queryClient.invalidateQueries();
    }
  });
}

export const queryKeys = {
  auth: ["auth"] as const,
  context: ["system", "context"] as const,
  dashboards: {
    orderDelivery: (companyId?: number | null, branchId?: number | null, search = "") =>
      ["dashboards", "order-delivery", companyId ?? 0, branchId ?? 0, search] as const,
    stageWise: (companyId?: number | null, branchId?: number | null, search = "") =>
      ["dashboards", "stage-wise", companyId ?? 0, branchId ?? 0, search] as const,
    executiveCockpit: (companyId?: number | null, branchId?: number | null) =>
      ["dashboards", "executive-cockpit", companyId ?? 0, branchId ?? 0] as const
  },
  translation: (languageCode: string, module = "all", search = "") =>
    ["localization", languageCode, module, search] as const,
  organization: {
    companies: (search = "", status = "all") => ["organization", "companies", search, status] as const,
    branches: (companyId?: number | null, search = "", status = "all") =>
      ["organization", "branches", companyId ?? 0, search, status] as const,
    departments: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["organization", "departments", companyId ?? 0, branchId ?? 0, search, status] as const,
    warehouses: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["organization", "warehouses", companyId ?? 0, branchId ?? 0, search, status] as const,
    bins: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["organization", "bins", companyId ?? 0, branchId ?? 0, search, status] as const,
    shifts: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["organization", "shifts", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  measurements: {
    uomClasses: (companyId?: number | null, search = "", status = "all") =>
      ["measurements", "uom-classes", companyId ?? 0, search, status] as const,
    uoms: (companyId?: number | null, search = "", status = "all") =>
      ["measurements", "uoms", companyId ?? 0, search, status] as const,
    uomConversions: (companyId?: number | null, search = "", status = "all") =>
      ["measurements", "uom-conversions", companyId ?? 0, search, status] as const,
    profiles: (companyId?: number | null, search = "", status = "all") =>
      ["measurements", "profiles", companyId ?? 0, search, status] as const
  },
  masters: {
    itemGroups: (companyId?: number | null, search = "", status = "all") =>
      ["masters", "item-groups", companyId ?? 0, search, status] as const,
    itemAttributes: (companyId?: number | null, search = "", status = "all") =>
      ["masters", "item-attributes", companyId ?? 0, search, status] as const,
    reasonCodes: (companyId?: number | null, search = "", status = "all") =>
      ["masters", "reason-codes", companyId ?? 0, search, status] as const,
    items: (companyId?: number | null, search = "", status = "all") =>
      ["masters", "items", companyId ?? 0, search, status] as const,
    itemProfile: (itemId?: number | null) => ["masters", "item-profile", itemId ?? 0] as const,
    itemVariants: (companyId?: number | null, search = "", status = "all") =>
      ["masters", "item-variants", companyId ?? 0, search, status] as const,
    barcodes: (companyId?: number | null, search = "", status = "all") =>
      ["masters", "barcodes", companyId ?? 0, search, status] as const
  },
  partners: {
    customers: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["partners", "customers", companyId ?? 0, branchId ?? 0, search, status] as const,
    customerProfile: (customerId?: number | null) => ["partners", "customer-profile", customerId ?? 0] as const,
    customerAddresses: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["partners", "customer-addresses", companyId ?? 0, branchId ?? 0, search, status] as const,
    suppliers: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["partners", "suppliers", companyId ?? 0, branchId ?? 0, search, status] as const,
    supplierProfile: (supplierId?: number | null) => ["partners", "supplier-profile", supplierId ?? 0] as const,
    supplierAddresses: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["partners", "supplier-addresses", companyId ?? 0, branchId ?? 0, search, status] as const,
    supplierLeadTimes: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["partners", "supplier-lead-times", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  commercial: {
    priceLists: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "price-lists", companyId ?? 0, search, status] as const,
    discountSchemes: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "discount-schemes", companyId ?? 0, search, status] as const,
    taxCategories: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "tax-categories", companyId ?? 0, search, status] as const,
    currencies: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "currencies", companyId ?? 0, search, status] as const,
    exchangeRates: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "exchange-rates", companyId ?? 0, search, status] as const,
    paymentTerms: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "payment-terms", companyId ?? 0, search, status] as const,
    tradeTerms: (companyId?: number | null, search = "", status = "all") =>
      ["commercial", "trade-terms", companyId ?? 0, search, status] as const
  },
  salesPlanning: {
    quotes: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["sales-planning", "quotes", companyId ?? 0, branchId ?? 0, search, status] as const,
    salesOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["sales-planning", "sales-orders", companyId ?? 0, branchId ?? 0, search, status] as const,
    blanketOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["sales-planning", "blanket-orders", companyId ?? 0, branchId ?? 0, search, status] as const,
    forecasts: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["sales-planning", "forecasts", companyId ?? 0, branchId ?? 0, search, status] as const,
    mps: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["sales-planning", "mps", companyId ?? 0, branchId ?? 0, search, status] as const,
    availableToPromise: (companyId?: number | null, branchId?: number | null, search = "") =>
      ["sales-planning", "available-to-promise", companyId ?? 0, branchId ?? 0, search] as const
  },
  resources: {
    operations: (companyId?: number | null, search = "", status = "all") =>
      ["resources", "operations", companyId ?? 0, search, status] as const,
    workCenters: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["resources", "work-centers", companyId ?? 0, branchId ?? 0, search, status] as const,
    machines: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["resources", "machines", companyId ?? 0, branchId ?? 0, search, status] as const,
    tools: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["resources", "tools", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  engineering: {
    boms: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "boms", companyId ?? 0, search, status] as const,
    bomDetails: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "bom-details", companyId ?? 0, search, status] as const,
    bomComparison: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "bom-comparison", companyId ?? 0, search, status] as const,
    routings: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "routings", companyId ?? 0, search, status] as const,
    engineeringChanges: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "engineering-changes", companyId ?? 0, search, status] as const,
    alternateItems: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "alternate-items", companyId ?? 0, search, status] as const,
    documents: (companyId?: number | null, search = "", status = "all") =>
      ["engineering", "documents", companyId ?? 0, search, status] as const
  },
  planning: {
    plans: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "plans", companyId ?? 0, branchId ?? 0, search, status] as const,
    snapshots: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "snapshots", companyId ?? 0, branchId ?? 0, search, status] as const,
    mrpRuns: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "mrp-runs", companyId ?? 0, branchId ?? 0, search, status] as const,
    mrpResults: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "mrp-results", companyId ?? 0, branchId ?? 0, search, status] as const,
    boqRequirements: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "boq-requirements", companyId ?? 0, branchId ?? 0, search, status] as const,
    plannedOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "planned-orders", companyId ?? 0, branchId ?? 0, search, status] as const,
    shortageActions: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "shortage-actions", companyId ?? 0, branchId ?? 0, search, status] as const,
    capacityBoard: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["planning", "capacity-board", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  procurement: {
    purchaseRequisitions: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["procurement", "purchase-requisitions", companyId ?? 0, branchId ?? 0, search, status] as const,
    purchaseOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["procurement", "purchase-orders", companyId ?? 0, branchId ?? 0, search, status] as const,
    subcontractOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["procurement", "subcontract-orders", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  inventory: {
    balances: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["inventory", "balances", companyId ?? 0, branchId ?? 0, search, status] as const,
    traceability: (companyId?: number | null, branchId?: number | null, search = "") =>
      ["inventory", "traceability", companyId ?? 0, branchId ?? 0, search] as const,
    materialIssues: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["inventory", "material-issues", companyId ?? 0, branchId ?? 0, search, status] as const,
    materialReturns: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["inventory", "material-returns", companyId ?? 0, branchId ?? 0, search, status] as const,
    stockTransfers: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["inventory", "stock-transfers", companyId ?? 0, branchId ?? 0, search, status] as const,
    cycleCounts: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["inventory", "cycle-counts", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  production: {
    workOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "work-orders", companyId ?? 0, branchId ?? 0, search, status] as const,
    workOrderDetail: (workOrderId?: number | null) => ["production", "work-order-detail", workOrderId ?? 0] as const,
    workOrderReadiness: (workOrderId?: number | null) => ["production", "work-order-readiness", workOrderId ?? 0] as const,
    jobCards: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "job-cards", companyId ?? 0, branchId ?? 0, search, status] as const,
    jobCardDetail: (jobCardId?: number | null) => ["production", "job-card-detail", jobCardId ?? 0] as const,
    machineBoard: (dateFrom = "", dateTo = "", search = "", status = "all") =>
      ["production", "machine-board", dateFrom, dateTo, search, status] as const,
    downtime: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "downtime", companyId ?? 0, branchId ?? 0, search, status] as const,
    shiftProduction: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "shift-production", companyId ?? 0, branchId ?? 0, search, status] as const,
    productionReceipts: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "production-receipts", companyId ?? 0, branchId ?? 0, search, status] as const,
    scrapEntries: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "scrap-entries", companyId ?? 0, branchId ?? 0, search, status] as const,
    reworkOrders: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["production", "rework-orders", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  quality: {
    inspectionPlans: (companyId?: number | null, search = "", status = "all", inspectionType = "all") =>
      ["quality", "inspection-plans", companyId ?? 0, search, status, inspectionType] as const,
    inspections: (companyId?: number | null, branchId?: number | null, search = "", status = "all", inspectionType = "all") =>
      ["quality", "inspections", companyId ?? 0, branchId ?? 0, search, status, inspectionType] as const,
    nonConformances: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["quality", "non-conformances", companyId ?? 0, branchId ?? 0, search, status] as const,
    coas: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["quality", "coas", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  dispatch: {
    packLists: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["dispatch", "pack-lists", companyId ?? 0, branchId ?? 0, search, status] as const,
    planning: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["dispatch", "planning", companyId ?? 0, branchId ?? 0, search, status] as const,
    shipments: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["dispatch", "shipments", companyId ?? 0, branchId ?? 0, search, status] as const
  },
  platform: {
    attachments: (companyId?: number | null, search = "", status = "all") =>
      ["platform", "attachments", companyId ?? 0, search, status] as const
  },
  ws07: {
    integrationProviders: (companyId?: number | null, search = "", status = "all") =>
      ["ws07", "integration-providers", companyId ?? 0, search, status] as const,
    providerHealth: () => ["ws07", "provider-health"] as const,
    webhooks: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["ws07", "webhooks", companyId ?? 0, branchId ?? 0, search, status] as const,
    imports: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["ws07", "imports", companyId ?? 0, branchId ?? 0, search, status] as const,
    exports: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["ws07", "exports", companyId ?? 0, branchId ?? 0, search, status] as const,
    deliveries: (companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["ws07", "deliveries", companyId ?? 0, branchId ?? 0, search, status] as const,
    aiAssistant: (companyId?: number | null, branchId?: number | null, search = "") =>
      ["ws07", "ai-assistant", companyId ?? 0, branchId ?? 0, search] as const,
    translationAssistant: (companyId?: number | null, branchId?: number | null, search = "") =>
      ["ws07", "translation-assistant", companyId ?? 0, branchId ?? 0, search] as const,
    reporting: (screen: string, companyId?: number | null, branchId?: number | null, search = "", status = "all") =>
      ["ws07", "reporting", screen, companyId ?? 0, branchId ?? 0, search, status] as const
  }
};
