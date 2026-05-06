import type { MobileContext, MobileCredentials, MobileSession } from "./mobileTypes";

export function signInWithDeviceBinding(credentials: MobileCredentials, activeContext: MobileContext): MobileSession {
  const name = credentials.userName.trim() || "operator";

  return {
    accessToken: `demo-mobile-${name}`,
    displayName: name.replace(/[._-]/g, " "),
    deviceBindingStatus: credentials.deviceName.trim() ? "Bound" : "Pending",
    languageCode: "en-IN",
    roles: ["ProductionSupervisor", "MachineOperator", "StoreKeeper", "QCInspector"],
    activeContext
  };
}
