# Profiles Table Deprecation Plan — FIND-002

## Status: Phase 1 (Documentation & Read Migration)

## Background

The codebase has a **dual-table problem**:
- `profiles` (legacy, from migration 001) — used by most app code and RLS policies
- `user_profiles` (canonical, from migration 018) — enterprise-grade with lifecycle, compliance fields

Both tables store user profile data, creating redundancy that violates 3NF and SSOT principles.

## Migration Strategy

### Phase 1: Read Migration (Current)
- [x] Document the deprecation plan (this file)
- [ ] Add `@deprecated` JSDoc to all `profiles` table references in hooks
- [ ] Create a `useUserProfile()` hook that reads from `user_profiles` with `profiles` fallback
- [ ] Update `auth-context.tsx` to prefer `user_profiles` data

### Phase 2: Write Migration
- [ ] Create migration to sync `profiles` → `user_profiles` for existing rows
- [ ] Add DB trigger: `profiles` INSERT/UPDATE → mirror to `user_profiles`
- [ ] Update all write operations to target `user_profiles`
- [ ] Update RLS policies to reference `user_profiles`

### Phase 3: Cleanup
- [ ] Remove `profiles` table reads from all components
- [ ] Drop sync trigger
- [ ] Mark `profiles` table as read-only via RLS
- [ ] Final migration: DROP `profiles` table (with data verification)

## Affected Files

| File | Usage | Migration Action |
|------|-------|-----------------|
| `src/lib/supabase/hooks.ts` | `useProfile()`, `useProfiles()` | Redirect to `user_profiles` |
| `src/lib/supabase/auth-context.tsx` | Profile fetch on auth | Prefer `user_profiles` |
| `src/components/permission-guard.tsx` | Role from profile | Use `org_memberships.role` |
| `supabase/migrations/001_initial_schema.sql` | Table definition | Mark deprecated |
| Various RLS policies | `profiles.id` references | Migrate to `user_profiles.id` |

## Schema Comparison

| Field | `profiles` | `user_profiles` |
|-------|-----------|-----------------|
| id | ✅ UUID | ✅ UUID |
| name | ✅ TEXT | ✅ display_name TEXT |
| avatar_url | ✅ TEXT | ✅ TEXT |
| role | ✅ TEXT | ❌ (use org_memberships) |
| organization_id | ✅ UUID | ❌ (use org_memberships) |
| phone | ❌ | ✅ TEXT |
| bio | ❌ | ✅ TEXT |
| lifecycle_status | ❌ | ✅ ENUM |
| timezone | ❌ | ✅ TEXT |
| locale | ❌ | ✅ TEXT |

## Risk Mitigation

- **Rollback**: Keep `profiles` table intact until Phase 3 verification
- **Data loss**: Sync trigger ensures no writes are lost during transition
- **RLS**: Update policies atomically in a single migration
- **Testing**: Add integration tests verifying profile data consistency
