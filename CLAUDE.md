# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check (tsc -b) then production build
npm run lint     # ESLint over the repo
npm run preview  # Preview the production build
```

There is no test runner configured. `npm run build` is the type-safety gate — TypeScript is strict with `noUnusedLocals`/`noUnusedParameters`, so unused imports/vars fail the build.

Path alias: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).

## What this is

Helora Garments ERP — a multi-tenant React 19 + TypeScript SPA (garment manufacturing/ordering: orders, customers, employees, measurements, attendance, pricing, WhatsApp/email comms). Stack: Vite 7, TanStack Router (file-based), TanStack Query, Zustand, CASL for RBAC, Tailwind CSS v4, shadcn/ui + Radix + Base UI.

## Architecture

### Runtime config (not build-time env)
`public/runtime-config.js` sets `window.__APP_CONFIG__` and is loaded via a plain `<script>` in `index.html` **before** the app bundle. `src/config/runtime-config.ts` reads it and **throws on startup if missing**. Key fields: `API_URL`, `ROOT_DOMAIN`, `PRODUCT_CODE`. This lets the same build be deployed to different environments — do not move these into Vite `import.meta.env`. (Note: `src/services/config/environment.config.ts` reads `import.meta.env` and is largely superseded by the runtime config path.)

### Multi-tenancy via subdomain
Tenant/environment are derived from the hostname, e.g. `<tenant>-<env>.<product>-<env>.<ROOT_DOMAIN>`. `src/utils/subdomain.ts` (`getSubdomain`) and `getTenantInfo` in `src/services/clients/login.client.ts` parse this. `ENV_SUFFIXES` = `dev|qa|stage|uat|prod`. The tenant/env are injected as `X-Tenant-Prefix` / `X-Environment-Prefix` request headers.

### API clients (`src/services/clients/`)
- `covalentHubClient` (in `covalent.client.ts`) — primary client; `withCredentials: true`.
- `login.client.ts` default export — adds tenant/customer context headers.
- All clients read `baseURL` from `appConfig.API_URL`, attach `Bearer` token from the auth store, and share the same **silent-refresh** pattern: on 401 they call `refreshSession()`, retry the original request once (`_retry` flag), and on failure `logout()` + `redirectToLogin()`. `covalentHubClient` additionally queues concurrent requests during an in-flight refresh.

### Auth (`src/auth/`)
- Zustand store `authStore.ts` — persisted to **sessionStorage** (`helora-auth-storage`); only `accessToken`/`user` persist, `status` always rehydrates to `"idle"`. Status flow: `idle → authenticated | unauthenticated`.
- `AuthProvider` (wraps the whole app in `main.tsx`) runs a one-time `refreshSession()` on `idle` to restore the session; shows `EnterpriseLottieLoader` until resolved.
- JWT claims (`ifs_person_id`, `permissions` and `customer_ids` as **stringified JSON**) are parsed in `authUtils.ts`.

### RBAC (`src/auth/rbac/` + `src/config/permission.ts`)
- Backend sends permissions as a bitmask per subject (`read=1, create=2, update=4, delete=8`); `transformBitmaskToStrings` expands to `subject:action` strings.
- CASL: `defineAbilityFromPermissions` builds the ability (subjects kept lowercase from backend; `SUPER_ADMIN` role → `manage all`). `AbilityProvider` provides it (in `AuthenticatedApp`, seeded from `user.permissions`).
- Guarding: `useCan(action, subject)` hook, `<Can>` component, and gate components `PermissionGate` / `AdminGate` / `SuperAdminGate`.

### Routing (`src/routes/`, file-based)
- TanStack Router with `autoCodeSplitting`. **`src/routeTree.gen.ts` is generated — never edit it by hand.**
- `__root.tsx` supplies `queryClient` via router context, loaders, error/not-found components.
- `_authenticated/route.tsx` is the auth gate: `beforeLoad` redirects unauthenticated users to the external identity provider (`VITE_IDENTITY_BASE_URL`) with `tenant`/`product`/`returnUrl` params.
- Route groups: `(auth)` = public auth pages; `_authenticated/app/*` = tenant user area; `_authenticated/admin/*` = admin area.
- Routes are thin: they define search-param schemas (Zod), `staticData` (title, breadcrumbs with per-crumb `permission`), and render a page component imported from `src/modules/`.

### Feature modules (`src/modules/`)
Each feature (orders, customers, employees, etc.) is self-contained: `index.tsx` (page), `components/`, `api/` (TanStack Query hooks), `types/`, sometimes `schema/`. Route files under `src/routes/` are thin wrappers that import the module's page. When adding a feature, follow this module layout rather than putting logic in the route file.

### Data fetching conventions
Query hooks live in module `api/` folders (or top-level `src/api/`). The house pattern (see `src/api/useGetCustomers.ts`): a **query-key factory** object, a standalone async fetch fn using a shared axios client, and a `useQuery` wrapper exposing a `select` and a `config` override. Query defaults (`queryClient.ts`): `staleTime` 2m, `gcTime` 10m, `retry: false`. Use the exported `QueryConfig` / `MutationConfig` helper types.

### UI
- shadcn/ui components in `src/components/ui/` (Radix + Base UI primitives). Shared layout in `src/components/layout/`, skeletons in `src/components/skeletons/`.
- Tailwind CSS v4 via `@tailwindcss/vite` (config-in-CSS, `index.css`). `cn()` in `src/lib/utils.ts` merges classes (`clsx` + `tailwind-merge`).
- Toasts: `sonner` (mounted in `__root.tsx`); tables: TanStack Table; forms: both `react-hook-form` and `@tanstack/react-form` are present; charts: `recharts`; PDF export: `jspdf`. Sinhala language support via `sinhala-unicode-coverter` and Noto Sans Sinhala font.

## Conventions
- Imports use the `@/` alias, not deep relative paths.
- Entry point is `src/app/main.tsx` (not the usual `src/main.tsx`); it wires `QueryClientProvider → AuthProvider → RouterProvider`.
