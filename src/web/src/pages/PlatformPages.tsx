import { startTransition, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import type { ApprovalWorkItem, NotificationItem } from "../api/contracts";
import { useAuth } from "../auth/AuthContext";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import { useI18n } from "../i18n/I18nProvider";
import { useNotifications } from "../notifications/NotificationProvider";
import {
  listApprovalWorkItems,
  requestForgotPassword,
  submitApprovalDecision
} from "../platform/platformAdapters";
import { useWorkspacePreference } from "../platform/WorkspacePreferenceContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { Drawer } from "../ui/Drawer";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { KpiCard } from "../ui/KpiCard";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

export function ForgotPasswordPage() {
  const { status } = useAuth();
  const { t } = useI18n();
  const [userNameOrEmail, setUserNameOrEmail] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [channel, setChannel] = useState<"Email" | "SMS" | "Authenticator">("Email");
  const [recoveryMode, setRecoveryMode] = useState<"PasswordReset" | "MfaRecovery">("PasswordReset");
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof requestForgotPassword>> | null>(null);

  if (status === "authenticated") {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="login-layout login-layout--enterprise">
      <section className="login-hero">
        <div className="login-hero__headline">
          <div className="context-chip-row">
            <Badge tone="info">Account access</Badge>
            <Badge tone="info">Password reset</Badge>
            <Badge tone="info">MFA recovery</Badge>
          </div>
          <h1>Recover access to STS Manufacturing ERP</h1>
          <p>
            Request password reset guidance or MFA recovery without revealing whether an account exists.
          </p>
        </div>
        <div className="login-hero__grid">
          <KpiCard label="Recovery path" value="Auditable" hint="Each request keeps a reviewable action trail." />
          <KpiCard label="Company scope" value="Active" hint="Recovery stays tied to company and branch context." />
          <KpiCard label="Delivery channel" value="Selectable" hint="Choose the best recovery channel for the request." />
          <KpiCard label="MFA recovery" value="Included" hint="Authenticator lockout guidance is part of the same flow." />
        </div>
      </section>

      <main aria-label={t("auth.forgotPassword")} className="login-shell">
        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setSubmitting(true);
            startTransition(() => {
              setSubmitError(null);
              setResult(null);
            });

            try {
              const response = await requestForgotPassword({
                userNameOrEmail,
                companyCode,
                channel,
                recoveryMode
              });

              startTransition(() => {
                setResult(response);
              });
            } catch (error) {
              setSubmitError(
                error instanceof Error
                  ? error.message
                  : "Recovery request could not be submitted. Contact your administrator."
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="login-form__header">
            <span className="login-eyebrow">Account recovery</span>
            <h2>Recover access</h2>
            <p>
              Submit your account and company details. If the account can be verified, recovery guidance will
              be sent through the selected channel.
            </p>
          </div>

          {submitError ? <div className="login-form__error">{submitError}</div> : null}

          <div className="login-form__grid">
            <label>
              <span>User name or email</span>
              <input
                autoComplete="username"
                onChange={(event) => setUserNameOrEmail(event.target.value)}
                required
                value={userNameOrEmail}
              />
            </label>
            <label>
              <span>Company code</span>
              <input
                autoComplete="organization"
                onChange={(event) => setCompanyCode(event.target.value)}
                required
                value={companyCode}
              />
            </label>
            <label>
              <span>Recovery channel</span>
              <select onChange={(event) => setChannel(event.target.value as typeof channel)} value={channel}>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Authenticator">Authenticator recovery</option>
              </select>
            </label>
            <label>
              <span>Recovery mode</span>
              <select onChange={(event) => setRecoveryMode(event.target.value as typeof recoveryMode)} value={recoveryMode}>
                <option value="PasswordReset">Password reset</option>
                <option value="MfaRecovery">MFA recovery</option>
              </select>
            </label>
          </div>

          <div className="context-chip-row">
            <Button disabled={isSubmitting} fullWidth variant="primary" type="submit">
              {isSubmitting ? "Preparing recovery..." : "Request recovery guidance"}
            </Button>
            <Link className="login-form__link login-form__link--button" to="/login">
              Back to sign in
            </Link>
          </div>

          {result ? (
            <div className="notification-item">
              <strong>{result.message}</strong>
              <p>{result.deliverySummary}</p>
              <div className="context-chip-row">
                <Badge tone="info">Security review queued</Badge>
                <Badge tone="warn">{`Expires ${new Date(result.expiresOnUtc).toLocaleTimeString("en-IN")}`}</Badge>
              </div>
              <div className="ui-inline-badges">
                {result.availableChallenges.map((challenge) => (
                  <Badge key={challenge} tone="neutral">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </form>
      </main>
    </div>
  );
}

export function ContextSwitchPage() {
  const { session, switchContext } = useAuth();
  const { selectedWarehouse, selectedWarehouseId, getWarehousesForBranch, setSelectedWarehouseId } =
    useWorkspacePreference();
  const [draftCompanyId, setDraftCompanyId] = useState<number>(session?.user.activeContext.companyId ?? 0);
  const [draftBranchId, setDraftBranchId] = useState<number>(session?.user.activeContext.branchId ?? 0);
  const [draftWarehouseId, setDraftWarehouseId] = useState<number | null>(selectedWarehouseId);
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availableContexts = session?.user.availableContexts ?? [];
  const companies = useMemo(() => {
    const map = new Map<number, string>();

    for (const context of availableContexts) {
      map.set(context.companyId, context.companyName);
    }

    return Array.from(map.entries()).map(([companyId, companyName]) => ({ companyId, companyName }));
  }, [availableContexts]);

  const availableBranches = availableContexts.filter((context) => context.companyId === draftCompanyId);
  const availableWarehouses = getWarehousesForBranch(draftBranchId);

  useEffect(() => {
    if (availableBranches.length === 0) {
      return;
    }

    const branchExists = availableBranches.some((branch) => branch.branchId === draftBranchId);

    if (!branchExists) {
      setDraftBranchId(availableBranches[0].branchId);
    }
  }, [availableBranches, draftBranchId]);

  useEffect(() => {
    if (availableWarehouses.length === 0) {
      setDraftWarehouseId(null);
      return;
    }

    const warehouseExists = availableWarehouses.some((warehouse) => warehouse.warehouseId === draftWarehouseId);

    if (!warehouseExists) {
      setDraftWarehouseId(availableWarehouses[0].warehouseId);
    }
  }, [availableWarehouses, draftWarehouseId]);

  return (
    <ListPageShell
      actions={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              setDraftCompanyId(session?.user.activeContext.companyId ?? 0);
              setDraftBranchId(session?.user.activeContext.branchId ?? 0);
              setDraftWarehouseId(selectedWarehouseId);
              setMessage(null);
              setSubmitError(null);
            }}
          >
            Reset
          </Button>
          <Button
            disabled={isSubmitting || draftCompanyId === 0 || draftBranchId === 0}
            variant="primary"
            onClick={async () => {
              setSubmitting(true);
              startTransition(() => {
                setMessage(null);
                setSubmitError(null);
              });

              try {
                if (
                  draftCompanyId !== session?.user.activeContext.companyId ||
                  draftBranchId !== session?.user.activeContext.branchId
                ) {
                  await switchContext({
                    companyId: draftCompanyId,
                    branchId: draftBranchId
                  });
                }

                setSelectedWarehouseId(draftWarehouseId);

                startTransition(() => {
                  setMessage("Operating context and preferred warehouse were updated.");
                });
              } catch (error) {
                setSubmitError(error instanceof Error ? error.message : "Operating context switch failed.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Switching..." : "Apply context"}
          </Button>
        </>
      }
      aside={
        <Card title="Workspace guidance" description="Choose the company, branch, and warehouse context for your current work session.">
          <div className="notification-item">
            <strong>Company and branch</strong>
            <p>Your selected company and branch determine the records, dashboards, and actions shown in the workspace.</p>
          </div>
          <div className="notification-item">
            <strong>Preferred warehouse</strong>
            <p>The warehouse selection keeps store and inventory screens focused on the location you use most often.</p>
          </div>
        </Card>
      }
      description="Switch company, branch, and preferred warehouse without signing out."
      title="Company / Branch / Warehouse Switch"
    >
      <KpiStrip
        items={[
          { label: "Company", value: session?.user.activeContext.companyCode ?? "None" },
          { label: "Branch", value: session?.user.activeContext.branchCode ?? "None" },
          { label: "Warehouse", value: selectedWarehouse?.warehouseCode ?? "Not pinned" },
          { label: "Scope IDs", value: String(session?.user.scope.allowedWarehouseIds.length ?? 0), hint: "Allowed warehouses" }
        ]}
      />

      <div className="split-panels">
        <FormShell
          description="Select the operating context for the current session."
          initialFingerprint={`${draftCompanyId}:${draftBranchId}:${draftWarehouseId ?? 0}`}
          title="Operating context"
          validationErrors={submitError ? [submitError] : []}
        >
          <label>
            <span>Company</span>
            <select onChange={(event) => setDraftCompanyId(Number(event.target.value))} value={draftCompanyId}>
              {companies.map((company) => (
                <option key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Branch</span>
            <select onChange={(event) => setDraftBranchId(Number(event.target.value))} value={draftBranchId}>
              {availableBranches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Preferred warehouse</span>
            <select
              onChange={(event) => setDraftWarehouseId(Number(event.target.value))}
              value={draftWarehouseId ?? ""}
            >
              {availableWarehouses.map((warehouse) => (
                <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                  {warehouse.warehouseName}
                </option>
              ))}
            </select>
          </label>
          {message ? <div className="ui-validation-summary">{message}</div> : null}
        </FormShell>

        <Card title="Workspace preview" description="Review the work context before applying the change.">
          <div className="utility-grid">
            <Tile label="Next company" meta="Company scope">
              {companies.find((company) => company.companyId === draftCompanyId)?.companyName ?? "No company"}
            </Tile>
            <Tile label="Next branch" meta="Branch scope">
              {availableBranches.find((branch) => branch.branchId === draftBranchId)?.branchName ?? "No branch"}
            </Tile>
            <Tile label="Warehouse" meta="Warehouse preference">
              {availableWarehouses.find((warehouse) => warehouse.warehouseId === draftWarehouseId)?.warehouseName ??
                "No warehouse"}
            </Tile>
          </div>
        </Card>
      </div>
    </ListPageShell>
  );
}

const notificationColumns: DataGridColumn<NotificationItem>[] = [
  {
    key: "title",
    header: "Notification",
    width: "32%",
    render: (record) => (
      <div>
        <strong>{record.title}</strong>
        <div className="muted">{record.documentRef ?? record.body}</div>
      </div>
    )
  },
  {
    key: "module",
    header: "Module",
    width: "16%",
    render: (record) => (
      <div>
        <Badge tone={record.severity}>{record.module}</Badge>
        {record.category ? <div className="muted">{record.category}</div> : null}
      </div>
    )
  },
  {
    key: "status",
    header: "Status",
    width: "16%",
    render: (record) => (
      <Badge tone={record.requiresAction ? "warn" : record.isRead ? "success" : "info"}>
        {record.requiresAction ? "Action due" : record.isRead ? "Read" : "Unread"}
      </Badge>
    )
  },
  {
    key: "time",
    header: "Created",
    width: "18%",
    render: (record) => new Date(record.createdAt).toLocaleString("en-IN")
  },
  {
    key: "action",
    header: "Audit label",
    width: "18%",
    render: (record) => record.auditActionLabel ?? record.actionLabel ?? "Review notification"
  }
];

export function NotificationInboxPage() {
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const { markAllAsRead, markAsRead, notifications, unreadCount } = useNotifications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selected, setSelected] = useState<NotificationItem | null>(notifications[0] ?? null);

  const filtered = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        `${notification.title} ${notification.body} ${notification.documentRef ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !notification.isRead) ||
        (statusFilter === "read" && notification.isRead) ||
        (statusFilter === "actionable" && Boolean(notification.requiresAction));
      const matchesModule = moduleFilter === "all" || notification.module === moduleFilter;

      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [moduleFilter, notifications, search, statusFilter]);

  const actionableCount = notifications.filter((notification) => notification.requiresAction).length;

  return (
    <>
      <ListPageShell
        actions={
          <Button disabled={unreadCount === 0} variant="secondary" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        }
        description="System alerts, approvals, and reminder inbox for the current workspace."
        filters={
          <FilterBar>
            <input
              aria-label="Search notifications"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title / document / message"
              value={search}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Status: All</option>
              <option value="unread">Unread</option>
              <option value="actionable">Action due</option>
              <option value="read">Read</option>
            </select>
            <select onChange={(event) => setModuleFilter(event.target.value)} value={moduleFilter}>
              <option value="all">Module: All</option>
              {Array.from(new Set(notifications.map((notification) => notification.module))).map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </FilterBar>
        }
        title="Notification Center"
      >
        {!flags.enableNotificationCenter ? (
          <EmptyState
            description="The shared notification toggle is off, so the inbox is paused."
            hint="Re-enable notifications from Platform Settings to restore this workspace."
            title="Notification center is paused"
          />
        ) : (
          <>
            <KpiStrip
              items={[
                { label: "Total", value: String(notifications.length) },
                { label: "Unread", value: String(unreadCount) },
                { label: "Action due", value: String(actionableCount) },
                {
                  label: "Approval alerts",
                  value: String(notifications.filter((notification) => notification.category === "Approval").length)
                }
              ]}
            />
            <Card title="Inbox grid" description="Scan alerts and approval reminders before they escalate into missed release gates.">
              <DataGrid
                ariaLabel="Notification inbox"
                columns={notificationColumns}
                emptyState={{
                  title: "No notifications match the current filters",
                  description: "Adjust the search, status, or module filter to restore the inbox.",
                  hint: "Reminder flow is available for review in the current workspace."
                }}
                getRowId={(record) => record.id}
                onRowSelect={setSelected}
                records={filtered}
                rowLabel={(record) => `${record.title} ${record.module}`}
                virtualization={{ enabled: flags.enableDenseGridVirtualization }}
              />
            </Card>
          </>
        )}
      </ListPageShell>

      <Drawer
        description="Audit-friendly notification detail with compatible open and mark-read actions."
        footer={
          selected ? (
            <div className="context-chip-row">
              {!selected.isRead ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    markAsRead(selected.id);
                    setSelected({ ...selected, isRead: true });
                  }}
                >
                  {selected.auditActionLabel ?? "Acknowledge notification"}
                </Button>
              ) : null}
              {selected.actionPath ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    markAsRead(selected.id);
                    navigate(selected.actionPath ?? "/");
                  }}
                >
                  {selected.actionLabel ?? "Open linked record"}
                </Button>
              ) : null}
            </div>
          ) : null
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title ?? "Notification detail"}
      >
        {selected ? (
          <Card title={selected.documentRef ?? selected.module} description={selected.body}>
            <div className="utility-grid">
              <Tile label="Module" meta="Source">{selected.module}</Tile>
              <Tile label="Category" meta="Notification type">{selected.category ?? "Alert"}</Tile>
              <Tile label="Status" meta="Review state">
                {selected.requiresAction ? "Action due" : selected.isRead ? "Read" : "Unread"}
              </Tile>
              <Tile label="Audit label" meta="Action wording">
                {selected.auditActionLabel ?? selected.actionLabel ?? "Review notification"}
              </Tile>
            </div>
          </Card>
        ) : null}
      </Drawer>
    </>
  );
}

const approvalColumns: DataGridColumn<ApprovalWorkItem>[] = [
  {
    key: "title",
    header: "Approval item",
    width: "30%",
    render: (record) => (
      <div>
        <strong>{record.title}</strong>
        <div className="muted">{`${record.referenceNo} / ${record.stepName}`}</div>
      </div>
    )
  },
  {
    key: "module",
    header: "Module",
    width: "16%",
    render: (record) => <Badge tone={record.priority === "High" ? "danger" : record.priority === "Medium" ? "warn" : "info"}>{record.module}</Badge>
  },
  {
    key: "submittedBy",
    header: "Submitted by",
    width: "16%",
    render: (record) => (
      <div>
        <strong>{record.submittedBy}</strong>
        <div className="muted">{new Date(record.submittedOn).toLocaleString("en-IN")}</div>
      </div>
    )
  },
  {
    key: "dueOn",
    header: "Due",
    width: "14%",
    render: (record) => new Date(record.dueOn).toLocaleString("en-IN")
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => (
      <Badge tone={record.status === "Escalated" ? "danger" : record.status === "Pending" ? "warn" : record.status === "Approved" ? "success" : "info"}>
        {record.status}
      </Badge>
    )
  },
  {
    key: "audit",
    header: "Audit label",
    width: "12%",
    render: (record) => record.auditActionLabel
  }
];

export function ApprovalWorkbenchPage() {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  const [approvals, setApprovals] = useState<ApprovalWorkItem[]>([]);
  const [selected, setSelected] = useState<ApprovalWorkItem | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void listApprovalWorkItems()
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setApprovals(items);
        setSelected(items[0] ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return approvals.filter((approval) => {
      const matchesSearch =
        `${approval.title} ${approval.referenceNo} ${approval.summary}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || approval.status === statusFilter;
      const matchesModule = moduleFilter === "all" || approval.module === moduleFilter;
      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [approvals, moduleFilter, search, statusFilter]);

  const pendingCount = approvals.filter((approval) => approval.status === "Pending").length;
  const escalatedCount = approvals.filter((approval) => approval.status === "Escalated").length;

  const applyDecision = async (decision: "Approve" | "Reject" | "RequestChanges") => {
    if (!selected) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setMessage(null);

    try {
      const response = await submitApprovalDecision(selected, {
        decision,
        remarks
      });

      setApprovals((current) =>
        current.map((approval) =>
          approval.id === selected.id
            ? {
                ...approval,
                status:
                  decision === "Approve"
                    ? "Approved"
                    : decision === "Reject"
                      ? "Rejected"
                      : "Changes Requested"
              }
            : approval
        )
      );

      if (selected.relatedNotificationId) {
        markAsRead(selected.relatedNotificationId);
      }

      setSelected((current) =>
        current
          ? {
              ...current,
              status:
                decision === "Approve"
                  ? "Approved"
                  : decision === "Reject"
                    ? "Rejected"
                    : "Changes Requested"
            }
          : current
      );
      setMessage(response.status ? `${response.status} recorded for ${response.referenceNo}.` : "Decision recorded.");
      setRemarks("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Approval decision failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ListPageShell
        description="Manager review surface for BOMs, releases, purchase commitments, holds, dispatch gates, and AI drafts."
        filters={
          <FilterBar>
            <input
              aria-label="Search approvals"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference / title / summary"
              value={search}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Escalated">Escalated</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Changes Requested">Changes Requested</option>
            </select>
            <select onChange={(event) => setModuleFilter(event.target.value)} value={moduleFilter}>
              <option value="all">Module: All</option>
              {Array.from(new Set(approvals.map((approval) => approval.module))).map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </FilterBar>
        }
        title="Approval Workbench"
      >
        <KpiStrip
          items={[
            { label: "Pending", value: String(pendingCount) },
            { label: "Escalated", value: String(escalatedCount) },
            {
              label: "Due today",
              value: String(
                approvals.filter((approval) => new Date(approval.dueOn).toDateString() === new Date().toDateString()).length
              )
            },
            {
              label: "Approved",
              value: String(approvals.filter((approval) => approval.status === "Approved").length)
            }
          ]}
        />
        <Card title="Approval queue" description="Review and act on manager-owned decisions without leaving the shared shell.">
          <DataGrid
            ariaLabel="Approval workbench"
            columns={approvalColumns}
            emptyState={{
              title: "No approvals match the current filter",
              description: "Adjust the module or status filters to restore the review queue.",
              hint: "Approval work items are available for review in the current workspace."
            }}
            getRowId={(record) => record.id}
            isLoading={isLoading}
            onRowSelect={setSelected}
            records={filtered}
            rowLabel={(record) => `${record.referenceNo} ${record.title}`}
          />
        </Card>
      </ListPageShell>

      <Drawer
        description="Review summary, capture remarks, and submit an audit-friendly approval decision."
        footer={
          selected ? (
            <div className="context-chip-row">
              <Button disabled={isSubmitting} variant="secondary" onClick={() => void applyDecision("RequestChanges")}>
                Request changes
              </Button>
              <Button disabled={isSubmitting} variant="ghost" onClick={() => void applyDecision("Reject")}>
                Reject
              </Button>
              <Button disabled={isSubmitting} variant="primary" onClick={() => void applyDecision("Approve")}>
                Approve
              </Button>
            </div>
          ) : null
        }
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.referenceNo ?? "Approval detail"}
      >
        {selected ? (
          <>
            <Card title={selected.title} description={selected.summary}>
              <div className="utility-grid">
                <Tile label="Module" meta="Review area">{selected.module}</Tile>
                <Tile label="Step" meta="Workflow gate">{selected.stepName}</Tile>
                <Tile label="Priority" meta="Queue severity">{selected.priority}</Tile>
                <Tile label="Audit label" meta="Logged action">{selected.auditActionLabel}</Tile>
              </div>
              <div className="ui-inline-badges">
                {selected.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
            <FormShell
              description="Capture remarks before completing the approval decision."
              initialFingerprint={`${selected.id}:${remarks}:${selected.status}`}
              title="Decision notes"
              validationErrors={submitError ? [submitError] : []}
            >
              <label>
                <span>Remarks</span>
                <textarea
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Record the approval note, reason for rejection, or requested changes."
                  rows={5}
                  value={remarks}
                />
              </label>
              {message ? <div className="ui-validation-summary">{message}</div> : null}
              {selected.actionPath ? (
                <Button
                  variant="quiet"
                  onClick={() => {
                    navigate(selected.actionPath ?? "/");
                  }}
                >
                  Open linked record
                </Button>
              ) : null}
            </FormShell>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
