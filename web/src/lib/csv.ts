/** Escapes a single CSV field per RFC 4180: wrap in quotes if it contains a
 *  comma, quote, or newline, doubling any interior quotes. */
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds a CSV string (with header row) from an array of flat objects. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => escapeCsvField(row[col])).join(","));
  return [header, ...lines].join("\r\n") + "\r\n";
}
