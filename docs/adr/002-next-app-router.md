# ADR-002: Next.js App Router Architecture

**Date:** 2025-01-15
**Status:** Accepted

## Context

The application needs a React-based framework with server-side rendering, API routes, middleware, and strong TypeScript support. The architecture must support 500+ routes, role-based layouts, and server-side data fetching.

## Decision

Use **Next.js 16 App Router** with the following conventions:

- **Layouts:** Nested route groups (`(dashboard)`, `(auth)`, `(public)`) with role-aware layouts
- **API Routes:** `src/app/api/` for all backend logic. CRUD operations go through a centralized factory (`crud-factory.ts`); custom routes use `withApiHandler` wrapper.
- **Server Components:** Default for all pages. Client components only when interactivity requires it.
- **Middleware:** `src/middleware.ts` handles session refresh, CSP injection, and CSRF token management.
- **React Compiler:** Enabled via `reactCompiler: true` for automatic memoization.
- **Standalone Output:** `output: "standalone"` for Docker deployments.

## Consequences

**Positive:**

- Server Components reduce client bundle size significantly
- File-based routing scales to 500+ pages without manual route configuration
- `withApiHandler` provides centralized auth, rate limiting, CSRF, and error handling
- React Compiler eliminates manual `useMemo`/`useCallback` optimization

**Negative:**

- App Router's streaming model requires careful error boundary placement
- Server/client component boundary requires explicit `"use client"` annotations
- Middleware runs on every request — must stay lightweight
