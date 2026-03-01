# Frozen Phoenix — RBAC & Pricing Implementation Roadmap

> **Version:** 1.0.0 | **Phases:** 4 | **Estimated Duration:** 10 weeks

---

## Executive Summary

This roadmap covers the end-to-end implementation of field-level RBAC and usage-based pricing for the Frozen Phoenix platform. All architecture documents, JSON definitions, migration SQL, TypeScript runtime, and API routes have been designed. This document sequences the remaining integration, testing, and deployment work.

---

## Phase 1: Schema Enrichment (Weeks 1-2)

### Objective
Apply P0 and P1 enrichment columns from the Migration Priority Matrix to close safety, compliance, and business-critical gaps.

### Deliverables

| # | Task | File(s) | Status |
|---|---|---|---|
| 1.1 | Run migration 031 (field-level RBAC + pricing tables) | `supabase/migrations/031_field_level_rbac_pricing.sql` | Ready |
| 1.2 | Create migration 032 (P0 safety/compliance columns) | `supabase/migrations/032_safety_compliance_enrichment.sql` | TODO |
| 1.3 | Create migration 033 (P1 business operations columns) | `supabase/migrations/033_business_operations_enrichment.sql` | TODO |
| 1.4 | Regenerate `database.types.ts` | `src/lib/supabase/database.types.ts` | TODO |
| 1.5 | Update TypeScript interfaces for new columns | `src/types/index.ts`, `src/types/production.ts` | TODO |
| 1.6 | Add Zod schemas for new fields | `src/lib/validation/schemas.ts` | TODO |

### Acceptance Criteria
- All P0 columns exist in DB with correct types and defaults
- `supabase gen types typescript` produces clean output
- Zod schemas validate new fields
- Existing React Query hooks still compile

---

## Phase 2: Field Access Runtime (Weeks 3-4)

### Objective
Wire the field-resolver engine into the API layer and seed field tier assignments.

### Deliverables

| # | Task | File(s) | Status |
|---|---|---|---|
| 2.1 | Seed `field_tier_assignments` with all 168 field types | `supabase/migrations/034_seed_field_tiers.sql` | TODO |
| 2.2 | Seed `field_role_access` with rules from RBAC matrix | `supabase/migrations/034_seed_field_tiers.sql` | TODO |
| 2.3 | Seed `field_bundles` and `field_bundle_items` | `supabase/migrations/034_seed_field_tiers.sql` | TODO |
| 2.4 | Create `useFieldAccess(resource)` React Query hook | `src/lib/supabase/hooks-fields.ts` | TODO |
| 2.5 | Integrate `applyFieldMasking()` into existing API routes | All `src/app/api/*/route.ts` | TODO |
| 2.6 | Add field-level masking middleware wrapper | `src/app/api/middleware/field-masking.ts` | TODO |
| 2.7 | Update `src/config/rbac.ts` to delegate to field-resolver | `src/config/rbac.ts` | TODO |

### Acceptance Criteria
- GET /api/fields/access returns correct visibility per role
- API responses for `client` and `vendor` roles have sensitive fields masked/hidden
- Safety-critical fields are always VISIBLE regardless of tier
- Existing exec/pm behavior unchanged

---

## Phase 3: Subscription & Metering (Weeks 5-7)

### Objective
Implement subscription management, bundle purchases, and usage metering.

### Deliverables

| # | Task | File(s) | Status |
|---|---|---|---|
| 3.1 | Stripe integration for subscription management | `src/lib/stripe/` | TODO |
| 3.2 | Subscription management API routes | `src/app/api/subscriptions/route.ts` | TODO |
| 3.3 | Bundle purchase/cancel API routes | `src/app/api/fields/bundles/subscribe/route.ts` | TODO |
| 3.4 | Usage aggregation pg_cron job | `supabase/migrations/035_usage_aggregation_cron.sql` | TODO |
| 3.5 | Upsell trigger evaluation engine | `src/lib/pricing/upsell-engine.ts` | TODO |
| 3.6 | Subscription settings UI page | `src/app/(dashboard)/settings/subscription/page.tsx` | TODO |
| 3.7 | Bundle marketplace UI component | `src/components/pricing/bundle-marketplace.tsx` | TODO |
| 3.8 | Usage dashboard UI component | `src/components/pricing/usage-dashboard.tsx` | TODO |

### Acceptance Criteria
- Org admin can view/change subscription tier
- Org admin can purchase/cancel bundles
- Usage events are logged without blocking requests
- Daily aggregation runs via pg_cron
- Upsell notifications fire when thresholds are met

---

## Phase 4: UI Integration & Polish (Weeks 8-10)

### Objective
Surface field-level access controls in the UI with appropriate UX treatments.

### Deliverables

| # | Task | File(s) | Status |
|---|---|---|---|
| 4.1 | Field visibility wrapper component | `src/components/fields/field-gate.tsx` | TODO |
| 4.2 | Upsell overlay component (blurred + CTA) | `src/components/pricing/upsell-overlay.tsx` | TODO |
| 4.3 | REDACTED field display component | `src/components/fields/redacted-field.tsx` | TODO |
| 4.4 | MASKED field display component | `src/components/fields/masked-field.tsx` | TODO |
| 4.5 | Export button with tier-aware column filtering | Update existing export components | TODO |
| 4.6 | Column visibility in data tables | Update `src/components/ui/data-table.tsx` | TODO |
| 4.7 | Admin: field access override management | `src/app/(dashboard)/settings/field-access/page.tsx` | TODO |
| 4.8 | Admin: usage analytics dashboard | `src/app/(dashboard)/settings/usage/page.tsx` | TODO |
| 4.9 | Integration tests for field masking | `src/__tests__/lib/field-resolver.test.ts` | TODO |
| 4.10 | E2E tests for tier gating | `tests/e2e/field-access.spec.ts` | TODO |

### Acceptance Criteria
- Hidden fields are absent from UI tables and detail views
- Masked fields show partial values with consistent formatting
- Redacted fields show appropriate placeholder text
- Upsell overlays appear on tier-gated features
- Exports respect field-level export permissions
- Admin can create/revoke field access overrides

---

## Dependency Graph

```
Phase 1 (Schema)
  └─► Phase 2 (Runtime)
        ├─► Phase 3 (Subscriptions)  ← can start in parallel with 2.5+
        └─► Phase 4 (UI)             ← requires 2.4 complete
              └─► Phase 3.6-3.8 (UI) ← merge with Phase 4
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Stripe integration complexity | Medium | High | Use Stripe Checkout for MVP, custom portal later |
| Performance: field resolution on every API call | Medium | High | Cache resolved access per user session (TTL: 5 min) via permission-cache.ts |
| Migration data loss | Low | Critical | All migrations are additive (ALTER TABLE ADD COLUMN). No destructive changes. |
| Safety-critical field miscategorization | Low | Critical | Automated test: assert all safety_critical=true fields resolve to VISIBLE for all roles |
| Bundle pricing cannibalization | Medium | Medium | Bundle price must be < tier upgrade price. Monitor conversion rates. |

---

## Testing Strategy

### Unit Tests
- `field-resolver.ts`: 100% branch coverage for all visibility/write/safety/tier combinations
- Masking functions: email, phone, SSN, address format verification
- Override resolution: scope priority, expiry, elevation-only

### Integration Tests
- API route tests: verify response shape, field filtering, and masking for each role
- Subscription state changes: verify field access changes immediately on tier change
- Bundle activation: verify specific fields become accessible

### E2E Tests
- Login as each role → verify field visibility on project detail page
- Core tier org → attempt Pro feature → verify upsell overlay
- Admin → create override → verify vendor gains access to specific field

---

## Files Created in This Audit

### Phase 1 (Master Registry)
- `docs/schema-audit/master-field-type-registry.json` — 168 canonical field types
- `docs/schema-audit/field-type-reference-guide.md` — Human-readable catalog

### Phase 2 (Enrichment)
- `docs/schema-audit/enrichment/core-tables.md`
- `docs/schema-audit/enrichment/production-tables.md`
- `docs/schema-audit/enrichment/crm-revenue-tables.md`
- `docs/schema-audit/enrichment/finance-procurement-tables.md`
- `docs/schema-audit/enrichment/workforce-crew-tables.md`
- `docs/schema-audit/enrichment/vendor-tables.md`
- `docs/schema-audit/enrichment/asset-logistics-tables.md`
- `docs/schema-audit/enrichment/creative-brand-tables.md`
- `docs/schema-audit/enrichment/governance-tables.md`
- `docs/schema-audit/enrichment/live-operations-tables.md`
- `docs/schema-audit/enrichment/spatial-hierarchy-tables.md`
- `docs/schema-audit/enrichment/settings-rbac-tables.md`
- `docs/schema-audit/module-relationship-map.md`
- `docs/schema-audit/migration-priority-matrix.md`

### Phase 3 (RBAC + Pricing)
- `docs/schema-audit/rbac-field-access-matrix.json`
- `docs/schema-audit/pricing-tier-architecture.md`
- `docs/schema-audit/field-bundle-definitions.json`
- `docs/schema-audit/implementation-roadmap.md` (this file)
- `src/lib/permissions/field-resolver.ts`
- `src/app/api/fields/access/route.ts`
- `src/app/api/fields/bundles/route.ts`
- `src/app/api/fields/usage/route.ts`
- `supabase/migrations/031_field_level_rbac_pricing.sql`
