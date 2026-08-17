// Human-readable labels for every enum in prisma/schema.prisma. Bilingual
// (es/en): each `*Label(key, locale)` getter picks the EN record when
// locale === "en", falling back to ES (and then the raw key) if a value is
// somehow missing from a record — so a still-unmigrated call site importing
// the plain ES Record directly keeps compiling and showing Spanish, and a
// migrated one gets the real English text instead of leaking Spanish onto
// /en/* pages. Class-name Records (SEVERITY_BG_CLASS etc.) aren't text, so
// they stay plain and locale-agnostic.

function pick<K extends string | number>(
  es: Record<K, string>,
  en: Record<K, string>,
  key: K,
  locale: string,
): string {
  if (locale === "en") return en[key] ?? es[key] ?? String(key);
  return es[key] ?? String(key);
}

export const SEVERITY_LABEL: Record<string, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MODERADA: "Moderada",
  LEVE: "Leve",
};

const SEVERITY_LABEL_EN: Record<string, string> = {
  CRITICA: "Critical",
  ALTA: "High",
  MODERADA: "Moderate",
  LEVE: "Minor",
};

export function severityLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(SEVERITY_LABEL, SEVERITY_LABEL_EN, key, locale) : "";
}

// Tailwind class names, written as full literal strings (not built via
// template/interpolation) so Tailwind's scanner can see them at build time.
export const SEVERITY_BG_CLASS: Record<string, string> = {
  CRITICA: "bg-severity-critica",
  ALTA: "bg-severity-alta",
  MODERADA: "bg-severity-moderada",
  LEVE: "bg-severity-leve",
};

export const SEVERITY_TEXT_CLASS: Record<string, string> = {
  CRITICA: "text-severity-critica",
  ALTA: "text-severity-alta",
  MODERADA: "text-severity-moderada",
  LEVE: "text-severity-leve",
};

export const METRIC_LABEL: Record<string, string> = {
  DEATHS_REPORTED_OFFICIAL: "Fallecidos (reporte oficial)",
  DEATHS_CONFIRMED_FORENSIC: "Fallecidos (confirmados, Medicina Legal)",
  INJURED: "Heridos",
  MISSING_OFFICIAL: "Desaparecidos (oficial)",
  MISSING_CROWDSOURCED: "Desaparecidos (reportes ciudadanos)",
  DAMNIFICADOS_PERSONAS: "Personas afectadas",
  DAMNIFICADOS_FAMILIAS: "Familias afectadas",
  VIVIENDAS_DESTRUIDAS: "Viviendas destruidas",
  VIVIENDAS_AVERIADAS: "Viviendas averiadas",
  EDIFICIOS_COLAPSADOS: "Edificios colapsados",
  CENTROS_EDUCATIVOS_AFECTADOS: "Centros educativos afectados",
  CENTROS_COMUNITARIOS_AFECTADOS: "Centros comunitarios afectados",
  CENTROS_SALUD_AFECTADOS: "Centros de salud afectados",
};

const METRIC_LABEL_EN: Record<string, string> = {
  DEATHS_REPORTED_OFFICIAL: "Deaths (official report)",
  DEATHS_CONFIRMED_FORENSIC: "Deaths (confirmed, forensic medicine)",
  INJURED: "Injured",
  MISSING_OFFICIAL: "Missing (official)",
  MISSING_CROWDSOURCED: "Missing (citizen reports)",
  DAMNIFICADOS_PERSONAS: "People affected",
  DAMNIFICADOS_FAMILIAS: "Families affected",
  VIVIENDAS_DESTRUIDAS: "Homes destroyed",
  VIVIENDAS_AVERIADAS: "Homes damaged",
  EDIFICIOS_COLAPSADOS: "Buildings collapsed",
  CENTROS_EDUCATIVOS_AFECTADOS: "Schools affected",
  CENTROS_COMUNITARIOS_AFECTADOS: "Community centers affected",
  CENTROS_SALUD_AFECTADOS: "Health centers affected",
};

export function metricLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(METRIC_LABEL, METRIC_LABEL_EN, key, locale) : "";
}

export const AID_KIND_LABEL: Record<string, string> = {
  ALBERGUE: "Albergue",
  ACOPIO: "Centro de acopio",
  HEALTH: "Salud",
  VET: "Veterinaria",
  BLOOD_DONATION: "Donación de sangre",
  MONETARY_DONATION: "Donación monetaria",
};

const AID_KIND_LABEL_EN: Record<string, string> = {
  ALBERGUE: "Shelter",
  ACOPIO: "Collection center",
  HEALTH: "Health",
  VET: "Veterinary",
  BLOOD_DONATION: "Blood donation",
  MONETARY_DONATION: "Monetary donation",
};

export function aidKindLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(AID_KIND_LABEL, AID_KIND_LABEL_EN, key, locale) : "";
}

export const VEREDA_KIND_LABEL: Record<string, string> = {
  VEREDA: "Vereda",
  CORREGIMIENTO: "Corregimiento",
  CENTRO_POBLADO: "Centro poblado",
};

const VEREDA_KIND_LABEL_EN: Record<string, string> = {
  VEREDA: "Rural hamlet (vereda)",
  CORREGIMIENTO: "Corregimiento",
  CENTRO_POBLADO: "Populated center",
};

export function veredaKindLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(VEREDA_KIND_LABEL, VEREDA_KIND_LABEL_EN, key, locale) : "";
}

export const AID_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  FULL: "Al límite de capacidad",
  CLOSED: "Cerrado",
  UNCONFIRMED: "Sin confirmar",
};

const AID_STATUS_LABEL_EN: Record<string, string> = {
  ACTIVE: "Active",
  FULL: "At capacity",
  CLOSED: "Closed",
  UNCONFIRMED: "Unconfirmed",
};

export function aidStatusLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(AID_STATUS_LABEL, AID_STATUS_LABEL_EN, key, locale) : "";
}

export const AID_STATUS_TEXT_CLASS: Record<string, string> = {
  ACTIVE: "text-status-active",
  FULL: "text-status-full",
  CLOSED: "text-status-closed",
  UNCONFIRMED: "text-status-unconfirmed",
};

export const TIER_LABEL: Record<number, string> = {
  1: "Fuente primaria oficial",
  2: "Fuente secundaria confiable",
  3: "Declaración oficial vía prensa",
  4: "Fuente local/institucional",
  5: "Prensa no verificada",
  6: "Redes sociales — no verificado",
};

const TIER_LABEL_EN: Record<number, string> = {
  1: "Official primary source",
  2: "Reliable secondary source",
  3: "Official statement via press",
  4: "Local/institutional source",
  5: "Unverified press",
  6: "Social media — unverified",
};

export function tierLabel(key: number | null | undefined, locale: string): string {
  return key != null ? pick(TIER_LABEL, TIER_LABEL_EN, key, locale) : "";
}

export function tierTextClass(tier: number): string {
  const clamped = Math.min(6, Math.max(1, Math.round(tier)));
  return `text-tier-${clamped}`;
}

export const CROWDFUNDING_PLATFORM_LABEL: Record<string, string> = {
  GOFUNDME: "GoFundMe",
  VAKI: "Vaki",
  OTHER: "Canal directo",
};

const CROWDFUNDING_PLATFORM_LABEL_EN: Record<string, string> = {
  GOFUNDME: "GoFundMe",
  VAKI: "Vaki",
  OTHER: "Direct channel",
};

export function crowdfundingPlatformLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(CROWDFUNDING_PLATFORM_LABEL, CROWDFUNDING_PLATFORM_LABEL_EN, key, locale) : "";
}

export const VERIFICATION_LABEL: Record<string, string> = {
  VERIFIED: "Verificado",
  PLAUSIBLE: "Plausible",
  UNCONFIRMED: "Sin confirmar",
  FLAGGED_SCAM: "Riesgo de fraude",
};

const VERIFICATION_LABEL_EN: Record<string, string> = {
  VERIFIED: "Verified",
  PLAUSIBLE: "Plausible",
  UNCONFIRMED: "Unconfirmed",
  FLAGGED_SCAM: "Scam risk",
};

export function verificationLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(VERIFICATION_LABEL, VERIFICATION_LABEL_EN, key, locale) : "";
}

export const VERIFICATION_TEXT_CLASS: Record<string, string> = {
  VERIFIED: "text-verify-verified",
  PLAUSIBLE: "text-verify-plausible",
  UNCONFIRMED: "text-verify-unconfirmed",
  FLAGGED_SCAM: "text-verify-flagged",
};

export const CONTRADICTION_STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierta",
  RESOLVED: "Resuelta",
};

const CONTRADICTION_STATUS_LABEL_EN: Record<string, string> = {
  OPEN: "Open",
  RESOLVED: "Resolved",
};

export function contradictionStatusLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(CONTRADICTION_STATUS_LABEL, CONTRADICTION_STATUS_LABEL_EN, key, locale) : "";
}

export const SOURCE_STATUS_LABEL: Record<string, string> = {
  LIVE: "En línea",
  BLOCKED: "Bloqueada",
  DEAD: "Inactiva",
  NEEDS_RECHECK: "Por revisar",
};

const SOURCE_STATUS_LABEL_EN: Record<string, string> = {
  LIVE: "Live",
  BLOCKED: "Blocked",
  DEAD: "Inactive",
  NEEDS_RECHECK: "Needs recheck",
};

export function sourceStatusLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(SOURCE_STATUS_LABEL, SOURCE_STATUS_LABEL_EN, key, locale) : "";
}

export const ALLIED_CATEGORY_LABEL: Record<string, string> = {
  MAP_TRACKER: "Mapa / rastreador",
  AID_DIRECTORY: "Directorio de ayuda",
  DONATION_PLATFORM: "Plataforma de donación",
  NEWS_AGGREGATOR: "Agregador de noticias",
  VOLUNTEER_COORDINATION: "Coordinación de voluntariado",
  OTHER: "Otro",
};

const ALLIED_CATEGORY_LABEL_EN: Record<string, string> = {
  MAP_TRACKER: "Map / tracker",
  AID_DIRECTORY: "Aid directory",
  DONATION_PLATFORM: "Donation platform",
  NEWS_AGGREGATOR: "News aggregator",
  VOLUNTEER_COORDINATION: "Volunteer coordination",
  OTHER: "Other",
};

export function alliedCategoryLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(ALLIED_CATEGORY_LABEL, ALLIED_CATEGORY_LABEL_EN, key, locale) : "";
}

// Proper nouns / platform names — identical in both locales, no getter needed.
export const SOCIAL_PLATFORM_LABEL: Record<string, string> = {
  X: "X",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
};

export const SOCIAL_CATEGORY_LABEL: Record<string, string> = {
  AID_POINT: "Punto de ayuda",
  NEED: "Necesidad puntual",
  HUMAN_INTEREST: "Historia humana",
  OFFICIAL: "Fuente oficial",
};

const SOCIAL_CATEGORY_LABEL_EN: Record<string, string> = {
  AID_POINT: "Aid point",
  NEED: "Specific need",
  HUMAN_INTEREST: "Human story",
  OFFICIAL: "Official source",
};

export function socialCategoryLabel(key: string | null | undefined, locale: string): string {
  return key ? pick(SOCIAL_CATEGORY_LABEL, SOCIAL_CATEGORY_LABEL_EN, key, locale) : "";
}
