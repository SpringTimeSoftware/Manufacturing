import { useMemo, useState, type ReactElement } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { demoScenarios } from "../demo/demoScenarios";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import { NotificationCenter } from "../notifications/NotificationCenter";
import { useNotifications } from "../notifications/NotificationProvider";
import { useWorkspacePreference } from "../platform/WorkspacePreferenceContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import { navigationItems, type NavigationItem } from "./navigation";

const navigationGroups: Array<{ label: string; sourceSections: string[]; visibleCount: number }> = [
  { label: "OVERVIEW", sourceSections: ["Dashboards"], visibleCount: 5 },
  { label: "PLANNING", sourceSections: ["Planning", "Sales"], visibleCount: 6 },
  { label: "ENGINEERING & PRODUCTION", sourceSections: ["Engineering", "Production"], visibleCount: 7 },
  { label: "MASTER DATA", sourceSections: ["Organization", "Measurement", "Masters"], visibleCount: 7 },
  { label: "COMMERCIAL SETUP", sourceSections: ["Commercial Setup"], visibleCount: 5 },
  { label: "PROCUREMENT", sourceSections: ["Procurement"], visibleCount: 4 },
  { label: "INVENTORY", sourceSections: ["Inventory"], visibleCount: 5 },
  { label: "QUALITY", sourceSections: ["Quality"], visibleCount: 5 },
  { label: "DISPATCH", sourceSections: ["Dispatch"], visibleCount: 4 },
  { label: "PLATFORM", sourceSections: ["Platform"], visibleCount: 5 },
  { label: "REPORTS", sourceSections: ["Reports"], visibleCount: 4 }
];

type NavigationIconName =
  | "approval"
  | "attachment"
  | "audit"
  | "bell"
  | "dashboard"
  | "dispatch"
  | "engineering"
  | "home"
  | "inventory"
  | "master"
  | "platform"
  | "planning"
  | "procurement"
  | "production"
  | "quality"
  | "reports"
  | "roles"
  | "settings"
  | "users"
  | "workflow";

function groupNavigationItems() {
  const grouped = navigationGroups
    .map((group) => ({
      ...group,
      items: navigationItems.filter((item) => group.sourceSections.includes(item.section))
    }))
    .filter((group) => group.items.length > 0);

  const groupedSections = new Set(navigationGroups.flatMap((group) => group.sourceSections));
  const ungrouped = navigationItems.filter((item) => !groupedSections.has(item.section));

  if (ungrouped.length > 0) {
    grouped.push({
      label: "OTHER WORKSPACES",
      sourceSections: [],
      visibleCount: 5,
      items: ungrouped
    });
  }

  return grouped;
}

function getNavigationIcon(item: NavigationItem, section: string): NavigationIconName {
  if (item.path === "/") {
    return "home";
  }

  if (item.path.includes("dashboard")) {
    return "dashboard";
  }

  if (item.path.includes("planning") || item.path.includes("sales")) {
    return "planning";
  }

  if (item.path.includes("engineering")) {
    return "engineering";
  }

  if (item.path.includes("production")) {
    return "production";
  }

  if (item.path.includes("quality")) {
    return "quality";
  }

  if (item.path.includes("dispatch")) {
    return "dispatch";
  }

  if (item.path.includes("inventory")) {
    return "inventory";
  }

  if (item.path.includes("procurement")) {
    return "procurement";
  }

  if (item.path === "/platform/notifications") {
    return "bell";
  }

  if (item.path === "/platform/approvals") {
    return "approval";
  }

  if (item.path === "/platform/attachments") {
    return "attachment";
  }

  if (item.path === "/platform/users") {
    return "users";
  }

  if (item.path === "/platform/roles") {
    return "roles";
  }

  if (item.path === "/platform/audit-trail") {
    return "audit";
  }

  if (item.path === "/platform/workflow-numbering") {
    return "workflow";
  }

  if (item.path.includes("/platform/settings") || item.path.includes("/platform/tenant-settings")) {
    return "settings";
  }

  if (item.path.includes("platform")) {
    return "platform";
  }

  if (item.path.includes("reports")) {
    return "reports";
  }

  if (item.path.includes("commercial")) {
    return "master";
  }

  if (section.includes("MASTER")) {
    return "master";
  }

  return "dashboard";
}

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8
  };

  const paths: Record<NavigationIconName, ReactElement> = {
    approval: (
      <>
        <path {...common} d="M7 4h10v16H7V4Z" />
        <path {...common} d="M9.5 8h5" />
        <path {...common} d="m9.5 13 1.5 1.5 3.5-4" />
      </>
    ),
    attachment: (
      <>
        <path {...common} d="m8 12 5.8-5.8a3 3 0 0 1 4.2 4.2l-7.3 7.3a4.2 4.2 0 0 1-5.9-5.9l6.6-6.6" />
        <path {...common} d="m10 14 5.6-5.6" />
      </>
    ),
    audit: (
      <>
        <path {...common} d="M6 4h9l3 3v13H6V4Z" />
        <path {...common} d="M15 4v4h3" />
        <path {...common} d="M8.5 12h7" />
        <path {...common} d="M8.5 16h4" />
      </>
    ),
    bell: (
      <>
        <path {...common} d="M6.5 10.5a5.5 5.5 0 0 1 11 0v3.2l1.5 2.8H5l1.5-2.8v-3.2Z" />
        <path {...common} d="M10 19a2 2 0 0 0 4 0" />
      </>
    ),
    dashboard: (
      <>
        <path {...common} d="M4 13.5h5.5V4H4v9.5Z" />
        <path {...common} d="M14.5 20H20v-9.5h-5.5V20Z" />
        <path {...common} d="M4 20h5.5v-3.5H4V20Z" />
        <path {...common} d="M14.5 7.5H20V4h-5.5v3.5Z" />
      </>
    ),
    dispatch: (
      <>
        <path {...common} d="M3.5 7.5h11v9h-11v-9Z" />
        <path {...common} d="M14.5 10.5h3.2l2.8 3v3h-6v-6Z" />
        <path {...common} d="M6.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path {...common} d="M17.5 18.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
      </>
    ),
    engineering: (
      <>
        <path {...common} d="m5 19 6-6" />
        <path {...common} d="m14 5 5 5" />
        <path {...common} d="m10.8 7.8 5.4 5.4" />
        <path {...common} d="M7 17.5 5.5 19 4 17.5 5.5 16 7 17.5Z" />
        <path {...common} d="M12.4 6.2 14 4.6 19.4 10 17.8 11.6" />
      </>
    ),
    home: (
      <>
        <path {...common} d="m4 11 8-7 8 7" />
        <path {...common} d="M6.5 10.5V20h11v-9.5" />
        <path {...common} d="M10 20v-5h4v5" />
      </>
    ),
    inventory: (
      <>
        <path {...common} d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" />
        <path {...common} d="M4 12.5 12 17l8-4.5" />
        <path {...common} d="M4 16.5 12 21l8-4.5" />
      </>
    ),
    master: (
      <>
        <path {...common} d="M5 5.5h14" />
        <path {...common} d="M5 12h14" />
        <path {...common} d="M5 18.5h14" />
        <path {...common} d="M8 4v3" />
        <path {...common} d="M15 10.5v3" />
        <path {...common} d="M11 17v3" />
      </>
    ),
    platform: (
      <>
        <path {...common} d="M12 3.5 19 7v5.2c0 4-2.8 7.1-7 8.3-4.2-1.2-7-4.3-7-8.3V7l7-3.5Z" />
        <path {...common} d="m9 12 2 2 4-4" />
      </>
    ),
    planning: (
      <>
        <path {...common} d="M5 5h14v15H5V5Z" />
        <path {...common} d="M8 3v4" />
        <path {...common} d="M16 3v4" />
        <path {...common} d="M8 11h8" />
        <path {...common} d="M8 15h5" />
      </>
    ),
    procurement: (
      <>
        <path {...common} d="M6 6h15l-2 8H8L6 6Z" />
        <path {...common} d="M6 6 5.2 3.5H3" />
        <path {...common} d="M9 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        <path {...common} d="M17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      </>
    ),
    production: (
      <>
        <path {...common} d="M4 19h16" />
        <path {...common} d="M5 19V9l4 3V9l4 3V8l6 4v7" />
        <path {...common} d="M8 15h2" />
        <path {...common} d="M13 15h2" />
      </>
    ),
    quality: (
      <>
        <path {...common} d="M12 4 19 7.5v5c0 3.5-2.7 6.4-7 7.5-4.3-1.1-7-4-7-7.5v-5L12 4Z" />
        <path {...common} d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    reports: (
      <>
        <path {...common} d="M6 4h9l3 3v13H6V4Z" />
        <path {...common} d="M15 4v4h3" />
        <path {...common} d="M9 15v2" />
        <path {...common} d="M12 12v5" />
        <path {...common} d="M15 13.5V17" />
      </>
    ),
    roles: (
      <>
        <path {...common} d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path {...common} d="M3.8 19a4.2 4.2 0 0 1 8.4 0" />
        <path {...common} d="M15 8h5" />
        <path {...common} d="M15 12h4" />
        <path {...common} d="M15 16h3" />
      </>
    ),
    settings: (
      <>
        <path {...common} d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path {...common} d="M12 3.5v2" />
        <path {...common} d="M12 18.5v2" />
        <path {...common} d="M4.6 7.2 6.2 8.3" />
        <path {...common} d="m17.8 15.7 1.6 1.1" />
        <path {...common} d="m19.4 7.2-1.6 1.1" />
        <path {...common} d="m6.2 15.7-1.6 1.1" />
      </>
    ),
    users: (
      <>
        <path {...common} d="M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Z" />
        <path {...common} d="M3.8 19a5.2 5.2 0 0 1 10.4 0" />
        <path {...common} d="M16 10.5a2.4 2.4 0 1 0 0-4.8" />
        <path {...common} d="M17 19a4 4 0 0 0-2.2-3.6" />
      </>
    ),
    workflow: (
      <>
        <path {...common} d="M5 6.5h5v5H5v-5Z" />
        <path {...common} d="M14 12.5h5v5h-5v-5Z" />
        <path {...common} d="M10 9h2.5a3.5 3.5 0 0 1 3.5 3.5" />
        <path {...common} d="M12 15H9.5A3.5 3.5 0 0 1 6 11.5" />
      </>
    )
  };

  return (
    <svg aria-hidden="true" className="app-shell__nav-svg" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function SectionChevron() {
  return (
    <svg aria-hidden="true" className="app-shell__nav-chevron" viewBox="0 0 20 20">
      <path
        d="M7 5.5 11.5 10 7 14.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAllowed, logout, session, switchContext } = useAuth();
  const { flags } = useFeatureFlags();
  const { unreadCount } = useNotifications();
  const { selectedWarehouse } = useWorkspacePreference();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set(["OVERVIEW"]));

  const currentPage = navigationItems.find((item) => item.path === location.pathname);
  const groupedNavigation = useMemo(() => groupNavigationItems(), []);
  const currentNavigationGroup = groupedNavigation.find((group) =>
    group.items.some((item) => item.path === location.pathname)
  )?.label;
  const currentContext = session?.user.activeContext;
  const availableContexts = session?.user.availableContexts ?? [];
  const roleSummary = session?.user.roles.length
    ? `${session.user.roles[0]}${session.user.roles.length > 1 ? ` +${session.user.roles.length - 1}` : ""}`
    : "Signed in";

  const companies = useMemo(() => {
    const entries = new Map<number, { id: number; label: string }>();

    for (const context of availableContexts) {
      entries.set(context.companyId, { id: context.companyId, label: context.companyName });
    }

    return Array.from(entries.values());
  }, [availableContexts]);

  const branches = availableContexts.filter(
    (entry) => entry.companyId === currentContext?.companyId
  );
  const toggleSection = (section: string) => {
    setExpandedSections((current) => {
      return current.has(section) ? new Set() : new Set([section]);
    });
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <span className="app-shell__brand-mark" aria-hidden="true" />
          <div>
            <strong>STS Manufacturing ERP</strong>
            <p>Planning, production, inventory, quality, and dispatch control.</p>
          </div>
        </div>

        <nav aria-label="Primary" className="app-shell__nav">
          {groupedNavigation.map((group) => {
            const allowedItems = group.items.filter((item) => isAllowed(item.roles));
            const hasActiveItem = group.label === currentNavigationGroup;
            const isExpanded = expandedSections.has(group.label) || hasActiveItem;
            const visibleItems = isExpanded ? allowedItems : allowedItems.slice(0, group.visibleCount);

            if (allowedItems.length === 0) {
              return null;
            }

            return (
              <section className="app-shell__nav-section" key={group.label}>
                <button
                  aria-expanded={isExpanded}
                  className="app-shell__nav-section-button"
                  onClick={() => toggleSection(group.label)}
                  type="button"
                >
                  <span>{group.label}</span>
                  <span aria-hidden="true" className="app-shell__nav-section-meta">
                    <SectionChevron />
                  </span>
                </button>
                <div className="app-shell__nav-links">
                  {visibleItems.map((item) => {
                    const iconName = getNavigationIcon(item, group.label);

                    return (
                      <NavLink
                        key={item.path}
                        className={({ isActive }) =>
                          `app-shell__nav-link app-shell__nav-link--child ${isActive ? "app-shell__nav-link--active" : ""}`
                        }
                        to={item.path}
                      >
                        <span className="app-shell__nav-icon" aria-hidden="true" data-nav-icon={iconName}>
                          <NavigationIcon name={iconName} />
                        </span>
                        <span className="app-shell__nav-text">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {flags.showSeededNavigation ? (
            <div className="app-shell__nav-section app-shell__nav-demo">
              <div className="app-shell__nav-section-label">WORKFLOW SHORTCUTS</div>
              <div className="app-shell__nav-links">
                {demoScenarios.slice(0, 3).map((scenario) => (
                  <Button
                    className="app-shell__scenario-link"
                    key={scenario.id}
                    onClick={() => navigate(scenario.route)}
                    variant="quiet"
                  >
                    <span>{scenario.title}</span>
                    <span className="muted">Open</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className="app-shell__sidebar-footer">
          <span>Signed in</span>
          <strong>{session?.user.displayName ?? "Workspace user"}</strong>
          <p>Access follows approved company, branch, and role scope.</p>
        </div>
      </aside>

      <main className="app-shell__content" id="main-content" tabIndex={-1}>
        <div className="app-topbar">
          <div className="app-topbar__hero">
            <div className="app-topbar__context">
              <div className="app-topbar__title">
                <small>Manufacturing workspace</small>
                <h1>{currentPage?.label ?? "Role home dashboard"}</h1>
                <p>
                  {currentContext?.companyName ?? "No company selected"} -{" "}
                  {currentContext?.branchName ?? "No branch selected"}
                </p>
                <div className="context-chip-row">
                  <Badge tone="info">{roleSummary}</Badge>
                  {selectedWarehouse ? <Badge tone="neutral">{`Warehouse ${selectedWarehouse.warehouseCode}`}</Badge> : null}
                  {flags.enableNotificationCenter ? (
                    <Badge tone="neutral">{`Unread notifications ${unreadCount}`}</Badge>
                  ) : null}
                </div>
              </div>

              <div className="app-topbar__controls" aria-label="Workspace controls">
                <div className="app-topbar__context-switch">
                  <div className="app-topbar__selector-grid">
                    <label>
                      <span className="app-topbar__control-label">Company</span>
                      <select
                        onChange={(event) => {
                          const nextCompanyId = Number(event.target.value);
                          const firstBranch = availableContexts.find(
                            (context) => context.companyId === nextCompanyId
                          );

                          if (firstBranch) {
                            void switchContext({
                              companyId: firstBranch.companyId,
                              branchId: firstBranch.branchId
                            });
                          }
                        }}
                        value={currentContext?.companyId ?? ""}
                      >
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="app-topbar__control-label">Branch</span>
                      <select
                        onChange={(event) => {
                          void switchContext({
                            companyId: Number(currentContext?.companyId),
                            branchId: Number(event.target.value)
                          });
                        }}
                        value={currentContext?.branchId ?? ""}
                      >
                        {branches.map((branch) => (
                          <option key={branch.branchId} value={branch.branchId}>
                            {branch.branchName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="app-topbar__action-row">
                    {flags.enableNotificationCenter ? (
                      <Button variant="secondary" onClick={() => setNotificationsOpen(true)}>
                        Notifications
                        {unreadCount > 0 ? <Badge tone="warn">{String(unreadCount)}</Badge> : null}
                      </Button>
                    ) : null}
                    <Button variant="quiet" onClick={() => navigate("/platform/context-switch")}>
                      Switch
                    </Button>
                    <Button variant="ghost" onClick={() => void logout()}>
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Outlet />

        {flags.enableNotificationCenter ? (
          <Drawer
            description="Role-aware inbox for operational alerts, approvals, and reminders."
            isOpen={isNotificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            title="Notification center"
          >
            <NotificationCenter compact />
          </Drawer>
        ) : null}
      </main>
    </div>
  );
}
