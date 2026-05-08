import type {
  AuthSessionResponse,
  CurrencyDto,
  CurrencyUpsertRequest,
  DiscountSchemeDto,
  DiscountSchemeUpsertRequest,
  ExchangeRateSetupDto,
  ExchangeRateSetupUpsertRequest,
  PaymentTermDto,
  PaymentTermUpsertRequest,
  PriceListDto,
  PriceListUpsertRequest,
  QueryFilter,
  TaxCategoryDto,
  TaxCategoryUpsertRequest,
  TradeTermDto,
  TradeTermUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { hasLiveSession, liveDataUnavailable } from "../api/liveData";

export interface CommercialLookupOption {
  label: string;
  value: string;
}

const todayIso = "2026-04-23";

const seededCurrencies: CurrencyDto[] = [
  {
    id: 7001,
    companyId: 1,
    currencyCode: "INR",
    currencyName: "Indian Rupee",
    symbol: "Rs",
    decimalPrecision: 2,
    roundingMode: "HalfUp",
    isBaseCurrency: true,
    status: "Active"
  },
  {
    id: 7002,
    companyId: 1,
    currencyCode: "USD",
    currencyName: "US Dollar",
    symbol: "$",
    decimalPrecision: 2,
    roundingMode: "HalfUp",
    isBaseCurrency: false,
    status: "Active"
  }
];

const seededTaxCategories: TaxCategoryDto[] = [
  {
    id: 7101,
    companyId: 1,
    taxCategoryCode: "GST18",
    taxCategoryName: "GST standard goods 18%",
    taxScope: "Domestic sale",
    defaultRatePercent: 18,
    isRecoverable: true,
    status: "Active",
    taxCodes: [
      {
        id: 7102,
        taxCategoryId: 7101,
        taxCode: "GST18-LOCAL",
        taxCodeName: "GST 18% domestic supply",
        ratePercent: 18,
        effectiveFrom: todayIso,
        effectiveTo: null,
        status: "Active"
      }
    ]
  }
];

const seededPaymentTerms: PaymentTermDto[] = [
  {
    id: 7201,
    companyId: 1,
    paymentTermsCode: "NET30",
    paymentTermsName: "Net 30 days",
    netDays: 30,
    discountDays: null,
    discountPercent: null,
    dueCalculationMode: "InvoiceDate",
    status: "Active"
  },
  {
    id: 7202,
    companyId: 1,
    paymentTermsCode: "ADV50",
    paymentTermsName: "50% advance, balance before dispatch",
    netDays: 0,
    discountDays: null,
    discountPercent: null,
    dueCalculationMode: "Milestone",
    status: "Active"
  }
];

const seededTradeTerms: TradeTermDto[] = [
  {
    id: 7301,
    companyId: 1,
    tradeTermsCode: "EXW",
    tradeTermsName: "Ex Works",
    tradeMode: "Domestic dispatch",
    responsibilitySummary: "Customer-arranged pickup from agreed STS dispatch point.",
    status: "Active"
  }
];

const seededExchangeRates: ExchangeRateSetupDto[] = [
  {
    id: 7401,
    companyId: 1,
    currencyId: 7002,
    currencyCode: "USD",
    rateType: "Manual",
    rateSource: "Finance table",
    manualRate: 83.25,
    effectiveFrom: todayIso,
    effectiveTo: null,
    status: "Active"
  }
];

const seededPriceLists: PriceListDto[] = [
  {
    id: 7501,
    companyId: 1,
    priceListCode: "STD-INR-2026",
    priceListName: "Standard domestic INR price list",
    currencyId: 7001,
    currencyCode: "INR",
    priceListType: "Standard Sales",
    effectiveFrom: todayIso,
    effectiveTo: null,
    customerSegment: "Domestic industrial",
    approvalStatus: "Draft",
    status: "Active",
    lines: [
      {
        id: 7502,
        priceListId: 7501,
        lineNo: 10,
        itemId: 10002,
        itemCode: "FG-BRACKET-001",
        itemName: "Mounting Bracket",
        itemGroupId: null,
        itemGroupName: null,
        uomId: 1,
        uomCode: "PCS",
        minQuantity: 1,
        unitPrice: 875,
        discountEligible: true,
        taxCategoryId: 7101,
        taxCategoryCode: "GST18",
        effectiveFrom: todayIso,
        effectiveTo: null,
        status: "Active"
      }
    ],
    assignments: [
      {
        id: 7503,
        priceListId: 7501,
        customerId: 20001,
        customerName: "Enkay Ozone",
        customerGroupCode: null,
        itemGroupId: null,
        itemGroupName: null,
        branchId: 11,
        branchName: "Main Fabrication Plant",
        priorityRank: 10,
        effectiveFrom: todayIso,
        effectiveTo: null,
        status: "Active"
      }
    ]
  }
];

const seededDiscountSchemes: DiscountSchemeDto[] = [
  {
    id: 7601,
    companyId: 1,
    schemeCode: "VOL-STD-2026",
    schemeName: "Standard volume discount",
    discountType: "Quantity Break",
    currencyId: 7001,
    currencyCode: "INR",
    effectiveFrom: todayIso,
    effectiveTo: null,
    requiresApproval: true,
    approvalStatus: "Draft",
    status: "Active",
    rules: [
      {
        id: 7602,
        discountSchemeId: 7601,
        ruleNo: 10,
        ruleName: "Bracket order quantity break",
        applicabilityType: "Item",
        customerId: null,
        customerName: null,
        customerGroupCode: null,
        itemId: 10002,
        itemCode: "FG-BRACKET-001",
        itemName: "Mounting Bracket",
        itemGroupId: null,
        itemGroupName: null,
        minQuantity: 25,
        discountPercent: 3,
        discountAmount: null,
        priceListId: 7501,
        priceListCode: "STD-INR-2026",
        status: "Active"
      }
    ]
  }
];

function filterRows<T>(rows: T[], filter: QueryFilter, searchText: (row: T) => string) {
  const search = typeof filter.search === "string" ? filter.search.trim().toLowerCase() : "";
  const status = typeof filter.status === "string" ? filter.status : "";
  return rows.filter((row) => {
    const rowStatus = "status" in (row as Record<string, unknown>) ? String((row as Record<string, unknown>).status) : "";
    const statusMatches = !status || status === "all" || rowStatus === status;
    const searchMatches = !search || searchText(row).toLowerCase().includes(search);
    return statusMatches && searchMatches;
  });
}

async function loadRows<T>(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter,
  seededRows: T[],
  liveLoader: (filter: QueryFilter) => Promise<{ items: T[] }>,
  searchText: (row: T) => string
) {
  if (!hasLiveSession(session)) {
    return filterRows(seededRows, filter, searchText);
  }

  try {
    const response = await liveLoader(filter);
    return response.items;
  } catch {
    throw liveDataUnavailable("Commercial setup");
  }
}

function requireLiveSession(session: AuthSessionResponse | null | undefined, label: string) {
  if (!hasLiveSession(session)) {
    throw new Error(`Live workspace sign-in is required before saving ${label}.`);
  }
}

export function toLookupOptions(rows: Array<{ id: number }>, label: (row: { id: number }) => string): CommercialLookupOption[] {
  return rows.map((row) => ({ label: label(row), value: String(row.id) }));
}

export async function listCommercialCurrencies(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededCurrencies, apiClient.commercial.currencies, (row) => `${row.currencyCode} ${row.currencyName}`);
}

export async function listCommercialTaxCategories(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededTaxCategories, apiClient.commercial.taxCategories, (row) => `${row.taxCategoryCode} ${row.taxCategoryName}`);
}

export async function listCommercialPaymentTerms(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededPaymentTerms, apiClient.commercial.paymentTerms, (row) => `${row.paymentTermsCode} ${row.paymentTermsName}`);
}

export async function listCommercialTradeTerms(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededTradeTerms, apiClient.commercial.tradeTerms, (row) => `${row.tradeTermsCode} ${row.tradeTermsName}`);
}

export async function listCommercialExchangeRates(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededExchangeRates, apiClient.commercial.exchangeRates, (row) => `${row.currencyCode} ${row.rateType} ${row.rateSource}`);
}

export async function listPriceLists(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededPriceLists, apiClient.commercial.priceLists, (row) => `${row.priceListCode} ${row.priceListName} ${row.currencyCode}`);
}

export async function listDiscountSchemes(session: AuthSessionResponse | null | undefined, filter: QueryFilter) {
  return loadRows(session, filter, seededDiscountSchemes, apiClient.commercial.discountSchemes, (row) => `${row.schemeCode} ${row.schemeName} ${row.discountType}`);
}

export async function savePriceList(
  session: AuthSessionResponse | null | undefined,
  priceListId: number | null,
  request: PriceListUpsertRequest
) {
  requireLiveSession(session, "price lists");
  return priceListId ? apiClient.commercial.updatePriceList(priceListId, request) : apiClient.commercial.createPriceList(request);
}

export async function saveDiscountScheme(
  session: AuthSessionResponse | null | undefined,
  schemeId: number | null,
  request: DiscountSchemeUpsertRequest
) {
  requireLiveSession(session, "discount schemes");
  return schemeId ? apiClient.commercial.updateDiscountScheme(schemeId, request) : apiClient.commercial.createDiscountScheme(request);
}

export async function saveCurrency(
  session: AuthSessionResponse | null | undefined,
  currencyId: number | null,
  request: CurrencyUpsertRequest
) {
  requireLiveSession(session, "currency setup");
  return currencyId ? apiClient.commercial.updateCurrency(currencyId, request) : apiClient.commercial.createCurrency(request);
}

export async function saveExchangeRate(
  session: AuthSessionResponse | null | undefined,
  exchangeRateId: number | null,
  request: ExchangeRateSetupUpsertRequest
) {
  requireLiveSession(session, "exchange-rate setup");
  return exchangeRateId ? apiClient.commercial.updateExchangeRate(exchangeRateId, request) : apiClient.commercial.createExchangeRate(request);
}

export async function saveTaxCategory(
  session: AuthSessionResponse | null | undefined,
  taxCategoryId: number | null,
  request: TaxCategoryUpsertRequest
) {
  requireLiveSession(session, "tax categories");
  return taxCategoryId ? apiClient.commercial.updateTaxCategory(taxCategoryId, request) : apiClient.commercial.createTaxCategory(request);
}

export async function savePaymentTerm(
  session: AuthSessionResponse | null | undefined,
  paymentTermId: number | null,
  request: PaymentTermUpsertRequest
) {
  requireLiveSession(session, "payment terms");
  return paymentTermId ? apiClient.commercial.updatePaymentTerm(paymentTermId, request) : apiClient.commercial.createPaymentTerm(request);
}

export async function saveTradeTerm(
  session: AuthSessionResponse | null | undefined,
  tradeTermId: number | null,
  request: TradeTermUpsertRequest
) {
  requireLiveSession(session, "trade terms");
  return tradeTermId ? apiClient.commercial.updateTradeTerm(tradeTermId, request) : apiClient.commercial.createTradeTerm(request);
}
