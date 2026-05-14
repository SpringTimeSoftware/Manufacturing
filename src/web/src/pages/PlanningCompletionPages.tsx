import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  PlannedOrderConversionResultDto,
  PlannedOrderUpsertRequest,
  PlanningPlanUpsertRequest,
  PurchaseRequisitionDto,
  PurchaseRequisitionUpsertRequest,
  ShortageActionUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { buildMasterFilter, type MasterDataSource } from "../masters/masterDataAdapters";
import {
  listBoqRequirementSetup,
  listCapacityBoardSetup,
  listMrpRunConsoleSetup,
  type BoqRequirementItem,
  type CapacityBucketItem,
  type MrpExceptionItem,
  type MrpRunConsoleItem
} from "../planning/planningAdapters";
import { Card } from "../ui/Card";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpFileActionState,
  ErpFilterBar,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip,
  ErpTransactionLineGrid,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

type PlanDraft = {
  planCode: string;
  planName: string;
  planType: string;
  planVersion: string;
  status: string;
  plant: string;
  horizonStart: string;
  horizonEnd: string;
  demandFenceDays: number;
  planningFenceDays: number;
  includeForecast: string;
  includeCapacity: string;
  planner: string;
};

type SnapshotRow = {
  id: string;
  runId: number;
  runCode: string;
  snapshotType: string;
  snapshotName: string;
  snapshotHash: string;
  inputCount: number;
  outputCount: number;
  exceptionCount: number;
  plannedOrderCount: number;
  deltaSummary: string;
  status: string;
};

type PlannedOrderRow = {
  id: string;
  plannedOrderId: number | null;
  sourceRequirementId: number;
  sourceLineId: number | null;
  sourceDocument: string;
  orderNo: string;
  orderType: "Purchase" | "Work" | "Transfer";
  itemId: number;
  itemLabel: string;
  quantity: number;
  uomId: number;
  startDate: string;
  dueDate: string;
  supplierOrResource: string;
  firm: boolean;
  released: boolean;
  expedite: boolean;
  bomRevisionId?: number | null;
  routingId?: number | null;
  pegging: string;
  status: string;
  targetDocumentId?: number | null;
  targetDocumentType?: string | null;
};

type ManualPlannedOrderDraft = {
  plannedOrderNo: string;
  orderType: PlannedOrderRow["orderType"];
  itemId: number;
  itemLabel: string;
  quantity: number;
  uomId: number;
  startDate: string;
  dueDate: string;
  sourceWarehouseId: number | null;
  targetWarehouseId: number | null;
  bomRevisionId: number | null;
  routingId: number | null;
  isFirm: boolean;
  isExpedite: boolean;
  peggingSourceType: string;
  peggingSourceId: number | null;
  status: string;
};

type PeggingRow = {
  id: string;
  demand: string;
  supply: string;
  itemLabel: string;
  peggedQuantity: number;
  peggingPercent: number;
  status: string;
};

type ShortageRow = {
  id: string;
  source: string;
  itemId: number;
  plannedOrderId: number | null;
  itemLabel: string;
  shortageQuantity: number;
  actionType: string;
  owner: string;
  dueDate: string;
  reason: string;
  status: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function sourceTone(source: MasterDataSource) {
  return source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
}

function SourceBadge({ source }: { source: MasterDataSource }) {
  return <ErpStatusChip tone={sourceTone(source)}>{source === "Live" ? "Live planning data" : "Demo planning data"}</ErpStatusChip>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("blocked") || normalized.includes("shortage") || normalized.includes("overload")
    ? "danger"
    : normalized.includes("draft") || normalized.includes("review")
      ? "warn"
      : normalized.includes("firm") || normalized.includes("converted") || normalized.includes("available")
        ? "success"
        : "info";
  return <ErpStatusChip tone={tone}>{status}</ErpStatusChip>;
}

function buildPlanDraft(): PlanDraft {
  return {
    planCode: `PLAN-${todayIso().replace(/-/g, "")}`,
    planName: "Monthly supply plan",
    planType: "Supply",
    planVersion: "V1",
    status: "Draft",
    plant: "Current branch",
    horizonStart: todayIso(),
    horizonEnd: addDaysIso(60),
    demandFenceDays: 7,
    planningFenceDays: 21,
    includeForecast: "Yes",
    includeCapacity: "Yes",
    planner: "Current planner"
  };
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `MRP-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

function buildSnapshots(runs: MrpRunConsoleItem[], plannedOrders: PlannedOrderRow[]): SnapshotRow[] {
  return runs.flatMap((run) => {
    const runOrders = plannedOrders.filter((order) => order.pegging.includes(run.runCode) || order.sourceDocument.includes(run.runCode));
    const base = `${run.runCode}|${run.horizon}|${run.lineCount}|${run.exceptionCount}|${run.buyCount}|${run.makeCount}|${run.transferCount}`;

    return [
      {
        id: `${run.id}-input`,
        runId: run.mrpRunId,
        runCode: run.runCode,
        snapshotType: "Input",
        snapshotName: `${run.runCode} input`,
        snapshotHash: stableHash(`${base}|input`),
        inputCount: Math.max(run.lineCount, 1),
        outputCount: 0,
        exceptionCount: 0,
        plannedOrderCount: 0,
        deltaSummary: "Demand and supply input locked for this run.",
        status: run.status
      },
      {
        id: `${run.id}-output`,
        runId: run.mrpRunId,
        runCode: run.runCode,
        snapshotType: "Output",
        snapshotName: `${run.runCode} output`,
        snapshotHash: stableHash(`${base}|output|${runOrders.length}`),
        inputCount: Math.max(run.lineCount, 1),
        outputCount: run.lineCount,
        exceptionCount: run.exceptionCount,
        plannedOrderCount: runOrders.length,
        deltaSummary: `${run.exceptionCount} exception(s), ${runOrders.length} planned order(s), BUY/MAKE/TRANSFER ${run.buyCount}/${run.makeCount}/${run.transferCount}.`,
        status: run.status
      }
    ];
  });
}

function mapActionToOrderType(action: string): PlannedOrderRow["orderType"] {
  const normalized = action.toUpperCase();
  if (normalized === "MAKE") {
    return "Work";
  }
  if (normalized === "TRANSFER") {
    return "Transfer";
  }
  return "Purchase";
}

function buildPlannedOrders(boqs: BoqRequirementItem[], runs: MrpRunConsoleItem[]): PlannedOrderRow[] {
  const fromBoq = boqs.flatMap((boq) =>
    boq.lines.map((line) => {
      const orderType = mapActionToOrderType(line.approvedAction || line.recommendedAction);
      return {
        id: `planned-${boq.id}-${line.id}`,
        plannedOrderId: null,
        sourceRequirementId: boq.boqRequirementId,
        sourceLineId: line.lineId,
        sourceDocument: boq.sourceDocument,
        orderNo: `PLN-${orderType.toUpperCase()}-${boq.boqRequirementId}-${line.lineNo}`,
        orderType,
        itemId: line.itemId,
        itemLabel: line.itemLabel,
        quantity: line.shortageQuantity > 0 ? line.shortageQuantity : line.requiredQuantity,
        uomId: line.requirementUomId,
        startDate: todayIso(),
        dueDate: line.needByDate,
        supplierOrResource: orderType === "Purchase" ? "Supplier selection required" : orderType === "Work" ? "Released BOM/routing required" : "Source warehouse required",
        firm: line.status === "Reviewed" || line.status === "Converted",
        released: line.status === "Converted",
        expedite: line.shortageQuantity > 0,
        bomRevisionId: null,
        routingId: null,
        pegging: `${boq.mrpRunLabel} -> ${boq.sourceDocument} -> line ${line.lineNo}`,
        status: line.status === "Converted" ? "Converted" : line.shortageQuantity > 0 ? "Shortage review" : "Planned"
      } satisfies PlannedOrderRow;
    })
  );

  if (fromBoq.length > 0) {
    return fromBoq;
  }

  return runs.flatMap((run) =>
    run.items.map((item, index) => ({
      id: `planned-${run.id}-${item.id}`,
      plannedOrderId: null,
      sourceRequirementId: run.mrpRunId,
      sourceLineId: null,
      sourceDocument: run.runCode,
      orderNo: `PLN-${item.recommendedAction}-${run.mrpRunId}-${index + 1}`,
      orderType: mapActionToOrderType(item.recommendedAction),
      itemId: item.itemId,
      itemLabel: item.itemLabel,
      quantity: item.netRequirementQty,
      uomId: 1,
      startDate: todayIso(),
      dueDate: addDaysIso(14 + index),
      supplierOrResource: item.recommendedAction === "BUY" ? "Supplier selection required" : "Resource review required",
      firm: false,
      released: false,
      expedite: item.exceptionCode !== "None",
      bomRevisionId: null,
      routingId: null,
      pegging: `${run.runCode} -> ${item.demandSourceType}`,
      status: item.exceptionCode === "None" ? "Planned" : "Shortage review"
    }))
  );
}

function mapLivePlannedOrders(records: Awaited<ReturnType<typeof apiClient.planning.plannedOrders>>["items"]): PlannedOrderRow[] {
  return records.map((record) => ({
    id: `planned-live-${record.id}`,
    plannedOrderId: record.id,
    sourceRequirementId: record.planningPlanId ?? record.mrpRunId ?? 0,
    sourceLineId: record.boqRequirementLineId,
    sourceDocument: record.peggingSourceType,
    orderNo: record.plannedOrderNo,
    orderType: record.orderType === "Make" ? "Work" : record.orderType === "Transfer" ? "Transfer" : "Purchase",
    itemId: record.itemId,
    itemLabel: `Item ${record.itemId}`,
    quantity: record.quantity,
    uomId: record.uomId,
    startDate: record.plannedStartDate,
    dueDate: record.plannedDueDate,
    supplierOrResource: record.orderType === "Purchase" ? "Supplier selection required" : record.orderType === "Make" ? "Released BOM/routing required" : "Source warehouse required",
    firm: record.isFirm,
    released: record.isReleased,
    expedite: record.isExpedite,
    bomRevisionId: record.bomRevisionId,
    routingId: record.routingId,
    pegging: `${record.peggingSourceType}${record.peggingSourceId ? ` ${record.peggingSourceId}` : ""}`,
    status: record.status,
    targetDocumentId: record.targetDocumentId,
    targetDocumentType: record.targetDocumentType
  }));
}

function buildPeggingRows(plannedOrders: PlannedOrderRow[]): PeggingRow[] {
  return plannedOrders.map((order) => ({
    id: `peg-${order.id}`,
    demand: order.sourceDocument,
    supply: order.orderNo,
    itemLabel: order.itemLabel,
    peggedQuantity: order.quantity,
    peggingPercent: 100,
    status: order.status
  }));
}

function buildShortageRows(plannedOrders: PlannedOrderRow[], exceptions: MrpExceptionItem[]): ShortageRow[] {
  const fromOrders = plannedOrders
    .filter((order) => order.expedite || order.status.toLowerCase().includes("shortage"))
    .map((order) => ({
      id: `shortage-${order.id}`,
      source: order.orderNo,
      itemId: order.itemId,
      plannedOrderId: order.plannedOrderId,
      itemLabel: order.itemLabel,
      shortageQuantity: order.quantity,
      actionType: order.orderType === "Purchase" ? "Buy" : order.orderType === "Work" ? "Make" : "Transfer",
      owner: "Planner",
      dueDate: order.dueDate,
      reason: order.pegging,
      status: "Open"
    }));

  const fromExceptions = exceptions.map((item) => ({
    id: `shortage-${item.id}`,
    source: item.demandSourceType,
    itemId: item.itemId,
    plannedOrderId: null,
    itemLabel: item.itemLabel,
    shortageQuantity: item.netRequirementQty,
    actionType: item.recommendedAction,
    owner: "Planner",
    dueDate: addDaysIso(7),
    reason: item.exceptionCode,
    status: "Open"
  }));

  const seen = new Set<string>();
  return [...fromOrders, ...fromExceptions].filter((row) => {
    const key = `${row.source}:${row.itemLabel}:${row.actionType}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildPurchaseRequisitionRequest(companyId: number, branchId: number, order: PlannedOrderRow): PurchaseRequisitionUpsertRequest {
  return {
    companyId,
    branchId,
    purchaseRequisitionNo: `PR-${order.orderNo}`,
    sourceDocumentType: "PlannedOrder",
    sourceDocumentId: order.sourceLineId,
    status: "Draft",
    lines: [
      {
        lineNo: 10,
        itemId: order.itemId,
        requiredQuantity: order.quantity,
        orderUomId: order.uomId || 1,
        needByDate: order.dueDate,
        sourceBoqRequirementLineId: order.sourceLineId,
        linkedWorkOrderId: null,
        status: "Draft"
      }
    ]
  };
}

function buildPlanningPlanRequest(companyId: number, branchId: number, draft: PlanDraft): PlanningPlanUpsertRequest {
  return {
    companyId,
    branchId,
    planCode: draft.planCode,
    planName: draft.planName,
    planType: draft.planType,
    horizonStart: draft.horizonStart,
    horizonEnd: draft.horizonEnd,
    firmFenceDays: draft.demandFenceDays,
    forecastFenceDays: draft.planningFenceDays,
    includeForecast: draft.includeForecast === "Yes",
    includeCapacity: draft.includeCapacity === "Yes",
    status: draft.status
  };
}

function buildManualPlannedOrderRequest(companyId: number, branchId: number, draft: ManualPlannedOrderDraft): PlannedOrderUpsertRequest {
  return {
    companyId,
    branchId,
    planningPlanId: null,
    mrpRunId: null,
    boqRequirementLineId: null,
    plannedOrderNo: draft.plannedOrderNo,
    orderType: draft.orderType === "Work" ? "Make" : draft.orderType,
    itemId: draft.itemId,
    quantity: draft.quantity,
    uomId: draft.uomId,
    plannedStartDate: draft.startDate,
    plannedDueDate: draft.dueDate,
    sourceWarehouseId: draft.sourceWarehouseId,
    targetWarehouseId: draft.targetWarehouseId,
    bomRevisionId: draft.bomRevisionId,
    routingId: draft.routingId,
    isFirm: draft.isFirm,
    isExpedite: draft.isExpedite,
    peggingSourceType: draft.peggingSourceType,
    peggingSourceId: draft.peggingSourceId,
    status: draft.status
  };
}

function buildShortageActionRequest(companyId: number, branchId: number, row: ShortageRow, order?: PlannedOrderRow | null): ShortageActionUpsertRequest {
  return {
    companyId,
    branchId,
    plannedOrderId: row.plannedOrderId ?? order?.plannedOrderId ?? null,
    mrpRunItemId: null,
    itemId: row.itemId || order?.itemId || 0,
    shortageQuantity: row.shortageQuantity,
    actionType: row.actionType,
    ownerUserId: null,
    dueDate: row.dueDate,
    reasonCode: row.reason.slice(0, 64),
    status: row.status,
    resolutionNote: row.source
  };
}

function buildManualPlannedOrderDraft(): ManualPlannedOrderDraft {
  return {
    plannedOrderNo: `PLO-${Date.now().toString().slice(-6)}`,
    orderType: "Purchase",
    itemId: 0,
    itemLabel: "",
    quantity: 1,
    uomId: 1,
    startDate: todayIso(),
    dueDate: addDaysIso(14),
    sourceWarehouseId: null,
    targetWarehouseId: null,
    bomRevisionId: null,
    routingId: null,
    isFirm: false,
    isExpedite: false,
    peggingSourceType: "Manual",
    peggingSourceId: null,
    status: "Draft"
  };
}

function planValidation(draft: PlanDraft | null) {
  if (!draft) {
    return [];
  }

  return [
    !draft.planCode.trim() ? "Plan code is required." : "",
    !draft.planName.trim() ? "Plan name is required." : "",
    !draft.horizonStart ? "Horizon start is required." : "",
    !draft.horizonEnd ? "Horizon end is required." : "",
    draft.horizonEnd < draft.horizonStart ? "Horizon end must be on or after start." : "",
    draft.demandFenceDays < 0 ? "Demand fence must be zero or greater." : "",
    draft.planningFenceDays < draft.demandFenceDays ? "Planning fence must be greater than or equal to demand fence." : ""
  ].filter(Boolean);
}

function capacitySourceRows(capacityRows: CapacityBucketItem[]) {
  return capacityRows.flatMap((row) => [
    {
      id: `${row.id}-source`,
      demand: row.plannedOrderRef,
      supply: `${row.workCenterLabel} / ${row.machineLabel}`,
      itemLabel: row.constraintSignal,
      peggedQuantity: row.loadedMinutes,
      peggingPercent: row.availableMinutes > 0 ? Math.round((row.loadedMinutes / row.availableMinutes) * 100) : 0,
      status: row.status
    }
  ]);
}

export function PlanningWorkspacePage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [planDraft, setPlanDraft] = useState<PlanDraft | null>(null);
  const [manualOrderDraft, setManualOrderDraft] = useState<ManualPlannedOrderDraft | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PlannedOrderRow | null>(null);
  const [selectedShortage, setSelectedShortage] = useState<ShortageRow | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const companyId = user?.activeContext.companyId ?? 0;
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => (live && companyId > 0 ? apiClient.masters.itemLookup(companyId) : Promise.resolve([])), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uomLookup = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => (live && companyId > 0 ? apiClient.measurements.uoms({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])), { enabled: live && companyId > 0, staleTime: 60_000 });
  const itemOptions = (itemLookup.data ?? []).map((item) => ({ label: `${item.itemCode} / ${item.itemName}`, value: String(item.id) }));
  const uomOptions = (uomLookup.data ?? []).map((uom) => ({ label: `${uom.uomCode} / ${uom.uomName}`, value: String(uom.id) }));
  const mrpQuery = useApiQuery(queryKeys.planning.mrpRuns(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMrpRunConsoleSetup(session, filter), { staleTime: 60_000 });
  const boqQuery = useApiQuery(queryKeys.planning.boqRequirements(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listBoqRequirementSetup(session, filter), { staleTime: 60_000 });
  const capacityQuery = useApiQuery(queryKeys.planning.capacityBoard(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listCapacityBoardSetup(session, filter), { staleTime: 60_000 });
  const plannedOrderQuery = useApiQuery(
    queryKeys.planning.plannedOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => (live ? apiClient.planning.plannedOrders(filter).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const mrpRuns = mrpQuery.data ?? [];
  const boqs = boqQuery.data ?? [];
  const capacityRows = capacityQuery.data ?? [];
  const exceptions = mrpRuns.flatMap((run) => run.items.map((item) => ({ ...item, id: `${run.id}-${item.id}` })));
  const persistedPlannedOrders = mapLivePlannedOrders(plannedOrderQuery.data ?? []);
  const plannedOrders = live && persistedPlannedOrders.length > 0 ? persistedPlannedOrders : buildPlannedOrders(boqs, mrpRuns);
  const snapshots = buildSnapshots(mrpRuns, plannedOrders);
  const peggingRows = [...buildPeggingRows(plannedOrders), ...capacitySourceRows(capacityRows)];
  const shortages = buildShortageRows(plannedOrders, exceptions);
  const source: MasterDataSource = mrpRuns[0]?.source ?? boqs[0]?.source ?? capacityRows[0]?.source ?? (live ? "Live" : "Seeded");
  const validation = planValidation(planDraft);
  const planSaveReason = !live
    ? "Live planning sign-in is required before saving planning plans."
    : !user?.activeContext.companyId || !user?.activeContext.branchId
      ? "Select a company and branch before saving planning plans."
      : validation[0];
  const manualOrderErrors = manualOrderDraft
    ? [
        !manualOrderDraft.plannedOrderNo.trim() ? "Planned order number is required." : "",
        !manualOrderDraft.itemId ? "Item is required." : "",
        manualOrderDraft.quantity <= 0 ? "Quantity must be greater than zero." : "",
        !manualOrderDraft.uomId ? "UOM is required." : "",
        manualOrderDraft.dueDate < manualOrderDraft.startDate ? "Due date must be on or after start date." : ""
      ].filter(Boolean)
    : [];
  const convertReason = selectedOrder
    ? !live
      ? "Live planning sign-in is required before converting planned orders."
      : selectedOrder.orderType !== "Purchase"
        ? "Only purchase planned orders can create purchase requisitions from this preview."
        : !selectedOrder.itemId
          ? "Planned order item must resolve to Item Master before conversion."
          : undefined
    : "Select a planned order before conversion.";
  const workOrderConvertReason = selectedOrder
    ? !live
      ? "Live planning sign-in is required before converting planned orders."
        : selectedOrder.orderType !== "Work"
          ? "Only work planned orders can create work orders from this preview."
        : !selectedOrder.plannedOrderId
          ? "Save the planned order before converting it to a work order."
          : !selectedOrder.bomRevisionId
            ? "Work order conversion requires released BOM and routing on the planned order."
          : undefined
    : "Select a planned order before conversion.";
  const convertMutation = useApiMutation<PlannedOrderRow, PlannedOrderConversionResultDto | PurchaseRequisitionDto>(
    (order: PlannedOrderRow) => order.plannedOrderId
      ? apiClient.planning.convertPlannedOrderToPurchaseRequisition(order.plannedOrderId)
      : apiClient.procurement.createPurchaseRequisition(buildPurchaseRequisitionRequest(user?.activeContext.companyId ?? 0, user?.activeContext.branchId ?? 0, order)),
    {
      onError: (error) => setMessage(error.message),
      onSuccess: (result) => {
        setMessage(`Created purchase requisition ${"purchaseRequisitionNo" in result ? result.purchaseRequisitionNo : result.targetDocumentNo}.`);
        setSelectedOrder(null);
      }
    }
  );
  const savePlanMutation = useApiMutation(
    (draft: PlanDraft) => apiClient.planning.createPlan(buildPlanningPlanRequest(user?.activeContext.companyId ?? 0, user?.activeContext.branchId ?? 0, draft)),
    {
      onError: (error) => setMessage(error.message),
      onSuccess: (result) => {
        setPlanDraft(null);
        setMessage(`Saved planning plan ${result.planCode}.`);
      }
    }
  );
  const saveManualOrderMutation = useApiMutation(
    (draft: ManualPlannedOrderDraft) => apiClient.planning.createPlannedOrder(buildManualPlannedOrderRequest(user?.activeContext.companyId ?? 0, user?.activeContext.branchId ?? 0, draft)),
    {
      onError: (error) => setMessage(error.message),
      onSuccess: (result) => {
        setManualOrderDraft(null);
        setMessage(`Saved planned order ${result.plannedOrderNo}.`);
      }
    }
  );
  const saveShortageActionMutation = useApiMutation(
    (row: ShortageRow) => apiClient.planning.createShortageAction(buildShortageActionRequest(user?.activeContext.companyId ?? 0, user?.activeContext.branchId ?? 0, row, plannedOrders.find((order) => order.orderNo === row.source))),
    {
      onError: (error) => setMessage(error.message),
      onSuccess: (result) => {
        setSelectedShortage(null);
        setMessage(`Saved shortage action ${result.actionType}.`);
      }
    }
  );
  const convertWorkOrderMutation = useApiMutation(
    (order: PlannedOrderRow) => apiClient.planning.convertPlannedOrderToWorkOrder(order.plannedOrderId ?? 0),
    {
      onError: (error) => setMessage(error.message),
      onSuccess: (result) => {
        setMessage(`Created work order ${result.targetDocumentNo}.`);
        setSelectedOrder(null);
      }
    }
  );

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ label: "Create Plan", onClick: () => setPlanDraft(buildPlanDraft()) }]}
              secondary={[{ label: "Add planned order", onClick: () => setManualOrderDraft(buildManualPlannedOrderDraft()) }, { disabled: true, label: "Schedule MRP run", reason: "MRP recurrence scheduling requires the approved scheduler service." }]}
              utility={[{ disabled: true, label: "Upload planning evidence", reason: "Planning evidence upload uses document control after the plan persistence endpoint is enabled." }]}
              testId="planning-workspace-action-bar"
            />
          </>
        }
        aside={
          <Card title="Planning closeout" description="Demand, MRP, requirements, planned orders, capacity and shortage actions are reviewed from one planning workspace.">
            <div className="utility-grid">
              <Tile eyebrow="MRP" label="Runs">{mrpRuns.length}</Tile>
              <Tile eyebrow="Supply" label="Planned orders">{plannedOrders.length}</Tile>
              <Tile eyebrow="Exceptions" label="Open">{shortages.length}</Tile>
              <Tile eyebrow="Capacity" label="Overloads">{capacityRows.filter((row) => row.status === "Overloaded").length}</Tile>
            </div>
          </Card>
        }
        description="Planner workspace for MPS, MRP snapshots, BOQ/net requirements, pegging, planned orders, capacity and shortage actions."
        filters={
          <ErpFilterBar
            ariaLabel="Planning workspace filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="planning-workspace-filter-bar"
          >
            <input aria-label="Search planning workspace" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search run, item, planned order, shortage, capacity" value={search} />
            <select aria-label="Planning workspace status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Draft">Draft</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Converted">Converted</option>
              <option value="Overloaded">Overloaded</option>
            </select>
          </ErpFilterBar>
        }
        title="Planning Workspace"
      >
        {(mrpQuery.isError || boqQuery.isError || capacityQuery.isError || plannedOrderQuery.isError) ? (
          <Card title="Live planning data unavailable" description="No seeded operational fallback is shown in live mode. Resolve the API issue or switch to explicit demo mode for sample rows.">
            <StatusBadge status="Blocked" />
          </Card>
        ) : null}
        {message ? <Card title="Planning action status" description={message}><StatusBadge status={message.includes("Created") ? "Converted" : "Review"} /></Card> : null}
        <KpiStrip items={[{ label: "Snapshots", value: String(snapshots.length) }, { label: "Planned orders", value: String(plannedOrders.length) }, { label: "Pegging links", value: String(peggingRows.length) }, { label: "Capacity buckets", value: String(capacityRows.length) }, { label: "Shortage actions", value: String(shortages.length) }]} />
        <div className="split-panels">
          <Card title="Snapshot detail / compare" description="MRP snapshot hashes, output counts and deltas are shown per run.">
            <ErpTransactionLineGrid
              ariaLabel="Planning snapshot line grid"
              columns={[
                { key: "run", header: "Run", width: "150px", render: (row) => <strong>{row.runCode}</strong> },
                { key: "type", header: "Type", width: "100px", render: (row) => row.snapshotType },
                { key: "hash", header: "Hash", width: "140px", render: (row) => row.snapshotHash },
                { key: "counts", header: "Input / output / exceptions", render: (row) => `${row.inputCount} / ${row.outputCount} / ${row.exceptionCount}` },
                { key: "planned", header: "Planned", width: "90px", render: (row) => row.plannedOrderCount },
                { key: "delta", header: "Delta", render: (row) => row.deltaSummary },
                { key: "status", header: "Status", width: "110px", render: (row) => <StatusBadge status={row.status} /> }
              ]}
              getRowId={(row) => row.id}
              lines={snapshots}
              testId="planning-snapshot-grid"
            />
          </Card>
          <Card title="Planned orders" description="Purchase, work and transfer planned orders show type-specific fields, firm flags, pegging and conversion gates.">
            <ErpTransactionLineGrid
              ariaLabel="Planning planned order grid"
              columns={[
                { key: "order", header: "Planned order", width: "160px", render: (row) => <strong>{row.orderNo}</strong> },
                { key: "type", header: "Type", width: "100px", render: (row) => row.orderType },
                { key: "item", header: "Item", render: (row) => row.itemLabel },
                { key: "qty", header: "Qty", width: "100px", render: (row) => row.quantity },
                { key: "dates", header: "Start / due", width: "170px", render: (row) => `${row.startDate} / ${row.dueDate}` },
                { key: "source", header: "Source", render: (row) => row.pegging },
                { key: "flags", header: "Flags", width: "160px", render: (row) => `${row.firm ? "Firm" : "Unfirm"} / ${row.expedite ? "Expedite" : "Normal"}` },
                { key: "status", header: "Status", width: "130px", render: (row) => <StatusBadge status={row.status} /> },
                { key: "action", header: "Action", width: "160px", render: (row) => <ErpActionBar secondary={[{ label: "Preview conversion", onClick: () => setSelectedOrder(row) }]} /> }
              ]}
              getRowId={(row) => row.id}
              lines={plannedOrders}
              testId="planning-planned-order-grid"
            />
          </Card>
        </div>
        <div className="split-panels">
          <Card title="Pegging drilldown" description="Demand-to-supply and capacity-source links stay record-specific.">
            <ErpTransactionLineGrid
              ariaLabel="Planning pegging line grid"
              columns={[
                { key: "demand", header: "Demand", render: (row) => row.demand },
                { key: "supply", header: "Supply", render: (row) => row.supply },
                { key: "item", header: "Item / operation", render: (row) => row.itemLabel },
                { key: "qty", header: "Qty/min", width: "100px", render: (row) => row.peggedQuantity },
                { key: "pct", header: "Pegged", width: "100px", render: (row) => `${row.peggingPercent}%` },
                { key: "status", header: "Status", width: "120px", render: (row) => <StatusBadge status={row.status} /> }
              ]}
              getRowId={(row) => row.id}
              lines={peggingRows}
              testId="planning-pegging-grid"
            />
          </Card>
          <Card title="Exception and shortage actions" description="Shortages are assigned, reasoned and gated before downstream conversion.">
            <ErpTransactionLineGrid
              ariaLabel="Planning shortage action grid"
              columns={[
                { key: "source", header: "Source", render: (row) => row.source },
                { key: "item", header: "Item", render: (row) => row.itemLabel },
                { key: "qty", header: "Shortage", width: "100px", render: (row) => row.shortageQuantity },
                { key: "action", header: "Action", width: "110px", render: (row) => row.actionType },
                { key: "owner", header: "Owner / due", render: (row) => `${row.owner} / ${row.dueDate}` },
                { key: "reason", header: "Reason", render: (row) => row.reason },
                { key: "status", header: "Status", width: "100px", render: (row) => <StatusBadge status={row.status} /> },
                { key: "open", header: "Open", width: "130px", render: (row) => <ErpActionBar secondary={[{ label: "Review shortage", onClick: () => setSelectedShortage(row) }]} /> }
              ]}
              getRowId={(row) => row.id}
              lines={shortages}
              testId="planning-shortage-grid"
            />
          </Card>
        </div>
        <Card title="Capacity overview" description="Work-center and machine buckets expose available, required, overload, slack and source operation references.">
          <ErpTransactionLineGrid
            ariaLabel="Planning capacity bucket grid"
            columns={[
              { key: "workCenter", header: "Work center / machine", render: (row) => `${row.workCenterLabel} / ${row.machineLabel}` },
              { key: "date", header: "Bucket", width: "150px", render: (row) => `${row.bucketDate} / ${row.shiftLabel}` },
              { key: "load", header: "Available / required", width: "150px", render: (row) => `${row.availableMinutes} / ${row.loadedMinutes} min` },
              { key: "overload", header: "Overload / slack", width: "140px", render: (row) => `${row.overloadMinutes} / ${Math.max(row.availableMinutes - row.loadedMinutes, 0)} min` },
              { key: "source", header: "Source operation", render: (row) => row.plannedOrderRef },
              { key: "constraint", header: "Constraint", render: (row) => row.constraintSignal },
              { key: "status", header: "Status", width: "110px", render: (row) => <StatusBadge status={row.status} /> }
            ]}
            getRowId={(row) => row.id}
            lines={capacityRows}
            testId="planning-capacity-grid"
          />
        </Card>
        <Card title="Planning documents / evidence" description="Document actions stay explicit until the plan persistence record exists.">
          <ErpFileActionState
            disabledReason="Planning evidence upload requires a saved planning plan or MRP run record before file metadata can be authorized."
            enabled={false}
            label="Upload planning evidence"
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Create or inspect plan headers, scope, time fences, forecast and capacity flags before MPS/MRP execution."
        footer={<ErpActionBar primary={[{ disabled: Boolean(planSaveReason) || savePlanMutation.isPending, label: savePlanMutation.isPending ? "Saving plan" : "Save plan", onClick: planDraft && !planSaveReason ? () => savePlanMutation.mutate(planDraft) : undefined, reason: planSaveReason }]} utility={[{ label: "Close", onClick: () => setPlanDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(planDraft)}
        onClose={() => setPlanDraft(null)}
        panelClassName="ui-modal__panel--item-master"
        title={planDraft?.planCode ?? "Planning plan"}
        validation={<ErpValidationSummary errors={validation} title="Plan checks" />}
      >
        {planDraft ? (
          <FormShell initialFingerprint={planDraft.planCode} title="Plan definition controls">
            <label><span>Plan code</span><input onChange={(event) => setPlanDraft({ ...planDraft, planCode: event.target.value })} value={planDraft.planCode} /></label>
            <label><span>Plan name</span><input onChange={(event) => setPlanDraft({ ...planDraft, planName: event.target.value })} value={planDraft.planName} /></label>
            <ErpLookupField label="Plan type" onChange={(value) => setPlanDraft({ ...planDraft, planType: value })} options={["Supply", "Master production", "Simulation"].map((value) => ({ label: value, value }))} value={planDraft.planType} />
            <ErpLookupField label="Status" onChange={(value) => setPlanDraft({ ...planDraft, status: value })} options={["Draft", "Approved", "Archived"].map((value) => ({ label: value, value }))} value={planDraft.status} />
            <ErpLookupField label="Plant / branch" onChange={(value) => setPlanDraft({ ...planDraft, plant: value })} options={[{ label: user?.activeContext.branchName ?? "Current branch", value: "Current branch" }]} value={planDraft.plant} />
            <label><span>Horizon start</span><input onChange={(event) => setPlanDraft({ ...planDraft, horizonStart: event.target.value })} type="date" value={planDraft.horizonStart} /></label>
            <label><span>Horizon end</span><input onChange={(event) => setPlanDraft({ ...planDraft, horizonEnd: event.target.value })} type="date" value={planDraft.horizonEnd} /></label>
            <ErpNumberField label="Demand fence days" min={0} onChange={(value) => setPlanDraft({ ...planDraft, demandFenceDays: value ?? 0 })} value={planDraft.demandFenceDays} />
            <ErpNumberField label="Planning fence days" min={0} onChange={(value) => setPlanDraft({ ...planDraft, planningFenceDays: value ?? 0 })} value={planDraft.planningFenceDays} />
            <ErpLookupField label="Include forecast" onChange={(value) => setPlanDraft({ ...planDraft, includeForecast: value })} options={["Yes", "No"].map((value) => ({ label: value, value }))} value={planDraft.includeForecast} />
            <ErpLookupField label="Include capacity" onChange={(value) => setPlanDraft({ ...planDraft, includeCapacity: value })} options={["Yes", "No"].map((value) => ({ label: value, value }))} value={planDraft.includeCapacity} />
            <ErpLookupField label="Planner" onChange={(value) => setPlanDraft({ ...planDraft, planner: value })} options={[{ label: "Current planner", value: "Current planner" }]} value={planDraft.planner} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Create a manual planned order with governed item/UOM controls, typed quantities and planning dates."
        footer={
          <ErpActionBar
            primary={[{ disabled: !live || manualOrderErrors.length > 0 || saveManualOrderMutation.isPending, label: saveManualOrderMutation.isPending ? "Saving planned order" : "Save planned order", onClick: manualOrderDraft && live && manualOrderErrors.length === 0 ? () => saveManualOrderMutation.mutate(manualOrderDraft) : undefined, reason: !live ? "Live planning sign-in is required before saving planned orders." : manualOrderErrors[0] }]}
            utility={[{ label: "Close", onClick: () => setManualOrderDraft(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(manualOrderDraft)}
        onClose={() => setManualOrderDraft(null)}
        panelClassName="ui-modal__panel--item-master"
        title={manualOrderDraft?.plannedOrderNo ?? "Manual planned order"}
        validation={<ErpValidationSummary errors={manualOrderErrors} title="Planned order checks" />}
      >
        {manualOrderDraft ? (
          <FormShell initialFingerprint={manualOrderDraft.plannedOrderNo} title="Manual planned order controls">
            <label><span>Planned order number</span><input disabled={!live} onChange={(event) => setManualOrderDraft({ ...manualOrderDraft, plannedOrderNo: event.target.value })} value={manualOrderDraft.plannedOrderNo} /></label>
            <ErpLookupField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before selecting items." : undefined} label="Order type" onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, orderType: value as PlannedOrderRow["orderType"] })} options={["Purchase", "Work", "Transfer"].map((value) => ({ label: value, value }))} required value={manualOrderDraft.orderType} />
            <ErpLookupField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before selecting items." : undefined} label="Item" onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, itemId: Number(value), itemLabel: itemOptions.find((option) => option.value === value)?.label ?? value })} options={itemOptions} required value={manualOrderDraft.itemId ? String(manualOrderDraft.itemId) : ""} />
            <ErpLookupField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before selecting UOM." : undefined} label="UOM" onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, uomId: Number(value) })} options={uomOptions} required value={manualOrderDraft.uomId ? String(manualOrderDraft.uomId) : ""} />
            <ErpDecimalField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before editing quantity." : undefined} label="Quantity" min={0.000001} onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, quantity: value ?? 0 })} value={manualOrderDraft.quantity} />
            <label><span>Start date</span><input disabled={!live} onChange={(event) => setManualOrderDraft({ ...manualOrderDraft, startDate: event.target.value })} type="date" value={manualOrderDraft.startDate} /></label>
            <label><span>Due date</span><input disabled={!live} onChange={(event) => setManualOrderDraft({ ...manualOrderDraft, dueDate: event.target.value })} type="date" value={manualOrderDraft.dueDate} /></label>
            <ErpLookupField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before setting firm flag." : undefined} label="Firm flag" onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, isFirm: value === "Yes" })} options={["No", "Yes"].map((value) => ({ label: value, value }))} value={manualOrderDraft.isFirm ? "Yes" : "No"} />
            <ErpLookupField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before setting expedite flag." : undefined} label="Expedite flag" onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, isExpedite: value === "Yes" })} options={["No", "Yes"].map((value) => ({ label: value, value }))} value={manualOrderDraft.isExpedite ? "Yes" : "No"} />
            <ErpLookupField disabled={!live} disabledReason={!live ? "Live planning sign-in is required before setting status." : undefined} label="Status" onChange={(value) => setManualOrderDraft({ ...manualOrderDraft, status: value })} options={["Draft", "Firm", "Released"].map((value) => ({ label: value, value }))} value={manualOrderDraft.status} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Preview target document creation and row-level validation before converting a planned order."
        footer={
          <ErpActionBar
            primary={[{ disabled: Boolean(convertReason) || convertMutation.isPending, label: convertMutation.isPending ? "Converting" : "Convert to PR", onClick: selectedOrder && !convertReason ? () => convertMutation.mutate(selectedOrder) : undefined, reason: convertReason }]}
            secondary={[
              { disabled: Boolean(workOrderConvertReason) || convertWorkOrderMutation.isPending, label: convertWorkOrderMutation.isPending ? "Converting to WO" : "Convert to WO", onClick: selectedOrder && !workOrderConvertReason ? () => convertWorkOrderMutation.mutate(selectedOrder) : undefined, reason: workOrderConvertReason },
              { disabled: true, label: "Convert to Transfer", reason: "Transfer conversion requires source and destination warehouse/bin resolution." }
            ]}
            utility={[{ label: "Close", onClick: () => setSelectedOrder(null), variant: "quiet" }]}
          />
        }
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="Planned order conversion preview"
      >
        {selectedOrder ? (
          <FormShell initialFingerprint={selectedOrder.id} title="Conversion validation">
            <ErpLookupField disabled disabledReason="Planned order type is calculated from MRP/BOQ action." label="Order type" onChange={() => undefined} options={[{ label: selectedOrder.orderType, value: selectedOrder.orderType }]} value={selectedOrder.orderType} />
            <ErpLookupField disabled disabledReason="Item is controlled by Item Master." label="Item" onChange={() => undefined} options={[{ label: selectedOrder.itemLabel, value: String(selectedOrder.itemId) }]} value={String(selectedOrder.itemId)} />
            <ErpDecimalField disabled disabledReason="Planned quantity is calculated from net requirement." label="Quantity" onChange={() => undefined} value={selectedOrder.quantity} />
            <label><span>Due date</span><input disabled type="date" value={selectedOrder.dueDate} /></label>
            <ErpLookupField disabled disabledReason="Pegging is fixed by the selected MRP/BOQ source row." label="Pegging source" onChange={() => undefined} options={[{ label: selectedOrder.pegging, value: selectedOrder.pegging }]} value={selectedOrder.pegging} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Shortage action review with owner, due date, reason and status. Live sessions persist the action to the planning shortage register."
        footer={<ErpActionBar primary={[{ disabled: !live || saveShortageActionMutation.isPending, label: saveShortageActionMutation.isPending ? "Saving shortage action" : "Save shortage action", onClick: selectedShortage && live ? () => saveShortageActionMutation.mutate(selectedShortage) : undefined, reason: live ? undefined : "Live planning sign-in is required before saving shortage actions." }]} utility={[{ label: "Close", onClick: () => setSelectedShortage(null), variant: "quiet" }]} />}
        isOpen={Boolean(selectedShortage)}
        onClose={() => setSelectedShortage(null)}
        title="Shortage action"
      >
        {selectedShortage ? (
          <FormShell initialFingerprint={selectedShortage.id} title="Shortage action controls">
            <ErpLookupField disabled disabledReason="Action source is controlled by MRP/BOQ pegging." label="Source" onChange={() => undefined} options={[{ label: selectedShortage.source, value: selectedShortage.source }]} value={selectedShortage.source} />
            <ErpLookupField disabled disabledReason="Action type is calculated from recommended planning action." label="Action type" onChange={() => undefined} options={[{ label: selectedShortage.actionType, value: selectedShortage.actionType }]} value={selectedShortage.actionType} />
            <ErpDecimalField disabled disabledReason="Shortage quantity is calculated by netting." label="Shortage quantity" onChange={() => undefined} value={selectedShortage.shortageQuantity} />
            <label><span>Due date</span><input disabled type="date" value={selectedShortage.dueDate} /></label>
            <ErpLookupField disabled disabledReason="Owner assignment follows planning workflow policy." label="Owner" onChange={() => undefined} options={[{ label: selectedShortage.owner, value: selectedShortage.owner }]} value={selectedShortage.owner} />
            <ErpLookupField disabled disabledReason="Reason is controlled by exception and pegging analysis." label="Reason" onChange={() => undefined} options={[{ label: selectedShortage.reason, value: selectedShortage.reason }]} value={selectedShortage.reason} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
