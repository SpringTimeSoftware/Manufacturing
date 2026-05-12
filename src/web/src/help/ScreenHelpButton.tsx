import { useMemo, useState } from "react";
import { useInRouterContext, useLocation } from "react-router-dom";
import { Button } from "../ui/Button";
import { ModalDialog } from "../ui/ModalDialog";
import {
  answerQuickHelp,
  findHelpByRoute,
  findTabHelp,
  type QuickHelpAnswer
} from "./helpContent";

function detectSelectedTab() {
  if (typeof document === "undefined") {
    return undefined;
  }

  const selectedRoleTab = document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
  if (selectedRoleTab?.textContent?.trim()) {
    return selectedRoleTab.textContent.trim();
  }

  const activeItemTab = document.querySelector<HTMLElement>(".item-master__section-tab--active");
  if (activeItemTab?.textContent?.trim()) {
    return activeItemTab.textContent.trim();
  }

  const activeSectionTab = document.querySelector<HTMLElement>('[class*="tab--active"], [class*="section-tab--active"]');
  return activeSectionTab?.textContent?.trim() || undefined;
}

interface ScreenHelpButtonProps {
  compact?: boolean;
  routeOverride?: string;
  selectedTab?: string;
}

function ScreenHelpButtonContent({
  compact = false,
  route,
  selectedTab
}: {
  compact?: boolean;
  route: string;
  selectedTab?: string;
}) {
  const screenHelp = findHelpByRoute(route);
  const [isOpen, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(selectedTab);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<QuickHelpAnswer | null>(null);
  const tabHelp = useMemo(() => findTabHelp(screenHelp, activeTab), [activeTab, screenHelp]);

  if (!screenHelp) {
    return null;
  }

  const openHelp = () => {
    setActiveTab(selectedTab ?? detectSelectedTab());
    setAnswer(null);
    setOpen(true);
  };

  const askQuestion = () => {
    setAnswer(answerQuickHelp(question, route, activeTab));
  };

  return (
    <>
      <Button className={compact ? "screen-help-button screen-help-button--compact" : "screen-help-button"} onClick={openHelp} variant="quiet">
        Help
      </Button>
      <ModalDialog
        description="Product guidance for this workspace and its available actions."
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        panelClassName="screen-help-modal"
        title={`${screenHelp.title} help`}
      >
        <div className="screen-help">
          <section className="screen-help__summary">
            <div>
              <span className="screen-help__eyebrow">{screenHelp.domain}</span>
              <h3>{screenHelp.title}</h3>
              <p>{screenHelp.purpose}</p>
            </div>
            <div className="screen-help__chips" aria-label="Help roles">
              {screenHelp.targetRoles.slice(0, 4).map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>
          </section>

          {tabHelp ? (
            <section className="screen-help__panel" data-testid="selected-tab-help">
              <span className="screen-help__eyebrow">Selected tab</span>
              <h4>{tabHelp.tab}</h4>
              <p>{tabHelp.purpose}</p>
              <ul>
                {tabHelp.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="screen-help__grid">
            <section className="screen-help__panel">
              <h4>Set First</h4>
              <ul>
                {screenHelp.prerequisites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="screen-help__panel">
              <h4>Key Actions</h4>
              <ul>
                {screenHelp.keyActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="screen-help__panel">
              <h4>Status Meaning</h4>
              <ul>
                {screenHelp.statuses.map((status) => (
                  <li key={status}>{status}</li>
                ))}
              </ul>
            </section>
            <section className="screen-help__panel">
              <h4>Common Mistakes</h4>
              <ul>
                {screenHelp.commonMistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="screen-help__panel">
            <h4>Action Reasons</h4>
            <div className="screen-help__actions">
              {screenHelp.actions.map((action) => (
                <article key={action.action}>
                  <strong>{action.action}</strong>
                  <p>{action.purpose}</p>
                  <small>{action.disabledReason}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="screen-help__panel">
            <h4>Quick Help</h4>
            <div className="quick-help">
              <label>
                <span>Question</span>
                <input
                  aria-label="Quick help question"
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      askQuestion();
                    }
                  }}
                  placeholder="Ask about this screen, selected tab, action state, or status"
                  value={question}
                />
              </label>
              <Button onClick={askQuestion} variant="primary">
                Ask
              </Button>
            </div>
            {answer ? (
              <div className="quick-help__answer" data-testid="quick-help-answer">
                <p>{answer.answer}</p>
                {answer.citations.length > 0 ? <small>From: {answer.citations.join(", ")}</small> : null}
              </div>
            ) : null}
          </section>

          <section className="screen-help__panel">
            <h4>Related Screens</h4>
            <div className="screen-help__chips">
              {screenHelp.relatedScreens.map((screen) => (
                <span key={screen}>{screen}</span>
              ))}
            </div>
          </section>
        </div>
      </ModalDialog>
    </>
  );
}

function ScreenHelpButtonWithLocation(props: Omit<ScreenHelpButtonProps, "routeOverride">) {
  const location = useLocation();
  return <ScreenHelpButtonContent {...props} route={location.pathname} />;
}

export function ScreenHelpButton({ compact = false, routeOverride, selectedTab }: ScreenHelpButtonProps) {
  const inRouter = useInRouterContext();

  if (routeOverride) {
    return <ScreenHelpButtonContent compact={compact} route={routeOverride} selectedTab={selectedTab} />;
  }

  if (!inRouter) {
    return null;
  }

  return <ScreenHelpButtonWithLocation compact={compact} selectedTab={selectedTab} />;
}
