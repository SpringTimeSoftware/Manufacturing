import type {
  ActionResponse,
  ApprovalDecisionRequest,
  ApprovalWorkItem,
  ForgotPasswordRequest,
  ForgotPasswordResponse
} from "../api/contracts";
import { apiClient } from "../api/http";
import { readStoredSession } from "../auth/authStorage";

export const seededApprovalItems: ApprovalWorkItem[] = [
  {
    id: "approval-bom-r4",
    module: "Engineering",
    documentType: "BOM Revision",
    referenceNo: "BOM-FG-OZ-50 / R4",
    title: "Approve revised ozone tank BOM",
    summary: "Revision R4 adds the calibrated leak-test clamp and updates the welding checkpoint notes before release.",
    submittedBy: "Neha Patel",
    submittedOn: "2026-04-18T06:45:00Z",
    dueOn: "2026-04-18T12:30:00Z",
    status: "Pending",
    priority: "High",
    stepName: "Engineering release",
    auditActionLabel: "Approve BOM revision",
    relatedNotificationId: "notif-bom-approval",
    actionPath: "/engineering/boms",
    tags: ["ECO", "QC checkpoint", "Release"]
  },
  {
    id: "approval-wo-release",
    module: "Production",
    documentType: "Work order",
    referenceNo: "WO-02642",
    title: "Approve work-order re-release after supplier slip",
    summary: "Planning has rerouted welding and requested a controlled re-release because RM-SS-SHEET arrived one shift late.",
    submittedBy: "Ritika Sharma",
    submittedOn: "2026-04-18T07:10:00Z",
    dueOn: "2026-04-18T10:00:00Z",
    status: "Escalated",
    priority: "High",
    stepName: "Plant head release gate",
    auditActionLabel: "Approve re-release",
    relatedNotificationId: "notif-wo-risk",
    actionPath: "/production/work-orders",
    tags: ["Capacity", "Shortage", "Reschedule"]
  },
  {
    id: "approval-po-2204",
    module: "Procurement",
    documentType: "Purchase order",
    referenceNo: "PO-02204",
    title: "Approve outside-processing PO for powder coat run",
    summary: "The outside-processing lot needs approval before semi-finished stock is dispatched to the vendor tomorrow morning.",
    submittedBy: "Amit Desai",
    submittedOn: "2026-04-18T05:20:00Z",
    dueOn: "2026-04-19T04:00:00Z",
    status: "Pending",
    priority: "Medium",
    stepName: "Purchase manager approval",
    auditActionLabel: "Approve outside-processing PO",
    actionPath: "/partners/suppliers",
    tags: ["Subcontract", "Vendor", "Lead time"]
  },
  {
    id: "approval-ai-summary",
    module: "AI",
    documentType: "Daily summary draft",
    referenceNo: "AI-SUM-2026-04-18-A",
    title: "Approve plant-head daily summary draft",
    summary: "The generated summary explains stage-wise blockers, dispatch risk, and downtime trends before it is shared externally.",
    submittedBy: "AI Draft Assistant",
    submittedOn: "2026-04-18T08:05:00Z",
    dueOn: "2026-04-18T13:30:00Z",
    status: "Pending",
    priority: "Low",
    stepName: "Management review",
    auditActionLabel: "Approve AI summary",
    actionPath: "/dashboards/stage-wise",
    tags: ["AI", "Summary", "Management"]
  }
];

function wait(durationMs = 240) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function hasLiveSession() {
  const session = readStoredSession();
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

export async function requestForgotPassword(
  request: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  try {
    return await apiClient.auth.forgotPassword(request);
  } catch {
    // Keep the guarded recovery UX usable before the database pack is applied.
  }

  await wait();

  const channelSummary =
    request.channel === "Email"
      ? "If the account can be verified, reset guidance will be sent to the registered mailbox."
      : request.channel === "SMS"
        ? "If the account can be verified, recovery guidance will be sent to the registered mobile number."
        : "If the account can be verified, authenticator recovery guidance will be prepared for the next sign-in.";

  return {
    requestToken: `reset-${Date.now()}`,
    message: "Recovery guidance was prepared if the account details are valid.",
    deliverySummary: channelSummary,
    availableChallenges: [
      "Password reset link",
      "Recovery code rotation",
      "Helpdesk callback verification"
    ],
    expiresOnUtc: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
    pendingEndpoint: "/api/auth/forgot-password"
  };
}

export async function listApprovalWorkItems(): Promise<ApprovalWorkItem[]> {
  if (hasLiveSession()) {
    try {
      return await apiClient.approvals.list();
    } catch {
      throw new Error("Approval queue could not be loaded. Retry after the approval service is available.");
    }
  }

  await wait(120);
  return seededApprovalItems;
}

export async function submitApprovalDecision(
  approval: ApprovalWorkItem,
  request: ApprovalDecisionRequest
): Promise<ActionResponse> {
  if (hasLiveSession()) {
    try {
      return await apiClient.approvals.decide(approval.id, request);
    } catch {
      throw new Error("Approval decision could not be recorded. Retry after the approval service is available.");
    }
  }

  await wait(180);

  return {
    id: approval.id,
    status: request.decision,
    referenceNo: approval.referenceNo,
    warnings:
      request.decision === "Reject" && !request.remarks
        ? ["Add remarks before rejecting this approval."]
        : []
  };
}
