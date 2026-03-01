# Frozen Phoenix — Cross-Module Relationship Map

> **Version:** 1.0.0 | **Tables:** 170+ | **Modules:** 12

---

## 1. Module Definitions

| Module | Tables (Primary) | Migration(s) |
|---|---|---|
| **Core** | organizations, user_profiles, org_memberships, departments, teams | 001, 002, 018, 023–025 |
| **CRM** | deals, accounts, contacts, opportunities, revenue_forecasts, lead_sources | 001, 013 |
| **Production** | projects, tasks, task_dependencies, milestones, work_packages, boms, production_runs, qc_gates | 001, 003, 005, 012, 021 |
| **Workforce** | crew_members, certifications, shifts, workforce_members, workforce_pay_rates, schedule_entries | 001, 005, 011 |
| **Finance** | budgets, budget_line_items, expenses, invoices, client_invoices, purchase_orders, gl_accounts, payroll_batches | 001, 005, 007, 016 |
| **Vendor** | vendors, contracts, vendor_insurance, vendor_scorecards, vendor_compliance_items | 001, 008, 016 |
| **Asset** | assets, vehicles, warehouses, warehouse_zones, kits, shipments, scan_events, load_plans | 001, 019 |
| **Creative** | brand_kits, decks, digital_assets, campaigns, creative_briefs, brand_guidelines, usage_rights | 001, 014, 015 |
| **Governance** | insurance_policies, permits, engineering_approvals, compliance_checklists, audit_findings | 016, 022 |
| **Live Ops** | live_events, command_positions, readiness_gates, ros_cues, comm_channels, environmental_readings | 020 |
| **Spatial** | locations, project_locations, space_bookings, event_space_overlays, location_inspections | 003, 017 |
| **Platform** | settings, feature_flags, role_definitions, permission_grants, brands, access_audit_log, notifications | 006, 026–030 |

---

## 2. Cross-Module Relationship Diagram

```
                    ┌─────────────────────────────────────┐
                    │              CORE                     │
                    │  organizations ◄── org_memberships    │
                    │  user_profiles ◄── departments/teams  │
                    └──────────┬──────────────────┬────────┘
                               │                  │
              organization_id FK              user/profile FKs
                               │                  │
          ┌────────────────────┼──────────────────┼────────────────────┐
          │                    │                  │                    │
    ┌─────▼─────┐       ┌─────▼─────┐     ┌─────▼─────┐       ┌─────▼─────┐
    │    CRM    │       │ PRODUCTION│     │ WORKFORCE │       │  FINANCE  │
    │  deals    │──────►│  projects │◄────│crew_members│──────►│  budgets  │
    │  accounts │       │  tasks    │     │  shifts   │       │  invoices │
    │  contacts │       │  milestones│    │ schedule  │       │  expenses │
    └─────┬─────┘       └─────┬─────┘     └─────┬─────┘       └─────┬─────┘
          │                   │                  │                    │
          │              project_id FK      crew/workforce FK    project/vendor FK
          │                   │                  │                    │
    ┌─────▼─────┐       ┌─────▼─────┐     ┌─────▼─────┐       ┌─────▼─────┐
    │  CREATIVE │       │  LIVE OPS │     │  SPATIAL  │       │  VENDOR   │
    │ campaigns │◄──────│live_events│────►│ locations │       │  vendors  │
    │ brand_kits│       │ros_cues   │     │space_books│       │ contracts │
    │  decks    │       │readiness  │     │inspections│       │  POs      │
    └───────────┘       └─────┬─────┘     └───────────┘       └─────┬─────┘
                              │                                      │
                        ┌─────▼─────┐                          ┌─────▼─────┐
                        │   ASSET   │                          │GOVERNANCE │
                        │  assets   │◄─────────────────────────│  permits  │
                        │  vehicles │                          │ insurance │
                        │  kits     │                          │ eng_apprvl│
                        └───────────┘                          └───────────┘
                              │
                    ┌─────────▼──────────┐
                    │     PLATFORM       │
                    │  role_definitions  │
                    │  permission_grants │
                    │  settings          │
                    │  feature_flags     │
                    │  access_audit_log  │
                    └────────────────────┘
```

---

## 3. Cross-Module Foreign Key Relationships

### 3.1 Core → All Modules (Hub)

| Source Table | FK Column | Target Table | Direction | Cardinality |
|---|---|---|---|---|
| `organizations` | `id` | All tables with `organization_id` | 1 → N | Tenant isolation |
| `user_profiles` | `id` | All tables with `created_by`, `updated_by`, `assigned_to` | 1 → N | Attribution |
| `departments` | `id` | `workforce_members.department_id`, `teams.department_id` | 1 → N | Org hierarchy |

### 3.2 CRM ↔ Production

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `deals` | `project_id` | `projects` | N → 1 | Deal-to-project conversion |
| `opportunities` | `deal_id` | `deals` | N → 1 | Opportunity-to-deal pipeline |
| `change_orders` | `project_id` | `projects` | N → 1 | Scope/budget changes |
| `revenue_forecasts` | `project_id` | `projects` | N → 1 | Revenue attribution |
| `accounts` | — | `stakeholders` (unlinked) | **GAP** | Should link via FK |

### 3.3 Production ↔ Finance

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `budgets` | `project_id` | `projects` | N → 1 | Project budgeting |
| `budget_line_items` | `budget_id` | `budgets` | N → 1 | Line-item detail |
| `expenses` | `project_id` | `projects` | N → 1 | Cost tracking |
| `client_invoices` | `project_id` | `projects` | N → 1 | Client billing |
| `purchase_orders` | `project_id` | `projects` | N → 1 | Procurement |
| `production_expenses` | `project_id` | `projects` | N → 1 | Production costs |

### 3.4 Production ↔ Workforce

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `project_members` | `profile_id` | `user_profiles` | N → 1 | Team assignment |
| `tasks` | `assignee_id` | `user_profiles` | N → 1 | Task assignment |
| `shifts` | `crew_member_id` | `crew_members` | N → 1 | Scheduling |
| `shifts` | `project_id` | `projects` | N → 1 | Project context |
| `project_assignments` | `project_id` + `workforce_member_id` | Both | N → N | Unified assignment |

### 3.5 Production ↔ Spatial

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `project_locations` | `project_id` + `location_id` | Both | N → N | Venue assignment |
| `space_bookings` | `location_id` + `project_id` | Both | N → N | Space reservation |
| `projects` | `primary_venue_id` | `locations` | N → 1 | Primary venue |

### 3.6 Production ↔ Live Ops

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `live_events` | `project_id` | `projects` | N → 1 | Event ← Project |
| `live_events` | `venue_id` | `locations` | N → 1 | Event ← Venue |
| `live_crew_assignments` | `crew_member_id` | `crew_members` | N → 1 | Event staffing |
| `equipment_check_ins` | `asset_id` | `assets` | N → 1 | Asset tracking |
| `asset_reconciliation_items` | `asset_id` | `assets` | N → 1 | Post-event reconciliation |

### 3.7 Finance ↔ Vendor

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `purchase_orders` | `vendor_id` | `vendors` | N → 1 | Procurement |
| `invoices` | `vendor_id` | `vendors` | N → 1 | AP processing |
| `invoices` | `purchase_order_id` | `purchase_orders` | N → 1 | 3-way match |
| `contracts` | `vendor_id` | `vendors` | N → 1 | Contract management |
| `goods_receipts` | `purchase_order_id` | `purchase_orders` | N → 1 | 3-way match |

### 3.8 Creative ↔ CRM/Production

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `campaigns` | `project_id` | `projects` | N → 1 | Campaign ← Project |
| `campaigns` | `account_id` | `accounts` | N → 1 | Campaign ← Client |
| `creative_briefs` | `project_id` | `projects` | N → 1 | Brief ← Project |
| `creative_briefs` | `brand_guideline_id` | `brand_guidelines` | N → 1 | Brand conformance |
| `decks` | `project_id` | `projects` | N → 1 | Presentation ← Project |

### 3.9 Governance ↔ All

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `permits` | `project_id` | `projects` | N → 1 | Regulatory compliance |
| `insurance_policies` | `vendor_id` / `project_id` | Both | N → 1 | Coverage tracking |
| `engineering_approvals` | `project_id` | `projects` | N → 1 | Structural sign-offs |
| `compliance_checklists` | `project_id` | `projects` | N → 1 | Safety documentation |
| `entity_dependencies` | `source_id` / `target_id` | Any entity | N → N | Cross-module dependencies |

### 3.10 Asset ↔ Production/Logistics

| Source | FK Column | Target | Direction | Purpose |
|---|---|---|---|---|
| `inventory_reservations` | `asset_id` + `project_id` | Both | N → N | Asset allocation |
| `shipments` | `project_id` | `projects` | N → 1 | Logistics |
| `load_plans` | `vehicle_id` + `shipment_id` | Both | N → 1 | Load planning |
| `scan_events` | `asset_id` | `assets` | N → 1 | Chain of custody |
| `kits` | `project_id` | `projects` | N → 1 | Kit assembly |

---

## 4. Identified Gaps (Missing Cross-Module Links)

| Gap | Source | Target | Recommendation | Priority |
|---|---|---|---|---|
| No `accounts` ↔ `stakeholders` link | CRM (013) | Core (001) | Add `account_id` FK to `stakeholders` or deprecate `stakeholders` | HIGH |
| No `budget_line_items` ↔ `gl_accounts` link | Finance (005) | Finance (016) | Add `gl_account_id` FK to `budget_line_items` | HIGH |
| No `goods_receipts` ↔ `warehouse_locations` link | Finance (016) | Asset (019) | Add `warehouse_location_id` FK to `goods_receipts` | MEDIUM |
| No `payroll_batches` ↔ `projects` link | Finance (005) | Production (001) | Add `project_id` FK for project-specific payroll runs | MEDIUM |
| No `digital_assets` ↔ `campaigns` direct link | Creative (014) | Creative (015) | Bridge via `campaign_assets` junction — already exists ✓ | N/A |
| No `environmental_readings` ↔ `live_events` direct link | Live Ops (020) | Live Ops (020) | Already linked via `event_id` FK ✓ | N/A |

---

## 5. Data Flow Direction Summary

| Flow | Direction | Description |
|---|---|---|
| CRM → Production | **Forward** | Deals convert to projects; opportunities generate SOWs |
| Production → Finance | **Forward** | Projects generate budgets, expenses, invoices |
| Workforce → Production | **Bidirectional** | Crew assigned to projects; projects request crew |
| Vendor → Finance | **Forward** | Vendor contracts generate POs, invoices |
| Production → Live Ops | **Forward** | Projects spawn live events |
| Spatial → Production/Live Ops | **Consumed** | Locations referenced by projects and events |
| Asset → Production/Live Ops | **Bidirectional** | Assets reserved for projects; returned post-event |
| Creative → CRM/Production | **Bidirectional** | Campaigns reference projects; briefs generate deliverables |
| Governance → All | **Cross-cutting** | Permits, insurance, compliance attach to any entity |
| Platform → All | **Infrastructure** | RBAC, settings, flags, audit applied globally |
