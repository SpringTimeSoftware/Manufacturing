import { screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { renderWithApp } from "../test/render";
import {
  ServiceChargesPage,
  ServiceDashboardPage,
  ServiceSpareMovementsPage,
  ServiceTicketsPage
} from "./ServiceWarrantyAmcPages";

const page = <T,>(items: T[]) => ({
  items,
  page: 1,
  pageSize: 25,
  totalCount: items.length,
  totalPages: 1
});

describe("ServiceWarrantyAmcPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders persisted service dashboard counters and truthful disabled boundaries", async () => {
    vi.spyOn(apiClient.service, "dashboard").mockResolvedValue({
      activeContracts: 2,
      disabledActionReasons: ["Customer credit note/refund from warranty claim is disabled until finance return path is configured."],
      invoiceReadyCharges: 1,
      openTickets: 4,
      waitingForParts: 1,
      warrantyClaimsPending: 3
    });

    renderWithApp(<Routes><Route element={<ServiceDashboardPage />} path="/service/dashboard" /></Routes>, { route: "/service/dashboard" });

    expect(await screen.findByText("Service Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Open tickets")).toBeInTheDocument();
    expect(await screen.findByText("Customer credit note/refund from warranty claim is disabled until finance return path is configured.")).toBeInTheDocument();
  });

  it("renders service tickets with entitlement, live-source fields, and disabled demo action reasons", async () => {
    vi.spyOn(apiClient.service, "tickets").mockResolvedValue(page([
      {
        assetSnapshotJson: "{}",
        assignedOwnerUserId: 77,
        assignedTeamId: null,
        branchId: 10,
        channel: "Phone",
        closedByUserId: null,
        closedOn: null,
        closureReason: null,
        companyId: 1,
        contactId: null,
        customerFacingRemarks: "Technician will visit.",
        customerId: 501,
        entitlementCheckedOn: "2026-05-18",
        entitlementContractId: null,
        entitlementPolicyId: 801,
        entitlementSnapshotJson: "{}",
        entitlementSource: "Active warranty policy",
        entitlementType: "Warranty",
        id: 1001,
        installedAssetId: 7001,
        internalRemarks: "Internal note",
        issueCategory: "Breakdown",
        issueDescription: "Machine stopped.",
        itemId: 3001,
        priority: "High",
        reopenReason: null,
        serialNo: "SER-001",
        severity: "Major",
        sourceDispatchId: 9101,
        sourceIntegrationMessageId: null,
        sourceInvoiceId: 9201,
        sourceSalesOrderId: 9001,
        status: "Assigned",
        targetResolutionOn: null,
        targetResponseOn: null,
        ticketNo: "SVC-001"
      }
    ]));

    renderWithApp(<Routes><Route element={<ServiceTicketsPage />} path="/service/tickets" /></Routes>, { route: "/service/tickets" });

    expect(await screen.findByText("Service Tickets")).toBeInTheDocument();
    expect(await screen.findByText("SVC-001")).toBeInTheDocument();
    expect(screen.getByText("Warranty")).toBeInTheDocument();
    expect(screen.getAllByText("Live company sign-in is required for service actions.").length).toBeGreaterThan(0);
  });

  it("renders service spare movement as a compact tracking grid backed by posted inventory transaction", async () => {
    vi.spyOn(apiClient.service, "spares").mockResolvedValue(page([
      {
        binId: 22,
        branchId: 10,
        companyId: 1,
        defectiveInstalledAssetId: null,
        id: 501,
        inventoryState: "Available",
        itemId: 3001,
        itemRevisionId: 601,
        lotId: 33,
        movementNo: "SSI-001",
        movementType: "Issue",
        pcidId: 44,
        quantity: 2,
        reasonCode: "Replace",
        remarks: "Issued to technician",
        replacementInstalledAssetId: null,
        serialId: null,
        serialNo: null,
        serviceTicketId: 1001,
        serviceVisitId: null,
        status: "Posted",
        stockTransactionId: 88001,
        warehouseId: 11
      }
    ]));

    renderWithApp(<Routes><Route element={<ServiceSpareMovementsPage />} path="/service/spares" /></Routes>, { route: "/service/spares" });

    expect(await screen.findByText("Spare Issue / Return")).toBeInTheDocument();
    const table = await screen.findByRole("table", { name: "Service spare movements" });
    expect(within(table).getByText("SSI-001")).toBeInTheDocument();
    expect(within(table).getByText(/Txn 88001/)).toBeInTheDocument();
    expect(within(table).queryByText(/First line/i)).not.toBeInTheDocument();
  });

  it("renders service charges with persisted tax and invoice-ready snapshot status", async () => {
    vi.spyOn(apiClient.service, "charges").mockResolvedValue(page([
      {
        arInvoiceId: null,
        billableStatus: "Billable",
        branchId: 10,
        chargeNo: "SCH-001",
        companyId: 1,
        currencyId: null,
        customerId: 501,
        discountAmount: 0,
        id: 4001,
        laborAmount: 100,
        nonBillableReason: null,
        otherAmount: 0,
        partsAmount: 25,
        serviceTicketId: 1001,
        snapshotJson: "{}",
        status: "InvoiceReady",
        taxAmount: 22.5,
        taxCodeId: null,
        taxRateSnapshot: 18,
        totalAmount: 147.5,
        travelAmount: 0
      }
    ]));

    renderWithApp(<Routes><Route element={<ServiceChargesPage />} path="/service/charges" /></Routes>, { route: "/service/charges" });

    expect(await screen.findByText("Service Charges / Invoicing")).toBeInTheDocument();
    expect(await screen.findByText("SCH-001")).toBeInTheDocument();
    expect(screen.getAllByText("InvoiceReady").length).toBeGreaterThan(0);
    expect(screen.getByText("INR 147.50")).toBeInTheDocument();
  });
});
