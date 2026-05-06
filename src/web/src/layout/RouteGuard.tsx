import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { RoleCode } from "../api/contracts";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../ui/Card";
import { PageSkeleton } from "../ui/Skeleton";

export function RouteGuard({ children, roles }: PropsWithChildren<{ roles?: RoleCode[] }>) {
  const location = useLocation();
  const { isAllowed, status } = useAuth();

  if (status === "restoring") {
    return (
      <div className="app-splash">
        <Card title="Restoring session" description="Reloading auth state, role scope, and operating context.">
          <PageSkeleton rows={4} />
        </Card>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (!isAllowed(roles)) {
    return (
      <div className="app-splash">
        <Card
          title="Access limited by role scope"
          description="The current role can see this navigation group but cannot open the selected workspace."
        />
      </div>
    );
  }

  return children;
}
