export interface ReportColumn<TRecord> {
  header: string;
  value: (record: TRecord) => string | number;
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
