// Shared formatting helpers, previously each page called
// `.toLocaleDateString("es-CO")` / `.toLocaleString("es-CO")` inline.
//
// `locale` defaults to "es" so all pre-existing call sites keep their exact
// original behavior unchanged. Pass "en" from a call site that already has
// the app's locale in scope to get real English formatting (1,234 instead
// of 1.234) instead of the es-CO format leaking onto /en/* pages.

function intlLocale(locale: string): string {
  return locale === "en" ? "en-US" : "es-CO";
}

export function formatDate(date: Date, locale: string = "es"): string {
  return date.toLocaleDateString(intlLocale(locale));
}

export function formatDateTime(date: Date, locale: string = "es"): string {
  return date.toLocaleString(intlLocale(locale));
}

export function formatNumber(value: number, locale: string = "es"): string {
  return value.toLocaleString(intlLocale(locale));
}

export function formatCurrency(
  value: number,
  currency: string | null | undefined,
  locale: string = "es",
): string {
  const code = currency ?? "USD";
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Fallback if `currency` ever holds something Intl doesn't recognize.
    return `${code} ${formatNumber(value, locale)}`;
  }
}
