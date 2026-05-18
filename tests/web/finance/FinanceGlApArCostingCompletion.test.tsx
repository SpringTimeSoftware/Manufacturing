import React from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  ArInvoiceDto,
  AuthSessionResponse,
  ChartOfAccountDto,
  FiscalPeriodDto,
  JournalDto,
  PostingProfileDto,
  TaxLedgerEntryDto,
  InventoryValuationEntryDto
} from "../../../src/web/src/api/contracts";
import { apiClient } from "../../../src/web/src/api/http";
import { buildDemoSession } from "../../../src/web/src/auth/AuthContext";
import {
  ArInvoicesPage,
  ChartOfAccountsPage,
  FinanceDeferredActionsPage,
  GlJournalsPage,
  PostingProfilesPage
} from "../../../src/web/src/pages/FinancePages";
import { renderWithApp } from "../../../src/web/src/test/render";

function paged<TItem>(items: TItem[]) {
  return {
    items,
    page: 1,
    pageSize: Math.max(items.length, 1),
    totalCount: items.length,
    totalPages: items.length > 0 ? 1 : 0
  };
}

function liveSession(): AuthSessionResponse {
  return {
    ...buildDemoSession(),
    accessToken: "live-finance-token",
    refreshToken: "live-finance-refresh"
  };
}

const accounts: ChartOfAccountDto[] = [
  { id: 11, companyId: 1, accountCode: "1200-AR", accountName: "Accounts Receivable", accountClass: "Asset", parentAccountId: null, normalBalance: "Debit", isActive: true, isPostingAllowed: true, status: "Active" },
  { id: 12, companyId: 1, accountCode: "2100-AP", accountName: "Accounts Payable", accountClass: "Liability", parentAccountId: null, normalBalance: "Credit", isActive: true, isPostingAllowed: true, status: "Active" },
  { id: 13, companyId: 1, accountCode: "4100-SALES", accountName: "Sales Revenue", accountClass: "Revenue", parentAccountId: null, normalBalance: "Credit", isActive: true, isPostingAllowed: true, status: "Active" }
];

const arInvoice: ArInvoiceDto = {
  id: 501,
  companyId: 1,
  branchId: 10,
  invoiceNo: "AR-SHP-001",
  customerId: 200,
  salesOrderId: 300,
  shipmentId: 400,
  sourceDocumentNo: "SHP-0001",
  invoiceDate: "2026-05-17",
  dueDate: "2026-06-16",
  currencyCode: "INR",
  exchangeRateSnapshot: 1,
  subtotalAmount: 252,
  discountTotalAmount: 12,
  taxableAmount: 252,
  taxTotalAmount: 45.36,
  freightAmount: 10,
  packingAmount: 5,
  insuranceAmount: 3,
  otherChargesAmount: 2,
  addLessAmount: 0,
  roundOffAmount: 20,
  grandTotalAmount: 337.36,
  status: "Draft",
  arStatus: "Not Posted",
  lines: [
    { id: 1, lineNo: 10, salesOrderLineId: 301, shipmentLineId: 401, itemId: 1002, itemRevisionId: 501, invoiceQuantity: 2, uomId: 1, unitPrice: 120, discountAmount: 12, taxCodeId: 9001, taxRateSnapshot: 18, taxAmount: 45.36, lineSubtotal: 252, lineTaxableAmount: 252, lineTotalAmount: 297.36 }
  ]
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Finance GL AP AR costing completion UI", () => {
  it("saves chart of accounts through governed selectors", async () => {
    vi.spyOn(apiClient.finance, "chartOfAccounts").mockResolvedValue(paged(accounts));
    const create = vi.spyOn(apiClient.finance, "createChartOfAccount").mockImplementation(async (body) => ({ id: 99, ...body }));

    renderWithApp(<ChartOfAccountsPage />, { session: liveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "New Account" }));
    fireEvent.change(screen.getByLabelText("Account code"), { target: { value: "5100-COGS" } });
    fireEvent.change(screen.getByLabelText("Account name"), { target: { value: "Cost of Goods Sold" } });
    fireEvent.change(screen.getByLabelText("Account class"), { target: { value: "Expense" } });
    fireEvent.change(screen.getByLabelText("Normal balance"), { target: { value: "Debit" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Account" }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0]).toEqual(expect.objectContaining({ accountCode: "5100-COGS", accountClass: "Expense", normalBalance: "Debit" }));
  });

  it("saves posting profiles with governed debit and credit accounts", async () => {
    vi.spyOn(apiClient.finance, "chartOfAccounts").mockResolvedValue(paged(accounts));
    vi.spyOn(apiClient.finance, "postingProfiles").mockResolvedValue(paged<PostingProfileDto>([]));
    const create = vi.spyOn(apiClient.finance, "createPostingProfile").mockImplementation(async (body) => ({ id: 90, debitAccountCode: "1200-AR", creditAccountCode: "4100-SALES", effectiveTo: null, ...body }));

    renderWithApp(<PostingProfilesPage />, { session: liveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "New Posting Profile" }));
    fireEvent.change(screen.getByLabelText("Profile code"), { target: { value: "AR revenue" } });
    fireEvent.change(screen.getByLabelText("Posting key"), { target: { value: "AR_INVOICE_REVENUE" } });
    fireEvent.change(screen.getByLabelText("Debit account"), { target: { value: "11" } });
    fireEvent.change(screen.getByLabelText("Credit account"), { target: { value: "13" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Profile" }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0]).toEqual(expect.objectContaining({ postingKey: "AR_INVOICE_REVENUE", debitAccountId: 11, creditAccountId: 13 }));
  });

  it("requires balanced journal line grid before save and then calls the live journal API", async () => {
    vi.spyOn(apiClient.finance, "chartOfAccounts").mockResolvedValue(paged(accounts));
    vi.spyOn(apiClient.finance, "journals").mockResolvedValue(paged<JournalDto>([]));
    const create = vi.spyOn(apiClient.finance, "createJournal").mockImplementation(async (body) => ({
      id: 77,
      postedAt: null,
      postedByUserId: null,
      reversalJournalId: null,
      lines: [],
      ...body,
      branchId: body.branchId ?? null,
      sourceDocumentId: body.sourceDocumentId ?? null,
      sourceDocumentNo: body.sourceDocumentNo ?? null,
      remarks: body.remarks ?? null
    }));

    renderWithApp(<GlJournalsPage />, { session: liveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "New Journal" }));
    const grid = await screen.findByTestId("finance-journal-line-grid");
    expect(grid).toHaveAttribute("data-line-entry-pattern", "compact-grid");
    fireEvent.change(screen.getByLabelText("Line 10 account"), { target: { value: "11" } });
    fireEvent.change(screen.getByLabelText("Line 20 account"), { target: { value: "13" } });
    fireEvent.change(screen.getByLabelText("Line 10 debit"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Line 20 credit"), { target: { value: "90" } });
    expect(screen.getByRole("button", { name: "Save Journal" })).toBeDisabled();
    expect(screen.getAllByText("Journal debit and credit totals must balance before save/post.").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Line 20 credit"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Journal" }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0]).toEqual(expect.objectContaining({ lines: expect.arrayContaining([expect.objectContaining({ accountId: 11, debitAmount: 100 }), expect.objectContaining({ accountId: 13, creditAmount: 100 })]) }));
  });

  it("creates AR invoice from shipment and shows copied commercial snapshot", async () => {
    vi.spyOn(apiClient.finance, "arInvoices").mockResolvedValue(paged<ArInvoiceDto>([]));
    const create = vi.spyOn(apiClient.finance, "createArInvoiceFromShipment").mockResolvedValue(arInvoice);
    vi.spyOn(apiClient.finance, "postArInvoice").mockResolvedValue({
      invoice: { ...arInvoice, arStatus: "Posted", status: "Posted" },
      receivable: { id: 1, companyId: 1, branchId: 10, entryNo: "AR-1", arInvoiceId: arInvoice.id, customerId: arInvoice.customerId, postingDate: "2026-05-17", dueDate: "2026-06-16", receivableAmount: 337.36, receivedAmount: 0, balanceAmount: 337.36, status: "Open" },
      journal: { id: 1, companyId: 1, branchId: 10, journalNo: "GL-AR-1", postingDate: "2026-05-17", documentDate: "2026-05-17", sourceModule: "AR", sourceDocumentType: "AccountsReceivableInvoice", sourceDocumentId: 501, sourceDocumentNo: "AR-SHP-001", currencyCode: "INR", exchangeRateSnapshot: 1, status: "Posted", remarks: null, postedAt: "2026-05-17T00:00:00Z", postedByUserId: 77, reversalJournalId: null, lines: [] },
      taxEntries: []
    });

    renderWithApp(<ArInvoicesPage />, { session: liveSession() });

    fireEvent.click(await screen.findByRole("button", { name: "Create AR Invoice" }));
    fireEvent.change(screen.getByLabelText("Shipment ID"), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText("Invoice number"), { target: { value: "AR-SHP-001" } });
    fireEvent.click(screen.getByRole("button", { name: "Create from Shipment" }));

    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0]).toEqual(expect.objectContaining({ shipmentId: 400, invoiceNo: "AR-SHP-001" }));
    expect(await screen.findByText("Snapshot total:")).toBeInTheDocument();
    expect(screen.getByText("INR 337.36")).toBeInTheDocument();
    expect(screen.getByText("SHP-0001")).toBeInTheDocument();
  });

  it("keeps unfinished finance actions disabled with business-safe reasons", () => {
    renderWithApp(<FinanceDeferredActionsPage />, { session: liveSession() });

    const actionBar = screen.getByTestId("finance-deferred-action-bar");
    expect(within(actionBar).getByRole("button", { name: "Post landed cost" })).toBeDisabled();
    expect(within(actionBar).getByText("Landed cost durable allocation is scheduled after GRN/AP matching is finalized for all purchase flows.")).toBeInTheDocument();
    expect(within(actionBar).getByRole("button", { name: "Execute payment" })).toBeDisabled();
    expect(within(actionBar).getByText("Bank/payment provider execution is outside this finance foundation and requires treasury approval.")).toBeInTheDocument();
  });
});
