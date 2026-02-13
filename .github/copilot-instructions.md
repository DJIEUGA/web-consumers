<!-- Auto-generated: tailored Copilot instructions for this repo -->
# Copilot / AI agent guidance — Jobty Frontend (React + Vite)

Summary
- SaaS platform frontend built with React + Vite. Routes live in `src/pages/`; core UX implemented with a **modular, feature-based architecture** in `src/features/`. Professional styling via Tailwind + Shadcn UI (Indigo/Zinc theme). Mapbox integration for location-based discovery.

Quick commands
- Start dev server: `npm run dev` (see [package.json](package.json)).
- Build: `npm run build` and preview: `npm run preview`.
- Lint: `npm run lint`.

Big picture
- Frontend-only PWA app built with Vite + React. App shell is in [src/main.jsx](src/main.jsx) and [src/App.jsx](src/App.jsx). Service worker ([public/sw.js](public/sw.js)) caches core assets and handles offline navigation via app-shell pattern. Web manifest ([public/manifest.webmanifest](public/manifest.webmanifest)) enables "Add to Home Screen" and native-like installation.
- **Modular architecture:** Business logic is organized by feature in `src/features/` (auth, discovery, marketplace, localisation, job-alerte, portfolio). Each feature has its own components, hooks, services, and types. Generic UI components live in `src/components/ui/` (Shadcn) and `src/components/shared/` (Navbar, Footer).
- Navigation and page boundaries are implemented with `react-router-dom` routes in `src/App.jsx` (dynamic params like `:freelanceId`).
- Global state: `useAuthStore` and `useUIStore` (Zustand) for session, notifications, and modals. Feature-level state in local Zustand stores under each feature.
- API calls: centralized via `src/api/axios.js` (Axios instance with ApiResponse handling) and `src/api/endpoints.js` (all endpoint URLs). Data fetching with TanStack Query in feature-level hooks. JWT interceptors configured globally.

Project-specific patterns to follow
- **Folder structure:** See detailed structure below. Key dirs: `src/api/` (axios + endpoints), `src/features/` (auth, discovery, marketplace, localisation, job-alerte, portfolio), `src/layouts/` (AppLayout, AuthLayout), `src/stores/` (Zustand: navigation, auth, UI), `src/styles/` (Tailwind CSS).
- **Pages:** Route components live in `src/pages/`. Register routes in `src/App.jsx`.
- **Features:** Business logic organized in `src/features/{featureName}/` with subfolders: `components/`, `hooks/`, `services/`, `types/`, and `stores/`.
  - `src/features/auth/` — Login, Register flows
  - `src/features/discovery/` — Landing page, Category grid (no map)
  - `src/features/marketplace/` — List/Grid of Professionals & Enterprises
  - `src/features/localisation/` — Mapbox interactive discovery map
  - `src/features/job-alerte/` — Flash jobs, Urgent tasks
  - `src/features/portfolio/` — User work showcase
- **Components:** Generic UI in `src/components/ui/` (Shadcn style). Reusable complex components in `src/components/shared/`.
- **Stores:** Global state in `src/stores/useAuthStore.js` and `src/stores/useUIStore.js`. Feature-level state in `src/features/{feature}/stores/`.
- **API:** All HTTP calls use `src/api/axios.js` (configured with JWT interceptors) + `src/api/endpoints.js` (centralized URL definitions). Feature services in `src/features/{feature}/services/`.
- **Hooks:** Feature-specific hooks in `src/features/{feature}/hooks/`. Shared utilities in `src/lib/`.
- **Assets:** Static images in `public/`. Icons from Iconbuddy.
- **Layouts:** Reusable page wrappers (AppLayout, AuthLayout) in `src/layouts/`.
- **Styling:** Tailwind CSS (SaaS Professional theme). Shadcn UI components in `src/components/ui/`. Color scheme: Indigo primary (#4f46e5), Zinc backgrounds.
- **State:** Zustand stores in `src/stores/` (Navigation, Auth, UI). TanStack Query for server state. React hooks for component-level state.

Integration and dependencies
- Key deps in [package.json](package.json): `react`, `react-dom`, `react-router-dom` (v7+), `react-hook-form`, `zustand`, `@tanstack/react-query`, `axios`, `leaflet` and `react-leaflet` (present but map functionality is sometimes mocked/placeholder in pages), and `mapbox-gl`. Verify usage before changing map libs. **Note:** `react-icons` is being phased out in favor of **Iconbuddy** (https://iconbuddy.com).
- Build uses Vite with `@vitejs/plugin-react` ([vite.config.js](vite.config.js)).
- Service worker: registered in [src/main.jsx](src/main.jsx) at load time; uses network-first strategy for dynamic content and falls back to cache. For offline navigation, serves `/index.html` (app-shell).
- Manifest: [public/manifest.webmanifest](public/manifest.webmanifest) defines app metadata, icons, and start URL.
- API setup: [src/api/axios.js](src/api/axios.js) (Axios instance with ApiResponse), [src/api/endpoints.js](src/api/endpoints.js) (all endpoint URLs).
- Query client: [src/lib/query-client.js](src/lib/query-client.js) (TanStack Query defaults).
- Stores: [src/stores/](src/stores/) — Navigation, Auth, UI state (Zustand with persist middleware).

Developer workflows & debugging
- Run `npm run dev` and use Vite's HMR in the browser for fast editing iterations.
- Test PWA locally: Run `npm run build && npm run preview`, then open DevTools > Application > Manifest and Service Workers to verify registration. Test offline mode by checking "Offline" in DevTools.
- Use browser devtools for React and network debugging. There are no backend/API handlers in this repo — look for remote calls if adding integrations.
- Lint with `npm run lint` before pushing.

Documentation & Getting Started
**Start here:**
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — Essential commands, common tasks, file locations (⭐ read first)
- [ARCHITECTURE_STATUS.md](ARCHITECTURE_STATUS.md) — Complete implementation status, dependencies, pending tasks
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) — How to migrate pages to new patterns (step-by-step with code examples)

**Feature Examples:**
- [src/features/auth/README.md](src/features/auth/README.md) — Auth feature module with hooks, services, types
- [src/features/profile/README.md](src/features/profile/README.md) — Profile feature module (second example)

What to inspect first when contributing
- Routing and page list: [src/App.jsx](src/App.jsx).
- Entry & global CSS: [src/main.jsx](src/main.jsx) and `index.css`.
- Folder structure: [src/](src/) (features, api, stores, hooks, utils).
- Feature examples: [src/features/auth/](src/features/auth/), [src/features/discovery/](src/features/discovery/), [src/features/localisation/](src/features/localisation/) (complete patterns).
- API setup: [src/api/axios.js](src/api/axios.js) (Axios + ApiResponse) and [src/api/endpoints.js](src/api/endpoints.js) (all URLs).
- Global stores: [src/stores/](src/stores/) (Navigation, Auth, UI state).
- Styling: [tailwind.config.js](tailwind.config.js) (Indigo/Zinc theme), [src/styles/tailwind.css](src/styles/tailwind.css) (base styles).
- Layout & Components: [src/layouts/](src/layouts/) (AppLayout, AuthLayout), [src/components/ui/](src/components/ui/) (Shadcn UI), [src/components/shared/](src/components/shared/) (Navbar, Footer).

Notes for Copilot-style edits
- Keep changes aligned with feature-based modules; avoid cross-feature dependencies.
- Service worker updates: modify `ASSETS_TO_CACHE` in [public/sw.js](public/sw.js) if new static assets are added to `public/`. Update cache version (`CACHE_NAME`) when changing caching strategy.
- Manifest updates: if adding PWA icons, place them in `public/icons/` and update `manifest.webmanifest` icon entries with correct sizes and paths.
- When adding dependencies (e.g., enabling `leaflet` maps), confirm imports and required global CSS and polyfills — small map placeholders exist, so replace carefully.
- Avoid adding TypeScript or changing project type in this commit — this repo is plain JS/JSX and `package.json` uses `type: "module"`.

If anything is unclear or you need a convention added (commit lint, CI, tests, backend endpoints), tell me which area and I will update this file.

## Jobty Development Agent Instructions
You are the lead technical expert for the Jobty frontend. Follow these project-level rules when making changes or implementing features.

- Vision & Design System:
	- Aesthetics: "Enterprise SaaS" — clean, airy, trustful UI.
	- Color tokens to prefer: Primary `#4f46e5` (indigo-600) for primary actions; backgrounds `zinc-50` (main) and `white` (cards); text `slate-900` (headings) and `slate-500` (body); borders `zinc-200` and `indigo-100` for focus states.
	- Typography: use Urbanist or Inter if available. Headings bold, buttons semibold, labels medium.
	- Geometry: corners 12px (inputs/buttons) → 24px (cards/modals). Use very subtle shadow (`shadow-sm`).
	- Reference Figma: https://www.figma.com/design/28EAm3MasPrHNi1U5MeDaj/jobty — follow spacing, color and component tokens there.

- Frontend Tech Stack (Project standard):
	- Framework: React + Vite (already used).
	- State: use `zustand` for UI & session state; use TanStack Query (`@tanstack/react-query`) for remote data fetching and cache management.
	- Forms: `react-hook-form` for form state.
	- Mapping: use Mapbox GL JS for interactive discovery in `src/features/localisation/` — Mapbox implementations with required CSS already integrated.
  - Icons: **Iconbuddy** (https://iconbuddy.com) is the standard. Use SVG icons from `public/icons/` or Iconbuddy CDN. Phase out `react-icons` imports.
	- Modularity: separate pure layout components (header, footer, page shell) from business components (forms, lists, filters). Place page UI in `src/pages/` and reusable layout/views in `src/components/` or `src/layouts/`.

Practical examples
- Add a feature: create `src/features/{featureName}/` with components, hooks, services, types subdirs. Follow existing auth/discovery/localisation patterns.
- Add a page: create `src/pages/myPage.jsx`, then register route in `src/App.jsx`. Use layout wrappers from `src/layouts/`.
- Add API endpoint: Define URL in `src/api/endpoints.js`, create service in `src/features/{feature}/services/`, use in hooks via TanStack Query.
- Map integration: Use `src/features/localisation/` pattern — Mapbox GL initialized in component with feature store for state.
- Styling: Use Tailwind classes (primary: `indigo-600`, bg: `zinc-50`, etc.) + Shadcn UI components. Theme configured in `tailwind.config.js`.

## Industry Best Practices Implemented

- **Error Handling:** ErrorBoundary component catches React errors; API interceptors handle 401/403/5xx gracefully
- **Auth Management:** useAuthStore with JWT persistence, token refresh, and session recovery
- **API Consistency:** All requests normalized to `ApiResponse<T>` shape: `{ success, data, message, errors }`
- **Logging:** Logger utility with levels (debug, info, warn, error) and environment-aware output
- **Environment Config:** `.env.example` template for all required variables
- **Security:** JWT injection via interceptors, CORS-safe headers, no token in URL
- **Modularity:** Feature-based architecture prevents coupling; services, hooks, and stores isolated per domain
- **Performance:** Zustand middleware for persistence, TanStack Query for caching and deduplication
- **Code Quality:** JSDoc comments, TypeScript-ready structure, clean code organization

