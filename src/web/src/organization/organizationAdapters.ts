import type {
  AuthSessionResponse,
  BinDto,
  BranchDto,
  CompanyDto,
  DepartmentDto,
  PagedResult,
  QueryFilter,
  ShiftDto,
  WarehouseDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { isDemoSession, liveDataUnavailable } from "../api/liveData";

export type SetupDataSource = "Live" | "Seeded";

export interface CompanySetupItem {
  id: string;
  companyId: number;
  code: string;
  name: string;
  legalName: string;
  taxRegistrationNo: string;
  timeZoneId: string;
  defaultLanguageId: number | null;
  baseCurrencyCode: string;
  calendarCode: string;
  status: string;
  source: SetupDataSource;
}

export interface BranchSetupItem {
  id: string;
  branchId: number;
  companyId: number;
  code: string;
  name: string;
  branchType: string;
  timeZoneId: string;
  defaultLanguageId: number | null;
  calendarCode: string;
  defaultShiftId: number | null;
  defaultShift: string;
  defaultWarehouseId: number | null;
  defaultWarehouse: string;
  contactEmail: string;
  status: string;
  source: SetupDataSource;
}

export interface DepartmentSetupItem {
  id: string;
  departmentId: number;
  companyId: number;
  branchId: number | null;
  code: string;
  name: string;
  departmentType: string;
  parentDepartmentId: number | null;
  parentDepartment: string;
  managerUserId: number | null;
  manager: string;
  status: string;
  source: SetupDataSource;
}

export interface WarehouseSetupItem {
  id: string;
  warehouseId: number;
  companyId: number;
  branchId: number;
  code: string;
  name: string;
  warehouseType: string;
  defaultReceiving: boolean;
  defaultIssue: boolean;
  dispatchEnabled: boolean;
  allowsMixedLots: boolean;
  allowsNegativeStock: boolean;
  status: string;
  source: SetupDataSource;
}

export interface BinSetupItem {
  id: string;
  binId: number;
  companyId: number;
  branchId: number;
  warehouseId: number;
  parentBinId: number | null;
  code: string;
  name: string;
  binType: string;
  capacityValue: number | null;
  capacityUomId: number | null;
  capacityLabel: string;
  defaultReceive: boolean;
  defaultIssue: boolean;
  cycleCountLabel: string;
  isBlocked: boolean;
  countCycleDays: number | null;
  blockReason: string;
  status: string;
  source: SetupDataSource;
}

export interface ShiftSetupItem {
  id: string;
  shiftId: number;
  companyId: number;
  branchId: number | null;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  breakMinutes: number;
  sequenceNo: number;
  calendarProfileCode: string;
  status: string;
  source: SetupDataSource;
}

const seededCompanies: CompanySetupItem[] = [
  {
    id: "company-1",
    companyId: 1,
    code: "STS",
    name: "STS Precision Fabricators",
    legalName: "STS Precision Fabricators Private Limited",
    taxRegistrationNo: "27AAXCS9021K1Z5",
    timeZoneId: "Asia/Kolkata",
    defaultLanguageId: null,
    baseCurrencyCode: "INR",
    calendarCode: "IND-MFG-2026",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "company-2",
    companyId: 2,
    code: "STS-EXPORT",
    name: "STS Export Assemblies",
    legalName: "STS Export Assemblies LLP",
    taxRegistrationNo: "27AAXFS1188C1Z3",
    timeZoneId: "Asia/Kolkata",
    defaultLanguageId: null,
    baseCurrencyCode: "USD",
    calendarCode: "EXPORT-2026",
    status: "Draft",
    source: "Seeded"
  }
];

const seededBranches: BranchSetupItem[] = [
  {
    id: "branch-10",
    branchId: 10,
    companyId: 1,
    code: "PLANT-1",
    name: "Main Fabrication Plant",
    branchType: "Manufacturing",
    timeZoneId: "Asia/Kolkata",
    defaultLanguageId: null,
    calendarCode: "IND-MFG-2026",
    defaultShiftId: 1,
    defaultShift: "SHIFT-A",
    defaultWarehouseId: 101,
    defaultWarehouse: "RM-MAIN",
    contactEmail: "plant1@sts-precision.local",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "branch-11",
    branchId: 11,
    companyId: 1,
    code: "WAREHOUSE-HUB",
    name: "Central Warehouse Hub",
    branchType: "Warehouse",
    timeZoneId: "Asia/Kolkata",
    defaultLanguageId: null,
    calendarCode: "IND-MFG-2026",
    defaultShiftId: 3,
    defaultShift: "SHIFT-G",
    defaultWarehouseId: 103,
    defaultWarehouse: "FG-DISPATCH",
    contactEmail: "stores@sts-precision.local",
    status: "Active",
    source: "Seeded"
  }
];

const seededDepartments: DepartmentSetupItem[] = [
  {
    id: "dept-12",
    departmentId: 12,
    companyId: 1,
    branchId: 10,
    code: "PLN",
    name: "Planning",
    departmentType: "Planning",
    parentDepartmentId: null,
    parentDepartment: "Operations",
    managerUserId: null,
    manager: "Ritika Sharma",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "dept-14",
    departmentId: 14,
    companyId: 1,
    branchId: 10,
    code: "PRD",
    name: "Production",
    departmentType: "Production",
    parentDepartmentId: null,
    parentDepartment: "Operations",
    managerUserId: null,
    manager: "Ajay Patil",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "dept-16",
    departmentId: 16,
    companyId: 1,
    branchId: 10,
    code: "QC",
    name: "Quality Control",
    departmentType: "Quality",
    parentDepartmentId: null,
    parentDepartment: "Operations",
    managerUserId: null,
    manager: "Kiran Rao",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "dept-18",
    departmentId: 18,
    companyId: 1,
    branchId: 11,
    code: "STO",
    name: "Stores",
    departmentType: "Stores",
    parentDepartmentId: null,
    parentDepartment: "Supply Chain",
    managerUserId: null,
    manager: "Meera Iyer",
    status: "Active",
    source: "Seeded"
  }
];

const seededWarehouses: WarehouseSetupItem[] = [
  {
    id: "warehouse-101",
    warehouseId: 101,
    companyId: 1,
    branchId: 10,
    code: "RM-MAIN",
    name: "Raw Material Main Store",
    warehouseType: "Raw Material",
    defaultReceiving: true,
    defaultIssue: true,
    dispatchEnabled: false,
    allowsMixedLots: true,
    allowsNegativeStock: false,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "warehouse-102",
    warehouseId: 102,
    companyId: 1,
    branchId: 10,
    code: "WIP-FAB",
    name: "Fabrication WIP Store",
    warehouseType: "WIP",
    defaultReceiving: false,
    defaultIssue: true,
    dispatchEnabled: false,
    allowsMixedLots: true,
    allowsNegativeStock: false,
    status: "Active",
    source: "Seeded"
  },
  {
    id: "warehouse-103",
    warehouseId: 103,
    companyId: 1,
    branchId: 11,
    code: "FG-DISPATCH",
    name: "Finished Goods Dispatch",
    warehouseType: "Finished Goods",
    defaultReceiving: false,
    defaultIssue: false,
    dispatchEnabled: true,
    allowsMixedLots: false,
    allowsNegativeStock: false,
    status: "Active",
    source: "Seeded"
  }
];

const seededBins: BinSetupItem[] = [
  {
    id: "bin-1001",
    binId: 1001,
    companyId: 1,
    branchId: 10,
    warehouseId: 101,
    parentBinId: null,
    code: "RM-A-R01",
    name: "Row A Rack 01",
    binType: "Rack",
    capacityValue: 2.5,
    capacityUomId: null,
    capacityLabel: "2.5 MT",
    defaultReceive: true,
    defaultIssue: false,
    countCycleDays: 30,
    cycleCountLabel: "Every 30 days",
    isBlocked: false,
    blockReason: "None",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "bin-1002",
    binId: 1002,
    companyId: 1,
    branchId: 10,
    warehouseId: 101,
    parentBinId: null,
    code: "RM-QC-HOLD",
    name: "QC Hold Cage",
    binType: "Quarantine",
    capacityValue: 1,
    capacityUomId: null,
    capacityLabel: "1.0 MT",
    defaultReceive: false,
    defaultIssue: false,
    countCycleDays: 7,
    cycleCountLabel: "Every 7 days",
    isBlocked: true,
    blockReason: "QC_HOLD",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "bin-2001",
    binId: 2001,
    companyId: 1,
    branchId: 11,
    warehouseId: 103,
    parentBinId: null,
    code: "FG-STAGE-01",
    name: "Dispatch Stage 01",
    binType: "Staging",
    capacityValue: 12,
    capacityUomId: null,
    capacityLabel: "12 pallets",
    defaultReceive: false,
    defaultIssue: true,
    countCycleDays: 15,
    cycleCountLabel: "Every 15 days",
    isBlocked: false,
    blockReason: "None",
    status: "Active",
    source: "Seeded"
  }
];

const seededShifts: ShiftSetupItem[] = [
  {
    id: "shift-1",
    shiftId: 1,
    companyId: 1,
    branchId: 10,
    code: "SHIFT-A",
    name: "General Shift",
    startTime: "08:00",
    endTime: "16:30",
    crossesMidnight: false,
    breakMinutes: 45,
    sequenceNo: 1,
    calendarProfileCode: "IND-MFG-2026",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "shift-2",
    shiftId: 2,
    companyId: 1,
    branchId: 10,
    code: "SHIFT-B",
    name: "Evening Shift",
    startTime: "16:30",
    endTime: "01:00",
    crossesMidnight: true,
    breakMinutes: 45,
    sequenceNo: 2,
    calendarProfileCode: "IND-MFG-2026",
    status: "Active",
    source: "Seeded"
  },
  {
    id: "shift-3",
    shiftId: 3,
    companyId: 1,
    branchId: 11,
    code: "SHIFT-G",
    name: "Warehouse General",
    startTime: "09:00",
    endTime: "18:00",
    crossesMidnight: false,
    breakMinutes: 60,
    sequenceNo: 1,
    calendarProfileCode: "IND-MFG-2026",
    status: "Active",
    source: "Seeded"
  }
];

function matchesFilter(value: string, search?: string, status?: string) {
  const searchText = search?.trim().toLowerCase();
  const statusText = status?.trim().toLowerCase();
  const matchesSearch = !searchText || value.toLowerCase().includes(searchText);
  const matchesStatus = !statusText || statusText === "all" || value.toLowerCase().includes(statusText);

  return matchesSearch && matchesStatus;
}

function filterSeeded<T extends { status: string }>(
  items: T[],
  filter: QueryFilter,
  label: (item: T) => string
) {
  return items.filter((item) => matchesFilter(`${label(item)} ${item.status}`, filter.search, filter.status));
}

function emptyPaged<T>(): PagedResult<T> {
  return {
    items: [],
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0
  };
}

function mapCompany(dto: CompanyDto, source: SetupDataSource): CompanySetupItem {
  return {
    id: `company-${dto.id}`,
    companyId: dto.id,
    code: dto.companyCode,
    name: dto.companyName,
    legalName: dto.legalName,
    taxRegistrationNo: dto.taxRegistrationNo ?? "Not captured",
    timeZoneId: dto.timeZoneId,
    defaultLanguageId: dto.defaultLanguageId,
    baseCurrencyCode: dto.baseCurrencyCode ?? "Pending",
    calendarCode: dto.defaultCalendarCode ?? "Pending",
    status: dto.status,
    source
  };
}

function mapBranch(dto: BranchDto, source: SetupDataSource): BranchSetupItem {
  return {
    id: `branch-${dto.id}`,
    branchId: dto.id,
    companyId: dto.companyId,
    code: dto.branchCode,
    name: dto.branchName,
    branchType: dto.branchType,
    timeZoneId: dto.timeZoneId,
    defaultLanguageId: dto.defaultLanguageId,
    calendarCode: dto.defaultCalendarCode ?? "Pending",
    defaultShiftId: dto.defaultShiftId,
    defaultShift: dto.defaultShiftId ? `Shift ${dto.defaultShiftId}` : "Pending",
    defaultWarehouseId: dto.defaultWarehouseId,
    defaultWarehouse: dto.defaultWarehouseId ? `Warehouse ${dto.defaultWarehouseId}` : "Pending",
    contactEmail: dto.contactEmail ?? "Pending",
    status: dto.status,
    source
  };
}

function mapDepartment(dto: DepartmentDto, source: SetupDataSource): DepartmentSetupItem {
  return {
    id: `department-${dto.id}`,
    departmentId: dto.id,
    companyId: dto.companyId,
    branchId: dto.branchId,
    code: dto.departmentCode,
    name: dto.departmentName,
    departmentType: dto.departmentType,
    parentDepartmentId: dto.parentDepartmentId,
    parentDepartment: dto.parentDepartmentId ? `Department ${dto.parentDepartmentId}` : "Root",
    managerUserId: dto.managerUserId,
    manager: dto.managerUserId ? `User ${dto.managerUserId}` : "Unassigned",
    status: dto.status,
    source
  };
}

function mapWarehouse(dto: WarehouseDto, source: SetupDataSource): WarehouseSetupItem {
  return {
    id: `warehouse-${dto.id}`,
    warehouseId: dto.id,
    companyId: dto.companyId,
    branchId: dto.branchId,
    code: dto.warehouseCode,
    name: dto.warehouseName,
    warehouseType: dto.warehouseType,
    defaultReceiving: dto.isDefaultReceivingWarehouse,
    defaultIssue: dto.isDefaultIssueWarehouse,
    dispatchEnabled: dto.isDispatchEnabled,
    allowsMixedLots: dto.allowsMixedLots,
    allowsNegativeStock: dto.allowsNegativeStock,
    status: dto.status,
    source
  };
}

function mapBin(dto: BinDto, source: SetupDataSource): BinSetupItem {
  return {
    id: `bin-${dto.id}`,
    binId: dto.id,
    companyId: dto.companyId,
    branchId: dto.branchId,
    warehouseId: dto.warehouseId,
    parentBinId: dto.parentBinId,
    code: dto.binCode,
    name: dto.binName,
    binType: dto.binType,
    capacityValue: dto.capacityValue,
    capacityUomId: dto.capacityUomId,
    capacityLabel: dto.capacityValue ? `${dto.capacityValue} UOM ${dto.capacityUomId ?? "pending"}` : "Not capped",
    defaultReceive: dto.isDefaultReceiveBin,
    defaultIssue: dto.isDefaultIssueBin,
    cycleCountLabel: dto.isCountCycleRequired ? `Every ${dto.countCycleDays ?? "?"} days` : "Not required",
    isBlocked: dto.isBlocked,
    countCycleDays: dto.countCycleDays,
    blockReason: dto.blockReasonCode ?? "None",
    status: dto.status,
    source
  };
}

function mapShift(dto: ShiftDto, source: SetupDataSource): ShiftSetupItem {
  return {
    id: `shift-${dto.id}`,
    shiftId: dto.id,
    companyId: dto.companyId,
    branchId: dto.branchId,
    code: dto.shiftCode,
    name: dto.shiftName,
    startTime: dto.startTime,
    endTime: dto.endTime,
    crossesMidnight: dto.crossesMidnight,
    breakMinutes: dto.breakMinutes,
    sequenceNo: dto.sequenceNo,
    calendarProfileCode: dto.calendarProfileCode ?? "Pending",
    status: dto.status,
    source
  };
}

export async function listCompanySetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<CompanySetupItem[]> {
  if (isDemoSession(session)) {
    return filterSeeded(seededCompanies, filter, (item) => `${item.code} ${item.name} ${item.legalName}`);
  }

  try {
    const response = await apiClient.organization.companies(filter);
    return response.items.map((item) => mapCompany(item, "Live"));
  } catch {
    throw liveDataUnavailable("Company");
  }
}

export async function listBranchSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<BranchSetupItem[]> {
  if (isDemoSession(session)) {
    return filterSeeded(seededBranches, filter, (item) => `${item.code} ${item.name} ${item.branchType}`);
  }

  try {
    const response = await apiClient.organization.branches(filter);
    return response.items.map((item) => mapBranch(item, "Live"));
  } catch {
    throw liveDataUnavailable("Branch");
  }
}

export async function listDepartmentSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<DepartmentSetupItem[]> {
  if (isDemoSession(session)) {
    return filterSeeded(seededDepartments, filter, (item) => `${item.code} ${item.name} ${item.departmentType}`);
  }

  try {
    const response = await apiClient.organization.departments(filter);
    return response.items.map((item) => mapDepartment(item, "Live"));
  } catch {
    throw liveDataUnavailable("Department");
  }
}

export async function listWarehouseSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<WarehouseSetupItem[]> {
  if (isDemoSession(session)) {
    return filterSeeded(seededWarehouses, filter, (item) => `${item.code} ${item.name} ${item.warehouseType}`);
  }

  try {
    const response = await apiClient.organization.warehouses(filter);
    return response.items.map((item) => mapWarehouse(item, "Live"));
  } catch {
    throw liveDataUnavailable("Warehouse");
  }
}

export async function listBinSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<BinSetupItem[]> {
  if (isDemoSession(session)) {
    return filterSeeded(seededBins, filter, (item) => `${item.code} ${item.name} ${item.binType} ${item.blockReason}`);
  }

  try {
    const response = await apiClient.organization.bins(filter);
    return response.items.map((item) => mapBin(item, "Live"));
  } catch {
    throw liveDataUnavailable("Bin");
  }
}

export async function listShiftSetup(
  session: AuthSessionResponse | null | undefined,
  filter: QueryFilter
): Promise<ShiftSetupItem[]> {
  if (isDemoSession(session)) {
    return filterSeeded(seededShifts, filter, (item) => `${item.code} ${item.name} ${item.calendarProfileCode}`);
  }

  try {
    const response = await apiClient.organization.shifts(filter);
    return response.items.map((item) => mapShift(item, "Live"));
  } catch {
    throw liveDataUnavailable("Shift");
  }
}

export function emptyOrganizationPage<T>() {
  return emptyPaged<T>();
}
