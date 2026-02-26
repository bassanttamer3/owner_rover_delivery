# Rover 2026 – Clean Code & Best Practices Enhancement Report

This report summarizes recommended improvements so the codebase aligns with clean code principles and common best practices. The project is a React + TypeScript + Vite admin dashboard (Owner Rover Delivery) with auth, companies, company users, and fleet management.

---

## 1. TypeScript & Type Safety

### 1.1 Stricter compiler options
- **Current:** `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `strictNullChecks: false` in `tsconfig.json`.
- **Recommendation:** Enable these gradually (e.g. `strictNullChecks`, then `noImplicitAny`) and fix resulting errors. This will catch more bugs and improve maintainability.

### 1.2 Replace `any` with proper types
- **Locations:**  
  - `src/pages/Companies/Companies.tsx`: `useState<any[]>` for companies.  
  - `src/pages/CompanyUsers/CompanyUsers.tsx`: `useState<any[]>` for users.  
  - `src/pages/Profile/Profile.tsx`: `useState<any | null>` for profile; `InfoCard` prop `icon: any`.  
  - `src/pages/CompanyProfile/CompanyProfile.tsx`: multiple `any` (e.g. `locationModal.data`, `setCompany` callbacks, `updateCompanySettings(..., as any)`).  
  - `src/api/companies/companies.ts`: `updateCompany(id, data: { name: string; contact: any })`.
- **Recommendation:** Use existing interfaces (`Company`, `CompanyStats`, list user type, etc.) and add small types where missing (e.g. `CompanyUser`, `Profile`) so API responses and state are fully typed. Remove `as any` by aligning payload types with API interfaces.

### 1.3 Stronger context types
- **Current:** `AuthContext` and `AppContext` use `user: unknown`, `selectedRover: unknown`.
- **Recommendation:** Define `User` and `Rover` (or minimal shapes) and use them in context so consumers get proper typing and autocomplete.

---

## 2. Authentication & Authorization

### 2.1 Use AuthContext consistently
- **Current:** `AuthProvider` is never used; `ProtectedRoute` and auth logic read directly from `localStorage`. Auth state is duplicated and can get out of sync.
- **Recommendation:** Wrap the app (e.g. in `RootLayout` or `App`) with `AuthProvider`. Have `ProtectedRoute` use `useAuth()` (and optionally redirect to login if `!user`). Centralize token/user reads in the context and expose `user`, `loading`, `logout` from there; avoid direct `localStorage.getItem("access_token")` / `user` in components.

### 2.2 Single source of truth for auth storage
- **Current:** Token and user are read/written in multiple places (Login, base-api interceptors, ProtectedRoute, auth API, Sidebar).
- **Recommendation:** Introduce a small auth storage module (e.g. `getToken()`, `setToken()`, `getUser()`, `setUser()`, `clear()`) and use it everywhere. Optionally keep using localStorage inside that module so you can swap implementation later.

---

## 3. Routing & Navigation

### 3.1 Consistent path casing
- **Current:** List route is `path: "Companies"` (capital C), detail is `path: "companies/:company_id"`. Sidebar links to `/Companies`, while `Companies.tsx` navigates to `/companies/${id}`.
- **Recommendation:** Use lowercase everywhere: e.g. `path: "companies"` and `path: "companies/:company_id"`. Update Sidebar and any `navigate()`/`Link` to use the same base path (e.g. `/companies`, `/companies/:company_id`).

### 3.2 Centralized route paths
- **Current:** Paths are string literals in `routes/index.tsx`, Sidebar, and components.
- **Recommendation:** Define a `routes` or `paths` module (e.g. `ROUTES.LOGIN`, `ROUTES.COMPANIES`, `ROUTES.companyProfile(id)`) and import it everywhere. Reduces typos and simplifies refactors.

### 3.3 Auth layout route config
- **Current:** Auth layout has `{ index: true, path: "login", element: <Login /> }`. In React Router v6, an index route should not have a `path`.
- **Recommendation:** Use either `{ index: true, element: <Login /> }` for the default auth child or `{ path: "login", element: <Login /> }` (and no index if you always want explicit `/login`). Clarify intended behavior (e.g. redirect `/` to `/login` for unauthenticated users) and adjust accordingly.

---

## 4. API Layer

### 4.1 Typed API responses
- **Current:** API functions return raw Axios responses; call sites use `res.data?.data` and ad-hoc shapes.
- **Recommendation:** Add response types (e.g. `AuthResponse`, `CompaniesListResponse`, `CompanyUserListResponse`) and type the return of each API function (e.g. `Promise<AxiosResponse<CompaniesListResponse>>`). Use these types in components when setting state.

### 4.2 Centralized error handling
- **Current:** Each component catches API errors and shows toasts with different messages; some use `err: any`, some `err: unknown` with assertions.
- **Recommendation:** Create a small `apiErrorHandler(err)` (or use an Axios response interceptor) that maps status/message to user-facing messages and optionally logs. Use it in components so error handling is consistent and type-safe (e.g. accept `unknown`, narrow to Axios error).

### 4.3 Environment variable typing
- **Current:** `base-api.ts` uses `(globalThis as any).process?.env?.VITE_API_BASE_URL` and optional chaining for `import.meta.env.VITE_API_BASE_URL`.
- **Recommendation:** Rely on Vite’s `import.meta.env` only and type it in `vite-env.d.ts` (e.g. `interface ImportMetaEnv { VITE_API_BASE_URL: string }`). Remove `globalThis`/`process` for the front-end build.

---

## 5. DRY (Don’t Repeat Yourself)

### 5.1 Reusable status badge
- **Current:** `StatusBadge` and `statusConfig` (or equivalent) are duplicated in `Companies.tsx` and `CompanyUsers.tsx`.
- **Recommendation:** Move a generic `StatusBadge` (and optionally a small status config map) to e.g. `src/components/StatusBadge.tsx` and reuse it on both pages. Add a shared `statusConfig` or allow passing label/className per status.

### 5.2 Shared “logged-in user” helper
- **Current:** `getLoggedInUser()` is implemented in both `CompanyUsers.tsx` and `CompanyUsers/Details.tsx`.
- **Recommendation:** Move to a single place (e.g. `src/common/auth.ts` or a hook `useLoggedInUser()`) and import it in both. Prefer the hook if you want reactivity when user changes.

### 5.3 Pagination component
- **Current:** Companies and Company Users each implement pagination (Previous/Next, “Page X of Y”) inline.
- **Recommendation:** Extract a `Pagination` component (or use one from your UI library) that takes `currentPage`, `totalPages`, `onPageChange` and use it on both pages.

### 5.4 Table loading skeleton
- **Current:** Both list pages use similar skeleton rows (e.g. `Array.from({ length: 5 }).map(...)`).
- **Recommendation:** Extract a `TableSkeleton` (or per-page row skeleton) component and reuse it to keep layout and loading UX consistent.

### 5.5 Brand color
- **Current:** `#2ec8cf` appears in many files (components and pages).
- **Recommendation:** Define it once (e.g. in `tailwind.config.js` as a theme color like `primary` or `brand`, or in `index.css` as a variable) and use the token everywhere. Eases future theme changes.

---

## 6. Forms & Validation

### 6.1 Use react-hook-form + Zod
- **Current:** Login and CreateCompanyModal (and likely others) use manual `useState` and ad-hoc validation. CreateCompanyModal is very long and repetitive.
- **Recommendation:** Use `react-hook-form` with `@hookform/resolvers` and `zod` (already in package.json) for all forms. Define Zod schemas for login, create company, create user, etc., and reuse validation rules. This shortens components and centralizes validation.

### 6.2 Shared validation helpers
- **Current:** `isValidEmail`, `sanitizePhone`, `sanitizePositiveDecimal` live inside `CreateCompanyModal.tsx`.
- **Recommendation:** Move to a shared module (e.g. `src/common/validation.ts` or `src/lib/validation.ts`) so Login and other forms can reuse them. Optionally wrap in Zod schemas.

---

## 7. Error Handling & Logging

### 7.1 Consistent error typing
- **Current:** Mix of `catch (err: any)` and `catch (err: unknown)` with type assertions; some components use `err.response?.data?.message`, others generic messages.
- **Recommendation:** Standardize on `catch (err: unknown)` and use a type guard or helper (e.g. `isAxiosError(err)`) to read `response.data.message`. Rely on the centralized API error handler where possible.

### 7.2 Avoid console in production
- **Current:** `CreateCompanyModal.tsx` has `console.error("Payload Error:", ...)`.
- **Recommendation:** Use a small logging utility that no-ops or sends to an error reporting service in production, and log via that instead of `console.error` in user-facing code.

---

## 8. Component Structure & Size

### 8.1 Split large components
- **Current:** `CreateCompanyModal.tsx` is very long (e.g. 470+ lines) with many sections (company info, contact, location, map, operating hours, subscription, admin user).
- **Recommendation:** Split into smaller components (e.g. `CompanyContactFields`, `LocationMapPicker` already exists, `OperatingHoursFields`, `SubscriptionFields`, `AdminUserFields`) and keep the modal as composition. Improves readability and testability.

### 8.2 Extract table rows
- **Current:** Companies and Company Users tables define row markup inline with a lot of JSX.
- **Recommendation:** Extract `CompanyRow` and `CompanyUserRow` (or generic row components) that receive data and callbacks. Simplifies the parent and makes row behavior easier to test.

---

## 9. Testing

### 9.1 Add tests
- **Current:** No test files (e.g. `*.test.ts` / `*.test.tsx`) were found.
- **Recommendation:** Add a test runner (e.g. Vitest) and start with: (1) unit tests for validation and API helpers, (2) component tests for critical flows (Login, ProtectedRoute, one list + one form), (3) optional integration tests for key user journeys. Run tests in CI.

---

## 10. Linting & Code Quality

### 10.1 Re-enable unused-vars rule
- **Current:** `@typescript-eslint/no-unused-vars` is set to `"off"` in `eslint.config.js`.
- **Recommendation:** Turn it to `"warn"` (or `"error"`) and fix or remove unused variables. This keeps the codebase cleaner and avoids dead code.

### 10.2 Root element check
- **Current:** `main.tsx` does `if (root) createRoot(root).render(...)` but doesn’t handle the `!root` case (e.g. throw or render an error message).
- **Recommendation:** If `root` is null, throw a clear error or render a minimal error UI so the failure is obvious in development and production.

---

## 11. Documentation & Repo Hygiene

### 11.1 README
- **Current:** README is minimal and references a different repo URL (`owner_rover_delivery`).
- **Recommendation:** Update repo URL and add: how to run (install, env vars, `npm run dev`), short project overview, main scripts (dev, build, lint, test), and optional architecture/stack summary.

### 11.2 Env example
- **Current:** There is an `.env` file but no `.env.example` in the list.
- **Recommendation:** Add `.env.example` with all required keys (e.g. `VITE_API_BASE_URL=`) and no secrets, and document it in the README so new contributors know what to configure.

---

## 12. React-Specific Practices

### 12.1 React Query for server state
- **Current:** TanStack React Query is installed and used in `App.tsx`, but list pages (Companies, Company Users) use `useState` + `useEffect` for fetching.
- **Recommendation:** Use `useQuery` for GET (list company, list users, get company by id, etc.) and `useMutation` for POST/PUT/DELETE. This gives caching, loading/error states, and refetching with less boilerplate and fewer bugs.

### 12.2 Key for list items
- **Current:** Skeleton rows use `key={i}` (index).
- **Recommendation:** Prefer a stable key (e.g. `key={`skeleton-${i}`}` or a dedicated id) to avoid unnecessary reconciliation issues if the list order or length changes.

---

## Priority Summary

| Priority | Area                    | Action |
|----------|-------------------------|--------|
| High     | Routing                 | Unify `Companies` vs `companies` paths and fix auth index route. |
| High     | Auth                    | Use `AuthProvider` and single source of truth for token/user. |
| High     | Types                   | Replace `any` and add response types; tighten context types. |
| Medium   | DRY                     | Extract StatusBadge, getLoggedInUser, Pagination, table skeleton. |
| Medium   | API                     | Typed responses, centralized error handling, env typing. |
| Medium   | Forms                   | react-hook-form + Zod; shared validation helpers. |
| Low      | Component size          | Split CreateCompanyModal; extract table rows. |
| Low      | Testing                 | Add Vitest and first tests. |
| Low      | Lint & docs             | Re-enable no-unused-vars; improve README and .env.example. |

Implementing these in the order above will improve consistency, type safety, maintainability, and alignment with clean code and common React/TypeScript best practices.
