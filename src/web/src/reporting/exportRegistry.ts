export interface ReportColumn<TRecord> {
  header: string;
  value: (record: TRecord) => string | number;
}

export interface ReportAction {
  id: string;
  label: string;
  run: () => void;
}

function downloadFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function createDelimitedText<TRecord>(
  columns: ReportColumn<TRecord>[],
  records: TRecord[],
  delimiter: string
) {
  const header = columns.map((column) => escapeValue(column.header, delimiter)).join(delimiter);
  const rows = records.map((record) =>
    columns.map((column) => escapeValue(String(column.value(record)), delimiter)).join(delimiter)
  );

  return [header, ...rows].join("\n");
}

function escapeValue(value: string, delimiter: string) {
  if (!value.includes(delimiter) && !value.includes("\"") && !value.includes("\n")) {
    return value;
  }

  return `"${value.replaceAll("\"", "\"\"")}"`;
}

export function createCsvAction<TRecord>(
  fileName: string,
  columns: ReportColumn<TRecord>[],
  records: TRecord[]
): ReportAction {
  return {
    id: "csv",
    label: "Export CSV",
    run: () => {
      downloadFile(fileName, createDelimitedText(columns, records, ","), "text/csv;charset=utf-8");
    }
  };
}

export function createExcelAction<TRecord>(
  fileName: string,
  columns: ReportColumn<TRecord>[],
  records: TRecord[]
): ReportAction {
  return {
    id: "excel",
    label: "Export Excel",
    run: () => {
      downloadFile(
        fileName,
        createDelimitedText(columns, records, "\t"),
        "application/vnd.ms-excel;charset=utf-8"
      );
    }
  };
}

export function createPrintAction(title: string, bodyHtml: string): ReportAction {
  return {
    id: "print",
    label: "Print / PDF",
    run: () => {
      const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768");

      if (!printWindow) {
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Aptos, 'Segoe UI', sans-serif; color: #0f172a; padding: 24px; }
              h1 { margin-top: 0; }
              .meta { color: #475569; margin-bottom: 18px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #dbe4ef; padding: 8px; text-align: left; }
            </style>
          </head>
          <body>
            ${bodyHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };
}

export function createLabelAction(title: string, labels: string[]): ReportAction {
  return {
    id: "label",
    label: "Print labels",
    run: () => {
      const labelWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");

      if (!labelWindow) {
        return;
      }

      const cards = labels
        .map(
          (label) =>
            `<div style="border:1px solid #cbd5e1;border-radius:16px;padding:18px;min-height:120px;">
              <div style="font-size:12px;color:#475569;margin-bottom:8px;">${title}</div>
              <strong style="font-size:20px;">${label}</strong>
            </div>`
        )
        .join("");

      labelWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Aptos, 'Segoe UI', sans-serif; padding: 20px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            </style>
          </head>
          <body>
            <div class="grid">${cards}</div>
          </body>
        </html>
      `);
      labelWindow.document.close();
      labelWindow.focus();
      labelWindow.print();
    }
  };
}
