import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Card } from "../ui/Card";
import { ErpEmptyState, ErpFilterBar } from "../ui/ErpComponents";
import { ListPageShell } from "../ui/ListPageShell";
import {
  findHelpById,
  findProcessGuideById,
  glossaryTerms,
  helpScreens,
  processGuides,
  searchHelpContent
} from "../help/helpContent";

function HelpTopicList({
  description,
  title,
  topics
}: {
  description: string;
  title: string;
  topics: Array<{ id: string; route: string; title: string; domain: string; purpose: string }>;
}) {
  return (
    <Card title={title} description={description}>
      <div className="help-topic-list">
        {topics.map((topic) => (
          <Link className="help-topic-link" key={`${topic.route}-${topic.id}`} to={`/help/topics/${topic.id}`}>
            <span>{topic.domain}</span>
            <strong>{topic.title}</strong>
            <p>{topic.purpose}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const results = useMemo(() => searchHelpContent(search), [search]);
  const featuredScreens = results.screens.slice(0, search ? 30 : 18);

  return (
    <ListPageShell
      description="Search product guidance, process guides, glossary terms, screen help, and action reasons."
      filters={
        <ErpFilterBar ariaLabel="Help search" onClear={() => setSearch("")} testId="help-center-filter-bar">
          <input
            aria-label="Search help"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search screen, process, field, action, or status"
            value={search}
          />
        </ErpFilterBar>
      }
      title="Help Center"
    >
      <div className="help-center-grid">
        <HelpTopicList
          description="Screen-level help for implemented ERP workspaces."
          title={search ? "Matching Screens" : "Screen Help"}
          topics={featuredScreens}
        />
        <Card title="Process Guides" description="Business process walkthroughs from setup through dispatch.">
          <div className="help-guide-list">
            {results.processGuides.map((guide) => (
              <Link className="help-guide-link" key={guide.id} to={`/help/process/${guide.id}`}>
                <strong>{guide.title}</strong>
                <p>{guide.purpose}</p>
                <small>{guide.relatedScreens.join(" / ")}</small>
              </Link>
            ))}
          </div>
        </Card>
        <Card title="Glossary" description="Common ERP terms used across setup, planning, execution, quality, and dispatch.">
          <div className="help-glossary-preview">
            {results.glossaryTerms.slice(0, search ? 30 : 10).map((term) => (
              <article key={term.term}>
                <strong>{term.term}</strong>
                <p>{term.definition}</p>
              </article>
            ))}
          </div>
          <Link className="help-inline-link" to="/help/glossary">
            Open glossary
          </Link>
        </Card>
      </div>
    </ListPageShell>
  );
}

export function HelpTopicPage() {
  const { topicId } = useParams();
  const topic = findHelpById(topicId);

  if (!topic) {
    return (
      <ListPageShell description="The requested help topic is not available." title="Help Topic">
        <ErpEmptyState
          description="Search the Help Center to find another screen, process, action, or glossary entry."
          title="Help topic not found"
        />
      </ListPageShell>
    );
  }

  return (
    <ListPageShell description={topic.purpose} title={`${topic.title} Help`}>
      <div className="help-topic-page">
        <Card title="Purpose" description={topic.domain}>
          <p>{topic.purpose}</p>
          <div className="screen-help__chips">
            {topic.targetRoles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
        </Card>
        <Card title="Set First" description="Business setup needed before users rely on this screen.">
          <ul className="help-list">
            {topic.prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
        <Card title="Key Actions" description="What users normally do here.">
          <ul className="help-list">
            {topic.keyActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
        <Card title="Action Help" description="Why actions may be available or disabled.">
          <div className="screen-help__actions">
            {topic.actions.map((action) => (
              <article key={action.action}>
                <strong>{action.action}</strong>
                <p>{action.purpose}</p>
                <small>{action.disabledReason}</small>
              </article>
            ))}
          </div>
        </Card>
        {topic.tabs.length > 0 ? (
          <Card title="Tab Help" description="Tab-specific guidance for larger workspaces.">
            <div className="help-tab-grid">
              {topic.tabs.map((tab) => (
                <article key={tab.tab}>
                  <strong>{tab.tab}</strong>
                  <p>{tab.purpose}</p>
                  <small>{tab.actions.join(" / ")}</small>
                </article>
              ))}
            </div>
          </Card>
        ) : null}
        <Card title="Field Help" description="Important fields and control behavior.">
          <div className="help-field-grid">
            {topic.fields.map((field) => (
              <article key={field.fieldId}>
                <span>{field.screenOrTab}</span>
                <strong>{field.label}</strong>
                <p>{field.meaning}</p>
                <small>{field.controlType}{field.lookupSource ? ` / ${field.lookupSource}` : ""}</small>
              </article>
            ))}
          </div>
        </Card>
        <Card title="Related Screens" description="Where this record is used later.">
          <div className="screen-help__chips">
            {topic.relatedScreens.map((screen) => (
              <span key={screen}>{screen}</span>
            ))}
          </div>
        </Card>
      </div>
    </ListPageShell>
  );
}

export function ProcessGuidePage() {
  const { guideId } = useParams();
  const guide = findProcessGuideById(guideId);

  if (!guide) {
    return (
      <ListPageShell description="The requested process guide is not available." title="Process Guide">
        <ErpEmptyState
          description="Search the Help Center to find another process guide."
          title="Process guide not found"
        />
      </ListPageShell>
    );
  }

  return (
    <ListPageShell description={guide.purpose} title={guide.title}>
      <div className="help-topic-page">
        <Card title="Process Steps" description="Follow the steps in order for a controlled business flow.">
          <ol className="help-ordered-list">
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
        <Card title="Related Screens" description="Screens that participate in this process.">
          <div className="screen-help__chips">
            {guide.relatedScreens.map((screen) => (
              <span key={screen}>{screen}</span>
            ))}
          </div>
        </Card>
      </div>
    </ListPageShell>
  );
}

export function HelpGlossaryPage() {
  return (
    <ListPageShell description="Definitions for terms used across the ERP product." title="Glossary">
      <Card title="Glossary Terms" description="Business terms used by setup, planning, production, inventory, quality, dispatch, and platform controls.">
        <div className="help-glossary-grid">
          {glossaryTerms.map((term) => (
            <article key={term.term}>
              <strong>{term.term}</strong>
              <p>{term.definition}</p>
              <small>{term.relatedScreens.join(" / ")}</small>
            </article>
          ))}
        </div>
      </Card>
    </ListPageShell>
  );
}

export function HelpIndexSummary() {
  return (
    <div className="help-index-summary">
      <span>{helpScreens.length} screen topics</span>
      <span>{processGuides.length} process guides</span>
      <span>{glossaryTerms.length} glossary terms</span>
    </div>
  );
}
