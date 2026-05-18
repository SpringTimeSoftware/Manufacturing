import type {
  MobileContext,
  MobileCredentials,
  MobilePhotoEvidence,
  MobileRuntimeContext,
  MobileScanResult,
  MobileScanSource,
  MobileSession,
  MobileTask,
  MobileUdfValue,
  OfflineQueueEntry,
  QueueOfflineOperationInput
} from "./mobileTypes";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string | null;
  data?: T;
  errors?: Array<{ code: string; field?: string | null; message: string }>;
}

interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: number;
    displayName: string;
    languageCode: string;
    roles: string[];
    activeContext: {
      companyId?: number | null;
      branchId?: number | null;
      companyName?: string | null;
      branchName?: string | null;
    };
    availableContexts: Array<{
      companyId: number;
      companyName: string;
      branchId: number;
      branchName: string;
    }>;
  };
}

interface MobileDeviceRegistrationResponse {
  id: number;
  companyId: number;
  branchId: number;
  warehouseId?: number | null;
  deviceCode: string;
  deviceName: string;
  scannerCapability: string;
  cameraCapability: string;
  offlineCapability: boolean;
  trustStatus: string;
  isTrusted: boolean;
  isRevoked: boolean;
  lastSeenOn?: string | null;
  disabledReason?: string | null;
}

interface MobileOfflineOperationResponse {
  id: number;
  operationType: string;
  sourceModule: string;
  idempotencyKey: string;
  queuedOn: string;
  syncedOn?: string | null;
  status: OfflineQueueEntry["status"];
  failureReason?: string | null;
  conflictReason?: string | null;
  serverReferenceNo?: string | null;
  udfValues?: MobileUdfValue[];
}

export const mobileApiConfig = {
  baseUrl: "http://127.0.0.1:5000"
};

let accessToken: string | null = null;

export function setMobileAccessToken(token: string | null) {
  accessToken = token;
}

export async function signInMobile(credentials: MobileCredentials): Promise<{ session: MobileSession; contexts: MobileContext[]; runtime: MobileRuntimeContext }> {
  const auth = await apiFetch<AuthSessionResponse>("/api/auth/login", {
    method: "POST",
    body: {
      userName: credentials.userName,
      password: credentials.password,
      companyId: null,
      branchId: null,
      clientType: "mobile"
    },
    auth: false
  });
  setMobileAccessToken(auth.accessToken);

  const activeContext = toMobileContext(auth.user.activeContext, auth.user.availableContexts[0]);
  const contexts = auth.user.availableContexts.map((context) => toMobileContext(context, context));
  const deviceCode = normalizeDeviceCode(credentials.deviceName, auth.user.userId);
  const device = await apiFetch<MobileDeviceRegistrationResponse>("/api/mobile/devices", {
    method: "POST",
    body: {
      companyId: activeContext.companyId,
      branchId: activeContext.branchId,
      warehouseId: activeContext.warehouseId ?? null,
      deviceCode,
      deviceName: credentials.deviceName.trim() || deviceCode,
      platform: "PWA",
      runtimeName: "ReactNativeShell",
      appVersion: "0.1.0",
      operatingSystem: "browser-or-native",
      browserInfo: "runtime-provided",
      scannerCapability: "HardwareCameraManual",
      cameraCapability: "Unavailable",
      offlineCapability: true,
      credentialReference: "secret://mobile/device-binding",
      requestTrust: false
    }
  });
  const runtime = await getRuntimeContext(device.deviceCode);

  return {
    contexts,
    runtime,
    session: {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      userId: auth.user.userId,
      displayName: auth.user.displayName,
      deviceBindingStatus: device.isTrusted ? "Bound" : "Pending",
      deviceCode: device.deviceCode,
      deviceTrustStatus: device.trustStatus,
      languageCode: auth.user.languageCode,
      roles: auth.user.roles as MobileSession["roles"],
      activeContext,
      availableContexts: contexts
    }
  };
}

export async function getRuntimeContext(deviceCode: string): Promise<MobileRuntimeContext> {
  return apiFetch<MobileRuntimeContext>(`/api/mobile/runtime?deviceCode=${encodeURIComponent(deviceCode)}`, { method: "GET" });
}

export async function listMobileTasks(deviceCode: string): Promise<MobileTask[]> {
  return apiFetch<MobileTask[]>(`/api/mobile/tasks?deviceCode=${encodeURIComponent(deviceCode)}`, { method: "GET" });
}

export async function listOfflineOperations(deviceCode: string): Promise<OfflineQueueEntry[]> {
  const operations = await apiFetch<MobileOfflineOperationResponse[]>(`/api/mobile/offline-operations?deviceCode=${encodeURIComponent(deviceCode)}`, { method: "GET" });
  return operations.map(mapOperation);
}

export async function queueOfflineOperation(
  session: MobileSession,
  activeContext: MobileContext,
  input: QueueOfflineOperationInput
): Promise<OfflineQueueEntry> {
  const operation = await apiFetch<MobileOfflineOperationResponse>("/api/mobile/offline-operations", {
    method: "POST",
    body: {
      companyId: activeContext.companyId,
      branchId: activeContext.branchId,
      warehouseId: activeContext.warehouseId ?? null,
      deviceCode: session.deviceCode,
      operationType: input.operationType,
      sourceModule: input.sourceModule,
      payloadSnapshotJson: input.payloadSnapshotJson,
      udfValues: input.udfValues ?? [],
      idempotencyKey: input.idempotencyKey,
      createdOfflineOn: new Date().toISOString()
    }
  });
  return {
    ...mapOperation(operation),
    actionLabel: input.actionLabel,
    documentRef: input.documentRef,
    udfValues: input.udfValues ?? []
  };
}

export async function syncOfflineOperations(deviceCode: string, queue: OfflineQueueEntry[]): Promise<OfflineQueueEntry[]> {
  const operations = await apiFetch<MobileOfflineOperationResponse[]>("/api/mobile/offline-operations/sync", {
    method: "POST",
    body: {
      deviceCode,
      idempotencyKeys: queue.filter((entry) => entry.idempotencyKey).map((entry) => entry.idempotencyKey)
    }
  });
  return operations.map(mapOperation);
}

export async function resolveScan(
  session: MobileSession,
  activeContext: MobileContext,
  scanValue: string,
  scanSource: MobileScanSource,
  scanContext: string
): Promise<MobileScanResult> {
  return apiFetch<MobileScanResult>("/api/mobile/scans/resolve", {
    method: "POST",
    body: {
      companyId: activeContext.companyId,
      branchId: activeContext.branchId,
      warehouseId: activeContext.warehouseId ?? null,
      deviceCode: session.deviceCode,
      scanValue,
      scanSource,
      scanContext,
      scanTimestamp: new Date().toISOString(),
      payloadSnapshotJson: JSON.stringify({ source: "mobile-runtime", scanContext })
    }
  });
}

export async function captureEvidence(
  session: MobileSession,
  activeContext: MobileContext,
  input: {
    sourceModule: string;
    sourceDocumentType: string;
    sourceDocumentId?: number | null;
    sourceDocumentNo?: string | null;
    evidenceType: string;
    fileName: string;
    contentType: string;
  }
): Promise<MobilePhotoEvidence> {
  return apiFetch<MobilePhotoEvidence>("/api/mobile/photo-evidence", {
    method: "POST",
    body: {
      companyId: activeContext.companyId,
      branchId: activeContext.branchId,
      warehouseId: activeContext.warehouseId ?? null,
      deviceCode: session.deviceCode,
      sourceModule: input.sourceModule,
      sourceDocumentType: input.sourceDocumentType,
      sourceDocumentId: input.sourceDocumentId ?? null,
      sourceDocumentNo: input.sourceDocumentNo ?? null,
      evidenceType: input.evidenceType,
      fileName: input.fileName,
      contentType: input.contentType,
      attachmentId: null,
      capturedOn: new Date().toISOString(),
      metadataJson: JSON.stringify({ captureMode: "metadata-pending-binary-upload" })
    }
  });
}

async function apiFetch<T>(path: string, options: { method: "GET" | "POST"; body?: unknown; auth?: boolean }): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.auth !== false && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${mobileApiConfig.baseUrl}${path}`, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !envelope.success) {
    const message = envelope.errors?.map((error) => error.message).join("; ") || envelope.message || "Mobile API request failed.";
    throw new Error(message);
  }

  if (envelope.data === undefined) {
    throw new Error("Mobile API response did not include data.");
  }

  return envelope.data;
}

function toMobileContext(
  context: { companyId?: number | null; companyName?: string | null; branchId?: number | null; branchName?: string | null },
  fallback: { companyId: number; companyName: string; branchId: number; branchName: string }
): MobileContext {
  return {
    companyId: context.companyId ?? fallback.companyId,
    companyName: context.companyName ?? fallback.companyName,
    branchId: context.branchId ?? fallback.branchId,
    branchName: context.branchName ?? fallback.branchName,
    warehouseId: null,
    warehouseLabel: "Warehouse scope from server"
  };
}

function normalizeDeviceCode(deviceName: string, userId: number): string {
  const normalized = deviceName.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").toUpperCase();
  return normalized ? `MOB-${normalized}` : `MOB-USER-${userId}`;
}

function mapOperation(operation: MobileOfflineOperationResponse): OfflineQueueEntry {
  return {
    id: String(operation.id),
    module: operation.sourceModule,
    actionLabel: operation.operationType,
    documentRef: operation.serverReferenceNo ?? operation.idempotencyKey,
    queuedOnLabel: new Date(operation.queuedOn).toLocaleString(),
    status: operation.status,
    auditLabel: operation.syncedOn ? `Synced ${new Date(operation.syncedOn).toLocaleString()}` : `Idempotency ${operation.idempotencyKey}`,
    failureReason: operation.failureReason,
    conflictReason: operation.conflictReason,
    idempotencyKey: operation.idempotencyKey,
    serverReferenceNo: operation.serverReferenceNo,
    udfValues: operation.udfValues ?? []
  };
}
