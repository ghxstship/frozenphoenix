# Schema Enrichment Report — Core Tables

> **Migration Sources:** 001, 002, 018, 023, 024, 025
> **Tables:** organizations, profiles, user_profiles, org_memberships, invitations, departments, teams, team_memberships, roles, permissions

---

## organizations

| Attribute | Value |
|---|---|
| **Migration** | 001 (created), 002/018 (extended) |
| **Route(s)** | settings/, all (tenant root) |
| **Current Columns** | 6 (id, name, slug, logo_url, created_at, updated_at) + extensions in 002/018 (settings JSONB, status, pricing_tier, etc.) |
| **Recommended Columns** | +4 |
| **Compliance Score** | Before: 65% → After: 88% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `tax_id` | FT-PII-007 | TEXT | Required for invoicing/1099; IRS, GAAP | enterprise |
| `billing_email` | FT-PII-002 | TEXT | Billing contact separation from org admin | pro |
| `default_currency` | FT-ENUM-001 | TEXT | ISO 4217; multi-currency productions | core |
| `fiscal_year_start_month` | FT-NUM-001 | INTEGER | GAAP/IFRS financial reporting alignment | pro |

### Columns to Rename

None — naming is consistent.

### Gap Analysis

- **Missing `deleted_at`** — soft-delete required for SOC2 CC8.1 data retention
- **`settings` JSONB** (added in 018) is never read by the application; should be replaced by the `settings` table (migration 026)
- **`pricing_tier`** enum exists but no subscription/billing tables reference it yet

### Index Recommendations

- Already indexed: `slug` (UNIQUE), `id` (PK)
- Add: `CREATE INDEX idx_organizations_status ON organizations(status)` for filtered dashboards

### RLS Assessment

- Current: Simple `profiles.organization_id` check via `get_user_org_id()`
- Gap: Multi-org users (via `org_memberships`) need updated RLS function — partially addressed in migration 018 but `get_user_org_id()` still reads from `profiles`

---

## profiles (LEGACY — see FIND-002)

| Attribute | Value |
|---|---|
| **Migration** | 001 |
| **Route(s)** | All (auth context) |
| **Status** | **DEPRECATED** — canonical table is `user_profiles` (018) |
| **Compliance Score** | N/A — should be a view |

### Recommendation

Replace `profiles` table with a backward-compatible VIEW over `user_profiles` + `org_memberships`. Migration 018 already creates `user_profiles` and migrates data. The `profiles` view already exists (018) but the app still reads the table directly in some hooks.

**Action Required:**
1. Verify all hooks/queries reference the view (not the table)
2. Drop the table after confirming the view works
3. Update `get_user_org_id()` to read from `org_memberships`

---

## user_profiles

| Attribute | Value |
|---|---|
| **Migration** | 018 |
| **Route(s)** | settings/, crew/, all (auth context) |
| **Current Columns** | 18 |
| **Recommended Columns** | +3 |
| **Compliance Score** | Before: 80% → After: 92% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `preferred_locale` | FT-TEXT-003 | TEXT | i18n — GDPR Art. 12 (communication in user's language) | core |
| `timezone` | FT-TEXT-003 | TEXT | Scheduling accuracy for global crews | core |
| `emergency_contact_json` | FT-JSON-001 | JSONB | OSHA 1910.38 emergency action plans | core |

### RLS Assessment

- Current: Users can read/update own profile; org admins can read all in org
- **Adequate** — no changes needed

---

## org_memberships

| Attribute | Value |
|---|---|
| **Migration** | 018 |
| **Route(s)** | settings/, org-chart/ |
| **Current Columns** | 10 |
| **Compliance Score** | 90% |

### Assessment

Well-designed junction table with `is_default` flag for multi-org support, `role` field, and `status` enum. No enrichment needed.

---

## invitations

| Attribute | Value |
|---|---|
| **Migration** | 018 |
| **Route(s)** | settings/ (team management) |
| **Current Columns** | 12 |
| **Compliance Score** | 85% |

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `max_uses` | FT-NUM-001 | INTEGER | Support bulk/link invitations with usage limits | pro |
| `use_count` | FT-NUM-001 | INTEGER | Track invitation link usage | pro |

---

## departments, teams, team_memberships

| Attribute | Value |
|---|---|
| **Migration** | 002 |
| **Compliance Score** | 88% |

### Assessment

Standard org hierarchy tables. `departments` uses `department_type` enum (14 values covering production verticals). `teams` has `department_id` FK. `team_memberships` links users to teams with `project_role`.

### Gap

- `departments` missing `cost_center_code` (GAAP cost allocation)
- `teams` missing `max_capacity` (resource planning)

---

## roles, permissions (Config Tables)

| Attribute | Value |
|---|---|
| **Migration** | 002 |
| **Status** | Superseded by migrations 028 (`role_definitions`, `permission_grants`) |

### Assessment

Original `roles` and `permissions` tables from migration 002 are basic. Migration 028 creates the enterprise-grade `role_definitions` and `permission_grants` tables with scope-based access control. The old tables should be deprecated in favor of the new schema.
