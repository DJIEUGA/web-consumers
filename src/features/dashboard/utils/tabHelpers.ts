/**
 * Dashboard Tab Titles
 * Maps tab keys to display titles
 */

export const TAB_TITLES: Record<string, string> = {
  apercu: "Tableau de bord",
  carte: "Ma carte professionnelle",
  services: "Mes services",
  posts: "Mes réalisations",
  collaborations: "Mes collaborations",
  paiement: "Paiement",
  facturation: "Facturation",
  parametres: "Paramètres",
  publicite: "Publicité",
  analytics: "Analytics",
};

/**
 * Tab to Route Segment mapping
 */
export const TAB_TO_ROUTE_SEGMENT: Record<string, string> = {
  apercu: "overview",
  carte: "procard",
  services: "services",
  posts: "realisations",
  collaborations: "collaborations",
  paiement: "payments",
  facturation: "billing",
  parametres: "settings",
  publicite: "ads",
  analytics: "analytics",
};

/**
 * Route Segment to Tab mapping (reverse)
 */
export const ROUTE_SEGMENT_TO_TAB = Object.entries(TAB_TO_ROUTE_SEGMENT).reduce(
  (acc, [tab, segment]) => {
    acc[segment] = tab;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Helper to resolve active tab from pathname
 */
export const resolveActiveTabFromPath = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[2];
  if (!section) return "apercu";
  return ROUTE_SEGMENT_TO_TAB[section] || "apercu";
};
