/**
 * Admin Dashboard Tab Routing Utilities
 * Maps admin tab keys to URL segments and display titles
 */

/**
 * Admin Dashboard Tab Titles
 * Maps tab keys (from RoleSidebar) to display titles
 */
export const ADMIN_TAB_TITLES: Record<string, string> = {
  apercu: "Vue d'ensemble",
  users: "Gestion des utilisateurs",
  projets: "Gestion des projets",
  paiements: "Gestion des paiements",
  litiges: "Gestion des litiges",
  carte: "Carte des localisations",
  stats: "Statistiques et Analytics",
  kyc: "Vérification KYC",
  moderateurs: "Gestion des modérateurs",
  config: "Configuration système",
};

/**
 * Tab Key → URL Segment mapping
 * URL structure: /dashboard/admin/{segment}
 */
export const ADMIN_TAB_TO_ROUTE: Record<string, string> = {
  apercu: "overview",
  users: "users",
  projets: "projects",
  paiements: "payments",
  litiges: "disputes",
  carte: "map",
  stats: "analytics",
  kyc: "kyc-verification",
  moderateurs: "moderators",
  config: "settings",
};

/**
 * URL Segment → Tab Key (reverse mapping)
 */
export const ADMIN_ROUTE_TO_TAB = Object.entries(ADMIN_TAB_TO_ROUTE).reduce(
  (acc, [tab, segment]) => {
    acc[segment] = tab;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Resolve active tab from pathname
 * Example: /dashboard/admin/users → "users"
 */
export const resolveAdminTabFromPath = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  // segments = ["dashboard", "admin", "users"]
  const section = segments[2];
  if (!section) return "apercu";
  return ADMIN_ROUTE_TO_TAB[section] || "apercu";
};
