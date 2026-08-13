// Shared es-CO formatting helpers — previously each page called
// `.toLocaleDateString("es-CO")` / `.toLocaleString("es-CO")` inline.

export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO");
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("es-CO");
}

export function formatNumber(value: number): string {
  return value.toLocaleString("es-CO");
}

export function formatCurrency(value: number, currency: string | null | undefined): string {
  const code = currency ?? "USD";
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(value);
  } catch {
    // Fallback if `currency` ever holds something Intl doesn't recognize.
    return `${code} ${formatNumber(value)}`;
  }
}
