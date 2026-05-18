import { signInMobile } from "./mobileApi";
import type { MobileCredentials, MobileRuntimeContext, MobileSession } from "./mobileTypes";

export async function signInWithDeviceBinding(credentials: MobileCredentials): Promise<{
  session: MobileSession;
  runtime: MobileRuntimeContext;
}> {
  const response = await signInMobile(credentials);
  return {
    session: response.session,
    runtime: response.runtime
  };
}
