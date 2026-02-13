# Jobty Quick Reference Card

## Essential Commands

```bash
# Install dependencies (RUN THIS FIRST)
npm install

# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality

# Debugging
npm run dev -- --debug      # Dev server with debug output
```

## File Locations

### Setup & Config
- **PWA Metadata:** `public/manifest.webmanifest`
- **Service Worker:** `public/sw.js`
- **Environment:** `.env.example` → create `.env` with your values
- **Vite Config:** `vite.config.js`
- **App Entry:** `src/main.jsx`
- **App Routes:** `src/App.jsx`

### Core Patterns
- **Auth Flow:** `src/stores/useAuthStore.js`
- **API Layer:** `src/services/apiClient.js` + `src/api/interceptors.js`
- **Error Boundary:** `src/components/ErrorBoundary.jsx`
- **Protected Routes:** `src/components/ProtectedRoute.jsx`
- **Logging:** `src/utils/logger.js`

### Feature Modules Template
```
src/features/{feature}/
├── hooks/          # TanStack Query + custom hooks
├── services/       # API functions
├── types/          # JSDoc types
├── components/     # Feature-specific UI
├── stores/         # Local Zustand (optional)
└── README.md       # Usage documentation
```

### Already Created Examples
- **Auth:** `src/features/auth/`
- **Profile:** `src/features/profile/`

---

## Common Tasks

### Login User
```jsx
import { useLoginMutation } from '../features/auth/hooks/useAuthMutations';

const loginMutation = useLoginMutation();
loginMutation.mutate({ email, password });
```

### Fetch Data
```jsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../services/apiClient';

const { data, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: () => apiGet('/items'),
});
```

### Update Data
```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../services/apiClient';

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data) => apiPost('/items', data),
  onSuccess: () => queryClient.invalidateQueries(['items']),
});

mutation.mutate(newData);
```

### Protect Route
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPage />
  </ProtectedRoute>
} />
```

### Access Auth Store
```jsx
import { useAuthStore } from '../stores/useAuthStore';

const { user, token, isAuthenticated, logout } = useAuthStore();
```

### Format Values
```jsx
import { formatCurrency, formatDate, formatPhoneNumber } from '../utils/formatters';

formatCurrency(1000);        // $1,000.00
formatDate(new Date());      // Jan 1, 2024
formatPhoneNumber('1234567890'); // (123) 456-7890
```

### Validate Input
```jsx
import { validateEmail, validatePassword } from '../utils/validation-rules';

if (!validateEmail(email)) alert('Invalid email');
if (!validatePassword(password)) alert('Weak password');
```

### Log Messages
```jsx
import { logger } from '../utils/logger';

logger.debug('Debug info');
logger.info('User logged in');
logger.warn('API slow');
logger.error('API failed');

logger.time('operation');
// ... do work ...
logger.timeEnd('operation');
```

### Use Icons
```jsx
import Icon from '../components/Icon';

<Icon name="search" size="lg" color="#4f46e5" />
```

### Create Form
```jsx
import { useForm } from 'react-hook-form';
import { validateEmail } from '../utils/validation-rules';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => console.log(data);

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('email', { validate: validateEmail })} />
    {errors.email && <p>{errors.email.message}</p>}
    <button type="submit">Submit</button>
  </form>
);
```

---

## Directory Tree

```
jobty-web/
├── .github/
│   └── copilot-instructions.md     [Agent guidance - 150+ lines]
├── public/
│   ├── sw.js                       [Service worker]
│   ├── manifest.webmanifest        [PWA metadata]
│   └── images/                     [Static assets]
├── src/
│   ├── api/
│   │   ├── axios.js                [Axios instance]
│   │   └── interceptors.js         [JWT + error handling]
│   ├── components/
│   │   ├── ui/                     [Basic UI components]
│   │   ├── shared/                 [Reusable components]
│   │   ├── ErrorBoundary.jsx       [Error catching]
│   │   ├── Icon.jsx                [Iconbuddy wrapper]
│   │   ├── ProtectedRoute.jsx      [Auth protection]
│   │   └── iconMapping.js          [Icon definitions]
│   ├── features/
│   │   ├── auth/                   [✅ Auth module]
│   │   ├── profile/                [✅ Profile module]
│   │   ├── discovery/              [Discovery/map feature]
│   │   ├── payments/               [Payments feature]
│   │   └── escrow/                 [Escrow feature]
│   ├── hooks/
│   │   └── index.js                [Utility hooks]
│   ├── layouts/                    [Page layouts]
│   ├── lib/
│   │   ├── mapbox.js               [Mapbox config]
│   │   ├── query-client.js         [TanStack Query]
│   │   └── utils.js                [Helpers]
│   ├── pages/                      [17 route components]
│   ├── stores/
│   │   ├── useAuthStore.js         [Auth state]
│   │   └── useUIStore.js           [UI state]
│   ├── types/                      [Centralized types]
│   ├── utils/
│   │   ├── constants.js            [Config]
│   │   ├── formatters.js           [Format utilities]
│   │   ├── validation-rules.js     [Validators]
│   │   └── logger.js               [Logging]
│   ├── App.jsx                     [✅ Main app + routes]
│   ├── main.jsx                    [Entry point]
│   ├── App.css
│   └── index.css
├── ARCHITECTURE_STATUS.md          [Complete status]
├── MIGRATION_GUIDE.md              [Page migration guide]
├── .env.example                    [Environment template]
├── vite.config.js                  [Vite configuration]
├── eslint.config.js                [Lint rules]
├── package.json                    [Dependencies + scripts]
├── index.html                      [HTML entry + PWA links]
└── README.md                       [Project README]
```

---

## Environment Variables

Create `.env` in project root:

```env
# API
VITE_API_URL=http://localhost:3000/api

# Mapbox (get token from https://mapbox.com)
VITE_MAPBOX_TOKEN=pk_YOUR_TOKEN_HERE

# Logging
VITE_LOG_LEVEL=debug  # debug, info, warn, error

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ANALYTICS=false
```

---

## Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `npm: command not found` | Node.js not in PATH | Install Node.js from nodejs.org |
| `Cannot find module 'zustand'` | Dependencies not installed | Run `npm install` |
| `Service worker failed to register` | Wrong SW file path | Check `public/sw.js` exists |
| `Mapbox map not showing` | Missing token or CSS | Add `VITE_MAPBOX_TOKEN=...` to `.env` |
| `401 Unauthorized` | Token expired or invalid | Login again; check interceptors |
| `CORS error` | Backend CORS not configured | Check backend CORS headers |

---

## Performance Tips

1. **Lazy-load routes:** Use React Router `lazy()` for heavy pages
2. **Image optimization:** Use WebP format, CDN for images
3. **Tree-shaking:** Import specific functions, not entire modules
4. **Bundle analysis:** `npm install --save-dev rollup-plugin-visualizer`
5. **Service worker:** Force update cache during deployment
6. **TanStack Query:** Set appropriate `staleTime` and `gcTime`

---

## Testing Checklist

- [ ] `npm install` runs without errors
- [ ] `npm run dev` starts server on port 5173
- [ ] No errors in browser console
- [ ] Service worker registered (DevTools → Application)
- [ ] Login flow works (auth store persists token)
- [ ] Protected routes redirect to login when not authenticated
- [ ] API calls include `Authorization: Bearer <token>` header
- [ ] Errors show in error boundary (not crash app)
- [ ] Icons load from Iconbuddy
- [ ] Offline mode works (service worker caches assets)

---

## Deployment

```bash
# Build
npm run build

# Output: dist/
# Deploy dist/ folder to Vercel/Netlify/Static Host

# Vercel (already configured in vercel.json)
vercel deploy

# Preview
npm run preview
```

---

## Next Steps After npm install

1. Test dev server: `npm run dev`
2. Migrate first page (connexion.jsx) using MIGRATION_GUIDE.md
3. Create remaining features (discovery, payments)
4. Test full auth flow
5. Build and deploy to staging

---

## Key Files to Review First

1. `.github/copilot-instructions.md` — Understand project vision
2. `MIGRATION_GUIDE.md` — Learn page migration patterns
3. `src/features/auth/README.md` — See example feature module
4. `src/App.jsx` — Understand route setup
5. `src/services/apiClient.js` — Learn API wrapper

---

## Support

- **Copilot Instructions:** `.github/copilot-instructions.md`
- **Comprehensive Status:** `ARCHITECTURE_STATUS.md`
- **Page Migration:** `MIGRATION_GUIDE.md`
- **Feature Examples:** `src/features/{feature}/README.md`
- **Code Comments:** JSDoc in all major files

---

**Last Updated:** Current Session  
**Status:** ✅ Ready for Development (pending `npm install`)
