import React from "react";
import { Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import type {
  AttachmentDto,
  AuthSessionResponse,
  ItemDto,
  ItemMasterProfileDto,
  ItemMasterProfileUpsertRequest,
  UomClassDto,
  UomDto,
  MeasurementProfileDto
} from "../../../src/web/src/api/contracts";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import { ItemListPage } from "../../../src/web/src/pages/ItemMasterPages";
import { renderWithApp } from "../../../src/web/src/test/render";

export function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: Math.max(items.length, 1),
    totalCount: items.length,
    totalPages: items.length > 0 ? 1 : 0
  };
}

export function buildLiveItemSession(): AuthSessionResponse {
  return {
    ...buildDemoSession(),
    accessToken: "live-item-pack-token",
    refreshToken: "live-item-pack-refresh"
  };
}

export function renderItemMaster(session: AuthSessionResponse | null = buildDemoSession()) {
  return renderWithApp(
    <Routes>
      <Route path="/masters/items" element={<ItemListPage />} />
    </Routes>,
    { route: "/masters/items", session }
  );
}

export const itemUoms: UomDto[] = [
  { id: 1, uomCode: "PCS", uomName: "Pieces", symbol: "pcs", uomClassId: 1, decimalPrecision: 0, isSystemBase: true, status: "Active" },
  { id: 2, uomCode: "KG", uomName: "Kilogram", symbol: "kg", uomClassId: 2, decimalPrecision: 3, isSystemBase: true, status: "Active" },
  { id: 3, uomCode: "BOX", uomName: "Box", symbol: "box", uomClassId: 1, decimalPrecision: 0, isSystemBase: false, status: "Active" }
];

export const itemUomClasses: UomClassDto[] = [
  { id: 1, classCode: "COUNT", className: "Count", baseUomId: 1, supportsFormulaConversion: false, status: "Active" },
  { id: 2, classCode: "WEIGHT", className: "Weight", baseUomId: 2, supportsFormulaConversion: false, status: "Active" }
];

export const itemMeasurementProfiles: MeasurementProfileDto[] = [
  {
    id: 1,
    profileCode: "STD-COUNT",
    profileName: "Standard Count",
    profileType: "CountOnly",
    stockUomClassId: 1,
    allowsCatchWeight: false,
    requiresDimensions: false,
    requiresDensity: false,
    requiresThickness: false,
    requiresPackSize: true,
    supportsCommercialProductionSplit: false,
    status: "Active"
  }
];

export function buildItemDto(overrides: Partial<ItemDto> = {}): ItemDto {
  return {
    id: 10002,
    companyId: 1,
    itemCode: "FG-BRACKET-001",
    itemName: "Fabricated Mounting Bracket",
    shortName: "Mounting Bracket",
    itemType: "FinishedGood",
    itemGroupId: 2,
    measurementProfileId: 1,
    stockUomId: 1,
    purchaseUomId: 2,
    salesUomId: 1,
    productionUomId: 1,
    qcUomId: 1,
    traceabilityMode: "Lot",
    isCatchWeightItem: false,
    isQcRequired: true,
    isBatchExpiryTracked: false,
    defaultIssueMethod: "Manual",
    defaultMakeType: "Make",
    defaultWarehouseId: null,
    defaultBinId: null,
    leadTimeDays: 5,
    reorderPolicy: "MRP",
    status: "Active",
    ...overrides
  };
}

export function buildItemProfile(overrides: Partial<ItemMasterProfileDto> = {}): ItemMasterProfileDto {
  return {
    itemId: 10002,
    aliases: [{ aliasType: "Search", aliasValue: "Mounting Bracket", id: 1, companyId: 1, itemId: 10002, isPrimary: true, languageCode: null, status: "Active" }],
    media: [],
    documents: [],
    catalog: {
      id: 11,
      companyId: 1,
      itemId: 10002,
      catalogTitle: "Fabricated Mounting Bracket",
      catalogSection: "Fabricated components",
      marketingDescription: "Mounting bracket for customer order release.",
      customerVisibleSpecsJson: "{\"material\":\"MS\"}",
      publishStatus: "Ready for review",
      isCatalogVisible: true,
      effectiveFrom: "2026-04-01",
      effectiveTo: "2026-12-31",
      previewSlug: "fabricated-mounting-bracket",
      status: "Active"
    },
    packaging: {
      id: 12,
      companyId: 1,
      itemId: 10002,
      packagingUomId: 1,
      innerPackQty: 10,
      cartonQty: 50,
      palletQty: 1000,
      netWeight: 1.2,
      grossWeight: 1.32,
      weightUomId: 2,
      lengthValue: 180,
      widthValue: 95,
      heightValue: 42,
      dimensionUomId: null,
      labelCount: 2,
      packingInstructions: "Apply item and customer reference labels.",
      status: "Active"
    },
    physicalSpecs: {
      id: 13,
      companyId: 1,
      itemId: 10002,
      lengthValue: 180,
      widthValue: 95,
      heightValue: 42,
      thicknessValue: 6,
      dimensionUomId: null,
      grade: "MS E250",
      material: "Mild steel",
      colorFinish: "Powder coated black",
      shelfLifeDays: null,
      storageCondition: "Covered FG rack",
      toleranceNote: null,
      status: "Active"
    },
    customerReferences: [],
    vendorReferences: [],
    manufacturingPolicy: {
      id: 14,
      companyId: 1,
      itemId: 10002,
      bomPolicy: "Released BOM required",
      routingPolicy: "Released routing required",
      issueMethod: "Manual",
      scrapAllowancePercent: 1.5,
      operationLinkage: "Routing operation",
      status: "Active"
    },
    planningPolicy: {
      id: 15,
      companyId: 1,
      itemId: 10002,
      mrpEnabled: true,
      safetyStockQty: 10,
      reorderPointQty: 25,
      minimumQty: 20,
      maximumQty: 200,
      leadTimeDays: 5,
      lotSizeQty: 50,
      abcClass: "A",
      status: "Active"
    },
    inventoryPolicy: {
      id: 16,
      companyId: 1,
      itemId: 10002,
      defaultWarehouseId: null,
      defaultBinId: null,
      serialTrackingMode: "No",
      lotTrackingMode: "Yes",
      isCatchWeightItem: false,
      negativeStockPolicy: "Blocked",
      expiryPolicy: "Not required",
      shelfLifeDays: null,
      status: "Active"
    },
    qualityPolicy: {
      id: 17,
      companyId: 1,
      itemId: 10002,
      qcRequired: true,
      inspectionPlanId: null,
      inspectionPlanCode: "QAP-FG-BR-001",
      certificateRequirement: "Certificate of conformity",
      holdRule: "Hold until accepted",
      traceabilityDepth: "Lot level",
      status: "Active"
    },
    ...overrides
  };
}

function profileFromRequest(itemId: number, request: ItemMasterProfileUpsertRequest): ItemMasterProfileDto {
  const existing = buildItemProfile({ itemId });
  return {
    ...existing,
    aliases: request.aliases.map((alias, index) => ({
      id: index + 1,
      companyId: 1,
      itemId,
      aliasType: alias.aliasType,
      aliasValue: alias.aliasValue,
      languageCode: alias.languageCode,
      isPrimary: alias.isPrimary,
      status: alias.status
    })),
    catalog: {
      ...existing.catalog!,
      catalogTitle: request.catalog.catalogTitle,
      catalogSection: request.catalog.catalogSection,
      marketingDescription: request.catalog.marketingDescription,
      customerVisibleSpecsJson: request.catalog.customerVisibleSpecsJson,
      publishStatus: request.catalog.publishStatus,
      isCatalogVisible: request.catalog.isCatalogVisible,
      effectiveFrom: request.catalog.effectiveFrom,
      effectiveTo: request.catalog.effectiveTo,
      previewSlug: request.catalog.previewSlug,
      status: request.catalog.status
    },
    packaging: {
      ...existing.packaging!,
      packagingUomId: request.packaging.packagingUomId,
      innerPackQty: request.packaging.innerPackQty,
      cartonQty: request.packaging.cartonQty,
      palletQty: request.packaging.palletQty,
      netWeight: request.packaging.netWeight,
      grossWeight: request.packaging.grossWeight,
      weightUomId: request.packaging.weightUomId,
      lengthValue: request.packaging.lengthValue,
      widthValue: request.packaging.widthValue,
      heightValue: request.packaging.heightValue,
      dimensionUomId: request.packaging.dimensionUomId,
      labelCount: request.packaging.labelCount,
      packingInstructions: request.packaging.packingInstructions,
      status: request.packaging.status
    },
    physicalSpecs: {
      ...existing.physicalSpecs!,
      lengthValue: request.physicalSpecs.lengthValue,
      widthValue: request.physicalSpecs.widthValue,
      heightValue: request.physicalSpecs.heightValue,
      thicknessValue: request.physicalSpecs.thicknessValue,
      dimensionUomId: request.physicalSpecs.dimensionUomId,
      grade: request.physicalSpecs.grade,
      material: request.physicalSpecs.material,
      colorFinish: request.physicalSpecs.colorFinish,
      shelfLifeDays: request.physicalSpecs.shelfLifeDays,
      storageCondition: request.physicalSpecs.storageCondition,
      toleranceNote: request.physicalSpecs.toleranceNote,
      status: request.physicalSpecs.status
    },
    manufacturingPolicy: { ...existing.manufacturingPolicy!, ...request.manufacturingPolicy },
    planningPolicy: { ...existing.planningPolicy!, ...request.planningPolicy },
    inventoryPolicy: { ...existing.inventoryPolicy!, ...request.inventoryPolicy },
    qualityPolicy: { ...existing.qualityPolicy!, ...request.qualityPolicy },
    customerReferences: [],
    vendorReferences: []
  };
}

export function mockLiveItemMasterApi(initialAttachments: AttachmentDto[] = []) {
  let item = buildItemDto();
  let profile = buildItemProfile();
  let attachments = [...initialAttachments];

  vi.spyOn(apiClient.notifications, "list").mockResolvedValue([]);
  vi.spyOn(apiClient.masters, "items").mockImplementation(async () => paged([item]));
  vi.spyOn(apiClient.measurements, "uoms").mockResolvedValue(paged(itemUoms));
  vi.spyOn(apiClient.measurements, "uomClasses").mockResolvedValue(paged(itemUomClasses));
  vi.spyOn(apiClient.measurements, "profiles").mockResolvedValue(paged(itemMeasurementProfiles));
  vi.spyOn(apiClient.masters, "itemProfile").mockImplementation(async () => profile);
  vi.spyOn(apiClient.platform, "attachments").mockImplementation(async () => paged(attachments));
  vi.spyOn(apiClient.masters, "createItem").mockImplementation(async (request) => {
    item = buildItemDto({
      id: 20001,
      itemCode: request.itemCode,
      itemName: request.itemName,
      shortName: request.shortName,
      itemType: request.itemType,
      itemGroupId: request.itemGroupId,
      measurementProfileId: request.measurementProfileId,
      stockUomId: request.stockUomId,
      purchaseUomId: request.purchaseUomId,
      salesUomId: request.salesUomId,
      productionUomId: request.productionUomId,
      qcUomId: request.qcUomId,
      traceabilityMode: request.traceabilityMode,
      isCatchWeightItem: request.isCatchWeightItem,
      isQcRequired: request.isQcRequired,
      isBatchExpiryTracked: request.isBatchExpiryTracked,
      defaultIssueMethod: request.defaultIssueMethod,
      defaultMakeType: request.defaultMakeType,
      defaultWarehouseId: request.defaultWarehouseId,
      defaultBinId: request.defaultBinId,
      leadTimeDays: request.leadTimeDays,
      reorderPolicy: request.reorderPolicy,
      status: request.status
    });
    profile = buildItemProfile({ itemId: item.id });
    return item;
  });
  vi.spyOn(apiClient.masters, "updateItem").mockImplementation(async (_itemId, request) => {
    item = { ...item, ...request, id: item.id, itemCode: request.itemCode, itemName: request.itemName };
    return item;
  });
  const updateProfile = vi.spyOn(apiClient.masters, "updateItemProfile").mockImplementation(async (itemId, request) => {
    profile = profileFromRequest(itemId, request);
    return profile;
  });
  const uploadAttachment = vi.spyOn(apiClient.platform, "uploadAttachment").mockImplementation(async (request) => {
    const attachment: AttachmentDto = {
      id: 7000 + attachments.length,
      companyId: request.companyId ?? 1,
      branchId: request.branchId ?? 10,
      relatedDocumentType: request.relatedDocumentType,
      relatedDocumentId: request.relatedDocumentId,
      fileName: request.file.name,
      contentType: request.file.type || "application/octet-stream",
      fileSizeBytes: request.file.size,
      uploadedByUserId: 1,
      createdOn: "2026-05-14T00:00:00Z",
      status: "Linked"
    };
    attachments = [...attachments, attachment];
    return attachment;
  });

  return {
    get item() {
      return item;
    },
    get profile() {
      return profile;
    },
    get attachments() {
      return attachments;
    },
    updateProfile,
    uploadAttachment
  };
}
