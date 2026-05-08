import { readStoredSession } from "../auth/authStorage";
import type {
  ActionResponse,
  AuditTrailItemDto,
  AttachmentDto,
  AttachmentFilter,
  AttachmentUploadRequest,
  AlternateItemDto,
  AlternateItemUpsertRequest,
  ApiEnvelope,
  AuthSessionResponse,
  BlanketOrderDto,
  BinDto,
  BomDto,
  BomRevisionDto,
  BomUpsertRequest,
  BoqLineActionRequest,
  BoqRequirementDto,
  BoqRequirementLineDto,
  BranchDto,
  CompanyDto,
  CurrentUserResponse,
  CurrencyDto,
  CurrencyUpsertRequest,
  CustomerAddressDto,
  CustomerAddressUpsertRequest,
  CustomerDto,
  CustomerPartnerProfileUpsertRequest,
  CustomerPartnerWorkspaceDto,
  CustomerUpsertRequest,
  CycleCountDto,
  DashboardFilter,
  DepartmentDto,
  DiscountSchemeDto,
  DiscountSchemeUpsertRequest,
  DispatchPlanningItemDto,
  EngineeringChangeDto,
  EngineeringChangeUpsertRequest,
  ExportJobCreateRequest,
  ExportJobDto,
  ExchangeRateSetupDto,
  ExchangeRateSetupUpsertRequest,
  ExecutiveCockpitSummary,
  ItemBarcodeDto,
  ItemDto,
  ItemLookupDto,
  ItemMasterProfileDto,
  ItemMasterProfileUpsertRequest,
  ItemUpsertRequest,
  ItemUomDto,
  ItemVariantDto,
  LoginRequest,
  LogoutRequest,
  DowntimeEventDto,
  InspectionDto,
  InspectionPlanDto,
  JobCardDto,
  JobCardSummaryDto,
  MachineBoardItem,
  MachineDto,
  MeasurementFormulaDto,
  MeasurementProfileDto,
  MrpRunDto,
  MrpRunStartRequest,
  NonConformanceDto,
  NotificationItem,
  OperationDto,
  OperationUpsertRequest,
  OrderRiskItem,
  PackListDto,
  PackListPrintDto,
  PagedResult,
  PaymentTermDto,
  PaymentTermUpsertRequest,
  PriceListDto,
  PriceListUpsertRequest,
  ProductionReceiptDto,
  ProductionReceiptSummaryDto,
  PurchaseOrderDto,
  PurchaseRequisitionDto,
  QueryFilter,
  QuoteDto,
  RefreshTokenRequest,
  ApprovalDecisionRequest,
  ApprovalWorkItem,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ShiftDto,
  StageWiseDashboardItem,
  SalesOrderDto,
  SwitchOperatingContextRequest,
  SystemContextResponse,
  WarehouseDto,
  TranslationBundleResponse,
  UserDirectoryItemDto,
  WorkCenterDto,
  RoleMatrixItemDto,
  RoutingDto,
  RoutingUpsertRequest,
  WorkflowNumberingItemDto,
  TenantSettingItemDto,
  SupplierAddressDto,
  SupplierAddressUpsertRequest,
  SupplierDto,
  SupplierLeadTimeDto,
  SupplierLeadTimeUpsertRequest,
  SupplierPartnerProfileUpsertRequest,
  SupplierPartnerWorkspaceDto,
  SupplierUpsertRequest,
  SubcontractOrderDto,
  StockBalanceDto,
  StockTransactionDto,
  TaxCategoryDto,
  TaxCategoryUpsertRequest,
  TradeTermDto,
  TradeTermUpsertRequest,
  UomClassDto,
  UomConversionDto,
  UomDto,
  DemandForecastDto,
  MasterProductionScheduleDto,
  LotTraceabilityDto,
  SerialTraceabilityDto,
  ShipmentDto,
  ScrapEntryDto,
  WorkOrderDto,
  WorkOrderReadinessDto,
  WorkOrderSummaryDto,
  ReworkOrderDto
} from "./contracts";
import { serializeFilters } from "./filters";

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly details: string[];

  public constructor(message: string, status: number, code?: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiRequestInit extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, { skipAuth = false, ...init }: ApiRequestInit = {}) {
  const stored = readStoredSession();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth && stored?.accessToken) {
    headers.set("Authorization", `Bearer ${stored.accessToken}`);
  }

  const response = await fetch(path, {
    ...init,
    headers
  });

  const payload = (await response.json().catch(() => undefined)) as ApiEnvelope<T> | undefined;

  if (!response.ok || !payload?.success) {
    const first = payload?.errors?.[0];
    throw new ApiError(
      payload?.message ?? first?.message ?? "Unexpected API failure.",
      response.status,
      first?.code,
      payload?.errors?.map((entry) => entry.message) ?? []
    );
  }

  return payload.data;
}

export const apiClient = {
  auth: {
    login: (body: LoginRequest) =>
      request<AuthSessionResponse>("/api/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(body)
      }),
    me: () => request<CurrentUserResponse>("/api/auth/me"),
    refresh: (body: RefreshTokenRequest) =>
      request<AuthSessionResponse>("/api/auth/refresh", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(body)
      }),
    switchContext: (body: SwitchOperatingContextRequest) =>
      request<AuthSessionResponse>("/api/auth/switch-context", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    logout: (body: LogoutRequest) =>
      request<ActionResponse>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    forgotPassword: (body: ForgotPasswordRequest) =>
      request<ForgotPasswordResponse>("/api/auth/forgot-password", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(body)
      })
  },
  system: {
    context: () => request<SystemContextResponse>("/api/system/context")
  },
  localization: {
    resources: (languageCode: string, module?: string, keys?: string[]) => {
      const query = serializeFilters({
        languageCode,
        module,
        keys
      });

      return request<TranslationBundleResponse>(`/api/localization/resources?${query}`);
    }
  },
  dashboards: {
    stageWise: (filter: DashboardFilter = {}) => {
      const query = serializeFilters(filter);
      return request<StageWiseDashboardItem[]>(`/api/dashboards/stage-wise?${query}`);
    },
    orderDelivery: (filter: DashboardFilter = {}) => {
      const query = serializeFilters(filter);
      return request<OrderRiskItem[]>(`/api/dashboards/order-delivery?${query}`);
    },
    executiveCockpit: (filter: DashboardFilter = {}) => {
      const query = serializeFilters(filter);
      return request<ExecutiveCockpitSummary>(`/api/dashboards/executive-cockpit?${query}`);
    }
  },
  organization: {
    companies: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CompanyDto>>(`/api/companies?${query}`);
    },
    branches: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BranchDto>>(`/api/branches?${query}`);
    },
    departments: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DepartmentDto>>(`/api/departments?${query}`);
    },
    warehouses: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WarehouseDto>>(`/api/warehouses?${query}`);
    },
    bins: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BinDto>>(`/api/bins?${query}`);
    },
    shifts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ShiftDto>>(`/api/shifts?${query}`);
    }
  },
  measurements: {
    uomClasses: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<UomClassDto>>(`/api/uom/classes?${query}`);
    },
    uoms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<UomDto>>(`/api/uom?${query}`);
    },
    uomConversions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<UomConversionDto>>(`/api/uom/conversions?${query}`);
    },
    profiles: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MeasurementProfileDto>>(`/api/measurement-profiles?${query}`);
    },
    formulas: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MeasurementFormulaDto>>(`/api/measurement-formulas?${query}`);
    }
  },
  masters: {
    items: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemDto>>(`/api/items?${query}`);
    },
    createItem: (body: ItemUpsertRequest) =>
      request<ItemDto>("/api/items", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateItem: (itemId: number, body: ItemUpsertRequest) =>
      request<ItemDto>(`/api/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    itemLookup: (companyId?: number | null, search?: string) => {
      const query = serializeFilters({
        companyId: companyId ?? undefined,
        search: search?.trim() ? search.trim() : undefined
      });
      return request<ItemLookupDto[]>(`/api/items/lookup?${query}`);
    },
    itemProfile: (itemId: number) => request<ItemMasterProfileDto>(`/api/items/${itemId}/profile`),
    updateItemProfile: (itemId: number, body: ItemMasterProfileUpsertRequest) =>
      request<ItemMasterProfileDto>(`/api/items/${itemId}/profile`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    itemVariants: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemVariantDto>>(`/api/item-variants?${query}`);
    },
    itemUoms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemUomDto>>(`/api/item-uoms?${query}`);
    },
    itemBarcodes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemBarcodeDto>>(`/api/item-barcodes?${query}`);
    }
  },
  partners: {
    customers: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CustomerDto>>(`/api/customers?${query}`);
    },
    createCustomer: (body: CustomerUpsertRequest) =>
      request<CustomerDto>("/api/customers", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCustomer: (customerId: number, body: CustomerUpsertRequest) =>
      request<CustomerDto>(`/api/customers/${customerId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    customerProfile: (customerId: number) =>
      request<CustomerPartnerWorkspaceDto>(`/api/customers/${customerId}/profile`),
    updateCustomerProfile: (customerId: number, body: CustomerPartnerProfileUpsertRequest) =>
      request<CustomerPartnerWorkspaceDto>(`/api/customers/${customerId}/profile`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    customerAddresses: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CustomerAddressDto>>(`/api/customer-addresses?${query}`);
    },
    createCustomerAddress: (body: CustomerAddressUpsertRequest) =>
      request<CustomerAddressDto>("/api/customer-addresses", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCustomerAddress: (addressId: number, body: CustomerAddressUpsertRequest) =>
      request<CustomerAddressDto>(`/api/customer-addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    suppliers: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SupplierDto>>(`/api/suppliers?${query}`);
    },
    createSupplier: (body: SupplierUpsertRequest) =>
      request<SupplierDto>("/api/suppliers", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateSupplier: (supplierId: number, body: SupplierUpsertRequest) =>
      request<SupplierDto>(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    supplierProfile: (supplierId: number) =>
      request<SupplierPartnerWorkspaceDto>(`/api/suppliers/${supplierId}/profile`),
    updateSupplierProfile: (supplierId: number, body: SupplierPartnerProfileUpsertRequest) =>
      request<SupplierPartnerWorkspaceDto>(`/api/suppliers/${supplierId}/profile`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    supplierAddresses: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SupplierAddressDto>>(`/api/supplier-addresses?${query}`);
    },
    createSupplierAddress: (body: SupplierAddressUpsertRequest) =>
      request<SupplierAddressDto>("/api/supplier-addresses", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateSupplierAddress: (addressId: number, body: SupplierAddressUpsertRequest) =>
      request<SupplierAddressDto>(`/api/supplier-addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    supplierLeadTimes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SupplierLeadTimeDto>>(`/api/supplier-lead-times?${query}`);
    },
    createSupplierLeadTime: (body: SupplierLeadTimeUpsertRequest) =>
      request<SupplierLeadTimeDto>("/api/supplier-lead-times", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateSupplierLeadTime: (leadTimeId: number, body: SupplierLeadTimeUpsertRequest) =>
      request<SupplierLeadTimeDto>(`/api/supplier-lead-times/${leadTimeId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
  },
  commercial: {
    priceLists: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PriceListDto>>(`/api/commercial/price-lists?${query}`);
    },
    priceList: (priceListId: number) => request<PriceListDto>(`/api/commercial/price-lists/${priceListId}`),
    createPriceList: (body: PriceListUpsertRequest) =>
      request<PriceListDto>("/api/commercial/price-lists", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePriceList: (priceListId: number, body: PriceListUpsertRequest) =>
      request<PriceListDto>(`/api/commercial/price-lists/${priceListId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    discountSchemes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DiscountSchemeDto>>(`/api/commercial/discount-schemes?${query}`);
    },
    discountScheme: (schemeId: number) => request<DiscountSchemeDto>(`/api/commercial/discount-schemes/${schemeId}`),
    createDiscountScheme: (body: DiscountSchemeUpsertRequest) =>
      request<DiscountSchemeDto>("/api/commercial/discount-schemes", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateDiscountScheme: (schemeId: number, body: DiscountSchemeUpsertRequest) =>
      request<DiscountSchemeDto>(`/api/commercial/discount-schemes/${schemeId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    taxCategories: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<TaxCategoryDto>>(`/api/commercial/tax-categories?${query}`);
    },
    createTaxCategory: (body: TaxCategoryUpsertRequest) =>
      request<TaxCategoryDto>("/api/commercial/tax-categories", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateTaxCategory: (taxCategoryId: number, body: TaxCategoryUpsertRequest) =>
      request<TaxCategoryDto>(`/api/commercial/tax-categories/${taxCategoryId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    currencies: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CurrencyDto>>(`/api/commercial/currencies?${query}`);
    },
    createCurrency: (body: CurrencyUpsertRequest) =>
      request<CurrencyDto>("/api/commercial/currencies", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCurrency: (currencyId: number, body: CurrencyUpsertRequest) =>
      request<CurrencyDto>(`/api/commercial/currencies/${currencyId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    exchangeRates: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ExchangeRateSetupDto>>(`/api/commercial/exchange-rates?${query}`);
    },
    createExchangeRate: (body: ExchangeRateSetupUpsertRequest) =>
      request<ExchangeRateSetupDto>("/api/commercial/exchange-rates", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateExchangeRate: (exchangeRateId: number, body: ExchangeRateSetupUpsertRequest) =>
      request<ExchangeRateSetupDto>(`/api/commercial/exchange-rates/${exchangeRateId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    paymentTerms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PaymentTermDto>>(`/api/commercial/payment-terms?${query}`);
    },
    createPaymentTerm: (body: PaymentTermUpsertRequest) =>
      request<PaymentTermDto>("/api/commercial/payment-terms", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePaymentTerm: (paymentTermId: number, body: PaymentTermUpsertRequest) =>
      request<PaymentTermDto>(`/api/commercial/payment-terms/${paymentTermId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    tradeTerms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<TradeTermDto>>(`/api/commercial/trade-terms?${query}`);
    },
    createTradeTerm: (body: TradeTermUpsertRequest) =>
      request<TradeTermDto>("/api/commercial/trade-terms", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateTradeTerm: (tradeTermId: number, body: TradeTermUpsertRequest) =>
      request<TradeTermDto>(`/api/commercial/trade-terms/${tradeTermId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
  },
  resources: {
    operations: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<OperationDto>>(`/api/operations?${query}`);
    },
    createOperation: (body: OperationUpsertRequest) =>
      request<OperationDto>("/api/operations", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateOperation: (id: number, body: OperationUpsertRequest) =>
      request<OperationDto>(`/api/operations/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    workCenters: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WorkCenterDto>>(`/api/work-centers?${query}`);
    },
    machines: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MachineDto>>(`/api/machines?${query}`);
    }
  },
  salesPlanning: {
    quotes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<QuoteDto>>(`/api/quotes?${query}`);
    },
    salesOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SalesOrderDto>>(`/api/sales-orders?${query}`);
    },
    blanketOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BlanketOrderDto>>(`/api/blanket-orders?${query}`);
    },
    forecasts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DemandForecastDto>>(`/api/forecasts?${query}`);
    },
    mps: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MasterProductionScheduleDto>>(`/api/mps?${query}`);
    }
  },
  engineering: {
    createRouting: (body: RoutingUpsertRequest) =>
      request<RoutingDto>("/api/routings", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateRouting: (id: number, body: RoutingUpsertRequest) =>
      request<RoutingDto>(`/api/routings/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    routings: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<RoutingDto>>(`/api/routings?${query}`);
    },
    createBom: (body: BomUpsertRequest) =>
      request<BomDto>("/api/boms", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateBom: (id: number, body: BomUpsertRequest) =>
      request<BomDto>(`/api/boms/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    boms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BomDto>>(`/api/boms?${query}`);
    },
    cloneBomRevision: (bomId: number, revisionId: number) =>
      request<BomRevisionDto>(`/api/boms/${bomId}/revisions/${revisionId}/clone`, {
        method: "POST"
      }),
    approveBomRevision: (bomId: number, revisionId: number) =>
      request<BomRevisionDto>(`/api/boms/${bomId}/revisions/${revisionId}/approve`, {
        method: "POST"
      }),
    obsoleteBomRevision: (bomId: number, revisionId: number) =>
      request<BomRevisionDto>(`/api/boms/${bomId}/revisions/${revisionId}/obsolete`, {
        method: "POST"
      }),
    alternateItems: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<AlternateItemDto>>(`/api/alternate-items?${query}`);
    },
    createAlternateItem: (body: AlternateItemUpsertRequest) =>
      request<AlternateItemDto>("/api/alternate-items", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateAlternateItem: (id: number, body: AlternateItemUpsertRequest) =>
      request<AlternateItemDto>(`/api/alternate-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    engineeringChanges: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<EngineeringChangeDto>>(`/api/engineering-changes?${query}`);
    },
    createEngineeringChange: (body: EngineeringChangeUpsertRequest) =>
      request<EngineeringChangeDto>("/api/engineering-changes", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateEngineeringChange: (id: number, body: EngineeringChangeUpsertRequest) =>
      request<EngineeringChangeDto>(`/api/engineering-changes/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    submitEngineeringChange: (id: number) =>
      request<EngineeringChangeDto>(`/api/engineering-changes/${id}/submit`, {
        method: "POST"
      }),
    approveEngineeringChange: (id: number) =>
      request<EngineeringChangeDto>(`/api/engineering-changes/${id}/approve`, {
        method: "POST"
      }),
    implementEngineeringChange: (id: number) =>
      request<EngineeringChangeDto>(`/api/engineering-changes/${id}/implement`, {
        method: "POST"
      })
  },
  planning: {
    mrpRuns: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MrpRunDto>>(`/api/mrp?${query}`);
    },
    startMrpRun: (body: MrpRunStartRequest) =>
      request<MrpRunDto>("/api/mrp", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    boqRequirements: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BoqRequirementDto>>(`/api/boq-requirements?${query}`);
    },
    approveBoqLine: (boqRequirementId: number, lineId: number, body: BoqLineActionRequest) =>
      request<BoqRequirementLineDto>(`/api/boq-requirements/${boqRequirementId}/lines/${lineId}/approve`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    convertBoqLine: (boqRequirementId: number, lineId: number) =>
      request<BoqRequirementLineDto>(`/api/boq-requirements/${boqRequirementId}/lines/${lineId}/convert`, {
        method: "POST"
      }),
    convertReviewedBoqLines: (boqRequirementId: number) =>
      request<BoqRequirementLineDto[]>(`/api/boq-requirements/${boqRequirementId}/lines/convert-reviewed`, {
        method: "POST"
      })
  },
  procurement: {
    purchaseRequisitions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PurchaseRequisitionDto>>(`/api/purchase-requisitions?${query}`);
    },
    purchaseOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PurchaseOrderDto>>(`/api/purchase-orders?${query}`);
    },
    subcontractOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SubcontractOrderDto>>(`/api/subcontract-orders?${query}`);
    }
  },
  inventory: {
    balances: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<StockBalanceDto>>(`/api/inventory?${query}`);
    },
    transactions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<StockTransactionDto>>(`/api/inventory/transactions?${query}`);
    },
    lotTraceability: (lotNo: string, filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<LotTraceabilityDto>(`/api/traceability/lots/${encodeURIComponent(lotNo)}?${query}`);
    },
    serialTraceability: (serialNo: string, filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<SerialTraceabilityDto>(`/api/traceability/serials/${encodeURIComponent(serialNo)}?${query}`);
    },
    cycleCounts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CycleCountDto>>(`/api/cycle-counts?${query}`);
    },
    cycleCount: (id: number) => request<CycleCountDto>(`/api/cycle-counts/${id}`)
  },
  production: {
    workOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WorkOrderSummaryDto>>(`/api/work-orders?${query}`);
    },
    workOrder: (id: number) => request<WorkOrderDto>(`/api/work-orders/${id}`),
    workOrderReadiness: (id: number) => request<WorkOrderReadinessDto>(`/api/work-orders/${id}/readiness`),
    jobCards: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<JobCardSummaryDto>>(`/api/job-cards?${query}`);
    },
    jobCard: (id: number) => request<JobCardDto>(`/api/job-cards/${id}`),
    downtime: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DowntimeEventDto>>(`/api/downtime?${query}`);
    },
    machineBoard: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<MachineBoardItem[]>(`/api/machine-board?${query}`);
    },
    productionReceipts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ProductionReceiptSummaryDto>>(`/api/production-receipts?${query}`);
    },
    productionReceipt: (id: number) => request<ProductionReceiptDto>(`/api/production-receipts/${id}`),
    scrapEntries: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ScrapEntryDto>>(`/api/scrap-rework/scrap?${query}`);
    },
    reworkOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ReworkOrderDto>>(`/api/scrap-rework/rework-orders?${query}`);
    },
    reworkOrder: (id: number) => request<ReworkOrderDto>(`/api/scrap-rework/rework-orders/${id}`)
  },
  quality: {
    inspectionPlans: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<InspectionPlanDto>>(`/api/quality/plans?${query}`);
    },
    inspections: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<InspectionDto>>(`/api/quality/inspections?${query}`);
    },
    inspection: (id: number) => request<InspectionDto>(`/api/quality/inspections/${id}`),
    nonConformances: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<NonConformanceDto>>(`/api/quality/non-conformances?${query}`);
    },
    nonConformance: (id: number) => request<NonConformanceDto>(`/api/quality/non-conformances/${id}`)
  },
  dispatch: {
    packLists: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PackListDto>>(`/api/dispatch/pack-lists?${query}`);
    },
    packList: (id: number) => request<PackListDto>(`/api/dispatch/pack-lists/${id}`),
    shipments: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ShipmentDto>>(`/api/dispatch/shipments?${query}`);
    },
    shipment: (id: number) => request<ShipmentDto>(`/api/dispatch/shipments/${id}`),
    planning: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<DispatchPlanningItemDto[]>(`/api/dispatch/planning?${query}`);
    },
    packListPrint: (id: number) => request<PackListPrintDto>(`/api/reports/pack-lists/${id}/print`)
  },
  notifications: {
    list: () => request<NotificationItem[]>("/api/notifications"),
    markRead: (id: string) =>
      request<ActionResponse>(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: "POST"
      }),
    markAllRead: () =>
      request<ActionResponse>("/api/notifications/read-all", {
        method: "POST"
      })
  },
  approvals: {
    list: () => request<ApprovalWorkItem[]>("/api/approvals"),
    decide: (id: string, body: ApprovalDecisionRequest) =>
      request<ActionResponse>(`/api/approvals/${encodeURIComponent(id)}/decision`, {
        method: "POST",
        body: JSON.stringify(body)
      })
  },
  platform: {
    users: () => request<UserDirectoryItemDto[]>("/api/users"),
    roles: () => request<RoleMatrixItemDto[]>("/api/roles"),
    workflowRules: () => request<WorkflowNumberingItemDto[]>("/api/settings/workflow-rules"),
    tenantSettings: () => request<TenantSettingItemDto[]>("/api/settings/tenant-settings"),
    auditTrail: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<AuditTrailItemDto>>(`/api/audit-trail?${query}`);
    },
    attachments: (filter: AttachmentFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<AttachmentDto>>(`/api/attachments?${query}`);
    },
    uploadAttachment: (body: AttachmentUploadRequest) => {
      const formData = new FormData();
      if (body.companyId) {
        formData.set("companyId", String(body.companyId));
      }
      if (body.branchId) {
        formData.set("branchId", String(body.branchId));
      }
      formData.set("relatedDocumentType", body.relatedDocumentType);
      formData.set("relatedDocumentId", String(body.relatedDocumentId));
      formData.set("file", body.file);

      return request<AttachmentDto>("/api/attachments", {
        method: "POST",
        body: formData
      });
    },
    createExportJob: (body: ExportJobCreateRequest) =>
      request<ExportJobDto>("/api/exports", {
        method: "POST",
        body: JSON.stringify(body)
      })
  }
};
