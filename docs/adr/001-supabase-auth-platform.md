# ADR-001: Supabase as Auth & Data Platform

**Date:** 2025-01-15
**Status:** Accepted

## Context

Frozen Phoenix requires a PostgreSQL-backed data platform with built-in authentication, authorization (RLS), real-time subscriptions, and file storage. The team needs to move fast without managing infrastructure.

Key requirements:

- PostgreSQL with Row-Level Security for multi-tenant isolation
- Built-in auth with MFA, OAuth, and magic links
- Real-time subscriptions for messaging and live ops
- Edge-deployed, managed infrastructure
- TypeScript SDK with full type generation

## Decision

Use **Supabase** as the unified auth and data platform:

- **Auth:** Supabase Auth handles all authentication flows (email/password, MFA, OAuth, password reset). No hand-rolled session management.
- **Database:** Supabase-hosted PostgreSQL with RLS policies on every tenant-scoped table.
- **Storage:** Supabase Storage for file uploads (documents, images).
- **Client:** `@supabase/ssr` for server-side session management in Next.js App Router.
- **Types:** `openapi-typescript` generates TypeScript types from the Supabase schema.

## Consequences

**Positive:**

- Zero infrastructure management for auth/DB/storage
- RLS enforces tenant isolation at the database level — defense in depth
- Type-safe database access via generated types
- Built-in real-time capabilities for messaging

**Negative:**

- Vendor lock-in to Supabase-specific APIs (mitigated by standard PostgreSQL underneath)
- RLS policy complexity increases with schema size (currently 117 migrations)
- Cold-start latency on Edge Functions (not currently used — using Next.js API routes instead)
