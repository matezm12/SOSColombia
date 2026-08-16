// Per-AidPointKind marker styling for CiudadMapaClient. Markers are plain DOM
// nodes (see MapaClient.tsx's comment on why -- MapLibre markers live outside
// React's tree), so icons are raw SVG inner-markup strings rather than JSX
// components: the same string gets dropped into a marker's innerHTML AND into
// the legend's <svg>, one definition instead of maintaining a React version
// and a string version separately.
//
// Filled white silhouettes (not the thin-stroke style icons.tsx uses for UI
// chrome) -- these need to read clearly at ~18px on a colored dot, where a
// 2px outline all but disappears.
export const AID_KIND_COLOR_VAR: Record<string, string> = {
  ALBERGUE: "--color-aidkind-albergue",
  ACOPIO: "--color-aidkind-acopio",
  HEALTH: "--color-aidkind-health",
  VET: "--color-aidkind-vet",
  BLOOD_DONATION: "--color-aidkind-blood_donation",
  MONETARY_DONATION: "--color-aidkind-monetary_donation",
};

export const AID_KIND_ICON_SVG: Record<string, string> = {
  // House
  ALBERGUE: '<path d="M12 3L3 10h2v9h5v-6h4v6h5v-9h2z" fill="white"/>',
  // Box
  ACOPIO:
    '<path d="M4 9l8-5 8 5v10a1 1 0 01-1 1H5a1 1 0 01-1-1z" fill="white"/><path d="M4 9l8 4 8-4" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="1"/>',
  // Plus / medical cross
  HEALTH: '<path d="M10 3h4v6h6v4h-6v8h-4v-8H4V9h6z" fill="white"/>',
  // Paw
  VET:
    '<circle cx="12" cy="16.5" r="4" fill="white"/><circle cx="5.5" cy="9" r="2.2" fill="white"/><circle cx="12" cy="5.5" r="2.2" fill="white"/><circle cx="18.5" cy="9" r="2.2" fill="white"/>',
  // Droplet
  BLOOD_DONATION: '<path d="M12 2C9 7 5 11.5 5 15.5a7 7 0 0014 0C19 11.5 15 7 12 2z" fill="white"/>',
  // Coin
  MONETARY_DONATION:
    '<circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2"/><text x="12" y="16.5" font-size="11" font-weight="700" text-anchor="middle" fill="white">$</text>',
};
