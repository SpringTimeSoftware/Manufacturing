import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function read(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Pack 09 mobile barcode/camera/offline completion truth", () => {
  it("does not wire authenticated mobile runtime to seeded operational data", () => {
    const app = read("src/mobile/App.tsx");
    const shell = read("src/mobile/src/MobileShell.tsx");
    const auth = read("src/mobile/src/mobileAuth.ts");

    expect(app).not.toMatch(/mobileSeedData|seededMobileContexts|seededOfflineQueue|demo-mobile/);
    expect(shell).not.toMatch(/mobileSeedData|seededRoleNavigationRules|seeded[A-Z]/);
    expect(auth).not.toMatch(/demo-mobile|seeded/);
    expect(app).toMatch(/listMobileTasks|listOfflineOperations|getRuntimeContext/);
  });

  it("uses live mobile APIs for device trust, scan resolution, offline queue, sync, and evidence", () => {
    const api = read("src/mobile/src/mobileApi.ts");

    expect(api).toMatch(/\/api\/auth\/login/);
    expect(api).toMatch(/\/api\/mobile\/devices/);
    expect(api).toMatch(/\/api\/mobile\/runtime/);
    expect(api).toMatch(/\/api\/mobile\/tasks/);
    expect(api).toMatch(/\/api\/mobile\/scans\/resolve/);
    expect(api).toMatch(/\/api\/mobile\/offline-operations/);
    expect(api).toMatch(/\/api\/mobile\/offline-operations\/sync/);
    expect(api).toMatch(/\/api\/mobile\/photo-evidence/);
    expect(api).toMatch(/Bearer/);
  });

  it("labels manual scans separately and blocks fake camera success", () => {
    const material = read("src/mobile/src/screens/MaterialScanScreen.tsx");
    const device = read("src/mobile/src/screens/DeviceUtilitiesScreen.tsx");

    expect(material).toMatch(/Manual/);
    expect(material).toMatch(/Hardware/);
    expect(material).toMatch(/Camera unavailable|cameraCapability/);
    expect(material).toMatch(/Resolve scan through live API/);
    expect(device).toMatch(/Manual entry fallback/);
    expect(device).toMatch(/Camera barcode scanning requires a runtime camera adapter/);
    expect(device).not.toMatch(/captured in the device queue|simulated success/i);
  });

  it("makes offline sync durable and conflict-aware in the mobile UI", () => {
    const settings = read("src/mobile/src/screens/SettingsSyncStatusScreen.tsx");
    const stock = read("src/mobile/src/screens/InventoryMovementScreen.tsx");

    expect(settings).toMatch(/Sync queued operations/);
    expect(settings).toMatch(/Conflict/);
    expect(settings).toMatch(/idempotency|conflictReason|failureReason/i);
    expect(stock).toMatch(/Final posting will be server-validated during sync/);
    expect(stock).toMatch(/Queue transfer draft|Queue cycle count draft/);
  });

  it("uses persisted evidence and POD queue semantics instead of local-only success", () => {
    const quality = read("src/mobile/src/screens/QualityCaptureScreen.tsx");
    const dispatch = read("src/mobile/src/screens/DispatchProofScreen.tsx");

    expect(quality).toMatch(/onCaptureEvidence/);
    expect(quality).toMatch(/PendingUpload|pending upload/i);
    expect(dispatch).toMatch(/MobilePod/);
    expect(dispatch).toMatch(/POD sync remains idempotent/);
    expect(dispatch).toMatch(/Record POD evidence metadata/);
    expect(dispatch).not.toMatch(/setActionMessage\(`Package scan queued/);
  });
});
