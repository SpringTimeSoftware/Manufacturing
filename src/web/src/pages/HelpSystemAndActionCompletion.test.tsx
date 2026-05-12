import { fireEvent, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { answerQuickHelp, findHelpByRoute, helpScreens } from "../help/helpContent";
import { HelpCenterPage, HelpTopicPage, ProcessGuidePage } from "./HelpPages";
import { ItemAttributeMasterPage, ItemListPage } from "./ItemMasterPages";

const internalCopyPattern =
  /\bP0\b|React|TypeScript|reference UI|guarded demo|backend reachable|fallback|adapter|mock|seeded fallback|source status|demo shell|Workspace data/i;

function renderPage(path: string, element: ReactElement) {
  return renderWithApp(
    <Routes>
      <Route path={path} element={element} />
    </Routes>,
    { route: path }
  );
}

describe("HELP-SYSTEM-AND-ACTION-COMPLETION-01", () => {
  it("loads the Help Center with screen topics, process guides, and glossary content", async () => {
    renderPage("/help", <HelpCenterPage />);

    expect(await screen.findByText("Help Center")).toBeInTheDocument();
    expect(screen.getByLabelText("Search help")).toBeInTheDocument();
    expect(screen.getByText("Screen Help")).toBeInTheDocument();
    expect(screen.getByText("Process Guides")).toBeInTheDocument();
    expect(screen.getByText("Glossary")).toBeInTheDocument();
    expect(screen.getByText("Customer Order To Planning")).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });

  it("opens topic and process guide pages from grounded help content", async () => {
    renderWithApp(
      <Routes>
        <Route path="/help/topics/:topicId" element={<HelpTopicPage />} />
        <Route path="/help/process/:guideId" element={<ProcessGuidePage />} />
      </Routes>,
      { route: "/help/topics/masters-items" }
    );

    expect(await screen.findByText("Item Master Help")).toBeInTheDocument();
    expect(screen.getByText("Tab Help")).toBeInTheDocument();
    expect(screen.getByText("Item group/category")).toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });

  it("opens screen help from Item Master and answers quick help from local content", async () => {
    renderPage("/masters/items", <ItemListPage />);

    expect(await screen.findByText("Item List")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Help" }));

    const dialog = await screen.findByRole("dialog", { name: "Item Master help" });
    expect(within(dialog).getByText("Use Item Master to create and govern all sellable, purchasable, manufactured, and stocked items.")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText("Quick help question"), {
      target: { value: "What is this screen for?" }
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Ask" }));
    expect(within(dialog).getByTestId("quick-help-answer")).toHaveTextContent("Item Master");
    expect(within(dialog).getByTestId("quick-help-answer")).toHaveTextContent("Main actions");
  });

  it("resolves selected-tab help from the item workspace", async () => {
    renderPage("/masters/items", <ItemListPage />);

    expect(await screen.findByText("Item List")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New item draft" }));

    const itemDialog = await screen.findByRole("dialog", { name: "Draft Item" });
    fireEvent.click(within(itemDialog).getByRole("tab", { name: "Classification" }));
    fireEvent.click(within(itemDialog).getByRole("button", { name: "Help" }));

    const helpDialog = await screen.findByRole("dialog", { name: "Item Master help" });
    expect(within(helpDialog).getByTestId("selected-tab-help")).toHaveTextContent("Classification");
    expect(within(helpDialog).getByTestId("selected-tab-help")).toHaveTextContent("group, category, subcategory");
  });

  it("keeps Item Attribute create and allowed-value actions truthful", async () => {
    renderPage("/masters/item-attributes", <ItemAttributeMasterPage />);

    expect(await screen.findByText("Item Attribute Master")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New attribute draft" }));

    const dialog = await screen.findByRole("dialog", { name: "Attribute detail" });
    expect(within(dialog).getByRole("button", { name: "Save attribute draft" })).toBeDisabled();
    expect(within(dialog).getByText("Save is not enabled for this setup workflow yet.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Add allowed value" })).toBeDisabled();
    expect(within(dialog).getByText("Allowed-value maintenance is disabled until value versioning and item-usage checks are enabled.")).toBeInTheDocument();
  });

  it("keeps quick help grounded and returns a bounded answer when content is missing", () => {
    expect(helpScreens.length).toBeGreaterThan(40);
    expect(findHelpByRoute("/masters/items")?.tabs.length).toBeGreaterThan(0);
    expect(answerQuickHelp("what should I set first?", "/partners/customers").answer).toContain("Set these first");
    expect(answerQuickHelp("explain a topic that does not exist anywhere", "/masters/items").answer).toBe("This topic is not available in product help yet.");
  });
});
