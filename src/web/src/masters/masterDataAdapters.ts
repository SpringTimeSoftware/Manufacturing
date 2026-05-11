import type {
  AuthSessionResponse,
  CustomerAddressDto,
  CustomerAddressUpsertRequest,
  CustomerDto,
  CustomerPartnerProfileUpsertRequest,
  CustomerPartnerWorkspaceDto,
  CustomerUpsertRequest,
  ItemBarcodeDto,
  ItemDto,
  ItemMasterProfileDto,
  ItemMasterProfileUpsertRequest,
  ItemUpsertRequest,
  ItemVariantDto,
  MeasurementFormulaDto,
  MeasurementProfileDto,
  QueryFilter,
  SupplierAddressDto,
  SupplierAddressUpsertRequest,
  SupplierDto,
  SupplierLeadTimeDto,
  SupplierLeadTimeUpsertRequest,
  SupplierPartnerProfileUpsertRequest,
  SupplierPartnerWorkspaceDto,
  SupplierUpsertRequest,
  UomClassDto,
  UomConversionDto,
  UomDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { liveDataUnavailable } from "../api/liveData";

export type MasterDataSource = "Live" | "Seeded" | "Deferred";

export interface UomClassSetupItem {
  id: string;
  uomClassId: number;
  code: string;
  name: string;
  baseUomId: number | null;
  baseUom: string;
  supportsFormulaConversion: boolean;
  status: string;
  source: MasterDataSource;
}

export interface UomConversionSetupItem {
  id: string;
  conversionId: number;
  fromUomId: number;
  fromUom: string;
  toUomId: number;
  toUom: string;
  conversionMode: string;
  factorNumerator: number;
  factorDenominator: number;
  factorLabel: string;
  formulaTokenSet: string;
  roundMode: string;
  precisionScale: number;
  status: string;
  source: MasterDataSource;
}

export interface MeasurementProfileSetupItem {
  id: string;
  profileId: number;
  code: string;
  name: string;
  profileType: string;
  stockUomClassId: number;
  stockUomClass: string;
  allowsCatchWeight: boolean;
  requiresDimensions: boolean;
  requiresDensity: boolean;
  requiresThickness: boolean;
  requiresPackSize: boolean;
  supportsCommercialProductionSplit: boolean;
  status: string;
  source: MasterDataSource;
}

export interface MeasurementFormulaSetupItem {
  id: string;
  formulaId: number;
  profileId: number;
  code: string;
  name: string;
  purpose: string;
  expression: string;
  outputUom: string;
  precisionScale: number;
  status: string;
  source: MasterDataSource;
}

export interface ItemGroupSetupItem {
  id: string;
  groupId: number;
  code: string;
  name: string;
  parent: string;
  defaultProfile: string;
  defaultTraceability: string;
  defaultQcRequired: boolean;
  reportingBucket: string;
  status: string;
  source: MasterDataSource;
}

export interface ItemAttributeSetupItem {
  id: string;
  code: string;
  name: string;
  valueCount: number;
  sampleValues: string;
  usedForVariants: boolean;
  status: string;
  source: MasterDataSource;
}

export interface ReasonCodeSetupItem {
  id: string;
  code: string;
  name: string;
  module: string;
  usage: string;
  severity: "Info" | "Warning" | "Critical";
  requiresRemarks: boolean;
  status: string;
  source: MasterDataSource;
}

export interface ItemMediaSetupItem {
  id: string;
  mediaType: string;
  title: string;
  fileName: string;
  approvalStatus: string;
  visibilityScope: string;
  isPrimary: boolean;
  status: string;
}

export interface ItemDocumentSetupItem {
  id: string;
  documentType: string;
  title: string;
  documentNo: string;
  revisionCode: string;
  approvalStatus: string;
  effectiveDate: string;
  status: string;
}

export interface ItemCatalogSetup {
  isVisible: boolean;
  title: string;
  section: string;
  marketingDescription: string;
  customerVisibleSpecs: string;
  publishStatus: string;
  effectiveDates: string;
  previewSlug: string;
}

export interface ItemPackagingSetup {
  innerPack: string;
  carton: string;
  pallet: string;
  packagingUom: string;
  netWeight: string;
  grossWeight: string;
  dimensions: string;
  labelCount: string;
  packingInstructions: string;
}

export interface ItemPhysicalSpecsSetup {
  length: string;
  width: string;
  height: string;
  thickness: string;
  grade: string;
  material: string;
  colorFinish: string;
  shelfLife: string;
  storageCondition: string;
}

export interface ItemCustomerReferenceSetupItem {
  id: string;
  customerId: number | null;
  customer: string;
  customerItemCode: string;
  drawingRevision: string;
  packagingOverride: string;
  specificationOverride: string;
  approvalStatus: string;
}

export interface ItemVendorReferenceSetupItem {
  id: string;
  supplierId: number | null;
  supplier: string;
  vendorItemCode: string;
  minimumOrderQty: string;
  leadTime: string;
  purchaseUomId: number | null;
  purchaseUom: string;
  complianceStatus: string;
  documentStatus: string;
}

export interface ItemBarcodeSetupItem {
  id: string;
  barcodeValue: string;
  barcodeType: string;
  scanPurpose: string;
  uomLabel: string;
  isPrimary: boolean;
  status: string;
}

export interface ItemVariantTemplateSetupItem {
  id: string;
  templateCode: string;
  attributes: string;
  optionCount: string;
  defaultVariant: string;
  status: string;
}

export interface ItemAuditEventSetupItem {
  id: string;
  event: string;
  actor: string;
  occurredOn: string;
  outcome: string;
}

export interface ItemMasterSetupItem {
  id: string;
  itemId: number;
  companyId: number;
  code: string;
  name: string;
  shortName: string;
  itemType: string;
  itemGroupId: number;
  groupLabel: string;
  measurementProfileId: number;
  measurementProfile: string;
  stockUomId: number;
  stockUom: string;
  purchaseUomId: number | null;
  salesUomId: number | null;
  productionUomId: number | null;
  qcUomId: number | null;
  traceabilityMode: string;
  isCatchWeightItem: boolean;
  isQcRequired: boolean;
  isBatchExpiryTracked: boolean;
  defaultIssueMethod: string;
  defaultMakeType: string;
  defaultWarehouseId: number | null;
  defaultBinId: number | null;
  defaultWarehouse: string;
  leadTimeDays: number;
  reorderPolicy: string;
  lifecycleStatus: string;
  category: string;
  subCategory: string;
  productFamily: string;
  businessSegment: string;
  reportingBucket: string;
  attributeSummary: string;
  aliases: string[];
  baseUom: string;
  purchaseUom: string;
  salesUom: string;
  productionUom: string;
  catalogVisible: boolean;
  media: ItemMediaSetupItem[];
  documents: ItemDocumentSetupItem[];
  catalog: ItemCatalogSetup;
  packaging: ItemPackagingSetup;
  physicalSpecs: ItemPhysicalSpecsSetup;
  customerReferences: ItemCustomerReferenceSetupItem[];
  vendorReferences: ItemVendorReferenceSetupItem[];
  barcodeRules: ItemBarcodeSetupItem[];
  variantTemplates: ItemVariantTemplateSetupItem[];
  manufacturing: Record<string, string>;
  planning: Record<string, string>;
  inventory: Record<string, string>;
  quality: Record<string, string>;
  sales: Record<string, string>;
  purchase: Record<string, string>;
  activationBlockers: string[];
  auditTrail: ItemAuditEventSetupItem[];
  status: string;
  source: MasterDataSource;
}

type ItemMasterProfileFields = Pick<
  ItemMasterSetupItem,
  | "lifecycleStatus"
  | "category"
  | "subCategory"
  | "productFamily"
  | "businessSegment"
  | "reportingBucket"
  | "attributeSummary"
  | "aliases"
  | "baseUom"
  | "purchaseUom"
  | "salesUom"
  | "productionUom"
  | "catalogVisible"
  | "media"
  | "documents"
  | "catalog"
  | "packaging"
  | "physicalSpecs"
  | "customerReferences"
  | "vendorReferences"
  | "barcodeRules"
  | "variantTemplates"
  | "manufacturing"
  | "planning"
  | "inventory"
  | "quality"
  | "sales"
  | "purchase"
  | "activationBlockers"
  | "auditTrail"
>;

type ItemMasterCoreFields = Omit<ItemMasterSetupItem, keyof ItemMasterProfileFields>;

export interface ItemVariantSetupItem {
  id: string;
  variantId: number;
  companyId: number;
  itemId: number;
  itemLabel: string;
  code: string;
  name: string;
  variantKey: string;
  attributeSummary: string;
  overrideMeasurementProfileId: number | null;
  overrideMeasurementProfile: string;
  overrideStockUomId: number | null;
  overrideStockUom: string;
  overrideWeightPerUnitValue: number | null;
  overrideWeightPerUnit: string;
  status: string;
  source: MasterDataSource;
}

export interface BarcodeSetupItem {
  id: string;
  barcodeId: number;
  companyId: number;
  itemId: number;
  itemLabel: string;
  itemVariantId: number | null;
  variantLabel: string;
  uomId: number | null;
  uomLabel: string;
  barcodeValue: string;
  barcodeType: string;
  scanPurpose: string;
  preferenceRank: number;
  isPrimary: boolean;
  status: string;
  source: MasterDataSource;
}

export interface CustomerSetupItem {
  id: string;
  customerId: number;
  companyId: number;
  code: string;
  name: string;
  shortName: string;
  customerType: string;
  defaultBranch: string;
  taxRegistrationNo: string;
  paymentTermsCode: string;
  creditDays: string;
  exposureLabel: string;
  status: string;
  source: MasterDataSource;
}

export interface CustomerAddressSetupItem {
  id: string;
  addressId: number;
  customerId: number;
  code: string;
  addressType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  defaultUsage: string;
  status: string;
  source: MasterDataSource;
}

export interface SupplierSetupItem {
  id: string;
  supplierId: number;
  companyId: number;
  code: string;
  name: string;
  supplierType: string;
  supportsSubcontracting: boolean;
  defaultBranch: string;
  taxRegistrationNo: string;
  paymentTermsCode: string;
  delayScore: string;
  status: string;
  source: MasterDataSource;
}

export interface SupplierAddressSetupItem {
  id: string;
  addressId: number;
  supplierId: number;
  code: string;
  addressType: string;
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isDefaultOrderAddress: boolean;
  status: string;
  source: MasterDataSource;
}

export interface SupplierLeadTimeSetupItem {
  id: string;
  leadTimeId: number;
  companyId: number;
  supplierId: number;
  branchId: number | null;
  itemId: number | null;
  itemGroupId: number | null;
  itemLabel: string;
  leadTimeDays: number;
  minOrderQty: number | null;
  orderMultipleQty: number | null;
  orderPolicy: string;
  isSubcontractLeadTime: boolean;
  priorityRank: number;
  status: string;
  source: MasterDataSource;
}

export interface PartnerProfileSetup {
  legalName: string;
  taxCategory: string;
  currencyCode: string;
  creditStatus?: string;
  creditLimitAmount?: number | null;
  creditHoldRule?: string;
  paymentTermsCode: string;
  commercialSegment?: string;
  orderReleaseControl?: string;
  dispatchPreference?: string;
  dispatchInstruction?: string;
  catalogVisible?: boolean;
  catalogSegment?: string;
  preferredStatus?: string;
  complianceStatus?: string;
  capabilitySummary?: string;
  qualityRating?: number | null;
  procurementReleaseControl?: string;
  leadTimeReviewDays?: number | null;
  status: string;
}

export interface PartnerContactPointSetupItem {
  id: string;
  contactPointId: number;
  addressId: number | null;
  contactName: string;
  role: string;
  channel: string;
  detail: string;
  isPrimary: boolean;
  consentStatus: string;
  escalationLevel: string;
  status: string;
}

export interface PartnerDocumentSetupItem {
  id: string;
  documentId: number;
  documentType: string;
  title: string;
  documentNo: string;
  revisionCode: string;
  fileName: string;
  storageUri: string;
  approvalStatus: string;
  visibilityScope: string;
  effectiveFrom: string;
  effectiveTo: string;
  expiresOn: string;
  status: string;
}

export interface CustomerItemReferenceSetupProfileItem {
  id: string;
  referenceId: number;
  itemId: number | null;
  customerItemCode: string;
  drawingRevision: string;
  packagingOverride: string;
  specificationOverride: string;
  approvalStatus: string;
  status: string;
}

export interface SupplierVendorReferenceSetupProfileItem {
  id: string;
  referenceId: number;
  itemId: number | null;
  vendorItemCode: string;
  minimumOrderQty: number | null;
  leadTimeDays: number | null;
  purchaseUomId: number | null;
  complianceStatus: string;
  documentStatus: string;
  approvalStatus: string;
  status: string;
}

export interface CustomerPartnerWorkspaceSetup {
  profile: PartnerProfileSetup;
  contactPoints: PartnerContactPointSetupItem[];
  itemReferences: CustomerItemReferenceSetupProfileItem[];
  documents: PartnerDocumentSetupItem[];
  auditEvents: ItemAuditEventSetupItem[];
  source: MasterDataSource;
}

export interface SupplierPartnerWorkspaceSetup {
  profile: PartnerProfileSetup;
  contactPoints: PartnerContactPointSetupItem[];
  vendorReferences: SupplierVendorReferenceSetupProfileItem[];
  documents: PartnerDocumentSetupItem[];
  auditEvents: ItemAuditEventSetupItem[];
  source: MasterDataSource;
}

const seededUomClasses: UomClassSetupItem[] = [
  {
    id: "uom-class-count",
    uomClassId: 1,
    code: "COUNT",
    name: "Count",
    baseUomId: 1,
    baseUom: "PCS",
    supportsFormulaConversion: false,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "uom-class-weight",
    uomClassId: 2,
    code: "WEIGHT",
    name: "Weight",
    baseUomId: 2,
    baseUom: "KG",
    supportsFormulaConversion: false,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "uom-class-area",
    uomClassId: 3,
    code: "AREA",
    name: "Area",
    baseUomId: 4,
    baseUom: "SQM",
    supportsFormulaConversion: true,
    status: "Draft",
    source: "Seeded"
  }
];

const seededUomConversions: UomConversionSetupItem[] = [
  {
    id: "conversion-sheet-area",
    conversionId: 101,
    fromUomId: 3,
    fromUom: "SHEET",
    toUomId: 4,
    toUom: "SQM",
    conversionMode: "Formula",
    factorNumerator: 1,
    factorDenominator: 1,
    factorLabel: "length x width",
    formulaTokenSet: "LENGTH_MM, WIDTH_MM",
    roundMode: "Commercial",
    precisionScale: 3,
    status: "Draft",
    source: "Seeded"
  },
  {
    id: "conversion-kg-ton",
    conversionId: 102,
    fromUomId: 5,
    fromUom: "MT",
    toUomId: 2,
    toUom: "KG",
    conversionMode: "Fixed",
    factorNumerator: 1000,
    factorDenominator: 1,
    factorLabel: "1000 / 1",
    formulaTokenSet: "None",
    roundMode: "Standard",
    precisionScale: 3,
    status: "Active",
    source: "Seeded"
  }
];

const seededProfiles: MeasurementProfileSetupItem[] = [
  {
    id: "profile-count",
    profileId: 1,
    code: "STD-COUNT",
    name: "Standard Count Item",
    profileType: "CountOnly",
    stockUomClassId: 1,
    stockUomClass: "COUNT",
    allowsCatchWeight: false,
    requiresDimensions: false,
    requiresDensity: false,
    requiresThickness: false,
    requiresPackSize: false,
    supportsCommercialProductionSplit: false,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "profile-sheet",
    profileId: 2,
    code: "DIM-SHEET",
    name: "Dimensional Sheet Profile",
    profileType: "DimensionalFormula",
    stockUomClassId: 3,
    stockUomClass: "AREA",
    allowsCatchWeight: true,
    requiresDimensions: true,
    requiresDensity: true,
    requiresThickness: true,
    requiresPackSize: true,
    supportsCommercialProductionSplit: true,
    status: "Draft",
    source: "Seeded"
  }
];

const seededFormulas: MeasurementFormulaSetupItem[] = [
  {
    id: "formula-sheet-weight",
    formulaId: 201,
    profileId: 2,
    code: "SHEET-WEIGHT",
    name: "Sheet theoretical weight",
    purpose: "StockWeight",
    expression: "(length_mm * width_mm * thickness_mm * density) / 1000000",
    outputUom: "KG",
    precisionScale: 3,
    status: "Draft",
    source: "Seeded"
  },
  {
    id: "formula-roll-area",
    formulaId: 202,
    profileId: 2,
    code: "ROLL-AREA",
    name: "Roll area",
    purpose: "ProductionQuantity",
    expression: "length_m * width_m",
    outputUom: "SQM",
    precisionScale: 3,
    status: "Draft",
    source: "Seeded"
  }
];

const seededItemGroups: ItemGroupSetupItem[] = [
  {
    id: "group-raw",
    groupId: 1,
    code: "RAW",
    name: "Raw Materials",
    parent: "Root",
    defaultProfile: "STD-COUNT",
    defaultTraceability: "Lot",
    defaultQcRequired: false,
    reportingBucket: "Stores / procurement",
    status: "Active",
    source: "Deferred"
  },
  {
    id: "group-fg",
    groupId: 2,
    code: "FG",
    name: "Finished Goods",
    parent: "Root",
    defaultProfile: "STD-COUNT",
    defaultTraceability: "Lot",
    defaultQcRequired: true,
    reportingBucket: "Dispatch readiness",
    status: "Active",
    source: "Deferred"
  },
  {
    id: "group-wip",
    groupId: 3,
    code: "WIP",
    name: "Work in Progress",
    parent: "Root",
    defaultProfile: "DIM-SHEET",
    defaultTraceability: "Lot",
    defaultQcRequired: true,
    reportingBucket: "Production control",
    status: "Draft",
    source: "Deferred"
  }
];

const seededItemAttributes: ItemAttributeSetupItem[] = [
  {
    id: "attr-thickness",
    code: "THICKNESS",
    name: "Thickness",
    valueCount: 4,
    sampleValues: "3mm, 6mm, 8mm, 10mm",
    usedForVariants: true,
    status: "Active",
    source: "Deferred"
  },
  {
    id: "attr-finish",
    code: "FINISH",
    name: "Surface Finish",
    valueCount: 3,
    sampleValues: "Brushed, Painted, Powder coated",
    usedForVariants: true,
    status: "Active",
    source: "Deferred"
  },
  {
    id: "attr-grade",
    code: "GRADE",
    name: "Material Grade",
    valueCount: 5,
    sampleValues: "SS304, SS316, MS, EN8",
    usedForVariants: true,
    status: "Draft",
    source: "Deferred"
  }
];

const seededReasonCodes: ReasonCodeSetupItem[] = [
  {
    id: "reason-qc-hold",
    code: "QC_HOLD",
    name: "Quality hold",
    module: "Quality",
    usage: "Hold bin, production receipt, and NCR routing",
    severity: "Critical",
    requiresRemarks: true,
    status: "Active",
    source: "Deferred"
  },
  {
    id: "reason-machine-down",
    code: "MACHINE_DOWN",
    name: "Machine downtime",
    module: "Production",
    usage: "Job-card pause and downtime logging",
    severity: "Warning",
    requiresRemarks: true,
    status: "Active",
    source: "Deferred"
  },
  {
    id: "reason-scrap-edge",
    code: "SCRAP_EDGE_TRIM",
    name: "Edge trimming scrap",
    module: "Production",
    usage: "Scrap and rework quantity attribution",
    severity: "Info",
    requiresRemarks: false,
    status: "Draft",
    source: "Deferred"
  }
];

function buildItemProfile(base: ItemMasterCoreFields): ItemMasterProfileFields {
  const isFinishedGood = base.itemType.toLowerCase().includes("finished");
  const isDraft = base.status !== "Active";
  const commonProfile: ItemMasterProfileFields = {
    lifecycleStatus: base.status,
    category: base.groupLabel,
    subCategory: isFinishedGood ? "Fabricated assemblies" : "Input materials",
    productFamily: isFinishedGood ? "Fabricated brackets" : "Metals",
    businessSegment: isFinishedGood ? "Customer dispatch" : "Production supply",
    reportingBucket: isFinishedGood ? "Dispatch readiness" : "Stores / procurement",
    attributeSummary: isFinishedGood ? "Finish, customer drawing, pack size" : "Grade, thickness, width, heat lot",
    aliases: [base.shortName].filter((value) => value !== "Not captured"),
    baseUom: base.stockUom,
    purchaseUom: base.defaultMakeType === "Buy" ? base.stockUom : "PCS",
    salesUom: isFinishedGood ? "PCS" : "Not enabled",
    productionUom: base.stockUom,
    catalogVisible: isFinishedGood,
    media: [],
    documents: [],
    catalog: {
      isVisible: isFinishedGood,
      title: base.name,
      section: isFinishedGood ? "Fabricated components" : "Raw materials",
      marketingDescription: isFinishedGood
        ? "Fabricated component configured for customer ordering, packing, and dispatch review."
        : "Procurement and production material record used for controlled receiving and issue.",
      customerVisibleSpecs: isFinishedGood ? "Material, finish, drawing revision, and pack size." : "Material grade and receiving specification.",
      publishStatus: isFinishedGood ? "Ready for review" : "Internal only",
      effectiveDates: "Not scheduled",
      previewSlug: isFinishedGood ? base.code.toLowerCase() : "Not published"
    },
    packaging: {
      innerPack: "Not assigned",
      carton: "Not assigned",
      pallet: "Not assigned",
      packagingUom: base.stockUom,
      netWeight: "Not captured",
      grossWeight: "Not captured",
      dimensions: "Not captured",
      labelCount: "1",
      packingInstructions: "Confirm packing rule before activation."
    },
    physicalSpecs: {
      length: "Not captured",
      width: "Not captured",
      height: "Not captured",
      thickness: "Not captured",
      grade: "Not captured",
      material: "Not captured",
      colorFinish: "Not captured",
      shelfLife: "Not applicable",
      storageCondition: "Standard covered storage"
    },
    customerReferences: [],
    vendorReferences: [],
    barcodeRules: [],
    variantTemplates: [],
    manufacturing: {
      "BOM policy": isFinishedGood ? "Required before release" : "Not applicable",
      "Routing policy": isFinishedGood ? "Operation-linked route" : "Not applicable",
      "Issue method": base.defaultIssueMethod,
      "Scrap allowance": isFinishedGood ? "2%" : "0.5%",
      "Operation linkage": isFinishedGood ? "Cutting, bending, welding, finishing" : "Receiving and issue"
    },
    planning: {
      "MRP enabled": base.reorderPolicy === "MRP" ? "Yes" : "No",
      "Safety stock": isFinishedGood ? "25 PCS" : "500 KG",
      "Reorder point": isFinishedGood ? "40 PCS" : "750 KG",
      "Min / max": isFinishedGood ? "25 / 250 PCS" : "500 / 5,000 KG",
      "Lead time": `${base.leadTimeDays} days`,
      "Lot size": isFinishedGood ? "50 PCS" : "1,000 KG",
      "ABC class": isFinishedGood ? "A" : "B"
    },
    inventory: {
      "Default warehouse": base.defaultWarehouse,
      "Default bin": isFinishedGood ? "FG-STAGE-A" : "RM-RACK-A",
      "Serial tracking": "No",
      "Lot tracking": base.traceabilityMode === "Lot" ? "Yes" : "No",
      "Catch weight": base.isCatchWeightItem ? "Yes" : "No",
      "Negative stock": "Blocked",
      "Expiry policy": base.isBatchExpiryTracked ? "Batch expiry required" : "Not required"
    },
    quality: {
      "QC required": base.isQcRequired ? "Yes" : "No",
      "Inspection plan": base.isQcRequired ? "Incoming and release inspection" : "Visual check",
      "Certificate requirement": base.defaultMakeType === "Buy" ? "Mill certificate when supplied" : "Certificate of conformity",
      "Hold rules": base.isQcRequired ? "Hold until accepted" : "Release by exception",
      "Traceability depth": base.traceabilityMode === "Lot" ? "Lot and item revision" : "Item level"
    },
    sales: {
      "Sales enabled": isFinishedGood ? "Yes" : "No",
      "Sales UOM": isFinishedGood ? "PCS" : "Not applicable",
      "Tax category": isFinishedGood ? "Finished goods" : "Input material",
      "Price group": isFinishedGood ? "Standard fabrication" : "Not applicable",
      "Discount eligible": isFinishedGood ? "Controlled by customer agreement" : "No",
      "Catalog eligibility": isFinishedGood ? "Eligible after media and catalog approval" : "Not customer facing"
    },
    purchase: {
      "Buy enabled": base.defaultMakeType === "Buy" ? "Yes" : "No",
      "Preferred supplier": base.defaultMakeType === "Buy" ? "Approved supplier required" : "Not applicable",
      "Approved supplier list": base.defaultMakeType === "Buy" ? "Required" : "Not applicable",
      "Purchase lead time": `${base.leadTimeDays} days`,
      "MOQ": base.defaultMakeType === "Buy" ? "Review by supplier" : "Not applicable",
      "Supplier compliance requirement": base.defaultMakeType === "Buy" ? "Supplier document review" : "Not applicable"
    },
    activationBlockers: isDraft ? ["Complete catalog, packaging, and reference review before activation."] : [],
    auditTrail: [
      {
        id: `${base.id}-audit-created`,
        event: "Item record reviewed",
        actor: "Master data",
        occurredOn: "Current period",
        outcome: base.status
      }
    ]
  };

  if (base.code === "FG-BRACKET-001") {
    return {
      ...commonProfile,
      subCategory: "Mounting brackets",
      productFamily: "Fabricated brackets",
      attributeSummary: "Painted finish, customer drawing ENK-441, carton pack",
      media: [
        {
          id: "media-bracket-primary",
          mediaType: "Product photo",
          title: "Primary bracket image",
          fileName: "fg-bracket-primary.jpg",
          approvalStatus: "Approved",
          visibilityScope: "Catalog",
          isPrimary: true,
          status: "Active"
        },
        {
          id: "media-bracket-drawing",
          mediaType: "Drawing",
          title: "Customer drawing preview",
          fileName: "ENK-441-revB.pdf",
          approvalStatus: "Approved",
          visibilityScope: "Internal",
          isPrimary: false,
          status: "Active"
        }
      ],
      documents: [
        {
          id: "doc-bracket-qap",
          documentType: "Quality plan",
          title: "Bracket inspection plan",
          documentNo: "QAP-FG-BR-001",
          revisionCode: "A",
          approvalStatus: "Approved",
          effectiveDate: "2026-04-01",
          status: "Active"
        }
      ],
      catalog: {
        isVisible: true,
        title: "Fabricated Mounting Bracket",
        section: "Fabricated components",
        marketingDescription: "Powder-coated mounting bracket with controlled weld, paint, packing, and dispatch inspection requirements.",
        customerVisibleSpecs: "MS E250, powder coated black, 180 x 95 x 42 mm, 50 PCS carton.",
        publishStatus: "Ready for review",
        effectiveDates: "2026-04-01 to 2026-12-31",
        previewSlug: "fabricated-mounting-bracket"
      },
      packaging: {
        innerPack: "10 PCS shrink pack",
        carton: "50 PCS export carton",
        pallet: "20 cartons per pallet",
        packagingUom: "PCS",
        netWeight: "1.20 KG",
        grossWeight: "1.32 KG",
        dimensions: "180 x 95 x 42 mm",
        labelCount: "2 labels per carton",
        packingInstructions: "Apply part label and customer reference label on adjacent carton faces."
      },
      physicalSpecs: {
        length: "180 mm",
        width: "95 mm",
        height: "42 mm",
        thickness: "6 mm",
        grade: "MS E250",
        material: "Mild steel",
        colorFinish: "Powder coated black",
        shelfLife: "Not applicable",
        storageCondition: "Covered FG rack, dry storage"
      },
      customerReferences: [
        {
          id: "cust-ref-bracket-enkay",
          customerId: 20002,
          customer: "Enkay Ozone",
          customerItemCode: "ENK-BR-441",
          drawingRevision: "ENK-441 / Rev B",
          packagingOverride: "50 PCS carton",
          specificationOverride: "Black powder coat",
          approvalStatus: "Approved"
        }
      ],
      vendorReferences: [
        {
          id: "vendor-ref-bracket-coating",
          supplierId: 30002,
          supplier: "Approved coating supplier",
          vendorItemCode: "PC-BLK-BR-001",
          minimumOrderQty: "250 PCS",
          leadTime: "2 days",
          purchaseUomId: 1,
          purchaseUom: "PCS",
          complianceStatus: "Approved",
          documentStatus: "COC required"
        }
      ],
      barcodeRules: [
        {
          id: "barcode-rule-fg-bracket",
          barcodeValue: "FG-BRACKET-001",
          barcodeType: "Code128",
          scanPurpose: "Inventory and dispatch",
          uomLabel: "PCS",
          isPrimary: true,
          status: "Active"
        }
      ],
      variantTemplates: [
        {
          id: "variant-template-bracket",
          templateCode: "BRACKET-FINISH",
          attributes: "Finish, customer drawing",
          optionCount: "2 finish options",
          defaultVariant: "Painted bracket",
          status: "Active"
        }
      ],
      activationBlockers: []
    };
  }

  if (base.code === "RM-PLATE-001") {
    return {
      ...commonProfile,
      subCategory: "Plate",
      attributeSummary: "MS grade, 6mm thickness, mill certificate",
      media: [
        {
          id: "media-ms-plate-mtc",
          mediaType: "Specification",
          title: "Mill certificate sample",
          fileName: "ms-plate-mtc.pdf",
          approvalStatus: "Approved",
          visibilityScope: "Internal",
          isPrimary: false,
          status: "Active"
        }
      ],
      catalog: {
        ...commonProfile.catalog,
        isVisible: false,
        publishStatus: "Internal only",
        customerVisibleSpecs: "E250 mild steel, 6 mm thickness, mill certificate when supplied.",
        previewSlug: "Not published"
      },
      packaging: {
        innerPack: "Loose plate",
        carton: "Not applicable",
        pallet: "Strapped pallet bundle",
        packagingUom: "KG",
        netWeight: "As received",
        grossWeight: "As received",
        dimensions: "Supplier lot specific",
        labelCount: "1 lot label",
        packingInstructions: "Store by heat lot and keep certificate attached to receiving lot."
      },
      physicalSpecs: {
        length: "2,500 mm",
        width: "1,250 mm",
        height: "Not applicable",
        thickness: "6 mm",
        grade: "E250",
        material: "Mild steel",
        colorFinish: "Mill finish",
        shelfLife: "Not applicable",
        storageCondition: "Covered raw-material rack"
      },
      vendorReferences: [
        {
          id: "vendor-ref-ms-plate",
          supplierId: 30001,
          supplier: "Approved Steel Supplier",
          vendorItemCode: "MSPL-6MM",
          minimumOrderQty: "500 KG",
          leadTime: "7 days",
          purchaseUomId: 2,
          purchaseUom: "KG",
          complianceStatus: "Mill certificate required",
          documentStatus: "Current"
        }
      ],
      activationBlockers: []
    };
  }

  if (base.code === "RM-SS-SHEET") {
    return {
      ...commonProfile,
      subCategory: "Sheet",
      productFamily: "Stainless sheet",
      attributeSummary: "SS304, 6mm, dimensional conversion, catch-weight receipt",
      media: [],
      documents: [
        {
          id: "doc-ss-sheet-spec",
          documentType: "Specification",
          title: "SS304 material specification",
          documentNo: "SPEC-SS304",
          revisionCode: "Draft",
          approvalStatus: "Under review",
          effectiveDate: "Not effective",
          status: "Draft"
        }
      ],
      packaging: {
        innerPack: "Protective sheet separator",
        carton: "Not applicable",
        pallet: "Wooden pallet bundle",
        packagingUom: "SHEET",
        netWeight: "47.10 KG",
        grossWeight: "49.00 KG",
        dimensions: "2,000 x 1,000 x 6 mm",
        labelCount: "1 heat-lot label",
        packingInstructions: "Keep surface protected and separate accepted stock from QC hold stock."
      },
      physicalSpecs: {
        length: "2,000 mm",
        width: "1,000 mm",
        height: "Not applicable",
        thickness: "6 mm",
        grade: "SS304",
        material: "Stainless steel",
        colorFinish: "2B finish",
        shelfLife: "Not applicable",
        storageCondition: "Covered dry storage with surface protection"
      },
      vendorReferences: [
        {
          id: "vendor-ref-ss-sheet",
          supplierId: 30002,
          supplier: "Inox Metals",
          vendorItemCode: "SS304-6MM-SHEET",
          minimumOrderQty: "10 SHEET",
          leadTime: "9 days",
          purchaseUomId: 3,
          purchaseUom: "SHEET",
          complianceStatus: "Approved supplier",
          documentStatus: "MTC required"
        }
      ],
      barcodeRules: [
        {
          id: "barcode-rule-ss-sheet",
          barcodeValue: "SS304-6MM-SHEET",
          barcodeType: "QR",
          scanPurpose: "Receiving",
          uomLabel: "SHEET",
          isPrimary: true,
          status: "Draft"
        }
      ],
      variantTemplates: [
        {
          id: "variant-template-ss-sheet",
          templateCode: "SS-GRADE-THICKNESS",
          attributes: "Grade, thickness",
          optionCount: "4 thickness options",
          defaultVariant: "SS304 6mm sheet",
          status: "Draft"
        }
      ],
      activationBlockers: [
        "Approve dimensional conversion profile.",
        "Upload primary product image or receiving reference photo.",
        "Complete supplier compliance document review."
      ]
    };
  }

  return commonProfile;
}

function enrichItem(base: ItemMasterCoreFields): ItemMasterSetupItem {
  return {
    ...base,
    ...buildItemProfile(base)
  };
}

function formatQuantity(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) {
    return "Not captured";
  }

  return `${value}${suffix ? ` ${suffix}` : ""}`;
}

function formatDateRange(from: string | null | undefined, to: string | null | undefined) {
  if (!from && !to) {
    return "Not scheduled";
  }

  return `${from ?? "Open"} to ${to ?? "Open"}`;
}

function formatCustomerVisibleSpecs(specsJson: string | null | undefined) {
  if (!specsJson?.trim()) {
    return "Not captured";
  }

  try {
    const parsed = JSON.parse(specsJson) as Record<string, unknown>;
    const entries = Object.entries(parsed).map(([key, value]) => `${key}: ${String(value)}`);
    return entries.length > 0 ? entries.join(", ") : specsJson;
  } catch {
    return specsJson;
  }
}

function applyLiveItemProfile(item: ItemMasterSetupItem, profile: ItemMasterProfileDto | null | undefined): ItemMasterSetupItem {
  if (!profile) {
    return item;
  }

  return {
    ...item,
    aliases: profile.aliases.map((alias) => alias.aliasValue),
    catalogVisible: profile.catalog?.isCatalogVisible ?? item.catalogVisible,
    media: profile.media.map((media) => ({
      id: `live-media-${media.id}`,
      mediaType: media.mediaType,
      title: media.title,
      fileName: media.fileName ?? "Stored media",
      approvalStatus: media.approvalStatus,
      visibilityScope: media.visibilityScope,
      isPrimary: media.isPrimary,
      status: media.status
    })),
    documents: profile.documents.map((document) => ({
      id: `live-document-${document.id}`,
      documentType: document.documentType,
      title: document.title,
      documentNo: document.documentNo ?? "Not numbered",
      revisionCode: document.revisionCode ?? "Not revised",
      approvalStatus: document.approvalStatus,
      effectiveDate: document.effectiveFrom ?? "Not effective",
      status: document.status
    })),
    catalog: profile.catalog
      ? {
          isVisible: profile.catalog.isCatalogVisible,
          title: profile.catalog.catalogTitle,
          section: profile.catalog.catalogSection ?? "Not assigned",
          marketingDescription: profile.catalog.marketingDescription ?? "No catalog description captured.",
          customerVisibleSpecs: formatCustomerVisibleSpecs(profile.catalog.customerVisibleSpecsJson),
          publishStatus: profile.catalog.publishStatus,
          effectiveDates: formatDateRange(profile.catalog.effectiveFrom, profile.catalog.effectiveTo),
          previewSlug: profile.catalog.previewSlug ?? "Not published"
        }
      : item.catalog,
    packaging: profile.packaging
      ? {
          innerPack: formatQuantity(profile.packaging.innerPackQty, item.stockUom),
          carton: formatQuantity(profile.packaging.cartonQty, item.stockUom),
          pallet: formatQuantity(profile.packaging.palletQty, item.stockUom),
          packagingUom: profile.packaging.packagingUomId ? `UOM ${profile.packaging.packagingUomId}` : item.stockUom,
          netWeight: formatQuantity(profile.packaging.netWeight, profile.packaging.weightUomId ? `UOM ${profile.packaging.weightUomId}` : ""),
          grossWeight: formatQuantity(profile.packaging.grossWeight, profile.packaging.weightUomId ? `UOM ${profile.packaging.weightUomId}` : ""),
          dimensions:
            profile.packaging.lengthValue || profile.packaging.widthValue || profile.packaging.heightValue
              ? `${profile.packaging.lengthValue ?? "-"} x ${profile.packaging.widthValue ?? "-"} x ${profile.packaging.heightValue ?? "-"}`
              : "Not captured",
          labelCount: formatQuantity(profile.packaging.labelCount),
          packingInstructions: profile.packaging.packingInstructions ?? "No packing instruction captured."
        }
      : item.packaging,
    physicalSpecs: profile.physicalSpecs
      ? {
          length: formatQuantity(profile.physicalSpecs.lengthValue),
          width: formatQuantity(profile.physicalSpecs.widthValue),
          height: formatQuantity(profile.physicalSpecs.heightValue),
          thickness: formatQuantity(profile.physicalSpecs.thicknessValue),
          grade: profile.physicalSpecs.grade ?? "Not captured",
          material: profile.physicalSpecs.material ?? "Not captured",
          colorFinish: profile.physicalSpecs.colorFinish ?? "Not captured",
          shelfLife: profile.physicalSpecs.shelfLifeDays ? `${profile.physicalSpecs.shelfLifeDays} days` : "Not applicable",
          storageCondition: profile.physicalSpecs.storageCondition ?? "Not captured"
        }
      : item.physicalSpecs,
    customerReferences: profile.customerReferences.map((reference) => ({
      id: `live-customer-reference-${reference.id}`,
      customerId: reference.customerId,
      customer: reference.customerName ?? reference.customerCode ?? `Customer ${reference.customerId}`,
      customerItemCode: reference.customerItemCode,
      drawingRevision: [reference.drawingNo, reference.revisionCode].filter(Boolean).join(" / ") || "Not captured",
      packagingOverride: reference.packagingOverride ?? "None",
      specificationOverride: reference.specificationOverride ?? "None",
      approvalStatus: reference.approvalStatus
    })),
    vendorReferences: profile.vendorReferences.map((reference) => ({
      id: `live-vendor-reference-${reference.id}`,
      supplierId: reference.supplierId,
      supplier: reference.supplierName ?? reference.supplierCode ?? `Supplier ${reference.supplierId}`,
      vendorItemCode: reference.vendorItemCode,
      minimumOrderQty: formatQuantity(reference.minimumOrderQty),
      leadTime: reference.leadTimeDays ? `${reference.leadTimeDays} days` : "Not captured",
      purchaseUomId: reference.purchaseUomId,
      purchaseUom: reference.purchaseUomId ? `UOM ${reference.purchaseUomId}` : item.purchaseUom,
      complianceStatus: reference.complianceStatus ?? "Not captured",
      documentStatus: reference.documentStatus ?? "Not captured"
    })),
    manufacturing: profile.manufacturingPolicy
      ? {
          "BOM policy": profile.manufacturingPolicy.bomPolicy,
          "Routing policy": profile.manufacturingPolicy.routingPolicy,
          "Issue method": profile.manufacturingPolicy.issueMethod,
          "Scrap allowance": profile.manufacturingPolicy.scrapAllowancePercent
            ? `${profile.manufacturingPolicy.scrapAllowancePercent}%`
            : "Not captured",
          "Operation linkage": profile.manufacturingPolicy.operationLinkage ?? "Not captured"
        }
      : item.manufacturing,
    planning: profile.planningPolicy
      ? {
          "MRP enabled": profile.planningPolicy.mrpEnabled ? "Yes" : "No",
          "Safety stock": formatQuantity(profile.planningPolicy.safetyStockQty, item.stockUom),
          "Reorder point": formatQuantity(profile.planningPolicy.reorderPointQty, item.stockUom),
          "Min / max": `${formatQuantity(profile.planningPolicy.minimumQty, item.stockUom)} / ${formatQuantity(profile.planningPolicy.maximumQty, item.stockUom)}`,
          "Lead time": profile.planningPolicy.leadTimeDays ? `${profile.planningPolicy.leadTimeDays} days` : `${item.leadTimeDays} days`,
          "Lot size": formatQuantity(profile.planningPolicy.lotSizeQty, item.stockUom),
          "ABC class": profile.planningPolicy.abcClass ?? "Not classified"
        }
      : item.planning,
    inventory: profile.inventoryPolicy
      ? {
          "Default warehouse": profile.inventoryPolicy.defaultWarehouseId ? `Warehouse ${profile.inventoryPolicy.defaultWarehouseId}` : item.defaultWarehouse,
          "Default bin": profile.inventoryPolicy.defaultBinId ? `Bin ${profile.inventoryPolicy.defaultBinId}` : "Not assigned",
          "Serial tracking": profile.inventoryPolicy.serialTrackingMode,
          "Lot tracking": profile.inventoryPolicy.lotTrackingMode,
          "Catch weight": profile.inventoryPolicy.isCatchWeightItem ? "Yes" : "No",
          "Negative stock": profile.inventoryPolicy.negativeStockPolicy,
          "Expiry policy": profile.inventoryPolicy.expiryPolicy ?? "Not required"
        }
      : item.inventory,
    quality: profile.qualityPolicy
      ? {
          "QC required": profile.qualityPolicy.qcRequired ? "Yes" : "No",
          "Inspection plan": profile.qualityPolicy.inspectionPlanCode ?? "Not assigned",
          "Certificate requirement": profile.qualityPolicy.certificateRequirement ?? "Not required",
          "Hold rules": profile.qualityPolicy.holdRule ?? "Release by exception",
          "Traceability depth": profile.qualityPolicy.traceabilityDepth ?? item.traceabilityMode
        }
      : item.quality
  };
}

const seededItems: ItemMasterSetupItem[] = [
  enrichItem({
    id: "item-10001",
    itemId: 10001,
    companyId: 1,
    code: "RM-PLATE-001",
    name: "Mild Steel Plate 6mm",
    shortName: "MS Plate 6mm",
    itemType: "RawMaterial",
    itemGroupId: 1,
    groupLabel: "RAW",
    measurementProfileId: 1,
    measurementProfile: "STD-COUNT",
    stockUomId: 2,
    stockUom: "KG",
    purchaseUomId: 2,
    salesUomId: null,
    productionUomId: null,
    qcUomId: 2,
    traceabilityMode: "Lot",
    isCatchWeightItem: false,
    isQcRequired: true,
    isBatchExpiryTracked: false,
    defaultIssueMethod: "Manual",
    defaultMakeType: "Buy",
    defaultWarehouseId: 101,
    defaultBinId: 1001,
    defaultWarehouse: "RM-MAIN",
    leadTimeDays: 7,
    reorderPolicy: "MRP",
    status: "Active",
    source: "Seeded"
  }),
  enrichItem({
    id: "item-10002",
    itemId: 10002,
    companyId: 1,
    code: "FG-BRACKET-001",
    name: "Fabricated Mounting Bracket",
    shortName: "Mounting Bracket",
    itemType: "FinishedGood",
    itemGroupId: 2,
    groupLabel: "FG",
    measurementProfileId: 1,
    measurementProfile: "STD-COUNT",
    stockUomId: 1,
    stockUom: "PCS",
    purchaseUomId: null,
    salesUomId: 1,
    productionUomId: 1,
    qcUomId: 1,
    traceabilityMode: "Lot",
    isCatchWeightItem: false,
    isQcRequired: true,
    isBatchExpiryTracked: false,
    defaultIssueMethod: "Backflush",
    defaultMakeType: "Make",
    defaultWarehouseId: 201,
    defaultBinId: 2001,
    defaultWarehouse: "FG-DISPATCH",
    leadTimeDays: 3,
    reorderPolicy: "MRP",
    status: "Active",
    source: "Seeded"
  }),
  enrichItem({
    id: "item-sheet-demo",
    itemId: 10003,
    companyId: 1,
    code: "RM-SS-SHEET",
    name: "Stainless Steel Sheet",
    shortName: "SS Sheet",
    itemType: "RawMaterial",
    itemGroupId: 1,
    groupLabel: "RAW",
    measurementProfileId: 2,
    measurementProfile: "DIM-SHEET",
    stockUomId: 3,
    stockUom: "SHEET",
    purchaseUomId: 3,
    salesUomId: null,
    productionUomId: null,
    qcUomId: 3,
    traceabilityMode: "Lot",
    isCatchWeightItem: true,
    isQcRequired: true,
    isBatchExpiryTracked: false,
    defaultIssueMethod: "Manual",
    defaultMakeType: "Buy",
    defaultWarehouseId: 101,
    defaultBinId: 1001,
    defaultWarehouse: "RM-MAIN",
    leadTimeDays: 9,
    reorderPolicy: "MRP",
    status: "Draft",
    source: "Seeded"
  })
];

const seededVariants: ItemVariantSetupItem[] = [
  {
    id: "variant-ss-6mm",
    variantId: 501,
    companyId: 1,
    itemId: 10003,
    itemLabel: "RM-SS-SHEET",
    code: "SS-304-6MM",
    name: "SS304 6mm sheet",
    variantKey: "GRADE=SS304;THICKNESS=6MM",
    attributeSummary: "Grade SS304, thickness 6mm",
    overrideMeasurementProfileId: 2,
    overrideMeasurementProfile: "DIM-SHEET",
    overrideStockUomId: 3,
    overrideStockUom: "SHEET",
    overrideWeightPerUnitValue: 47.1,
    overrideWeightPerUnit: "47.1 kg",
    status: "Draft",
    source: "Seeded"
  },
  {
    id: "variant-bracket-painted",
    variantId: 502,
    companyId: 1,
    itemId: 10002,
    itemLabel: "FG-BRACKET-001",
    code: "BRACKET-PAINTED",
    name: "Painted bracket",
    variantKey: "FINISH=PAINTED",
    attributeSummary: "Painted finish",
    overrideMeasurementProfileId: 1,
    overrideMeasurementProfile: "STD-COUNT",
    overrideStockUomId: 1,
    overrideStockUom: "PCS",
    overrideWeightPerUnitValue: 1.2,
    overrideWeightPerUnit: "1.2 kg",
    status: "Active",
    source: "Seeded"
  }
];

const seededBarcodes: BarcodeSetupItem[] = [
  {
    id: "barcode-fg-bracket",
    barcodeId: 701,
    companyId: 1,
    itemId: 10002,
    itemLabel: "FG-BRACKET-001",
    itemVariantId: null,
    variantLabel: "Base item",
    uomId: 1,
    uomLabel: "PCS",
    barcodeValue: "FG-BRACKET-001",
    barcodeType: "Code128",
    scanPurpose: "Inventory",
    preferenceRank: 1,
    isPrimary: true,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "barcode-ss-sheet",
    barcodeId: 702,
    companyId: 1,
    itemId: 10003,
    itemLabel: "RM-SS-SHEET",
    itemVariantId: 501,
    variantLabel: "SS-304-6MM",
    uomId: 3,
    uomLabel: "SHEET",
    barcodeValue: "SS304-6MM-SHEET",
    barcodeType: "QR",
    scanPurpose: "Receiving",
    preferenceRank: 1,
    isPrimary: true,
    status: "Draft",
    source: "Seeded"
  }
];

const seededCustomers: CustomerSetupItem[] = [
  {
    id: "customer-20001",
    customerId: 20001,
    companyId: 1,
    code: "CUST-DEMO",
    name: "Demo Industrial Customer",
    shortName: "Demo Customer",
    customerType: "Domestic",
    defaultBranch: "PLANT-1",
    taxRegistrationNo: "Pending",
    paymentTermsCode: "NET30",
    creditDays: "30 days",
    exposureLabel: "2 open orders / dispatch watch",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "customer-enkay",
    customerId: 20002,
    companyId: 1,
    code: "CUST-ENKAY",
    name: "Enkay Ozone",
    shortName: "Enkay",
    customerType: "Domestic",
    defaultBranch: "PLANT-1",
    taxRegistrationNo: "27AAACE0000A1Z5",
    paymentTermsCode: "NET15",
    creditDays: "15 days",
    exposureLabel: "Order delivery risk monitored",
    status: "Active",
    source: "Seeded"
  }
];

const seededCustomerAddresses: CustomerAddressSetupItem[] = [
  {
    id: "customer-address-1",
    addressId: 0,
    customerId: 20001,
    code: "SHIP-01",
    addressType: "Shipping",
    addressLine1: "Demo industrial estate",
    addressLine2: "Dock 2",
    city: "Pune",
    stateOrProvince: "Maharashtra",
    postalCode: "411001",
    countryCode: "IN",
    contactName: "Demo Buyer",
    contactEmail: "buyer@demo.local",
    contactPhone: "Not captured",
    isDefaultBilling: true,
    isDefaultShipping: true,
    defaultUsage: "Billing + Shipping",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "customer-address-2",
    addressId: 0,
    customerId: 20002,
    code: "PLANT-DOCK",
    addressType: "Shipping",
    addressLine1: "Plant dispatch dock",
    addressLine2: "",
    city: "Nashik",
    stateOrProvince: "Maharashtra",
    postalCode: "422001",
    countryCode: "IN",
    contactName: "Kunal Shah",
    contactEmail: "dispatch@enkay.local",
    contactPhone: "Not captured",
    isDefaultBilling: false,
    isDefaultShipping: true,
    defaultUsage: "Shipping",
    status: "Active",
    source: "Seeded"
  }
];

const seededSuppliers: SupplierSetupItem[] = [
  {
    id: "supplier-30001",
    supplierId: 30001,
    companyId: 1,
    code: "SUP-DEMO",
    name: "Demo Steel Supplier",
    supplierType: "Material",
    supportsSubcontracting: false,
    defaultBranch: "WAREHOUSE-HUB",
    taxRegistrationNo: "Pending",
    paymentTermsCode: "NET15",
    delayScore: "7 day lead time",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "supplier-inox",
    supplierId: 30002,
    companyId: 1,
    code: "SUP-INOX",
    name: "Inox Metals",
    supplierType: "Material",
    supportsSubcontracting: false,
    defaultBranch: "WAREHOUSE-HUB",
    taxRegistrationNo: "27AAACI0000A1Z6",
    paymentTermsCode: "NET15",
    delayScore: "Preferred / stable",
    status: "Active",
    source: "Seeded"
  }
];

const seededSupplierAddresses: SupplierAddressSetupItem[] = [
  {
    id: "supplier-address-1",
    addressId: 0,
    supplierId: 30001,
    code: "ORDER-01",
    addressType: "Order",
    addressLine1: "Supplier order desk",
    city: "Pune",
    stateOrProvince: "Maharashtra",
    postalCode: "411001",
    countryCode: "IN",
    contactName: "Demo Supplier Desk",
    contactEmail: "supply@demo.local",
    contactPhone: "Not captured",
    isDefaultOrderAddress: true,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "supplier-address-2",
    addressId: 0,
    supplierId: 30002,
    code: "MILL-01",
    addressType: "Order",
    addressLine1: "Mill sales office",
    city: "Mumbai",
    stateOrProvince: "Maharashtra",
    postalCode: "400001",
    countryCode: "IN",
    contactName: "Priya Menon",
    contactEmail: "sales@inox.local",
    contactPhone: "Not captured",
    isDefaultOrderAddress: true,
    status: "Active",
    source: "Seeded"
  }
];

const seededSupplierLeadTimes: SupplierLeadTimeSetupItem[] = [
  {
    id: "leadtime-1",
    leadTimeId: 1,
    companyId: 1,
    supplierId: 30001,
    branchId: null,
    itemId: 10001,
    itemGroupId: null,
    itemLabel: "RM-PLATE-001",
    leadTimeDays: 7,
    minOrderQty: null,
    orderMultipleQty: null,
    orderPolicy: "Priority 1",
    isSubcontractLeadTime: false,
    priorityRank: 1,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "leadtime-2",
    leadTimeId: 2,
    companyId: 1,
    supplierId: 30002,
    branchId: null,
    itemId: 10003,
    itemGroupId: null,
    itemLabel: "RM-SS-SHEET",
    leadTimeDays: 9,
    minOrderQty: 500,
    orderMultipleQty: null,
    orderPolicy: "Minimum 500 kg",
    isSubcontractLeadTime: false,
    priorityRank: 1,
    status: "Active",
    source: "Seeded"
  }
];

export function buildMasterFilter(
  companyId?: number | null,
  branchId?: number | null,
  search?: string,
  status?: string
): QueryFilter {
  return {
    branchId: branchId ?? undefined,
    companyId: companyId ?? undefined,
    page: 1,
    pageSize: 25,
    search: search?.trim() ? search.trim() : undefined,
    status: status && status !== "all" ? status : undefined
  };
}

function hasLiveSession(session: AuthSessionResponse | null | undefined) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

export function canPersistMasterData(session: AuthSessionResponse | null | undefined) {
  return hasLiveSession(session);
}

export async function createItemMasterDraft(
  session: AuthSessionResponse | null | undefined,
  request: ItemUpsertRequest
): Promise<ItemDto> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Item Master changes.");
  }

  return apiClient.masters.createItem(request);
}

export async function updateItemMasterCore(
  session: AuthSessionResponse | null | undefined,
  itemId: number,
  request: ItemUpsertRequest
): Promise<ItemDto> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Item Master changes.");
  }

  return apiClient.masters.updateItem(itemId, request);
}

export async function updateItemMasterProfile(
  session: AuthSessionResponse | null | undefined,
  itemId: number,
  request: ItemMasterProfileUpsertRequest
): Promise<ItemMasterProfileDto> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Item Master changes.");
  }

  return apiClient.masters.updateItemProfile(itemId, request);
}

export async function createCustomerDraft(
  session: AuthSessionResponse | null | undefined,
  request: CustomerUpsertRequest
): Promise<CustomerSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Customer Master changes.");
  }

  return mapCustomer(await apiClient.partners.createCustomer(request), "Live");
}

export async function updateCustomerCore(
  session: AuthSessionResponse | null | undefined,
  customerId: number,
  request: CustomerUpsertRequest
): Promise<CustomerSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Customer Master changes.");
  }

  return mapCustomer(await apiClient.partners.updateCustomer(customerId, request), "Live");
}

export async function createCustomerAddressDraft(
  session: AuthSessionResponse | null | undefined,
  request: CustomerAddressUpsertRequest
): Promise<CustomerAddressSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Customer address changes.");
  }

  return mapCustomerAddress(await apiClient.partners.createCustomerAddress(request), "Live");
}

export async function updateCustomerAddressCore(
  session: AuthSessionResponse | null | undefined,
  addressId: number,
  request: CustomerAddressUpsertRequest
): Promise<CustomerAddressSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Customer address changes.");
  }

  return mapCustomerAddress(await apiClient.partners.updateCustomerAddress(addressId, request), "Live");
}

export async function getCustomerPartnerWorkspace(
  session: AuthSessionResponse | null | undefined,
  customer: CustomerSetupItem,
  addresses: CustomerAddressSetupItem[] = []
): Promise<CustomerPartnerWorkspaceSetup> {
  if (!hasLiveSession(session) || !customer.customerId) {
    return buildCustomerPartnerWorkspace(customer, addresses, hasLiveSession(session) ? "Deferred" : "Seeded");
  }

  try {
    return mapCustomerPartnerWorkspace(await apiClient.partners.customerProfile(customer.customerId), "Live");
  } catch {
    return buildCustomerPartnerWorkspace(customer, addresses, "Deferred");
  }
}

export async function updateCustomerPartnerWorkspace(
  session: AuthSessionResponse | null | undefined,
  customerId: number,
  workspace: CustomerPartnerWorkspaceSetup
): Promise<CustomerPartnerWorkspaceSetup> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Customer profile changes.");
  }

  return mapCustomerPartnerWorkspace(await apiClient.partners.updateCustomerProfile(customerId, toCustomerProfileRequest(workspace)), "Live");
}

export async function createSupplierDraft(
  session: AuthSessionResponse | null | undefined,
  request: SupplierUpsertRequest
): Promise<SupplierSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier Master changes.");
  }

  return mapSupplier(await apiClient.partners.createSupplier(request), "Live");
}

export async function updateSupplierCore(
  session: AuthSessionResponse | null | undefined,
  supplierId: number,
  request: SupplierUpsertRequest
): Promise<SupplierSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier Master changes.");
  }

  return mapSupplier(await apiClient.partners.updateSupplier(supplierId, request), "Live");
}

export async function createSupplierAddressDraft(
  session: AuthSessionResponse | null | undefined,
  request: SupplierAddressUpsertRequest
): Promise<SupplierAddressSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier address changes.");
  }

  return mapSupplierAddress(await apiClient.partners.createSupplierAddress(request), "Live");
}

export async function updateSupplierAddressCore(
  session: AuthSessionResponse | null | undefined,
  addressId: number,
  request: SupplierAddressUpsertRequest
): Promise<SupplierAddressSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier address changes.");
  }

  return mapSupplierAddress(await apiClient.partners.updateSupplierAddress(addressId, request), "Live");
}

export async function createSupplierLeadTimeDraft(
  session: AuthSessionResponse | null | undefined,
  request: SupplierLeadTimeUpsertRequest
): Promise<SupplierLeadTimeSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier lead-time changes.");
  }

  return mapSupplierLeadTime(await apiClient.partners.createSupplierLeadTime(request), seededItems, "Live");
}

export async function updateSupplierLeadTimeCore(
  session: AuthSessionResponse | null | undefined,
  leadTimeId: number,
  request: SupplierLeadTimeUpsertRequest
): Promise<SupplierLeadTimeSetupItem> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier lead-time changes.");
  }

  return mapSupplierLeadTime(await apiClient.partners.updateSupplierLeadTime(leadTimeId, request), seededItems, "Live");
}

export async function getSupplierPartnerWorkspace(
  session: AuthSessionResponse | null | undefined,
  supplier: SupplierSetupItem,
  addresses: SupplierAddressSetupItem[] = []
): Promise<SupplierPartnerWorkspaceSetup> {
  if (!hasLiveSession(session) || !supplier.supplierId) {
    return buildSupplierPartnerWorkspace(supplier, addresses, hasLiveSession(session) ? "Deferred" : "Seeded");
  }

  try {
    return mapSupplierPartnerWorkspace(await apiClient.partners.supplierProfile(supplier.supplierId), "Live");
  } catch {
    return buildSupplierPartnerWorkspace(supplier, addresses, "Deferred");
  }
}

export async function updateSupplierPartnerWorkspace(
  session: AuthSessionResponse | null | undefined,
  supplierId: number,
  workspace: SupplierPartnerWorkspaceSetup
): Promise<SupplierPartnerWorkspaceSetup> {
  if (!hasLiveSession(session)) {
    throw new Error("Live workspace sign-in is required before saving Supplier profile changes.");
  }

  return mapSupplierPartnerWorkspace(await apiClient.partners.updateSupplierProfile(supplierId, toSupplierProfileRequest(workspace)), "Live");
}

function matchesFilter(value: string, search?: string, status?: string) {
  const searchText = search?.trim().toLowerCase();
  const statusText = status?.trim().toLowerCase();
  const matchesSearch = !searchText || value.toLowerCase().includes(searchText);
  const matchesStatus = !statusText || statusText === "all" || value.toLowerCase().includes(statusText);

  return matchesSearch && matchesStatus;
}

function filterSeeded<T extends { status: string }>(items: T[], filter: QueryFilter, label: (item: T) => string) {
  return items.filter((item) => matchesFilter(`${label(item)} ${item.status}`, filter.search, filter.status));
}

function mapUomLabel(uoms: UomDto[], uomId: number | null | undefined) {
  if (!uomId) {
    return "Pending";
  }

  const uom = uoms.find((item) => item.id === uomId);
  return uom ? uom.uomCode : `UOM ${uomId}`;
}

function mapUomClassLabel(classes: UomClassSetupItem[], classId: number | null | undefined) {
  if (!classId) {
    return "Pending";
  }

  const match = classes.find((item) => item.uomClassId === classId);
  return match ? match.code : `Class ${classId}`;
}

function mapItemLabel(items: ItemMasterSetupItem[], itemId: number | null | undefined) {
  if (!itemId) {
    return "Any item";
  }

  const item = items.find((entry) => entry.itemId === itemId);
  return item ? item.code : `Item ${itemId}`;
}

function mapVariantLabel(variants: ItemVariantSetupItem[], variantId: number | null | undefined) {
  if (!variantId) {
    return "Base item";
  }

  const variant = variants.find((entry) => entry.variantId === variantId);
  return variant ? variant.code : `Variant ${variantId}`;
}

function mapUomClass(dto: UomClassDto, uoms: UomDto[], source: MasterDataSource): UomClassSetupItem {
  return {
    id: `uom-class-${dto.id}`,
    uomClassId: dto.id,
    code: dto.classCode,
    name: dto.className,
    baseUomId: dto.baseUomId,
    baseUom: mapUomLabel(uoms, dto.baseUomId),
    supportsFormulaConversion: dto.supportsFormulaConversion,
    status: dto.status,
    source
  };
}

function mapUomConversion(dto: UomConversionDto, uoms: UomDto[], source: MasterDataSource): UomConversionSetupItem {
  return {
    id: `uom-conversion-${dto.id}`,
    conversionId: dto.id,
    fromUomId: dto.fromUomId,
    fromUom: mapUomLabel(uoms, dto.fromUomId),
    toUomId: dto.toUomId,
    toUom: mapUomLabel(uoms, dto.toUomId),
    conversionMode: dto.conversionMode,
    factorNumerator: dto.factorNumerator,
    factorDenominator: dto.factorDenominator,
    factorLabel: `${dto.factorNumerator} / ${dto.factorDenominator}`,
    formulaTokenSet: dto.formulaTokenSet ?? "None",
    roundMode: dto.roundMode,
    precisionScale: dto.precisionScale,
    status: dto.status,
    source
  };
}

function mapMeasurementProfile(
  dto: MeasurementProfileDto,
  classes: UomClassSetupItem[],
  source: MasterDataSource
): MeasurementProfileSetupItem {
  return {
    id: `measurement-profile-${dto.id}`,
    profileId: dto.id,
    code: dto.profileCode,
    name: dto.profileName,
    profileType: dto.profileType,
    stockUomClassId: dto.stockUomClassId,
    stockUomClass: mapUomClassLabel(classes, dto.stockUomClassId),
    allowsCatchWeight: dto.allowsCatchWeight,
    requiresDimensions: dto.requiresDimensions,
    requiresDensity: dto.requiresDensity,
    requiresThickness: dto.requiresThickness,
    requiresPackSize: dto.requiresPackSize,
    supportsCommercialProductionSplit: dto.supportsCommercialProductionSplit,
    status: dto.status,
    source
  };
}

function mapMeasurementFormula(dto: MeasurementFormulaDto, uoms: UomDto[], source: MasterDataSource): MeasurementFormulaSetupItem {
  return {
    id: `measurement-formula-${dto.id}`,
    formulaId: dto.id,
    profileId: dto.measurementProfileId,
    code: dto.formulaCode,
    name: dto.formulaName,
    purpose: dto.formulaPurpose,
    expression: dto.expressionTemplate,
    outputUom: mapUomLabel(uoms, dto.outputUomId),
    precisionScale: dto.precisionScale,
    status: dto.status,
    source
  };
}

function mapItem(dto: ItemDto, uoms: UomDto[], profiles: MeasurementProfileSetupItem[], source: MasterDataSource): ItemMasterSetupItem {
  return enrichItem({
    id: `item-${dto.id}`,
    itemId: dto.id,
    companyId: dto.companyId,
    code: dto.itemCode,
    name: dto.itemName,
    shortName: dto.shortName ?? "Not captured",
    itemType: dto.itemType,
    itemGroupId: dto.itemGroupId,
    groupLabel: `Group ${dto.itemGroupId}`,
    measurementProfileId: dto.measurementProfileId,
    measurementProfile: profiles.find((profile) => profile.profileId === dto.measurementProfileId)?.code ?? `Profile ${dto.measurementProfileId}`,
    stockUomId: dto.stockUomId,
    stockUom: mapUomLabel(uoms, dto.stockUomId),
    purchaseUomId: dto.purchaseUomId,
    salesUomId: dto.salesUomId,
    productionUomId: dto.productionUomId,
    qcUomId: dto.qcUomId,
    traceabilityMode: dto.traceabilityMode,
    isCatchWeightItem: dto.isCatchWeightItem,
    isQcRequired: dto.isQcRequired,
    isBatchExpiryTracked: dto.isBatchExpiryTracked,
    defaultIssueMethod: dto.defaultIssueMethod,
    defaultMakeType: dto.defaultMakeType,
    defaultWarehouseId: dto.defaultWarehouseId,
    defaultBinId: dto.defaultBinId,
    defaultWarehouse: dto.defaultWarehouseId ? `Warehouse ${dto.defaultWarehouseId}` : "Not assigned",
    leadTimeDays: dto.leadTimeDays,
    reorderPolicy: dto.reorderPolicy,
    status: dto.status,
    source
  });
}

function mapItemVariant(
  dto: ItemVariantDto,
  items: ItemMasterSetupItem[],
  uoms: UomDto[],
  profiles: MeasurementProfileSetupItem[],
  source: MasterDataSource
): ItemVariantSetupItem {
  return {
    id: `item-variant-${dto.id}`,
    variantId: dto.id,
    companyId: dto.companyId,
    itemId: dto.itemId,
    itemLabel: mapItemLabel(items, dto.itemId),
    code: dto.variantCode,
    name: dto.variantName,
    variantKey: dto.variantKey,
    attributeSummary: dto.variantAttributeSummary ?? dto.variantAttributeMapJson,
    overrideMeasurementProfileId: dto.overrideMeasurementProfileId,
    overrideMeasurementProfile: dto.overrideMeasurementProfileId
      ? profiles.find((profile) => profile.profileId === dto.overrideMeasurementProfileId)?.code ?? `Profile ${dto.overrideMeasurementProfileId}`
      : "Base item",
    overrideStockUomId: dto.overrideStockUomId,
    overrideStockUom: mapUomLabel(uoms, dto.overrideStockUomId),
    overrideWeightPerUnitValue: dto.overrideWeightPerUnit,
    overrideWeightPerUnit: dto.overrideWeightPerUnit ? `${dto.overrideWeightPerUnit}` : "Base item",
    status: dto.status,
    source
  };
}

function mapBarcode(
  dto: ItemBarcodeDto,
  items: ItemMasterSetupItem[],
  variants: ItemVariantSetupItem[],
  uoms: UomDto[],
  source: MasterDataSource
): BarcodeSetupItem {
  return {
    id: `item-barcode-${dto.id}`,
    barcodeId: dto.id,
    companyId: dto.companyId,
    itemId: dto.itemId,
    itemLabel: mapItemLabel(items, dto.itemId),
    itemVariantId: dto.itemVariantId,
    variantLabel: mapVariantLabel(variants, dto.itemVariantId),
    uomId: dto.uomId,
    uomLabel: mapUomLabel(uoms, dto.uomId),
    barcodeValue: dto.barcodeValue,
    barcodeType: dto.barcodeType,
    scanPurpose: dto.scanPurpose,
    preferenceRank: dto.preferenceRank,
    isPrimary: dto.isPrimary,
    status: dto.status,
    source
  };
}

function mapCustomer(dto: CustomerDto, source: MasterDataSource): CustomerSetupItem {
  return {
    id: `customer-${dto.id}`,
    customerId: dto.id,
    companyId: dto.companyId,
    code: dto.customerCode,
    name: dto.customerName,
    shortName: dto.shortName ?? "Not captured",
    customerType: dto.customerType,
    defaultBranch: dto.defaultBranchId ? `Branch ${dto.defaultBranchId}` : "Any branch",
    taxRegistrationNo: dto.taxRegistrationNo ?? "Pending",
    paymentTermsCode: dto.paymentTermsCode ?? "Pending",
    creditDays: dto.creditDays ? `${dto.creditDays} days` : "Not set",
    exposureLabel: "Live order exposure pending sales screen",
    status: dto.status,
    source
  };
}

function mapCustomerAddress(dto: CustomerAddressDto, source: MasterDataSource): CustomerAddressSetupItem {
  return {
    id: `customer-address-${dto.id}`,
    addressId: dto.id,
    customerId: dto.customerId,
    code: dto.addressCode,
    addressType: dto.addressType,
    addressLine1: dto.addressLine1,
    addressLine2: dto.addressLine2 ?? "",
    city: `${dto.city}, ${dto.stateOrProvince}`,
    stateOrProvince: dto.stateOrProvince,
    postalCode: dto.postalCode,
    countryCode: dto.countryCode,
    contactName: dto.contactName ?? "Not captured",
    contactEmail: dto.contactEmail ?? "Not captured",
    contactPhone: dto.contactPhone ?? "Not captured",
    isDefaultBilling: dto.isDefaultBilling,
    isDefaultShipping: dto.isDefaultShipping,
    defaultUsage: [dto.isDefaultBilling ? "Billing" : "", dto.isDefaultShipping ? "Shipping" : ""].filter(Boolean).join(" + ") || "Reference",
    status: dto.status,
    source
  };
}

function mapSupplier(dto: SupplierDto, source: MasterDataSource): SupplierSetupItem {
  return {
    id: `supplier-${dto.id}`,
    supplierId: dto.id,
    companyId: dto.companyId,
    code: dto.supplierCode,
    name: dto.supplierName,
    supplierType: dto.supplierType,
    supportsSubcontracting: dto.supportsSubcontracting,
    defaultBranch: dto.defaultBranchId ? `Branch ${dto.defaultBranchId}` : "Any branch",
    taxRegistrationNo: dto.taxRegistrationNo ?? "Pending",
    paymentTermsCode: dto.paymentTermsCode ?? "Pending",
    delayScore: dto.supportsSubcontracting ? "Subcontract capable" : "Material supplier",
    status: dto.status,
    source
  };
}

function mapSupplierAddress(dto: SupplierAddressDto, source: MasterDataSource): SupplierAddressSetupItem {
  return {
    id: `supplier-address-${dto.id}`,
    addressId: dto.id,
    supplierId: dto.supplierId,
    code: dto.addressCode,
    addressType: dto.addressType,
    addressLine1: dto.addressLine1,
    city: `${dto.city}, ${dto.stateOrProvince}`,
    stateOrProvince: dto.stateOrProvince,
    postalCode: dto.postalCode,
    countryCode: dto.countryCode,
    contactName: dto.contactName ?? "Not captured",
    contactEmail: dto.contactEmail ?? "Not captured",
    contactPhone: dto.contactPhone ?? "Not captured",
    isDefaultOrderAddress: dto.isDefaultOrderAddress,
    status: dto.status,
    source
  };
}

function mapSupplierLeadTime(dto: SupplierLeadTimeDto, items: ItemMasterSetupItem[], source: MasterDataSource): SupplierLeadTimeSetupItem {
  return {
    id: `supplier-lead-time-${dto.id}`,
    leadTimeId: dto.id,
    companyId: dto.companyId,
    supplierId: dto.supplierId,
    branchId: dto.branchId,
    itemId: dto.itemId,
    itemGroupId: dto.itemGroupId,
    itemLabel: dto.itemId ? mapItemLabel(items, dto.itemId) : dto.itemGroupId ? `Group ${dto.itemGroupId}` : "Any item",
    leadTimeDays: dto.leadTimeDays,
    minOrderQty: dto.minOrderQty,
    orderMultipleQty: dto.orderMultipleQty,
    orderPolicy: `${dto.minOrderQty ?? "No min"} / ${dto.orderMultipleQty ?? "No multiple"}`,
    isSubcontractLeadTime: dto.isSubcontractLeadTime,
    priorityRank: dto.priorityRank,
    status: dto.status,
    source
  };
}

function buildCustomerPartnerWorkspace(customer: CustomerSetupItem, addresses: CustomerAddressSetupItem[] = [], source: MasterDataSource = "Seeded"): CustomerPartnerWorkspaceSetup {
  return {
    profile: {
      legalName: customer.name,
      taxCategory: customer.taxRegistrationNo === "Pending" ? "Pending" : "Registered GST",
      currencyCode: "INR",
      creditStatus: customer.status === "On Hold" ? "On hold" : "Clear",
      creditLimitAmount: null,
      creditHoldRule: customer.status === "On Hold" ? "Manager review" : "Standard release",
      paymentTermsCode: customer.paymentTermsCode,
      commercialSegment: customer.customerType === "Export" ? "Strategic" : "Standard",
      orderReleaseControl: "Standard",
      dispatchPreference: addresses.some((address) => address.defaultUsage.includes("Shipping")) ? "Standard dispatch" : "Appointment required",
      dispatchInstruction: addresses.length > 0 ? "Use default ship-to contact" : "Ship-to site pending",
      catalogVisible: customer.customerType === "Export",
      catalogSegment: customer.customerType === "Export" ? "Export catalog" : "Standard catalog",
      status: customer.status
    },
    contactPoints: addresses
      .filter((address) => address.contactName !== "Not captured" || address.contactEmail !== "Not captured")
      .map((address, index) => ({
        id: `${address.id}-contact-${index}`,
        contactPointId: 0,
        addressId: address.addressId || null,
        contactName: address.contactName,
        role: index === 0 ? "Commercial" : "Dispatch",
        channel: address.contactEmail !== "Not captured" ? "Email" : "Phone",
        detail: address.contactEmail !== "Not captured" ? address.contactEmail : address.contactPhone,
        isPrimary: index === 0,
        consentStatus: "Business communication",
        escalationLevel: index === 0 ? "Primary" : "Standard",
        status: address.status
      })),
    itemReferences: [],
    documents: customer.taxRegistrationNo !== "Pending"
      ? [
          {
            id: `${customer.id}-tax-document`,
            documentId: 0,
            documentType: "Tax registration",
            title: "Tax registration",
            documentNo: customer.taxRegistrationNo,
            revisionCode: "Current",
            fileName: "",
            storageUri: "",
            approvalStatus: "Ready",
            visibilityScope: "Internal",
            effectiveFrom: "",
            effectiveTo: "",
            expiresOn: "",
            status: "Active"
          }
        ]
      : [],
    auditEvents: [],
    source
  };
}

function buildSupplierPartnerWorkspace(supplier: SupplierSetupItem, addresses: SupplierAddressSetupItem[] = [], source: MasterDataSource = "Seeded"): SupplierPartnerWorkspaceSetup {
  return {
    profile: {
      legalName: supplier.name,
      taxCategory: supplier.taxRegistrationNo === "Pending" ? "Pending" : "Registered GST",
      currencyCode: "INR",
      paymentTermsCode: supplier.paymentTermsCode,
      preferredStatus: supplier.code.includes("INOX") || supplier.supportsSubcontracting ? "Preferred" : "Standard",
      complianceStatus: supplier.taxRegistrationNo === "Pending" ? "Pending" : "Approved",
      capabilitySummary: supplier.supportsSubcontracting ? "Subcontract capable" : supplier.supplierType,
      qualityRating: null,
      procurementReleaseControl: supplier.taxRegistrationNo === "Pending" ? "Compliance review" : "Standard",
      leadTimeReviewDays: null,
      status: supplier.status
    },
    contactPoints: addresses
      .filter((address) => address.contactName !== "Not captured" || address.contactEmail !== "Not captured")
      .map((address, index) => ({
        id: `${address.id}-contact-${index}`,
        contactPointId: 0,
        addressId: address.addressId || null,
        contactName: address.contactName,
        role: index === 0 ? "Commercial" : "Plant contact",
        channel: address.contactEmail !== "Not captured" ? "Email" : "Phone",
        detail: address.contactEmail !== "Not captured" ? address.contactEmail : address.contactPhone,
        isPrimary: index === 0,
        consentStatus: "Business communication",
        escalationLevel: index === 0 ? "Primary" : "Standard",
        status: address.status
      })),
    vendorReferences: [],
    documents: supplier.taxRegistrationNo !== "Pending"
      ? [
          {
            id: `${supplier.id}-compliance-document`,
            documentId: 0,
            documentType: "Compliance certificate",
            title: "Supplier compliance certificate",
            documentNo: supplier.taxRegistrationNo,
            revisionCode: "Current",
            fileName: "",
            storageUri: "",
            approvalStatus: "Ready",
            visibilityScope: "Internal",
            effectiveFrom: "",
            effectiveTo: "",
            expiresOn: "",
            status: "Active"
          }
        ]
      : [],
    auditEvents: [],
    source
  };
}

function mapCustomerPartnerWorkspace(dto: CustomerPartnerWorkspaceDto, source: MasterDataSource): CustomerPartnerWorkspaceSetup {
  return {
    profile: {
      legalName: dto.profile.legalName ?? "",
      taxCategory: dto.profile.taxCategory ?? "Pending",
      currencyCode: dto.profile.currencyCode ?? "INR",
      creditStatus: dto.profile.creditStatus ?? "Clear",
      creditLimitAmount: dto.profile.creditLimitAmount,
      creditHoldRule: dto.profile.creditHoldRule ?? "Standard release",
      paymentTermsCode: dto.profile.paymentTermsCode ?? "Pending",
      commercialSegment: dto.profile.commercialSegment ?? "Standard",
      orderReleaseControl: dto.profile.orderReleaseControl ?? "Standard",
      dispatchPreference: dto.profile.dispatchPreference ?? "Standard dispatch",
      dispatchInstruction: dto.profile.dispatchInstruction ?? "",
      catalogVisible: dto.profile.catalogVisible,
      catalogSegment: dto.profile.catalogSegment ?? "Standard catalog",
      status: dto.profile.status
    },
    contactPoints: dto.contactPoints.map((contact) => ({
      id: `customer-contact-${contact.id}`,
      contactPointId: contact.id,
      addressId: contact.customerAddressId,
      contactName: contact.contactName,
      role: contact.contactRole,
      channel: contact.channel,
      detail: contact.contactValue,
      isPrimary: contact.isPrimary,
      consentStatus: contact.consentStatus ?? "Business communication",
      escalationLevel: contact.escalationLevel ?? "Standard",
      status: contact.status
    })),
    itemReferences: dto.itemReferences.map((reference) => ({
      id: `customer-reference-${reference.id}`,
      referenceId: reference.id,
      itemId: reference.itemId,
      customerItemCode: reference.customerItemCode,
      drawingRevision: [reference.drawingNo, reference.revisionCode].filter(Boolean).join(" / "),
      packagingOverride: reference.packagingOverride ?? "",
      specificationOverride: reference.specificationOverride ?? "",
      approvalStatus: reference.approvalStatus,
      status: reference.status
    })),
    documents: dto.documents.map(mapPartnerDocument),
    auditEvents: dto.auditEvents.map(mapPartnerAuditEvent),
    source
  };
}

function mapSupplierPartnerWorkspace(dto: SupplierPartnerWorkspaceDto, source: MasterDataSource): SupplierPartnerWorkspaceSetup {
  return {
    profile: {
      legalName: dto.profile.legalName ?? "",
      taxCategory: dto.profile.taxCategory ?? "Pending",
      currencyCode: dto.profile.currencyCode ?? "INR",
      paymentTermsCode: dto.profile.paymentTermsCode ?? "Pending",
      preferredStatus: dto.profile.preferredStatus ?? "Standard",
      complianceStatus: dto.profile.complianceStatus ?? "Pending",
      capabilitySummary: dto.profile.capabilitySummary ?? "",
      qualityRating: dto.profile.qualityRating,
      procurementReleaseControl: dto.profile.procurementReleaseControl ?? "Standard",
      leadTimeReviewDays: dto.profile.leadTimeReviewDays,
      status: dto.profile.status
    },
    contactPoints: dto.contactPoints.map((contact) => ({
      id: `supplier-contact-${contact.id}`,
      contactPointId: contact.id,
      addressId: contact.supplierAddressId,
      contactName: contact.contactName,
      role: contact.contactRole,
      channel: contact.channel,
      detail: contact.contactValue,
      isPrimary: contact.isPrimary,
      consentStatus: contact.consentStatus ?? "Business communication",
      escalationLevel: contact.escalationLevel ?? "Standard",
      status: contact.status
    })),
    vendorReferences: dto.vendorReferences.map((reference) => ({
      id: `supplier-reference-${reference.id}`,
      referenceId: reference.id,
      itemId: reference.itemId,
      vendorItemCode: reference.vendorItemCode,
      minimumOrderQty: reference.minimumOrderQty,
      leadTimeDays: reference.leadTimeDays,
      purchaseUomId: reference.purchaseUomId,
      complianceStatus: reference.complianceStatus ?? "Pending",
      documentStatus: reference.documentStatus ?? "Pending",
      approvalStatus: reference.approvalStatus,
      status: reference.status
    })),
    documents: dto.documents.map(mapPartnerDocument),
    auditEvents: dto.auditEvents.map(mapPartnerAuditEvent),
    source
  };
}

function mapPartnerDocument(document: { id: number; documentType: string; title: string; documentNo: string | null; revisionCode: string | null; fileName: string | null; storageUri?: string | null; approvalStatus: string; visibilityScope: string; effectiveFrom: string | null; effectiveTo: string | null; expiresOn: string | null; status: string }): PartnerDocumentSetupItem {
  return {
    id: `partner-document-${document.id}`,
    documentId: document.id,
    documentType: document.documentType,
    title: document.title,
    documentNo: document.documentNo ?? "",
    revisionCode: document.revisionCode ?? "",
    fileName: document.fileName ?? "",
    storageUri: document.storageUri ?? "",
    approvalStatus: document.approvalStatus,
    visibilityScope: document.visibilityScope,
    effectiveFrom: document.effectiveFrom ?? "",
    effectiveTo: document.effectiveTo ?? "",
    expiresOn: document.expiresOn ?? "",
    status: document.status
  };
}

function mapPartnerAuditEvent(event: { id: number; actionCode: string; actor: string; occurredOn: string; outcome: string }): ItemAuditEventSetupItem {
  return {
    id: `partner-audit-${event.id}`,
    event: event.actionCode,
    actor: event.actor,
    occurredOn: event.occurredOn,
    outcome: event.outcome
  };
}

function toCustomerProfileRequest(workspace: CustomerPartnerWorkspaceSetup): CustomerPartnerProfileUpsertRequest {
  return {
    profile: {
      legalName: workspace.profile.legalName,
      taxCategory: workspace.profile.taxCategory,
      currencyCode: workspace.profile.currencyCode,
      creditStatus: workspace.profile.creditStatus ?? "Clear",
      creditLimitAmount: workspace.profile.creditLimitAmount ?? null,
      creditHoldRule: workspace.profile.creditHoldRule ?? "Standard release",
      paymentTermsCode: workspace.profile.paymentTermsCode,
      commercialSegment: workspace.profile.commercialSegment ?? "Standard",
      orderReleaseControl: workspace.profile.orderReleaseControl ?? "Standard",
      dispatchPreference: workspace.profile.dispatchPreference ?? "Standard dispatch",
      dispatchInstruction: workspace.profile.dispatchInstruction ?? null,
      catalogVisible: workspace.profile.catalogVisible ?? false,
      catalogSegment: workspace.profile.catalogSegment ?? null,
      status: workspace.profile.status
    },
    contactPoints: workspace.contactPoints.map((contact) => ({
      id: contact.contactPointId || null,
      customerAddressId: contact.addressId,
      contactName: contact.contactName,
      contactRole: contact.role,
      channel: contact.channel,
      contactValue: contact.detail,
      isPrimary: contact.isPrimary,
      consentStatus: contact.consentStatus,
      escalationLevel: contact.escalationLevel,
      status: contact.status
    })),
    itemReferences: workspace.itemReferences.map((reference) => {
      const [drawingNo, revisionCode] = reference.drawingRevision.split("/").map((part) => part.trim());
      return {
        id: reference.referenceId || null,
        itemId: reference.itemId,
        customerItemCode: reference.customerItemCode,
        drawingNo: drawingNo || null,
        revisionCode: revisionCode || null,
        packagingOverride: reference.packagingOverride || null,
        specificationOverride: reference.specificationOverride || null,
        approvalStatus: reference.approvalStatus,
        status: reference.status
      };
    }),
    documents: workspace.documents.map((document) => ({
      id: document.documentId || null,
      documentType: document.documentType,
      title: document.title,
      documentNo: document.documentNo || null,
      revisionCode: document.revisionCode || null,
      fileName: document.fileName || null,
      storageUri: document.storageUri || null,
      approvalStatus: document.approvalStatus,
      visibilityScope: document.visibilityScope,
      effectiveFrom: document.effectiveFrom || null,
      effectiveTo: document.effectiveTo || null,
      expiresOn: document.expiresOn || null,
      status: document.status
    }))
  };
}

function toSupplierProfileRequest(workspace: SupplierPartnerWorkspaceSetup): SupplierPartnerProfileUpsertRequest {
  return {
    profile: {
      legalName: workspace.profile.legalName,
      taxCategory: workspace.profile.taxCategory,
      currencyCode: workspace.profile.currencyCode,
      paymentTermsCode: workspace.profile.paymentTermsCode,
      preferredStatus: workspace.profile.preferredStatus ?? "Standard",
      complianceStatus: workspace.profile.complianceStatus ?? "Pending",
      capabilitySummary: workspace.profile.capabilitySummary ?? null,
      qualityRating: workspace.profile.qualityRating ?? null,
      procurementReleaseControl: workspace.profile.procurementReleaseControl ?? "Standard",
      leadTimeReviewDays: workspace.profile.leadTimeReviewDays ?? null,
      status: workspace.profile.status
    },
    contactPoints: workspace.contactPoints.map((contact) => ({
      id: contact.contactPointId || null,
      supplierAddressId: contact.addressId,
      contactName: contact.contactName,
      contactRole: contact.role,
      channel: contact.channel,
      contactValue: contact.detail,
      isPrimary: contact.isPrimary,
      consentStatus: contact.consentStatus,
      escalationLevel: contact.escalationLevel,
      status: contact.status
    })),
    vendorReferences: workspace.vendorReferences.map((reference) => ({
      id: reference.referenceId || null,
      itemId: reference.itemId,
      vendorItemCode: reference.vendorItemCode,
      minimumOrderQty: reference.minimumOrderQty,
      leadTimeDays: reference.leadTimeDays,
      purchaseUomId: reference.purchaseUomId,
      complianceStatus: reference.complianceStatus,
      documentStatus: reference.documentStatus,
      approvalStatus: reference.approvalStatus,
      status: reference.status
    })),
    documents: workspace.documents.map((document) => ({
      id: document.documentId || null,
      documentType: document.documentType,
      title: document.title,
      documentNo: document.documentNo || null,
      revisionCode: document.revisionCode || null,
      fileName: document.fileName || null,
      storageUri: document.storageUri || null,
      approvalStatus: document.approvalStatus,
      visibilityScope: document.visibilityScope,
      effectiveFrom: document.effectiveFrom || null,
      effectiveTo: document.effectiveTo || null,
      expiresOn: document.expiresOn || null,
      status: document.status
    }))
  };
}

async function listLiveUoms(filter: QueryFilter) {
  const response = await apiClient.measurements.uoms({ ...filter, pageSize: 100 });
  return response.items;
}

export async function listUomClassSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<UomClassSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededUomClasses, filter, (item) => `${item.code} ${item.name}`);
  }

  try {
    const [classes, uoms] = await Promise.all([
      apiClient.measurements.uomClasses(filter),
      listLiveUoms(filter)
    ]);
    return classes.items.map((item) => mapUomClass(item, uoms, "Live"));
  } catch {
    throw liveDataUnavailable("UOM class");
  }
}

export async function listUomConversionSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<UomConversionSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededUomConversions, filter, (item) => `${item.fromUom} ${item.toUom} ${item.conversionMode}`);
  }

  try {
    const [conversions, uoms] = await Promise.all([
      apiClient.measurements.uomConversions(filter),
      listLiveUoms(filter)
    ]);
    return conversions.items.map((item) => mapUomConversion(item, uoms, "Live"));
  } catch {
    throw liveDataUnavailable("UOM conversion");
  }
}

export async function listMeasurementProfileSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<MeasurementProfileSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededProfiles, filter, (item) => `${item.code} ${item.name} ${item.profileType}`);
  }

  try {
    const [profiles, classes] = await Promise.all([
      apiClient.measurements.profiles(filter),
      listUomClassSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined })
    ]);
    return profiles.items.map((item) => mapMeasurementProfile(item, classes, "Live"));
  } catch {
    throw liveDataUnavailable("Measurement profile");
  }
}

export async function listMeasurementFormulaSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<MeasurementFormulaSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededFormulas, filter, (item) => `${item.code} ${item.name} ${item.purpose}`);
  }

  try {
    const [formulas, uoms] = await Promise.all([
      apiClient.measurements.formulas(filter),
      listLiveUoms(filter)
    ]);
    return formulas.items.map((item) => mapMeasurementFormula(item, uoms, "Live"));
  } catch {
    throw liveDataUnavailable("Measurement formula");
  }
}

export async function listItemGroupSetup(filter: QueryFilter): Promise<ItemGroupSetupItem[]> {
  return filterSeeded(seededItemGroups, filter, (item) => `${item.code} ${item.name} ${item.reportingBucket}`);
}

export async function listItemAttributeSetup(filter: QueryFilter): Promise<ItemAttributeSetupItem[]> {
  return filterSeeded(seededItemAttributes, filter, (item) => `${item.code} ${item.name} ${item.sampleValues}`);
}

export async function listReasonCodeSetup(filter: QueryFilter): Promise<ReasonCodeSetupItem[]> {
  return filterSeeded(seededReasonCodes, filter, (item) => `${item.code} ${item.name} ${item.module} ${item.usage}`);
}

export async function listItemMasterSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<ItemMasterSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(
      seededItems,
      filter,
      (item) =>
        `${item.code} ${item.name} ${item.itemType} ${item.groupLabel} ${item.category} ${item.subCategory} ${item.defaultMakeType}`
    );
  }

  try {
    const [items, uoms, profiles] = await Promise.all([
      apiClient.masters.items(filter),
      listLiveUoms(filter),
      listMeasurementProfileSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined })
    ]);
    const mappedItems = items.items.map((item) => mapItem(item, uoms, profiles, "Live"));
    const profileResults = await Promise.allSettled(mappedItems.map((item) => apiClient.masters.itemProfile(item.itemId)));
    const profilesByItem = new Map<number, ItemMasterProfileDto>();

    profileResults.forEach((result) => {
      if (result.status === "fulfilled") {
        profilesByItem.set(result.value.itemId, result.value);
      }
    });

    return mappedItems.map((item) => applyLiveItemProfile(item, profilesByItem.get(item.itemId)));
  } catch {
    throw liveDataUnavailable("Item master");
  }
}

export async function listItemVariantSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<ItemVariantSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededVariants, filter, (item) => `${item.code} ${item.name} ${item.attributeSummary}`);
  }

  try {
    const [variants, items, uoms, profiles] = await Promise.all([
      apiClient.masters.itemVariants(filter),
      listItemMasterSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined }),
      listLiveUoms(filter),
      listMeasurementProfileSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined })
    ]);
    return variants.items.map((item) => mapItemVariant(item, items, uoms, profiles, "Live"));
  } catch {
    throw liveDataUnavailable("Item variant");
  }
}

export async function listBarcodeSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<BarcodeSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededBarcodes, filter, (item) => `${item.barcodeValue} ${item.itemLabel} ${item.scanPurpose}`);
  }

  try {
    const [barcodes, items, variants, uoms] = await Promise.all([
      apiClient.masters.itemBarcodes(filter),
      listItemMasterSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined }),
      listItemVariantSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined }),
      listLiveUoms(filter)
    ]);
    return barcodes.items.map((item) => mapBarcode(item, items, variants, uoms, "Live"));
  } catch {
    throw liveDataUnavailable("Barcode");
  }
}

export async function listCustomerSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<CustomerSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededCustomers, filter, (item) => `${item.code} ${item.name} ${item.customerType}`);
  }

  try {
    const response = await apiClient.partners.customers(filter);
    return response.items.map((item) => mapCustomer(item, "Live"));
  } catch {
    throw liveDataUnavailable("Customer");
  }
}

export async function listCustomerAddressSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<CustomerAddressSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededCustomerAddresses, filter, (item) => `${item.code} ${item.city} ${item.contactName}`);
  }

  try {
    const response = await apiClient.partners.customerAddresses({ ...filter, pageSize: 100 });
    return response.items.map((item) => mapCustomerAddress(item, "Live"));
  } catch {
    throw liveDataUnavailable("Customer address");
  }
}

export async function listSupplierSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<SupplierSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededSuppliers, filter, (item) => `${item.code} ${item.name} ${item.supplierType}`);
  }

  try {
    const response = await apiClient.partners.suppliers(filter);
    return response.items.map((item) => mapSupplier(item, "Live"));
  } catch {
    throw liveDataUnavailable("Supplier");
  }
}

export async function listSupplierAddressSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<SupplierAddressSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededSupplierAddresses, filter, (item) => `${item.code} ${item.city} ${item.contactName}`);
  }

  try {
    const response = await apiClient.partners.supplierAddresses({ ...filter, pageSize: 100 });
    return response.items.map((item) => mapSupplierAddress(item, "Live"));
  } catch {
    throw liveDataUnavailable("Supplier address");
  }
}

export async function listSupplierLeadTimeSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<SupplierLeadTimeSetupItem[]> {
  if (!hasLiveSession(session)) {
    return filterSeeded(seededSupplierLeadTimes, filter, (item) => `${item.itemLabel} ${item.leadTimeDays}`);
  }

  try {
    const [response, items] = await Promise.all([
      apiClient.partners.supplierLeadTimes({ ...filter, pageSize: 100 }),
      listItemMasterSetup(session, { ...filter, pageSize: 100, search: undefined, status: undefined })
    ]);
    return response.items.map((item) => mapSupplierLeadTime(item, items, "Live"));
  } catch {
    throw liveDataUnavailable("Supplier lead time");
  }
}
