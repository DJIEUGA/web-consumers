# Admin Dashboard Architecture Preview

## 📋 Route Mapping Structure

### AdminTabHelpers.ts
```typescript
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
  apercu: "overview",           // /dashboard/admin/overview
  users: "users",                // /dashboard/admin/users
  projets: "projects",           // /dashboard/admin/projects
  paiements: "payments",         // /dashboard/admin/payments
  litiges: "disputes",           // /dashboard/admin/disputes
  carte: "map",                  // /dashboard/admin/map
  stats: "analytics",            // /dashboard/admin/analytics
  kyc: "kyc-verification",       // /dashboard/admin/kyc-verification
  moderateurs: "moderators",     // /dashboard/admin/moderators
  config: "settings",            // /dashboard/admin/settings
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
```

---

## 🏗️ AdminDashboard.tsx Structure

```tsx
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";
import {
  ADMIN_TAB_TITLES,
  ADMIN_TAB_TO_ROUTE,
  resolveAdminTabFromPath,
} from "../../utils/adminTabHelpers";
import {
  OverviewTab,
  UsersTab,
  ProjectsTab,
  PaymentsTab,
  DisputesTab,
  MapTab,
  AnalyticsTab,
  KYCVerificationTab,
  ModeratorsTab,
  ConfigurationTab,
} from "../../components/admin";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useDashboardProfile();

  // Derive active tab from URL
  const activeTab = useMemo(
    () => resolveAdminTabFromPath(location.pathname),
    [location.pathname]
  );

  // Navigate to specific tab
  const goToTab = (tab: string) => {
    const segment = ADMIN_TAB_TO_ROUTE[tab] || ADMIN_TAB_TO_ROUTE.apercu;
    navigate(`/dashboard/admin/${segment}`);
  };

  // Route guards: redirect invalid paths to overview
  useEffect(() => {
    const pathname = location.pathname;
    const isDashboardRoot =
      pathname === "/dashboard" || pathname === "/dashboard/";
    const isAdminRoot =
      pathname === "/dashboard/admin" || pathname === "/dashboard/admin/";

    if (isDashboardRoot || isAdminRoot) {
      navigate("/dashboard/admin/overview", { replace: true });
      return;
    }

    if (pathname.startsWith("/dashboard/admin/")) {
      const segment = pathname.split("/").filter(Boolean)[2];
      const isKnownSegment = Object.values(ADMIN_TAB_TO_ROUTE).includes(segment);
      if (!isKnownSegment) {
        navigate("/dashboard/admin/overview", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const title = ADMIN_TAB_TITLES[activeTab] || "Administration";

  // Admin-specific user extra (could show admin badge)
  const userExtra = (
    <div className="admin-badge">
      <span className="badge badge-admin">Administrateur</span>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "apercu":
        return <OverviewTab />;
      case "users":
        return <UsersTab />;
      case "projets":
        return <ProjectsTab />;
      case "paiements":
        return <PaymentsTab />;
      case "litiges":
        return <DisputesTab />;
      case "carte":
        return <MapTab />;
      case "stats":
        return <AnalyticsTab />;
      case "kyc":
        return <KYCVerificationTab />;
      case "moderateurs":
        return <ModeratorsTab />;
      case "config":
        return <ConfigurationTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <DashboardLayout
      title={title}
      role="ROLE_ADMIN"
      activeTab={activeTab}
      onTabChange={goToTab}
      userExtra={userExtra}
    >
      <div className="admin-dashboard-content">
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
```

---

## 📦 Component Structure Examples

### 1. OverviewTab.tsx (Admin)
```tsx
import React from "react";
import { FiUsers, FiBriefcase, FiAlertCircle, FiDollarSign } from "react-icons/fi";

/**
 * Admin Overview Tab
 * Displays platform-wide statistics and recent activity
 */
const OverviewTab: React.FC = () => {
  // TODO: Replace with useAdminStatsQuery() hook
  const stats = {
    totalUsers: 1247,
    activeProjects: 89,
    pendingDisputes: 5,
    monthlyRevenue: 45230,
  };

  return (
    <div className="admin-overview">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiUsers className="text-indigo-600" />}
          label="Utilisateurs totaux"
          value={stats.totalUsers.toLocaleString()}
          trend="+12% ce mois"
        />
        <StatCard
          icon={<FiBriefcase className="text-blue-600" />}
          label="Projets actifs"
          value={stats.activeProjects}
          trend="+5 cette semaine"
        />
        <StatCard
          icon={<FiAlertCircle className="text-orange-600" />}
          label="Litiges en attente"
          value={stats.pendingDisputes}
          trend="Urgent"
          urgent
        />
        <StatCard
          icon={<FiDollarSign className="text-green-600" />}
          label="Revenus mensuels"
          value={`${(stats.monthlyRevenue / 1000).toFixed(1)}k €`}
          trend="+8% vs mois dernier"
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="card-title">Activité récente</h3>
        {/* TODO: Implement activity feed */}
        <p className="text-slate-500">Flux d'activité à implémenter</p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  urgent?: boolean;
}> = ({ icon, label, value, trend, urgent }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="text-3xl">{icon}</div>
      {trend && (
        <span
          className={`text-sm font-medium ${
            urgent ? "text-orange-600" : "text-green-600"
          }`}
        >
          {trend}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </div>
);

export default OverviewTab;
```

### 2. UsersTab.tsx (Admin)
```tsx
import React, { useState } from "react";
import { FiSearch, FiFilter, FiUserPlus } from "react-icons/fi";

/**
 * Admin Users Management Tab
 * Browse, search, filter, and manage platform users
 */
const UsersTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // TODO: Replace with useAdminUsersQuery() hook
  const users = [
    { id: 1, name: "Jean Dupont", email: "jean@example.com", role: "ROLE_PRO", status: "active" },
    { id: 2, name: "Marie Martin", email: "marie@example.com", role: "ROLE_ENTERPRISE", status: "active" },
  ];

  return (
    <div className="admin-users">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Gestion des utilisateurs
        </h2>
        <button className="btn btn-primary">
          <FiUserPlus className="mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6 p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ROLE_PRO">Professionnels</option>
            <option value="ROLE_ENTERPRISE">Entreprises</option>
            <option value="ROLE_CUSTOMER">Clients</option>
            <option value="ROLE_MODERATOR">Modérateurs</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left p-4">Utilisateur</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rôle</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100">
                <td className="p-4">{user.name}</td>
                <td className="p-4 text-slate-500">{user.email}</td>
                <td className="p-4">
                  <span className="badge badge-blue">{user.role}</span>
                </td>
                <td className="p-4">
                  <span className="badge badge-green">{user.status}</span>
                </td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:underline">
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
```

### 3. DisputesTab.tsx (Admin)
```tsx
import React from "react";
import { FiAlertCircle, FiClock, FiCheckCircle } from "react-icons/fi";

/**
 * Admin Disputes Management Tab
 * Handle and resolve user disputes
 */
const DisputesTab: React.FC = () => {
  // TODO: Replace with useAdminDisputesQuery() hook
  const disputes = [
    {
      id: 1,
      projectTitle: "Développement site web",
      clientName: "Jean Dupont",
      proName: "Marie Martin",
      status: "PENDING",
      createdAt: "2026-03-01",
      priority: "high",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <FiClock className="text-orange-500" />;
      case "RESOLVED":
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiAlertCircle className="text-red-500" />;
    }
  };

  return (
    <div className="admin-disputes">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Gestion des litiges
      </h2>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {getStatusIcon(dispute.status)}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {dispute.projectTitle}
                  </h3>
                  <p className="text-sm text-slate-500 mb-1">
                    Client: {dispute.clientName} • Pro: {dispute.proName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Créé le {dispute.createdAt}
                  </p>
                </div>
              </div>
              <button className="btn btn-primary">
                Traiter le litige
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisputesTab;
```

---

## 📁 Complete File Structure

```
src/features/dashboard/
├── components/
│   ├── admin/
│   │   ├── OverviewTab.tsx          ✅ Platform stats overview
│   │   ├── UsersTab.tsx             ✅ User management table
│   │   ├── ProjectsTab.tsx          📋 Project monitoring
│   │   ├── PaymentsTab.tsx          💰 Payment transactions
│   │   ├── DisputesTab.tsx          ⚖️ Dispute resolution
│   │   ├── MapTab.tsx               🗺️ Location analytics (Mapbox)
│   │   ├── AnalyticsTab.tsx         📊 Platform analytics
│   │   ├── KYCVerificationTab.tsx   🛡️ KYC review queue
│   │   ├── ModeratorsTab.tsx        👥 Moderator management
│   │   ├── ConfigurationTab.tsx     ⚙️ System settings
│   │   └── index.ts                 📦 Barrel export
│   └── pro/
│       └── ... (existing 10 tabs)
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.tsx       🎯 Admin orchestrator
│   └── pro/
│       └── ProDashboard.tsx         ✅ Existing
├── utils/
│   ├── adminTabHelpers.ts           🔧 Admin routing utilities
│   └── tabHelpers.ts                ✅ Existing (Pro)
└── layouts/
    └── DashboardLayout.tsx          ✅ Existing (shared)
```

---

## 🔄 Integration Points

### 1. Update Dashboard Entry Point
**File:** `src/features/dashboard/pages/index.tsx`
```tsx
import AdminDashboard from "./admin/AdminDashboard";
// ... existing imports

const DashboardPage: React.FC = () => {
  const { role } = useAuthStore();

  switch (role) {
    case "ROLE_ADMIN":
      return <AdminDashboard />;  // NEW
    case "ROLE_PRO":
    case "ROLE_ENTERPRISE":
      return <ProDashboard />;
    // ... other roles
  }
};
```

### 2. Update RoleSidebar (Already Done!)
The `adminItems` array already exists in [RoleSidebar.tsx](src/components/shared/RoleSidebar.tsx#L52-L61) with correct keys matching our mapping.

---

## 🎨 Styling Considerations

Admin dashboard uses same Tailwind theme but with admin-specific accents:
- **Primary color:** Keep indigo-600 for consistency
- **Admin badge:** Orange/amber accent for admin-only features
- **Table styling:** Zinc borders, white backgrounds
- **Status indicators:** Traffic light colors (red/orange/green)

---

## 🚀 Implementation Order (If Approved)

1. **Phase 1: Core Structure** (5 files)
   - `utils/adminTabHelpers.ts` - Routing utilities
   - `pages/admin/AdminDashboard.tsx` - Orchestrator
   - `components/admin/index.ts` - Barrel export
   - Update `pages/index.tsx` - Route to AdminDashboard
   - Create placeholder for each tab

2. **Phase 2: Priority Tabs** (3-4 tabs)
   - OverviewTab - Platform stats
   - UsersTab - User management
   - DisputesTab - Dispute handling
   - KYCVerificationTab - KYC review

3. **Phase 3: Remaining Tabs** (6 tabs)
   - ProjectsTab
   - PaymentsTab
   - MapTab
   - AnalyticsTab
   - ModeratorsTab
   - ConfigurationTab

---

## ❓ Questions for You

1. **API Endpoints:** Do you have admin API endpoints defined? (e.g., `/api/v1/admin/stats`, `/api/v1/admin/users`)
2. **Permissions:** Should we add permission checks within tabs? (e.g., only ROLE_ADMIN can delete users)
3. **Priority:** Which tabs are most critical? (I suggested Overview, Users, Disputes, KYC first)
4. **Map Integration:** Should admin Map tab show all platform users/projects on Mapbox?
5. **Styling:** Should admin dashboard use a distinct color scheme (e.g., amber accent) or keep indigo?

---

**Next Step:** If this structure looks good, I'll implement Phase 1 (core structure + routing) across all 10 admin tabs following this exact pattern. Confirm if you want any changes to the route structure or component naming! 🎯
