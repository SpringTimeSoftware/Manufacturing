import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSessionResponse, PriceListUpsertRequest, DiscountSchemeUpsertRequest } from "../api/contracts";
import { apiClient } from "../api/http";
import { saveDiscountScheme, savePriceList } from "./commercialMasterAdapters";

const liveSession: AuthSessionResponse = {
  accessToken: "live-token",
  refreshToken: "refresh-token",
  accessTokenExpiresOnUtc: "2026-04-23T12:00:00Z",
  user: {
    userId: 1,
    userName: "platform.admin",
    displayName: "Platform Admin",
    email: "platform.admin@example.test",
    languageCode: "en",
    activeContext: {
      companyId: 1,
      branchId: 10,
      companyCode: "STS",
      companyName: "STS Manufacturing",
      branchCode: "PLANT",
      branchName: "Plant"
    },
    availableContexts: [],
    roles: ["PlatformAdmin"],
    scope: {
      hasDeploymentAccess: true,
      visibilityMode: "Company",
      allowedWarehouseIds: [],
      allowedDepartmentIds: [],
      teamUserIds: []
    }
  }
};

const priceListRequest: PriceListUpsertRequest = {
  companyId: 1,
  priceListCode: "STD-INR-2026",
  priceListName: "Standard INR",
  currencyId: 7001,
  priceListType: "Standard Sales",
  effectiveFrom: "2026-04-23",
  effectiveTo: null,
  customerSegment: "Domestic",
  approvalStatus: "Draft",
  status: "Draft",
  lines: [
    {
      lineNo: 10,
      itemId: 10002,
      itemGroupId: null,
      uomId: 1,
      minQuantity: 1,
      unitPrice: 875,
      discountEligible: true,
      taxCategoryId: 7101,
      effectiveFrom: "2026-04-23",
      effectiveTo: null,
      status: "Draft"
    }
  ],
  assignments: [
    {
      customerId: 20001,
      customerGroupCode: null,
      itemGroupId: null,
      branchId: 10,
      priorityRank: 10,
      effectiveFrom: "2026-04-23",
      effectiveTo: null,
      status: "Draft"
    }
  ]
};

const discountRequest: DiscountSchemeUpsertRequest = {
  companyId: 1,
  schemeCode: "VOL-STD",
  schemeName: "Volume standard",
  discountType: "Quantity Break",
  currencyId: 7001,
  effectiveFrom: "2026-04-23",
  effectiveTo: null,
  requiresApproval: true,
  approvalStatus: "Draft",
  status: "Draft",
  rules: [
    {
      ruleNo: 10,
      ruleName: "Volume break",
      applicabilityType: "Item",
      customerId: null,
      customerGroupCode: null,
      itemId: 10002,
      itemGroupId: null,
      minQuantity: 25,
      discountPercent: 3,
      discountAmount: null,
      priceListId: 7501,
      status: "Draft"
    }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("commercial master adapters", () => {
  it("routes price list create and update to the commercial API", async () => {
    const createSpy = vi.spyOn(apiClient.commercial, "createPriceList").mockResolvedValue({
      ...priceListRequest,
      id: 1,
      currencyCode: "INR",
      lines: [],
      assignments: []
    });
    const updateSpy = vi.spyOn(apiClient.commercial, "updatePriceList").mockResolvedValue({
      ...priceListRequest,
      id: 9,
      currencyCode: "INR",
      lines: [],
      assignments: []
    });

    await savePriceList(liveSession, null, priceListRequest);
    await savePriceList(liveSession, 9, priceListRequest);

    expect(createSpy).toHaveBeenCalledWith(priceListRequest);
    expect(updateSpy).toHaveBeenCalledWith(9, priceListRequest);
  });

  it("routes discount scheme create and blocks non-live save attempts", async () => {
    const createSpy = vi.spyOn(apiClient.commercial, "createDiscountScheme").mockResolvedValue({
      ...discountRequest,
      id: 2,
      currencyCode: "INR",
      rules: []
    });

    await saveDiscountScheme(liveSession, null, discountRequest);

    expect(createSpy).toHaveBeenCalledWith(discountRequest);
    await expect(saveDiscountScheme({ ...liveSession, accessToken: "demo-access-token" }, null, discountRequest)).rejects.toThrow(
      "Live workspace sign-in is required before saving discount schemes."
    );
  });
});
