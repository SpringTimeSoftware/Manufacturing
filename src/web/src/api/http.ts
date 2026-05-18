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
  BlanketOrderUpsertRequest,
  BinDto,
  BinUpsertRequest,
  BomDto,
  BomRevisionDto,
  BomUpsertRequest,
  BoqLineActionRequest,
  BoqRequirementDto,
  BoqRequirementLineDto,
  BranchDto,
  BranchUpsertRequest,
  CompanyDto,
  CompanyUpsertRequest,
  CurrentUserResponse,
  CustomObjectDto,
  CustomObjectRecordDto,
  CustomObjectRecordUpsertRequest,
  CustomObjectUpsertRequest,
  CustomScreenDto,
  CustomScreenUpsertRequest,
  CurrencyDto,
  CurrencyUpsertRequest,
  CustomerAddressDto,
  CustomerAddressUpsertRequest,
  CustomerCommercialDefaultsDto,
  CustomerDto,
  CustomerPartnerProfileUpsertRequest,
  CustomerPartnerWorkspaceDto,
  CustomerUpsertRequest,
  CycleCountDto,
  CycleCountUpsertRequest,
  DashboardFilter,
  DepartmentDto,
  DepartmentUpsertRequest,
  DiscountSchemeDto,
  DiscountSchemeUpsertRequest,
  DispatchPlanningItemDto,
  EngineeringChangeDto,
  EngineeringChangeUpsertRequest,
  AiAssistantIntentDefinitionDto,
  AiAssistantPlanRequest,
  AiAssistantQueryPlanDto,
  AiDraftRequest,
  AiExecutionPolicyDto,
  AiModelDto,
  AiProviderDto,
  AiProviderHealthDto,
  AiReviewRequest,
  AiRunDto,
  ExportJobCreateRequest,
  ExportJobDto,
  ExchangeRateSetupDto,
  ExchangeRateSetupUpsertRequest,
  ExecutiveCockpitSummary,
  ItemAttributeDto,
  ItemAttributeUpsertRequest,
  ItemBarcodeDto,
  ItemBarcodeUpsertRequest,
  ItemDto,
  ItemLookupDto,
  ItemMasterProfileDto,
  ItemMasterProfileUpsertRequest,
  ItemUpsertRequest,
  ItemUomDto,
  ItemVariantDto,
  ItemVariantUpsertRequest,
  ImportJobCreateRequest,
  ImportJobDto,
  InventoryAvailableStockDto,
  InventoryAvailableStockRequest,
  InventoryDimensionOptionDto,
  InventoryDimensionQuery,
  InventoryTrackingPolicyDto,
  InventoryTrackingPolicyRequest,
  IntegrationConnectionDto,
  IntegrationConnectionUpsertRequest,
  IntegrationJobStatusUpdateRequest,
  IntegrationMessageTemplateDto,
  IntegrationMessageTemplateUpsertRequest,
  IntegrationProviderDto,
  IntegrationProviderUpsertRequest,
  LoginRequest,
  LogoutRequest,
  CreateJobCardsRequest,
  DowntimeEventDto,
  InspectionDto,
  InspectionPlanUpsertRequest,
  InspectionHoldReleaseRequest,
  InspectionPlanDto,
  InspectionSaveRequest,
  JobCardCompleteRequest,
  JobCardDto,
  JobCardPauseRequest,
  JobCardQuantityRequest,
  JobCardQuantityResultDto,
  JobCardResumeRequest,
  JobCardSummaryDto,
  JobCardStartRequest,
  MachineBoardItem,
  MachineDto,
  MachineUpsertRequest,
  MeasurementFormulaDto,
  MeasurementProfileDto,
  MeasurementProfileUpsertRequest,
  MasterProductionScheduleUpsertRequest,
  MrpRunDto,
  MrpRunStartRequest,
  PlannedOrderConversionResultDto,
  PlannedOrderDto,
  PlannedOrderUpsertRequest,
  PlanningPlanDto,
  PlanningPlanUpsertRequest,
  PlanningSnapshotCreateRequest,
  PlanningSnapshotDto,
  NonConformanceDto,
  NonConformanceActionRequest,
  NonConformanceDispositionRequest,
  NonConformanceUpsertRequest,
  CoaCertificateDto,
  CoaGenerateRequest,
  CoaReissueRequest,
  NotificationItem,
  OperationDto,
  OperationUpsertRequest,
  OrderRiskItem,
  OutboundDeliveryStatusDto,
  OutboundMessagePreviewDto,
  OutboundMessagePreviewRequest,
  OutboundMessageRequest,
  OutboundProviderHealthDto,
  OutboundRetryRequest,
  PackListDto,
  PackListPrintDto,
  PackListUpsertRequest,
  PagedResult,
  PaymentTermDto,
  PaymentTermUpsertRequest,
  PriceListDto,
  PriceListUpsertRequest,
  ProductionReceiptDto,
  ProductionReceiptCreateRequest,
  ProductionReceiptSummaryDto,
  PurchaseOrderDto,
  PurchaseOrderUpsertRequest,
  PurchaseRequisitionDto,
  PurchaseRequisitionUpsertRequest,
  QueryFilter,
  DashboardDataDto,
  DashboardDefinitionDto,
  DashboardUpsertRequest,
  QuoteComparisonDto,
  QuoteConvertRequest,
  QuoteDto,
  QuoteReopenRequest,
  QuoteUpsertRequest,
  RefreshTokenRequest,
  ApprovalDetailDto,
  ApprovalDecisionRequest,
  ApprovalWorkItem,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  HealthCheckResponse,
  GoodsReceiptDto,
  GoodsReceiptUpsertRequest,
  ArInvoiceDto,
  ArInvoiceFromShipmentRequest,
  ArInvoicePostingResultDto,
  ChartOfAccountDto,
  ChartOfAccountUpsertRequest,
  FiscalPeriodDto,
  FiscalPeriodUpsertRequest,
  InventoryValuationEntryDto,
  JournalDto,
  JournalUpsertRequest,
  PostingProfileDto,
  PostingProfileUpsertRequest,
  TaxLedgerEntryDto,
  ShiftDto,
  ShiftUpsertRequest,
  ShortageActionDto,
  ShortageActionUpsertRequest,
  StageWiseDashboardItem,
  SalesOrderDto,
  SalesOrderUpsertRequest,
  InstalledAssetDto,
  InstalledAssetUpsertRequest,
  ServiceChargeDto,
  ServiceChargeUpsertRequest,
  ServiceContractDto,
  ServiceContractUpsertRequest,
  ServiceDashboardDto,
  ServiceEntitlementDto,
  ServiceSpareMovementDto,
  ServiceSpareMovementRequest,
  ServiceSparePostResultDto,
  ServiceTicketAssignmentRequest,
  ServiceTicketDto,
  ServiceTicketStatusRequest,
  ServiceTicketUpsertRequest,
  ServiceVisitDto,
  ServiceVisitUpsertRequest,
  WarrantyClaimDecisionRequest,
  WarrantyClaimDto,
  WarrantyClaimUpsertRequest,
  WarrantyPolicyDto,
  WarrantyPolicyUpsertRequest,
  SalesTeamDto,
  SalesTerritoryDto,
  SwitchOperatingContextRequest,
  SystemContextResponse,
  SystemInfoResponse,
  WarehouseDto,
  WarehouseUpsertRequest,
  TranslationBundleResponse,
  TranslationDraftDto,
  TranslationDraftRequest,
  TranslationResourceUpsertRequest,
  UserDirectoryItemDto,
  UserAccessPolicyUpdateRequest,
  WorkCenterDto,
  WorkCenterUpsertRequest,
  PermissionCatalogItemDto,
  RoleMatrixItemDto,
  RoleUpsertRequest,
  RoutingDto,
  RoutingUpsertRequest,
  WorkflowNumberingItemDto,
  WorkflowRuleUpsertRequest,
  TenantSettingItemDto,
  TenantSettingUpdateRequest,
  UdfDefinitionDto,
  UdfDefinitionFilter,
  UdfDefinitionUpsertRequest,
  UdfPlacementDto,
  UdfPlacementUpsertRequest,
  UdfRuntimeFieldDto,
  UdfRuntimeValueSetRequest,
  UdfValueDto,
  UdfValueUpsertRequest,
  WebhookDispatchRequest,
  WebhookDispatchResultDto,
  WebhookEventDto,
  InboundWebhookRequest,
  CrmObjectMappingDto,
  CrmObjectMappingUpsertRequest,
  CrmSyncConflictDto,
  CrmSyncJobDto,
  CrmSyncRequest,
  WebhookSubscriptionDto,
  WebhookSubscriptionUpsertRequest,
  SupplierAddressDto,
  SupplierAddressUpsertRequest,
  SupplierDto,
  SupplierInvoiceDto,
  SupplierInvoicePostingResultDto,
  SupplierInvoiceUpsertRequest,
  SupplierLeadTimeDto,
  SupplierLeadTimeUpsertRequest,
  SupplierPartnerProfileUpsertRequest,
  SupplierPartnerWorkspaceDto,
  SupplierUpsertRequest,
  SubcontractOrderDto,
  SubcontractOrderUpsertRequest,
  SubcontractReceiptDto,
  SubcontractReceiptUpsertRequest,
  StockBalanceDto,
  StockIssueRequest,
  StockReservationDto,
  StockReservationReleaseRequest,
  StockReservationRequest,
  StockReturnRequest,
  StockTransactionDto,
  StockTransferRequest,
  TaxCategoryDto,
  TaxCategoryUpsertRequest,
  TradeTermDto,
  TradeTermUpsertRequest,
  ToolDto,
  ToolUpsertRequest,
  UomClassDto,
  UomClassUpsertRequest,
  UomConversionDto,
  UomConversionUpsertRequest,
  UomDto,
  DemandForecastDto,
  DemandForecastUpsertRequest,
  MasterProductionScheduleDto,
  LotTraceabilityDto,
  SerialTraceabilityDto,
  ShipmentDto,
  ShipmentProofRequest,
  ShipmentUpsertRequest,
  ScrapEntryDto,
  ScrapEntryCreateRequest,
  WorkOrderDto,
  WorkOrderActionRequest,
  WorkOrderReadinessDto,
  WorkOrderSummaryDto,
  WorkOrderUpsertRequest,
  ReworkOrderDto,
  ReworkOrderActionRequest,
  ReworkOrderCreateRequest,
  ReportDefinitionDto,
  ReportDefinitionUpsertRequest,
  ReportOutputDto,
  ReportRunDto,
  ReportRunRequest,
  RfqDto,
  RfqUpsertRequest,
  SupplierQuotationDto,
  SupplierQuotationSelectionRequest,
  SupplierQuotationUpsertRequest
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

async function requestBlob(path: string, { skipAuth = false, ...init }: ApiRequestInit = {}) {
  const stored = readStoredSession();
  const headers = new Headers(init.headers);

  if (!skipAuth && stored?.accessToken) {
    headers.set("Authorization", `Bearer ${stored.accessToken}`);
  }

  const response = await fetch(path, {
    ...init,
    headers
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => undefined)) as ApiEnvelope<unknown> | undefined;
    const first = payload?.errors?.[0];
    throw new ApiError(
      payload?.message ?? first?.message ?? "Download failed.",
      response.status,
      first?.code,
      payload?.errors?.map((entry) => entry.message) ?? []
    );
  }

  return {
    blob: await response.blob(),
    contentDisposition: response.headers.get("content-disposition")
  };
}

async function requestJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, init);
  const payload = (await response.json().catch(() => undefined)) as T | undefined;

  if (!response.ok || !payload) {
    throw new ApiError("Runtime check failed.", response.status);
  }

  return payload;
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
    context: () => request<SystemContextResponse>("/api/system/context"),
    healthLive: () => requestJson<HealthCheckResponse>("/api/health/live"),
    healthReady: () => requestJson<HealthCheckResponse>("/api/health/ready"),
    info: () => request<SystemInfoResponse>("/api/system/info", { skipAuth: true })
  },
  localization: {
    resources: (languageCode: string, module?: string, keys?: string[]) => {
      const query = serializeFilters({
        languageCode,
        module,
        keys
      });

      return request<TranslationBundleResponse>(`/api/localization/resources?${query}`);
    },
    upsertResource: (body: TranslationResourceUpsertRequest) =>
      request<ActionResponse>("/api/localization/resources", {
        method: "POST",
        body: JSON.stringify(body)
      })
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
    createCompany: (body: CompanyUpsertRequest) =>
      request<CompanyDto>("/api/companies", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCompany: (id: number, body: CompanyUpsertRequest) =>
      request<CompanyDto>(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    branches: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BranchDto>>(`/api/branches?${query}`);
    },
    createBranch: (body: BranchUpsertRequest) =>
      request<BranchDto>("/api/branches", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateBranch: (id: number, body: BranchUpsertRequest) =>
      request<BranchDto>(`/api/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    departments: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DepartmentDto>>(`/api/departments?${query}`);
    },
    createDepartment: (body: DepartmentUpsertRequest) =>
      request<DepartmentDto>("/api/departments", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateDepartment: (id: number, body: DepartmentUpsertRequest) =>
      request<DepartmentDto>(`/api/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    warehouses: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WarehouseDto>>(`/api/warehouses?${query}`);
    },
    createWarehouse: (body: WarehouseUpsertRequest) =>
      request<WarehouseDto>("/api/warehouses", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateWarehouse: (id: number, body: WarehouseUpsertRequest) =>
      request<WarehouseDto>(`/api/warehouses/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    bins: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BinDto>>(`/api/bins?${query}`);
    },
    createBin: (body: BinUpsertRequest) =>
      request<BinDto>("/api/bins", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateBin: (id: number, body: BinUpsertRequest) =>
      request<BinDto>(`/api/bins/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    shifts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ShiftDto>>(`/api/shifts?${query}`);
    },
    createShift: (body: ShiftUpsertRequest) =>
      request<ShiftDto>("/api/shifts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateShift: (id: number, body: ShiftUpsertRequest) =>
      request<ShiftDto>(`/api/shifts/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
  },
  measurements: {
    uomClasses: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<UomClassDto>>(`/api/uom/classes?${query}`);
    },
    createUomClass: (body: UomClassUpsertRequest) =>
      request<UomClassDto>("/api/uom/classes", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateUomClass: (id: number, body: UomClassUpsertRequest) =>
      request<UomClassDto>(`/api/uom/classes/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    uoms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<UomDto>>(`/api/uom?${query}`);
    },
    uomConversions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<UomConversionDto>>(`/api/uom/conversions?${query}`);
    },
    createUomConversion: (body: UomConversionUpsertRequest) =>
      request<UomConversionDto>("/api/uom/conversions", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateUomConversion: (id: number, body: UomConversionUpsertRequest) =>
      request<UomConversionDto>(`/api/uom/conversions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    profiles: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MeasurementProfileDto>>(`/api/measurement-profiles?${query}`);
    },
    createProfile: (body: MeasurementProfileUpsertRequest) =>
      request<MeasurementProfileDto>("/api/measurement-profiles", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateProfile: (id: number, body: MeasurementProfileUpsertRequest) =>
      request<MeasurementProfileDto>(`/api/measurement-profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
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
    itemAttributes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemAttributeDto>>(`/api/item-attributes?${query}`);
    },
    createItemAttribute: (body: ItemAttributeUpsertRequest) =>
      request<ItemAttributeDto>("/api/item-attributes", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateItemAttribute: (attributeId: number, body: ItemAttributeUpsertRequest) =>
      request<ItemAttributeDto>(`/api/item-attributes/${attributeId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    itemVariants: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemVariantDto>>(`/api/item-variants?${query}`);
    },
    createItemVariant: (body: ItemVariantUpsertRequest) =>
      request<ItemVariantDto>("/api/item-variants", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateItemVariant: (variantId: number, body: ItemVariantUpsertRequest) =>
      request<ItemVariantDto>(`/api/item-variants/${variantId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    itemUoms: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemUomDto>>(`/api/item-uoms?${query}`);
    },
    itemBarcodes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ItemBarcodeDto>>(`/api/item-barcodes?${query}`);
    },
    createItemBarcode: (body: ItemBarcodeUpsertRequest) =>
      request<ItemBarcodeDto>("/api/item-barcodes", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateItemBarcode: (barcodeId: number, body: ItemBarcodeUpsertRequest) =>
      request<ItemBarcodeDto>(`/api/item-barcodes/${barcodeId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
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
    customerCommercialDefaults: (customerId: number, params: { companyId: number; branchId: number; customerAddressId?: number | null; documentDate: string }) => {
      const query = serializeFilters({
        companyId: params.companyId,
        branchId: params.branchId,
        customerAddressId: params.customerAddressId ?? undefined,
        documentDate: params.documentDate
      });
      return request<CustomerCommercialDefaultsDto>(`/api/customers/${customerId}/commercial-defaults?${query}`);
    },
    salesTerritories: (companyId: number) =>
      request<SalesTerritoryDto[]>(`/api/customers/sales-territories?${serializeFilters({ companyId })}`),
    salesTeams: (companyId: number) =>
      request<SalesTeamDto[]>(`/api/customers/sales-teams?${serializeFilters({ companyId })}`),
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
    createWorkCenter: (body: WorkCenterUpsertRequest) =>
      request<WorkCenterDto>("/api/work-centers", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateWorkCenter: (id: number, body: WorkCenterUpsertRequest) =>
      request<WorkCenterDto>(`/api/work-centers/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    machines: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MachineDto>>(`/api/machines?${query}`);
    },
    createMachine: (body: MachineUpsertRequest) =>
      request<MachineDto>("/api/machines", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateMachine: (id: number, body: MachineUpsertRequest) =>
      request<MachineDto>(`/api/machines/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    tools: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ToolDto>>(`/api/tools?${query}`);
    },
    createTool: (body: ToolUpsertRequest) =>
      request<ToolDto>("/api/tools", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateTool: (id: number, body: ToolUpsertRequest) =>
      request<ToolDto>(`/api/tools/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
  },
  salesPlanning: {
    quotes: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<QuoteDto>>(`/api/quotes?${query}`);
    },
    createQuote: (body: QuoteUpsertRequest) =>
      request<QuoteDto>("/api/quotes", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateQuote: (quoteId: number, body: QuoteUpsertRequest) =>
      request<QuoteDto>(`/api/quotes/${quoteId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    releaseQuote: (quoteId: number) =>
      request<QuoteDto>(`/api/quotes/${quoteId}/release`, {
        method: "POST"
      }),
    reopenQuote: (quoteId: number, body: QuoteReopenRequest) =>
      request<QuoteDto>(`/api/quotes/${quoteId}/reopen`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    convertQuoteToSalesOrder: (quoteId: number, body: QuoteConvertRequest) =>
      request<SalesOrderDto>(`/api/quotes/${quoteId}/convert-to-sales-order`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    salesOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SalesOrderDto>>(`/api/sales-orders?${query}`);
    },
    createSalesOrder: (body: SalesOrderUpsertRequest) =>
      request<SalesOrderDto>("/api/sales-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateSalesOrder: (id: number, body: SalesOrderUpsertRequest) =>
      request<SalesOrderDto>(`/api/sales-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    blanketOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<BlanketOrderDto>>(`/api/blanket-orders?${query}`);
    },
    createBlanketOrder: (body: BlanketOrderUpsertRequest) =>
      request<BlanketOrderDto>("/api/blanket-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateBlanketOrder: (id: number, body: BlanketOrderUpsertRequest) =>
      request<BlanketOrderDto>(`/api/blanket-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    forecasts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DemandForecastDto>>(`/api/forecasts?${query}`);
    },
    createForecast: (body: DemandForecastUpsertRequest) =>
      request<DemandForecastDto>("/api/forecasts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateForecast: (id: number, body: DemandForecastUpsertRequest) =>
      request<DemandForecastDto>(`/api/forecasts/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    mps: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<MasterProductionScheduleDto>>(`/api/mps?${query}`);
    },
    createMps: (body: MasterProductionScheduleUpsertRequest) =>
      request<MasterProductionScheduleDto>("/api/mps", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateMps: (id: number, body: MasterProductionScheduleUpsertRequest) =>
      request<MasterProductionScheduleDto>(`/api/mps/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
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
    plans: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PlanningPlanDto>>(`/api/planning/plans?${query}`);
    },
    createPlan: (body: PlanningPlanUpsertRequest) =>
      request<PlanningPlanDto>("/api/planning/plans", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePlan: (id: number, body: PlanningPlanUpsertRequest) =>
      request<PlanningPlanDto>(`/api/planning/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    snapshots: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PlanningSnapshotDto>>(`/api/planning/snapshots?${query}`);
    },
    createSnapshot: (body: PlanningSnapshotCreateRequest) =>
      request<PlanningSnapshotDto>("/api/planning/snapshots", {
        method: "POST",
        body: JSON.stringify(body)
      }),
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
      }),
    plannedOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PlannedOrderDto>>(`/api/planning/planned-orders?${query}`);
    },
    createPlannedOrder: (body: PlannedOrderUpsertRequest) =>
      request<PlannedOrderDto>("/api/planning/planned-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePlannedOrder: (id: number, body: PlannedOrderUpsertRequest) =>
      request<PlannedOrderDto>(`/api/planning/planned-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    firmPlannedOrder: (id: number) =>
      request<PlannedOrderDto>(`/api/planning/planned-orders/${id}/firm`, {
        method: "POST"
      }),
    convertPlannedOrderToPurchaseRequisition: (id: number) =>
      request<PlannedOrderConversionResultDto>(`/api/planning/planned-orders/${id}/convert/purchase-requisition`, {
        method: "POST"
      }),
    convertPlannedOrderToWorkOrder: (id: number) =>
      request<PlannedOrderConversionResultDto>(`/api/planning/planned-orders/${id}/convert/work-order`, {
        method: "POST"
      }),
    shortageActions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ShortageActionDto>>(`/api/planning/shortage-actions?${query}`);
    },
    createShortageAction: (body: ShortageActionUpsertRequest) =>
      request<ShortageActionDto>("/api/planning/shortage-actions", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateShortageAction: (id: number, body: ShortageActionUpsertRequest) =>
      request<ShortageActionDto>(`/api/planning/shortage-actions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      })
  },
  procurement: {
    purchaseRequisitions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PurchaseRequisitionDto>>(`/api/purchase-requisitions?${query}`);
    },
    createPurchaseRequisition: (body: PurchaseRequisitionUpsertRequest) =>
      request<PurchaseRequisitionDto>("/api/purchase-requisitions", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePurchaseRequisition: (id: number, body: PurchaseRequisitionUpsertRequest) =>
      request<PurchaseRequisitionDto>(`/api/purchase-requisitions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    approvePurchaseRequisition: (id: number) =>
      request<PurchaseRequisitionDto>(`/api/purchase-requisitions/${id}/approve`, {
        method: "POST"
      }),
    purchaseOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PurchaseOrderDto>>(`/api/purchase-orders?${query}`);
    },
    createPurchaseOrder: (body: PurchaseOrderUpsertRequest) =>
      request<PurchaseOrderDto>("/api/purchase-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePurchaseOrder: (id: number, body: PurchaseOrderUpsertRequest) =>
      request<PurchaseOrderDto>(`/api/purchase-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    approvePurchaseOrder: (id: number) =>
      request<PurchaseOrderDto>(`/api/purchase-orders/${id}/approve`, {
        method: "POST"
      }),
    createGoodsReceipt: (body: GoodsReceiptUpsertRequest) =>
      request<GoodsReceiptDto>("/api/goods-receipts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    createSupplierInvoice: (body: SupplierInvoiceUpsertRequest) =>
      request<SupplierInvoiceDto>("/api/supplier-invoices", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    matchSupplierInvoice: (id: number) =>
      request<SupplierInvoiceDto>(`/api/supplier-invoices/${id}/match`, {
        method: "POST"
      }),
    postSupplierInvoice: (id: number) =>
      request<SupplierInvoicePostingResultDto>(`/api/supplier-invoices/${id}/post`, {
        method: "POST"
      }),
    subcontractOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SubcontractOrderDto>>(`/api/subcontract-orders?${query}`);
    },
    createSubcontractOrder: (body: SubcontractOrderUpsertRequest) =>
      request<SubcontractOrderDto>("/api/subcontract-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateSubcontractOrder: (id: number, body: SubcontractOrderUpsertRequest) =>
      request<SubcontractOrderDto>(`/api/subcontract-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    approveSubcontractOrder: (id: number) =>
      request<SubcontractOrderDto>(`/api/subcontract-orders/${id}/approve`, {
        method: "POST"
      }),
    subcontractReceipts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<SubcontractReceiptDto>>(`/api/subcontract-receipts?${query}`);
    },
      createSubcontractReceipt: (body: SubcontractReceiptUpsertRequest) =>
        request<SubcontractReceiptDto>("/api/subcontract-receipts", {
          method: "POST",
          body: JSON.stringify(body)
        }),
      rfqs: (filter: QueryFilter = {}) => {
        const query = serializeFilters(filter);
        return request<PagedResult<RfqDto>>(`/api/rfqs?${query}`);
      },
      createRfq: (body: RfqUpsertRequest) =>
        request<RfqDto>("/api/rfqs", {
          method: "POST",
          body: JSON.stringify(body)
        }),
      updateRfq: (id: number, body: RfqUpsertRequest) =>
        request<RfqDto>(`/api/rfqs/${id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        }),
      sendRfq: (id: number) =>
        request<RfqDto>(`/api/rfqs/${id}/send`, {
          method: "POST"
        }),
      quoteComparison: (rfqId: number) =>
        request<QuoteComparisonDto>(`/api/rfqs/${rfqId}/comparison`),
      supplierQuotations: (filter: QueryFilter = {}) => {
        const query = serializeFilters(filter);
        return request<PagedResult<SupplierQuotationDto>>(`/api/supplier-quotations?${query}`);
      },
      createSupplierQuotation: (body: SupplierQuotationUpsertRequest) =>
        request<SupplierQuotationDto>("/api/supplier-quotations", {
          method: "POST",
          body: JSON.stringify(body)
        }),
      updateSupplierQuotation: (id: number, body: SupplierQuotationUpsertRequest) =>
        request<SupplierQuotationDto>(`/api/supplier-quotations/${id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        }),
      selectSupplierQuotation: (id: number, body: SupplierQuotationSelectionRequest) =>
        request<SupplierQuotationDto>(`/api/supplier-quotations/${id}/select`, {
          method: "POST",
          body: JSON.stringify(body)
        }),
      convertSupplierQuotationToPurchaseOrder: (id: number) =>
        request<PurchaseOrderDto>(`/api/supplier-quotations/${id}/convert-to-po`, {
          method: "POST"
        })
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
    trackingPolicy: (body: InventoryTrackingPolicyRequest) => {
      const query = serializeFilters(body as unknown as QueryFilter);
      return request<InventoryTrackingPolicyDto>(`/api/inventory/policy/tracking?${query}`);
    },
    availableStock: (body: InventoryAvailableStockRequest) => {
      const query = serializeFilters(body as unknown as QueryFilter);
      return request<InventoryAvailableStockDto>(`/api/inventory/policy/available?${query}`);
    },
    validBins: (body: InventoryDimensionQuery) => {
      const query = serializeFilters(body as unknown as QueryFilter);
      return request<InventoryDimensionOptionDto[]>(`/api/inventory/policy/valid-bins?${query}`);
    },
    validLots: (body: InventoryDimensionQuery) => {
      const query = serializeFilters(body as unknown as QueryFilter);
      return request<InventoryDimensionOptionDto[]>(`/api/inventory/policy/valid-lots?${query}`);
    },
    validSerials: (body: InventoryDimensionQuery) => {
      const query = serializeFilters(body as unknown as QueryFilter);
      return request<InventoryDimensionOptionDto[]>(`/api/inventory/policy/valid-serials?${query}`);
    },
    validPcids: (body: InventoryDimensionQuery) => {
      const query = serializeFilters(body as unknown as QueryFilter);
      return request<InventoryDimensionOptionDto[]>(`/api/inventory/policy/valid-pcids?${query}`);
    },
    stockReservations: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<StockReservationDto>>(`/api/stock-reservations?${query}`);
    },
    reserveStock: (body: StockReservationRequest) =>
      request<StockReservationDto>("/api/stock-reservations", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    releaseStockReservation: (id: number, body: StockReservationReleaseRequest = {}) =>
      request<ActionResponse>(`/api/stock-reservations/${id}/release`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    issueStock: (body: StockIssueRequest) =>
      request<StockTransactionDto[]>("/api/stock-issues", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    returnStock: (body: StockReturnRequest) =>
      request<StockTransactionDto[]>("/api/stock-returns", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    transferStock: (body: StockTransferRequest) =>
      request<StockTransactionDto[]>("/api/stock-transfers", {
        method: "POST",
        body: JSON.stringify(body)
      }),
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
    cycleCount: (id: number) => request<CycleCountDto>(`/api/cycle-counts/${id}`),
    createCycleCount: (body: CycleCountUpsertRequest) =>
      request<CycleCountDto>("/api/cycle-counts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCycleCount: (id: number, body: CycleCountUpsertRequest) =>
      request<CycleCountDto>(`/api/cycle-counts/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    postCycleCount: (id: number) =>
      request<CycleCountDto>(`/api/cycle-counts/${id}/post`, {
        method: "POST"
      })
  },
  production: {
    workOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WorkOrderSummaryDto>>(`/api/work-orders?${query}`);
    },
    workOrder: (id: number) => request<WorkOrderDto>(`/api/work-orders/${id}`),
    workOrderReadiness: (id: number) => request<WorkOrderReadinessDto>(`/api/work-orders/${id}/readiness`),
    createWorkOrder: (body: WorkOrderUpsertRequest) =>
      request<WorkOrderDto>("/api/work-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateWorkOrder: (id: number, body: WorkOrderUpsertRequest) =>
      request<WorkOrderDto>(`/api/work-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    releaseWorkOrder: (id: number, body: WorkOrderActionRequest = {}) =>
      request<ActionResponse>(`/api/work-orders/${id}/release`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    reReleaseWorkOrder: (id: number, body: WorkOrderActionRequest = {}) =>
      request<ActionResponse>(`/api/work-orders/${id}/re-release`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    cancelWorkOrder: (id: number, body: WorkOrderActionRequest = {}) =>
      request<ActionResponse>(`/api/work-orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    closeWorkOrder: (id: number, body: WorkOrderActionRequest = {}) =>
      request<ActionResponse>(`/api/work-orders/${id}/close`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    jobCards: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<JobCardSummaryDto>>(`/api/job-cards?${query}`);
    },
    jobCard: (id: number) => request<JobCardDto>(`/api/job-cards/${id}`),
    createJobCardsForWorkOrder: (body: CreateJobCardsRequest) =>
      request<JobCardDto[]>("/api/job-cards/create-for-work-order", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    startJobCard: (id: number, body: JobCardStartRequest) =>
      request<ActionResponse>(`/api/job-cards/${id}/start`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    pauseJobCard: (id: number, body: JobCardPauseRequest) =>
      request<ActionResponse>(`/api/job-cards/${id}/pause`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    resumeJobCard: (id: number, body: JobCardResumeRequest) =>
      request<ActionResponse>(`/api/job-cards/${id}/resume`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    logJobCardQuantity: (id: number, body: JobCardQuantityRequest) =>
      request<JobCardQuantityResultDto>(`/api/job-cards/${id}/quantities`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    completeJobCard: (id: number, body: JobCardCompleteRequest = {}) =>
      request<ActionResponse>(`/api/job-cards/${id}/complete`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
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
    createProductionReceipt: (body: ProductionReceiptCreateRequest) =>
      request<ProductionReceiptDto>("/api/production-receipts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    scrapEntries: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ScrapEntryDto>>(`/api/scrap-rework/scrap?${query}`);
    },
    createScrapEntry: (body: ScrapEntryCreateRequest) =>
      request<ScrapEntryDto>("/api/scrap-rework/scrap", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    reworkOrders: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ReworkOrderDto>>(`/api/scrap-rework/rework-orders?${query}`);
    },
    reworkOrder: (id: number) => request<ReworkOrderDto>(`/api/scrap-rework/rework-orders/${id}`),
    createReworkOrder: (body: ReworkOrderCreateRequest) =>
      request<ReworkOrderDto>("/api/scrap-rework/rework-orders", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    releaseReworkOrder: (id: number, body: ReworkOrderActionRequest = {}) =>
      request<ActionResponse>(`/api/scrap-rework/rework-orders/${id}/release`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    completeReworkOrder: (id: number, body: ReworkOrderActionRequest = {}) =>
      request<ActionResponse>(`/api/scrap-rework/rework-orders/${id}/complete`, {
        method: "POST",
        body: JSON.stringify(body)
      })
  },
  quality: {
    inspectionPlans: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<InspectionPlanDto>>(`/api/quality/plans?${query}`);
    },
    createInspectionPlan: (body: InspectionPlanUpsertRequest) =>
      request<InspectionPlanDto>("/api/quality/plans", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateInspectionPlan: (id: number, body: InspectionPlanUpsertRequest) =>
      request<InspectionPlanDto>(`/api/quality/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    inspections: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<InspectionDto>>(`/api/quality/inspections?${query}`);
    },
    inspection: (id: number) => request<InspectionDto>(`/api/quality/inspections/${id}`),
    saveInspection: (body: InspectionSaveRequest) =>
      request<InspectionDto>("/api/quality/inspections", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    holdInspection: (id: number, body: InspectionHoldReleaseRequest = {}) =>
      request<ActionResponse>(`/api/quality/inspections/${id}/hold`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    releaseInspection: (id: number, body: InspectionHoldReleaseRequest = {}) =>
      request<ActionResponse>(`/api/quality/inspections/${id}/release`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    nonConformances: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<NonConformanceDto>>(`/api/quality/ncrs?${query}`);
    },
    nonConformance: (id: number) => request<NonConformanceDto>(`/api/quality/ncrs/${id}`),
    createNonConformance: (body: NonConformanceUpsertRequest) =>
      request<NonConformanceDto>("/api/quality/ncrs", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateNonConformance: (id: number, body: NonConformanceUpsertRequest) =>
      request<NonConformanceDto>(`/api/quality/ncrs/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    releaseNonConformanceDisposition: (id: number, body: NonConformanceDispositionRequest) =>
      request<ActionResponse>(`/api/quality/ncrs/${id}/release-disposition`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    closeNonConformance: (id: number, body: NonConformanceActionRequest = {}) =>
      request<ActionResponse>(`/api/quality/ncrs/${id}/close`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    coas: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CoaCertificateDto>>(`/api/quality/coas?${query}`);
    },
    coa: (id: number) => request<CoaCertificateDto>(`/api/quality/coas/${id}`),
    generateCoa: (body: CoaGenerateRequest) =>
      request<CoaCertificateDto>("/api/quality/coas", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    reissueCoa: (id: number, body: CoaReissueRequest) =>
      request<CoaCertificateDto>(`/api/quality/coas/${id}/reissue`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    issueCoa: (id: number) =>
      request<ActionResponse>(`/api/quality/coas/${id}/issue`, {
        method: "POST"
      })
  },
  dispatch: {
    packLists: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PackListDto>>(`/api/dispatch/pack-lists?${query}`);
    },
    packList: (id: number) => request<PackListDto>(`/api/dispatch/pack-lists/${id}`),
    createPackList: (body: PackListUpsertRequest) =>
      request<PackListDto>("/api/dispatch/pack-lists", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updatePackList: (id: number, body: PackListUpsertRequest) =>
      request<PackListDto>(`/api/dispatch/pack-lists/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    shipments: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ShipmentDto>>(`/api/dispatch/shipments?${query}`);
    },
    shipment: (id: number) => request<ShipmentDto>(`/api/dispatch/shipments/${id}`),
    createShipment: (body: ShipmentUpsertRequest) =>
      request<ShipmentDto>("/api/dispatch/shipments", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateShipmentProof: (id: number, body: ShipmentProofRequest) =>
      request<ShipmentDto>(`/api/dispatch/shipments/${id}/proof`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    planning: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<DispatchPlanningItemDto[]>(`/api/dispatch/planning?${query}`);
    },
    packListPrint: (id: number) => request<PackListPrintDto>(`/api/reports/pack-lists/${id}/print`)
  },
  service: {
    dashboard: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<ServiceDashboardDto>(`/api/service/dashboard?${query}`);
    },
    installedAssets: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<InstalledAssetDto>>(`/api/service/installed-assets?${query}`);
    },
    createInstalledAsset: (body: InstalledAssetUpsertRequest) =>
      request<InstalledAssetDto>("/api/service/installed-assets", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateInstalledAsset: (id: number, body: InstalledAssetUpsertRequest) =>
      request<InstalledAssetDto>(`/api/service/installed-assets/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    warrantyPolicies: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WarrantyPolicyDto>>(`/api/service/warranty-policies?${query}`);
    },
    createWarrantyPolicy: (body: WarrantyPolicyUpsertRequest) =>
      request<WarrantyPolicyDto>("/api/service/warranty-policies", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateWarrantyPolicy: (id: number, body: WarrantyPolicyUpsertRequest) =>
      request<WarrantyPolicyDto>(`/api/service/warranty-policies/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    contracts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ServiceContractDto>>(`/api/service/contracts?${query}`);
    },
    createContract: (body: ServiceContractUpsertRequest) =>
      request<ServiceContractDto>("/api/service/contracts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateContract: (id: number, body: ServiceContractUpsertRequest) =>
      request<ServiceContractDto>(`/api/service/contracts/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    entitlement: (params: { installedAssetId?: number | null; customerId?: number | null; itemId?: number | null; asOfDate?: string | null }) => {
      const query = serializeFilters({
        installedAssetId: params.installedAssetId ?? undefined,
        customerId: params.customerId ?? undefined,
        itemId: params.itemId ?? undefined,
        asOfDate: params.asOfDate ?? undefined
      });
      return request<ServiceEntitlementDto>(`/api/service/entitlement?${query}`);
    },
    tickets: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ServiceTicketDto>>(`/api/service/tickets?${query}`);
    },
    ticket: (id: number) => request<ServiceTicketDto>(`/api/service/tickets/${id}`),
    createTicket: (body: ServiceTicketUpsertRequest) =>
      request<ServiceTicketDto>("/api/service/tickets", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateTicket: (id: number, body: ServiceTicketUpsertRequest) =>
      request<ServiceTicketDto>(`/api/service/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    assignTicket: (id: number, body: ServiceTicketAssignmentRequest) =>
      request<ServiceTicketDto>(`/api/service/tickets/${id}/assign`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    changeTicketStatus: (id: number, body: ServiceTicketStatusRequest) =>
      request<ServiceTicketDto>(`/api/service/tickets/${id}/status`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    visits: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ServiceVisitDto>>(`/api/service/visits?${query}`);
    },
    createVisit: (body: ServiceVisitUpsertRequest) =>
      request<ServiceVisitDto>("/api/service/visits", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateVisit: (id: number, body: ServiceVisitUpsertRequest) =>
      request<ServiceVisitDto>(`/api/service/visits/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    spares: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ServiceSpareMovementDto>>(`/api/service/spares?${query}`);
    },
    issueSpare: (body: ServiceSpareMovementRequest) =>
      request<ServiceSparePostResultDto>("/api/service/spares/issue", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    returnSpare: (body: ServiceSpareMovementRequest) =>
      request<ServiceSparePostResultDto>("/api/service/spares/return", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    warrantyClaims: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WarrantyClaimDto>>(`/api/service/warranty-claims?${query}`);
    },
    createWarrantyClaim: (body: WarrantyClaimUpsertRequest) =>
      request<WarrantyClaimDto>("/api/service/warranty-claims", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    decideWarrantyClaim: (id: number, body: WarrantyClaimDecisionRequest) =>
      request<WarrantyClaimDto>(`/api/service/warranty-claims/${id}/decision`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    charges: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ServiceChargeDto>>(`/api/service/charges?${query}`);
    },
    createCharge: (body: ServiceChargeUpsertRequest) =>
      request<ServiceChargeDto>("/api/service/charges", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    markChargeInvoiceReady: (id: number) =>
      request<ServiceChargeDto>(`/api/service/charges/${id}/invoice-ready`, {
        method: "POST"
      })
  },
  reporting: {
    definitions: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ReportDefinitionDto>>(`/api/reporting/definitions?${query}`);
    },
    definition: (id: number) => request<ReportDefinitionDto>(`/api/reporting/definitions/${id}`),
    saveDefinition: (body: ReportDefinitionUpsertRequest) =>
      request<ReportDefinitionDto>("/api/reporting/definitions", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    runReport: (id: number, body: ReportRunRequest) =>
      request<ReportRunDto>(`/api/reporting/definitions/${id}/run`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    runs: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ReportRunDto>>(`/api/reporting/runs?${query}`);
    },
    outputs: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ReportOutputDto>>(`/api/reporting/outputs?${query}`);
    },
    downloadOutput: (id: number) => requestBlob(`/api/reporting/outputs/${id}/download`),
    dashboards: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<DashboardDefinitionDto>>(`/api/reporting/dashboards?${query}`);
    },
    saveDashboard: (body: DashboardUpsertRequest) =>
      request<DashboardDefinitionDto>("/api/reporting/dashboards", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    dashboardData: (id: number) => request<DashboardDataDto>(`/api/reporting/dashboards/${id}/data`)
  },
  finance: {
    chartOfAccounts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ChartOfAccountDto>>(`/api/finance/chart-of-accounts?${query}`);
    },
    createChartOfAccount: (body: ChartOfAccountUpsertRequest) =>
      request<ChartOfAccountDto>("/api/finance/chart-of-accounts", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    fiscalPeriods: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<FiscalPeriodDto>>(`/api/finance/fiscal-periods?${query}`);
    },
    createFiscalPeriod: (body: FiscalPeriodUpsertRequest) =>
      request<FiscalPeriodDto>("/api/finance/fiscal-periods", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    postingProfiles: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<PostingProfileDto>>(`/api/finance/posting-profiles?${query}`);
    },
    createPostingProfile: (body: PostingProfileUpsertRequest) =>
      request<PostingProfileDto>("/api/finance/posting-profiles", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    journals: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<JournalDto>>(`/api/finance/journals?${query}`);
    },
    createJournal: (body: JournalUpsertRequest) =>
      request<JournalDto>("/api/finance/journals", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    postJournal: (id: number) =>
      request<JournalDto>(`/api/finance/journals/${id}/post`, {
        method: "POST"
      }),
    reverseJournal: (id: number, reason: string) =>
      request<JournalDto>(`/api/finance/journals/${id}/reverse`, {
        method: "POST",
        body: JSON.stringify({ reason })
      }),
    arInvoices: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ArInvoiceDto>>(`/api/finance/ar-invoices?${query}`);
    },
    createArInvoiceFromShipment: (body: ArInvoiceFromShipmentRequest) =>
      request<ArInvoiceDto>("/api/finance/ar-invoices/from-shipment", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    postArInvoice: (id: number) =>
      request<ArInvoicePostingResultDto>(`/api/finance/ar-invoices/${id}/post`, {
        method: "POST"
      }),
    taxLedger: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<TaxLedgerEntryDto>>(`/api/finance/tax-ledger?${query}`);
    },
    inventoryValuation: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<InventoryValuationEntryDto>>(`/api/finance/inventory-valuation?${query}`);
    }
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
    detail: (id: string) => request<ApprovalDetailDto>(`/api/approvals/${encodeURIComponent(id)}`),
    decide: (id: string, body: ApprovalDecisionRequest) =>
      request<ActionResponse>(`/api/approvals/${encodeURIComponent(id)}/decision`, {
        method: "POST",
        body: JSON.stringify(body)
      })
  },
  integrations: {
    providers: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<IntegrationProviderDto>>(`/api/integrations/providers?${query}`);
    },
    createProvider: (body: IntegrationProviderUpsertRequest) =>
      request<IntegrationProviderDto>("/api/integrations/providers", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateProvider: (id: number, body: IntegrationProviderUpsertRequest) =>
      request<IntegrationProviderDto>(`/api/integrations/providers/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    connections: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<IntegrationConnectionDto>>(`/api/integrations/connections?${query}`);
    },
    createConnection: (body: IntegrationConnectionUpsertRequest) =>
      request<IntegrationConnectionDto>("/api/integrations/connections", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateConnection: (id: number, body: IntegrationConnectionUpsertRequest) =>
      request<IntegrationConnectionDto>(`/api/integrations/connections/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    providerHealth: () => request<OutboundProviderHealthDto[]>("/api/integrations/messages/provider-health"),
    deliveries: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<OutboundDeliveryStatusDto>>(`/api/integrations/messages/deliveries?${query}`);
    },
    previewMessage: (body: OutboundMessagePreviewRequest) =>
      request<OutboundMessagePreviewDto>("/api/integrations/messages/preview", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    queueMessage: (body: OutboundMessageRequest) =>
      request<OutboundDeliveryStatusDto>("/api/integrations/messages/queue", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    retryMessage: (id: number, body: OutboundRetryRequest = {}) =>
      request<OutboundDeliveryStatusDto>(`/api/integrations/messages/${id}/retry`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    templates: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<IntegrationMessageTemplateDto>>(`/api/integrations/templates?${query}`);
    },
    saveTemplate: (body: IntegrationMessageTemplateUpsertRequest) =>
      request<IntegrationMessageTemplateDto>("/api/integrations/templates", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    webhooks: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WebhookSubscriptionDto>>(`/api/webhooks?${query}`);
    },
    createWebhook: (body: WebhookSubscriptionUpsertRequest) =>
      request<WebhookSubscriptionDto>("/api/webhooks", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateWebhook: (id: number, body: WebhookSubscriptionUpsertRequest) =>
      request<WebhookSubscriptionDto>(`/api/webhooks/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    dispatchWebhook: (body: WebhookDispatchRequest) =>
      request<WebhookDispatchResultDto>("/api/webhooks/dispatch", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    webhookEvents: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<WebhookEventDto>>(`/api/webhooks/events?${query}`);
    },
    inboundWebhook: (providerCode: string, body: InboundWebhookRequest) =>
      request<WebhookEventDto>(`/api/webhooks/inbound/${encodeURIComponent(providerCode)}`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    crmMappings: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CrmObjectMappingDto>>(`/api/integrations/crm/mappings?${query}`);
    },
    saveCrmMapping: (body: CrmObjectMappingUpsertRequest) =>
      request<CrmObjectMappingDto>("/api/integrations/crm/mappings", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    runCrmSync: (body: CrmSyncRequest) =>
      request<CrmSyncJobDto>("/api/integrations/crm/sync", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    crmConflicts: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<CrmSyncConflictDto>>(`/api/integrations/crm/conflicts?${query}`);
    },
    imports: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ImportJobDto>>(`/api/imports?${query}`);
    },
    createImport: (body: ImportJobCreateRequest) =>
      request<ImportJobDto>("/api/imports", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateImportStatus: (id: number, body: IntegrationJobStatusUpdateRequest) =>
      request<ImportJobDto>(`/api/imports/${id}/status`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    exports: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<ExportJobDto>>(`/api/exports?${query}`);
    },
    createExport: (body: ExportJobCreateRequest) =>
      request<ExportJobDto>("/api/exports", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateExportStatus: (id: number, body: IntegrationJobStatusUpdateRequest) =>
      request<ExportJobDto>(`/api/exports/${id}/status`, {
        method: "POST",
        body: JSON.stringify(body)
      })
  },
  ai: {
    providers: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<AiProviderDto>>(`/api/ai/providers?${query}`);
    },
    models: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<AiModelDto>>(`/api/ai/models?${query}`);
    },
    runs: (filter: QueryFilter = {}) => {
      const query = serializeFilters(filter);
      return request<PagedResult<AiRunDto>>(`/api/ai/runs?${query}`);
    },
    providerHealth: () => request<AiProviderHealthDto[]>("/api/ai/provider-health"),
    executionPolicy: () => request<AiExecutionPolicyDto>("/api/ai/execution-policy"),
    assistantIntents: () => request<AiAssistantIntentDefinitionDto[]>("/api/ai/assistant/intents"),
    createAssistantPlan: (body: AiAssistantPlanRequest) =>
      request<AiAssistantQueryPlanDto>("/api/ai/assistant/plan", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    createDraft: (body: AiDraftRequest) =>
      request<AiRunDto>("/api/ai/runs/draft", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    reviewRun: (id: number, body: AiReviewRequest) =>
      request<AiRunDto>(`/api/ai/runs/${id}/review`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    createTranslationDraft: (body: TranslationDraftRequest) =>
      request<TranslationDraftDto>("/api/ai/translations/draft", {
        method: "POST",
        body: JSON.stringify(body)
      })
  },
  platform: {
    users: () => request<UserDirectoryItemDto[]>("/api/users"),
    updateUserAccessPolicy: (id: string, body: UserAccessPolicyUpdateRequest) =>
      request<UserDirectoryItemDto>(`/api/users/${encodeURIComponent(id)}/access-policy`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    requestUserAccessReset: (id: string) =>
      request<ActionResponse>(`/api/users/${encodeURIComponent(id)}/reset-request`, {
        method: "POST"
      }),
    roles: () => request<RoleMatrixItemDto[]>("/api/roles"),
    permissions: () => request<PermissionCatalogItemDto[]>("/api/permissions"),
    createRole: (body: RoleUpsertRequest) =>
      request<RoleMatrixItemDto>("/api/roles", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateRole: (id: string, body: RoleUpsertRequest) =>
      request<RoleMatrixItemDto>(`/api/roles/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    cloneRole: (id: string, body: RoleUpsertRequest) =>
      request<RoleMatrixItemDto>(`/api/roles/${encodeURIComponent(id)}/clone`, {
        method: "POST",
        body: JSON.stringify(body)
      }),
    workflowRules: () => request<WorkflowNumberingItemDto[]>("/api/settings/workflow-rules"),
    createWorkflowRule: (body: WorkflowRuleUpsertRequest) =>
      request<WorkflowNumberingItemDto>("/api/settings/workflow-rules", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateWorkflowRule: (id: string, body: WorkflowRuleUpsertRequest) =>
      request<WorkflowNumberingItemDto>(`/api/settings/workflow-rules/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    tenantSettings: () => request<TenantSettingItemDto[]>("/api/settings/tenant-settings"),
    updateTenantSetting: (id: string, body: TenantSettingUpdateRequest) =>
      request<TenantSettingItemDto>(`/api/settings/tenant-settings/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    udfDefinitions: (filter: UdfDefinitionFilter = {}) => {
      const query = serializeFilters(filter);
      return request<UdfDefinitionDto[]>(`/api/platform/udf-definitions?${query}`);
    },
    createUdfDefinition: (body: UdfDefinitionUpsertRequest) =>
      request<UdfDefinitionDto>("/api/platform/udf-definitions", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateUdfDefinition: (id: number, body: UdfDefinitionUpsertRequest) =>
      request<UdfDefinitionDto>(`/api/platform/udf-definitions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    udfValues: (entityType: string, entityId: number) =>
      request<UdfValueDto[]>(
        `/api/platform/udf-values/${encodeURIComponent(entityType)}/${encodeURIComponent(String(entityId))}`
      ),
    upsertUdfValue: (entityType: string, entityId: number, body: UdfValueUpsertRequest) =>
      request<UdfValueDto>(
        `/api/platform/udf-values/${encodeURIComponent(entityType)}/${encodeURIComponent(String(entityId))}`,
        {
          method: "PUT",
          body: JSON.stringify(body)
        }
      ),
    udfPlacements: (filter: { screenKey?: string; entityType?: string; entityLevel?: string } = {}) => {
      const query = serializeFilters(filter);
      return request<UdfPlacementDto[]>(`/api/platform/udf-placements?${query}`);
    },
    createUdfPlacement: (body: UdfPlacementUpsertRequest) =>
      request<UdfPlacementDto>("/api/platform/udf-placements", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateUdfPlacement: (id: number, body: UdfPlacementUpsertRequest) =>
      request<UdfPlacementDto>(`/api/platform/udf-placements/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    udfRuntimeFields: (screenKey: string, entityType: string, entityLevel: string, entityId: number, entityLineId?: number | null) => {
      const query = serializeFilters({ entityLineId: entityLineId ?? undefined });
      return request<UdfRuntimeFieldDto[]>(
        `/api/platform/udf-runtime/${encodeURIComponent(screenKey)}/${encodeURIComponent(entityType)}/${encodeURIComponent(entityLevel)}/${encodeURIComponent(String(entityId))}?${query}`
      );
    },
    upsertUdfRuntimeValues: (entityType: string, entityId: number, body: UdfRuntimeValueSetRequest) =>
      request<UdfValueDto[]>(
        `/api/platform/udf-runtime/${encodeURIComponent(entityType)}/${encodeURIComponent(String(entityId))}`,
        {
          method: "PUT",
          body: JSON.stringify(body)
        }
      ),
    customObjects: (filter: { module?: string; status?: string } = {}) => {
      const query = serializeFilters(filter);
      return request<CustomObjectDto[]>(`/api/platform/custom-objects?${query}`);
    },
    createCustomObject: (body: CustomObjectUpsertRequest) =>
      request<CustomObjectDto>("/api/platform/custom-objects", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCustomObject: (id: number, body: CustomObjectUpsertRequest) =>
      request<CustomObjectDto>(`/api/platform/custom-objects/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    customObjectRecords: (customObjectId: number) =>
      request<CustomObjectRecordDto[]>(`/api/platform/custom-objects/${customObjectId}/records`),
    createCustomObjectRecord: (body: CustomObjectRecordUpsertRequest) =>
      request<CustomObjectRecordDto>("/api/platform/custom-object-records", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCustomObjectRecord: (id: number, body: CustomObjectRecordUpsertRequest) =>
      request<CustomObjectRecordDto>(`/api/platform/custom-object-records/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
    customScreens: (filter: { module?: string; status?: string } = {}) => {
      const query = serializeFilters(filter);
      return request<CustomScreenDto[]>(`/api/platform/custom-screens?${query}`);
    },
    createCustomScreen: (body: CustomScreenUpsertRequest) =>
      request<CustomScreenDto>("/api/platform/custom-screens", {
        method: "POST",
        body: JSON.stringify(body)
      }),
    updateCustomScreen: (id: number, body: CustomScreenUpsertRequest) =>
      request<CustomScreenDto>(`/api/platform/custom-screens/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      }),
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
    downloadAttachment: (attachmentId: number) =>
      requestBlob(`/api/attachments/${attachmentId}/content`),
    createExportJob: (body: ExportJobCreateRequest) =>
      request<ExportJobDto>("/api/exports", {
        method: "POST",
        body: JSON.stringify(body)
      })
  }
};
