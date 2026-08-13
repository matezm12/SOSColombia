// Human-readable Spanish labels for every enum in prisma/schema.prisma.
// Consolidated here because several pages need the same maps — previously
// duplicated ad hoc (SEVERITY_LABEL alone existed in both page.tsx and
// MapaClient.tsx with drifting content).

export const SEVERITY_LABEL: Record<string, string> = {
  CRITICA: "Crítica",
  ALTA: "Alta",
  MODERADA: "Moderada",
  LEVE: "Leve",
};

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

export const AID_KIND_LABEL: Record<string, string> = {
  ALBERGUE: "Albergue",
  ACOPIO: "Centro de acopio",
  HEALTH: "Salud",
  VET: "Veterinaria",
  BLOOD_DONATION: "Donación de sangre",
  MONETARY_DONATION: "Donación monetaria",
};

export const AID_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  FULL: "Al límite de capacidad",
  CLOSED: "Cerrado",
  UNCONFIRMED: "Sin confirmar",
};

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

export function tierTextClass(tier: number): string {
  const clamped = Math.min(6, Math.max(1, Math.round(tier)));
  return `text-tier-${clamped}`;
}

export const CROWDFUNDING_PLATFORM_LABEL: Record<string, string> = {
  GOFUNDME: "GoFundMe",
  VAKI: "Vaki",
  OTHER: "Canal directo",
};

export const VERIFICATION_LABEL: Record<string, string> = {
  VERIFIED: "Verificado",
  PLAUSIBLE: "Plausible",
  UNCONFIRMED: "Sin confirmar",
  FLAGGED_SCAM: "Riesgo de fraude",
};

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

export const SOURCE_STATUS_LABEL: Record<string, string> = {
  LIVE: "En línea",
  BLOCKED: "Bloqueada",
  DEAD: "Inactiva",
  NEEDS_RECHECK: "Por revisar",
};
