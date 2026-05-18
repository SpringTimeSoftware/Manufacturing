import { useMemo, useState } from "react";
import type { QueryFilter, ReportDefinitionDto, ReportRunRequest } from "../api/contracts";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { apiClient } from "../api/http";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { useFeatureFlags } from "../featureFlags/FeatureFlagProvider";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import {
  ErpActionBar,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField
} from "../ui/ErpComponents";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

const documentModules = ["all", "Sales", "Procurement", "Inventory", "Production", "Quality", "Dispatch", "Finance"];
const outputFormats = ["PDF", "CSV", "XLSX"].map((value) => ({ label: value, value }));

const reviewDocumentReports: ReportDefinitionDto[] = [
  {
    id: 701,
    companyId: null,
    reportCode: "PRODUCTION-JOB-CARD-REGISTER",
    reportName: "Job Card / Traveler",
    module: "Production",
    category: "Document",
    description: "Traveler output backed by production job card records.",
    datasetSource: "production.job-card-register",
    reportType: "Document",
    outputFormats: ["PDF", "CSV", "XLSX"],
    status: "Active",
    permissionKey: "reports.production.run",
    parameterSchemaJson: "{}",
    defaultFiltersJson: "{}",
    ownerUserName: null,
    isActive: true,
    versionNo: 1
  },
  {
    id: 702,
    companyId: null,
    reportCode: "DISPATCH-SHIPMENT-REGISTER",
    reportName: "Dispatch Note / Packing Slip / POD",
    module: "Dispatch",
    category: "Document",
    description: "Dispatch and POD output backed by shipment facts.",
    datasetSource: "dispatch.shipment-register",
    reportType: "Document",
    outputFormats: ["PDF", "CSV", "XLSX"],
    status: "Active",
    permissionKey: "reports.dispatch.run",
    parameterSchemaJson: "{}",
    defaultFiltersJson: "{}",
    ownerUserName: null,
    isActive: true,
    versionNo: 1
  },
  {
    id: 703,
    companyId: null,
    reportCode: "QUALITY-COA-REGISTER",
    reportName: "COA Certificate Register",
    module: "Quality",
    category: "Document",
    description: "COA output backed by issued quality certificates.",
    datasetSource: "quality.coa-register",
    reportType: "Document",
    outputFormats: ["PDF", "CSV", "XLSX"],
    status: "Active",
    permissionKey: "reports.quality.run",
    parameterSchemaJson: "{}",
    defaultFiltersJson: "{}",
    ownerUserName: null,
    isActive: true,
    versionNo: 1
  }
];

function asPaged<T>(items: T[]) {
  return { items, page: 1, pageSize: items.length || 25, totalCount: items.length, totalPages: 1 };
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("complete")) return "success";
  if (normalized.includes("fail") || normalized.includes("inactive")) return "danger";
  if (normalized.includes("queue") || normalized.includes("draft")) return "warn";
  return "info";
}

function downloadGeneratedOutput(output: { blob: Blob; contentDisposition: string | null }, fallbackName: string) {
  const dispositionName = output.contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  const fileName = dispositionName ?? fallbackName;
  const href = URL.createObjectURL(output.blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
}

function buildDocumentRunRequest(outputFormat: string): ReportRunRequest {
  return {
    outputFormat,
    parameters: {
      dateFrom: null,
      dateTo: null
    }
  };
}

export function PrintPackPage() {
  const { flags } = useFeatureFlags();
  const { session, user } = useAuth();
  const isLive = hasLiveSession(session);
  const [module, setModule] = useState("all");
  const [outputFormat, setOutputFormat] = useState("PDF");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const filter: QueryFilter = useMemo(
    () => ({ page: 1, pageSize: 50, status: "Active", module: module === "all" ? undefined : module }),
    [module]
  );
  const query = useApiQuery(
    queryKeys.ws07.reporting("print-pack", user?.activeContext.companyId, user?.activeContext.branchId, module, "Active"),
    () => isLive ? apiClient.reporting.definitions(filter) : Promise.resolve(asPaged(reviewDocumentReports.filter((report) => module === "all" || report.module === module))),
    { staleTime: 60_000 }
  );
  const outputQuery = useApiQuery(
    queryKeys.ws07.reporting("print-pack-outputs", user?.activeContext.companyId, user?.activeContext.branchId, "", "Completed"),
    () => isLive ? apiClient.reporting.outputs({ page: 1, pageSize: 10 }) : Promise.resolve(asPaged([])),
    { staleTime: 60_000 }
  );
  const reports = query.data?.items ?? [];
  const selected = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;
  const runMutation = useApiMutation(
    ({ report, request }: { report: ReportDefinitionDto; request: ReportRunRequest }) => apiClient.reporting.runReport(report.id, request),
    {
      onSuccess: async (run) => {
        setMessage(`Generated ${run.runNo} with ${run.rowCount} rows.`);
        await outputQuery.refetch();
        const firstOutput = run.outputs[0];
        if (firstOutput) {
          const download = await apiClient.reporting.downloadOutput(firstOutput.id);
          downloadGeneratedOutput(download, firstOutput.fileName);
        }
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const downloadMutation = useApiMutation(
    (outputId: number) => apiClient.reporting.downloadOutput(outputId),
    {
      onSuccess: (output, outputId) => {
        const record = outputQuery.data?.items.find((item) => item.id === outputId);
        downloadGeneratedOutput(output, record?.fileName ?? "report-output.pdf");
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const liveReason = !isLive ? "Document output requires a live permission-aware session." : undefined;
  const featureReason = !flags.enablePrintAndExport ? "Print and export are turned off by feature settings." : undefined;
  const selectedFormatReason = selected && !selected.outputFormats.includes(outputFormat)
    ? `${selected.reportName} is not registered for ${outputFormat} output.`
    : undefined;
  const runReason = featureReason ?? liveReason ?? selectedFormatReason ?? (!selected ? "Select an active registered document report." : runMutation.isPending ? "Document generation is in progress." : undefined);

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(runReason), label: runMutation.isPending ? "Generating output" : "Generate output", onClick: selected && !runReason ? () => runMutation.mutate({ report: selected, request: buildDocumentRunRequest(outputFormat) }) : undefined, reason: runReason }]} secondary={[{ disabled: true, label: "Send to provider", reason: "Provider delivery is handled by the integration delivery pack." }]} testId="print-pack-action-bar" />}
      description="Traveler, certificate, dispatch, finance, and operational document outputs generated through persisted report runs."
      title="Print Pack / Traveler / Labels"
    >
      <KpiStrip items={[
        { label: "Registered documents", value: String(reports.length) },
        { label: "Recent outputs", value: String(outputQuery.data?.items.length ?? 0) },
        { label: "Mode", value: isLive ? "Live records" : "Review mode" }
      ]} />
      <div className="split-panels">
        <Card title="Document controls" description="Choose a registered document report and output format before generation.">
          <ErpFilterBar ariaLabel="Document output filters">
            <ErpLookupField label="Module" onChange={setModule} options={documentModules.map((value) => ({ label: value, value }))} value={module} />
            <ErpLookupField label="Output format" onChange={setOutputFormat} options={outputFormats} value={outputFormat} />
          </ErpFilterBar>
          {message ? <Badge tone={message.includes("Generated") ? "success" : "danger"}>{message}</Badge> : null}
        </Card>
        <Card title="Registered document outputs" description="Only registered active reports can generate print/export files.">
          <ErpGrid
            ariaLabel="Registered document output table"
            columns={[
              { key: "name", header: "Document", render: (record: ReportDefinitionDto) => <strong>{record.reportName}</strong> },
              { key: "code", header: "Code", render: (record) => record.reportCode },
              { key: "module", header: "Module", render: (record) => record.module },
              { key: "formats", header: "Formats", render: (record) => record.outputFormats.join(", ") },
              { key: "permission", header: "Permission", render: (record) => record.permissionKey },
              { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> }
            ]}
            getRowId={(record) => String(record.id)}
            isLoading={query.isLoading}
            onRowSelect={(record) => setSelectedReportId(record.id)}
            records={reports}
            rowLabel={(record) => `${record.reportName} document report`}
          />
        </Card>
      </div>
      <Card title="Generated output history" description="Reprint/download is served from generated output records with audit.">
        <ErpGrid
          ariaLabel="Generated document output table"
          columns={[
            { key: "file", header: "File", render: (record: NonNullable<typeof outputQuery.data>["items"][number]) => <strong>{record.fileName}</strong> },
            { key: "format", header: "Format", render: (record) => record.outputFormat },
            { key: "status", header: "Status", render: (record) => <Badge tone={statusTone(record.status)}>{record.status}</Badge> },
            { key: "generated", header: "Generated", render: (record) => record.generatedOn?.slice(0, 16).replace("T", " ") ?? "Not generated" },
            { key: "download", header: "Action", render: (record) => <button className="link-button" disabled={Boolean(liveReason) || downloadMutation.isPending} onClick={() => !liveReason && downloadMutation.mutate(record.id)} title={liveReason}>Download</button> }
          ]}
          getRowId={(record) => String(record.id)}
          isLoading={outputQuery.isLoading}
          records={outputQuery.data?.items ?? []}
        />
        {liveReason ? <small>{liveReason}</small> : null}
      </Card>
    </ListPageShell>
  );
}
