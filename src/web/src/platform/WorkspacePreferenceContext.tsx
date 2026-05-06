import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { WarehouseOption } from "../api/contracts";
import { useAuth } from "../auth/AuthContext";

const storageKey = "sts-mfg.web.workspace-preference";

const seededWarehouses: WarehouseOption[] = [
  {
    warehouseId: 101,
    warehouseCode: "RM-STORE",
    warehouseName: "Raw Material Store",
    branchId: 10,
    zoneLabel: "Issue and receipt staging"
  },
  {
    warehouseId: 102,
    warehouseCode: "WIP-BAY",
    warehouseName: "WIP Bay",
    branchId: 10,
    zoneLabel: "Job card and queue-side stock"
  },
  {
    warehouseId: 103,
    warehouseCode: "FG-DOCK",
    warehouseName: "Finished Goods Dispatch",
    branchId: 10,
    zoneLabel: "Ready-to-ship staging"
  },
  {
    warehouseId: 201,
    warehouseCode: "HUB-IN",
    warehouseName: "Central Hub Inbound",
    branchId: 11,
    zoneLabel: "Transfer and receipt consolidation"
  },
  {
    warehouseId: 202,
    warehouseCode: "HUB-OUT",
    warehouseName: "Central Hub Dispatch Dock",
    branchId: 11,
    zoneLabel: "Dispatch and customer handoff"
  }
];

interface WorkspacePreferenceValue {
  selectedWarehouseId: number | null;
  selectedWarehouse: WarehouseOption | null;
  availableWarehouses: WarehouseOption[];
  getWarehousesForBranch: (branchId: number | null) => WarehouseOption[];
  setSelectedWarehouseId: (warehouseId: number | null) => void;
}

const WorkspacePreferenceContext = createContext<WorkspacePreferenceValue | undefined>(undefined);

function readStoredPreferences() {
  if (typeof window === "undefined") {
    return {} as Record<string, number>;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeStoredPreferences(preferences: Record<string, number>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(preferences));
}

export function WorkspacePreferenceProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [selectedWarehouseId, setSelectedWarehouseIdState] = useState<number | null>(null);

  const warehouseCatalog = useMemo(() => {
    const allowedIds = new Set(session?.user.scope.allowedWarehouseIds ?? []);
    const currentBranchId = session?.user.activeContext.branchId ?? null;

    if (allowedIds.size === 0) {
      return [] as WarehouseOption[];
    }

    const matchingSeed = seededWarehouses.filter((warehouse) => allowedIds.has(warehouse.warehouseId));

    if (matchingSeed.length > 0) {
      return matchingSeed;
    }

    return Array.from(allowedIds).map((warehouseId) => ({
      warehouseId,
      warehouseCode: `WH-${warehouseId}`,
      warehouseName: `Warehouse ${warehouseId}`,
      branchId: currentBranchId ?? 0,
      zoneLabel: "Pending live warehouse master binding"
    }));
  }, [session?.user.activeContext.branchId, session?.user.scope.allowedWarehouseIds]);

  const getWarehousesForBranch = useMemo(
    () => (branchId: number | null) => {
      if (!branchId) {
        return [] as WarehouseOption[];
      }

      const branchMatches = warehouseCatalog.filter((warehouse) => warehouse.branchId === branchId);

      if (branchMatches.length > 0) {
        return branchMatches;
      }

      return warehouseCatalog.map((warehouse) => ({
        ...warehouse,
        branchId
      }));
    },
    [warehouseCatalog]
  );

  useEffect(() => {
    const branchId = session?.user.activeContext.branchId;
    const branchWarehouses = getWarehousesForBranch(branchId ?? null);

    if (!branchId || branchWarehouses.length === 0) {
      setSelectedWarehouseIdState(null);
      return;
    }

    const stored = readStoredPreferences();
    const storedWarehouseId = stored[String(branchId)];
    const matchingStored = branchWarehouses.find((warehouse) => warehouse.warehouseId === storedWarehouseId);

    setSelectedWarehouseIdState(matchingStored?.warehouseId ?? branchWarehouses[0].warehouseId);
  }, [getWarehousesForBranch, session?.user.activeContext.branchId]);

  const value = useMemo<WorkspacePreferenceValue>(() => {
    const branchId = session?.user.activeContext.branchId ?? null;
    const availableWarehouses = getWarehousesForBranch(branchId);
    const selectedWarehouse =
      availableWarehouses.find((warehouse) => warehouse.warehouseId === selectedWarehouseId) ?? null;

    return {
      selectedWarehouseId,
      selectedWarehouse,
      availableWarehouses,
      getWarehousesForBranch,
      setSelectedWarehouseId: (warehouseId) => {
        const activeBranchId = session?.user.activeContext.branchId;

        setSelectedWarehouseIdState(warehouseId);

        if (!activeBranchId || !warehouseId) {
          return;
        }

        const stored = readStoredPreferences();
        stored[String(activeBranchId)] = warehouseId;
        writeStoredPreferences(stored);
      }
    };
  }, [getWarehousesForBranch, selectedWarehouseId, session?.user.activeContext.branchId]);

  return (
    <WorkspacePreferenceContext.Provider value={value}>
      {children}
    </WorkspacePreferenceContext.Provider>
  );
}

export function useWorkspacePreference() {
  const context = useContext(WorkspacePreferenceContext);

  if (!context) {
    throw new Error("useWorkspacePreference must be used within WorkspacePreferenceProvider.");
  }

  return context;
}
