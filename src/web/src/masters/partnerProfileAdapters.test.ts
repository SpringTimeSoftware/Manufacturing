import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSessionResponse } from "../api/contracts";
import { apiClient } from "../api/http";
import {
  updateCustomerPartnerWorkspace,
  updateSupplierPartnerWorkspace,
  type CustomerPartnerWorkspaceSetup,
  type SupplierPartnerWorkspaceSetup
} from "./masterDataAdapters";

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
      branchId: 1,
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("partner profile adapters", () => {
  it("saves customer profile, contact point, document metadata, and returns audit history", async () => {
    const workspace: CustomerPartnerWorkspaceSetup = {
      profile: {
        legalName: "Acme Industries",
        taxCategory: "Registered GST",
        currencyCode: "INR",
        creditStatus: "Clear",
        creditLimitAmount: 100000,
        creditHoldRule: "Standard release",
        paymentTermsCode: "NET30",
        commercialSegment: "Strategic",
        orderReleaseControl: "Standard",
        dispatchPreference: "Standard dispatch",
        dispatchInstruction: "Use dock appointment",
        catalogVisible: true,
        catalogSegment: "Strategic catalog",
        status: "Active"
      },
      contactPoints: [
        {
          id: "contact-draft",
          contactPointId: 0,
          addressId: 12,
          contactName: "Rita Shah",
          role: "Commercial",
          channel: "Email",
          detail: "rita@example.test",
          isPrimary: true,
          consentStatus: "Business communication",
          escalationLevel: "Primary",
          status: "Active"
        }
      ],
      itemReferences: [],
      documents: [
        {
          id: "doc-draft",
          documentId: 0,
          documentType: "Commercial",
          title: "Customer GST certificate",
          documentNo: "GST-1",
          revisionCode: "A",
          fileName: "",
          storageUri: "",
          approvalStatus: "Draft",
          visibilityScope: "Internal",
          effectiveFrom: "",
          effectiveTo: "",
          expiresOn: "",
          status: "Draft"
        }
      ],
      auditEvents: [],
      source: "Live"
    };
    const updateSpy = vi.spyOn(apiClient.partners, "updateCustomerProfile").mockResolvedValue({
      profile: { id: 1, companyId: 1, customerId: 44, ...workspace.profile },
      contactPoints: [
        {
          id: 2,
          companyId: 1,
          customerId: 44,
          customerAddressId: 12,
          contactName: "Rita Shah",
          contactRole: "Commercial",
          channel: "Email",
          contactValue: "rita@example.test",
          isPrimary: true,
          consentStatus: "Business communication",
          escalationLevel: "Primary",
          status: "Active"
        }
      ],
      itemReferences: [],
      documents: [
        {
          id: 3,
          companyId: 1,
          customerId: 44,
          documentType: "Commercial",
          title: "Customer GST certificate",
          documentNo: "GST-1",
          revisionCode: "A",
          fileName: null,
          storageUri: null,
          approvalStatus: "Draft",
          visibilityScope: "Internal",
          effectiveFrom: null,
          effectiveTo: null,
          expiresOn: null,
          status: "Draft"
        }
      ],
      auditEvents: [{ id: 4, entityType: "CustomerPartnerProfile", actionCode: "customerprofile.update", actor: "User 1", occurredOn: "2026-04-23T12:00:00Z", outcome: "Recorded" }]
    } as any);

    const saved = await updateCustomerPartnerWorkspace(liveSession, 44, workspace);

    expect(updateSpy).toHaveBeenCalledWith(
      44,
      expect.objectContaining({
        contactPoints: [expect.objectContaining({ contactRole: "Commercial", contactValue: "rita@example.test" })],
        documents: [expect.objectContaining({ documentType: "Commercial", title: "Customer GST certificate" })]
      })
    );
    expect(saved.contactPoints[0].contactPointId).toBe(2);
    expect(saved.auditEvents[0].event).toBe("customerprofile.update");
  });

  it("saves supplier profile, contact point, vendor reference, document metadata, and returns audit history", async () => {
    const workspace: SupplierPartnerWorkspaceSetup = {
      profile: {
        legalName: "Inox Metals",
        taxCategory: "Registered GST",
        currencyCode: "INR",
        paymentTermsCode: "NET15",
        preferredStatus: "Preferred",
        complianceStatus: "Approved",
        capabilitySummary: "Material supplier",
        qualityRating: 96,
        procurementReleaseControl: "Standard",
        leadTimeReviewDays: 90,
        status: "Active"
      },
      contactPoints: [
        {
          id: "supplier-contact-draft",
          contactPointId: 0,
          addressId: 22,
          contactName: "Priya Menon",
          role: "Commercial",
          channel: "Email",
          detail: "priya@example.test",
          isPrimary: true,
          consentStatus: "Business communication",
          escalationLevel: "Primary",
          status: "Active"
        }
      ],
      vendorReferences: [
        {
          id: "vendor-ref-draft",
          referenceId: 0,
          itemId: 10003,
          vendorItemCode: "INOX-SS304",
          minimumOrderQty: 500,
          leadTimeDays: 9,
          purchaseUomId: null,
          complianceStatus: "Ready",
          documentStatus: "Ready",
          approvalStatus: "Approved",
          status: "Active"
        }
      ],
      documents: [],
      auditEvents: [],
      source: "Live"
    };
    const updateSpy = vi.spyOn(apiClient.partners, "updateSupplierProfile").mockResolvedValue({
      profile: { id: 8, companyId: 1, supplierId: 55, ...workspace.profile },
      contactPoints: [
        {
          id: 9,
          companyId: 1,
          supplierId: 55,
          supplierAddressId: 22,
          contactName: "Priya Menon",
          contactRole: "Commercial",
          channel: "Email",
          contactValue: "priya@example.test",
          isPrimary: true,
          consentStatus: "Business communication",
          escalationLevel: "Primary",
          status: "Active"
        }
      ],
      vendorReferences: [
        {
          id: 10,
          companyId: 1,
          supplierId: 55,
          itemId: 10003,
          vendorItemCode: "INOX-SS304",
          minimumOrderQty: 500,
          leadTimeDays: 9,
          purchaseUomId: null,
          complianceStatus: "Ready",
          documentStatus: "Ready",
          approvalStatus: "Approved",
          status: "Active"
        }
      ],
      documents: [],
      auditEvents: [{ id: 11, entityType: "SupplierPartnerProfile", actionCode: "supplierprofile.update", actor: "User 1", occurredOn: "2026-04-23T12:00:00Z", outcome: "Recorded" }]
    } as any);

    const saved = await updateSupplierPartnerWorkspace(liveSession, 55, workspace);

    expect(updateSpy).toHaveBeenCalledWith(
      55,
      expect.objectContaining({
        contactPoints: [expect.objectContaining({ contactRole: "Commercial", contactValue: "priya@example.test" })],
        vendorReferences: [expect.objectContaining({ vendorItemCode: "INOX-SS304", leadTimeDays: 9 })]
      })
    );
    expect(saved.vendorReferences[0].referenceId).toBe(10);
    expect(saved.auditEvents[0].event).toBe("supplierprofile.update");
  });
});
