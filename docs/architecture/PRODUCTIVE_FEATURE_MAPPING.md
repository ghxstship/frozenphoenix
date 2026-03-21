# Productive.io Feature Mapping to FrozenPhoenix

## Executive Summary

This document maps all Productive.io features to FrozenPhoenix equivalents, identifies gaps, and provides implementation recommendations while maintaining **3NF compliance**, **SSOT principles**, and **creative/experiential production management** focus.

---

## Feature Categories

### 1. PROJECT MANAGEMENT

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Task Management** | ✅ Exists (`tasks`, `production_tasks`) | Needs view configurations |
| **Subtasks/Hierarchical Tasks** | ✅ Exists (`parent_id` in tasks) | Complete |
| **Task Dependencies** | ✅ Exists (`task_dependencies`, `dependencies[]`) | Complete |
| **Multiple Task Views** | ⚠️ Partial | Need: Board, List, Table, Calendar, Timeline, Workload, Gantt views |
| **Custom Fields** | ❌ Missing | Need: `custom_fields` and `custom_field_values` tables |
| **Task Templates** | ⚠️ Partial (`project_templates`) | Need: task-level templates |
| **Task Automations** | ❌ Missing | Need: `automations` and `automation_rules` tables |
| **Saved Views** | ❌ Missing | Need: `saved_views` table |
| **AI Task Creation** | ❌ Missing | Future enhancement |
| **Task Comments** | ✅ Exists (`comments`) | Complete |
| **Task Attachments** | ⚠️ Partial | Need: dedicated `attachments` table |
| **Task Time Tracking** | ✅ Exists (`time_entries`, `production_time_entries`) | Complete |

### 2. RESOURCE PLANNING

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Resource Scheduling** | ✅ Exists (`crew_shifts`, `schedule_entries`) | Complete |
| **Workload View** | ❌ Missing | Need: UI component + utilization calculations |
| **Capacity Planning** | ⚠️ Partial | Need: `capacity_plans` table |
| **Placeholder Bookings** | ❌ Missing | Need: `resource_placeholders` table |
| **Tentative Bookings** | ⚠️ Partial | Need: booking status field |
| **Skills/Competencies** | ✅ Exists (`skills[]` on crew_members) | Complete |
| **Team Grouping** | ✅ Exists (`department` enum) | Complete |
| **Availability Management** | ✅ Exists (`crew_availability`) | Complete |
| **Time Off Management** | ⚠️ Partial | Need: `time_off_requests` table |
| **Utilization Forecasting** | ❌ Missing | Need: computed views/reports |
| **Resource Conflicts Detection** | ❌ Missing | Need: validation logic |

### 3. TIME TRACKING

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Manual Time Entry** | ✅ Exists | Complete |
| **Timer-based Tracking** | ❌ Missing | Need: `active_timers` table |
| **Weekly Timesheets** | ⚠️ Partial | Need: `timesheets` aggregate table |
| **Calendar Integration** | ⚠️ Partial (`integrations` table) | Need: sync logic |
| **Automatic Time Tracking** | ⚠️ Partial | Need: booking-to-time conversion |
| **Time Approval Workflow** | ✅ Exists (`status`, `approved_by`) | Complete |
| **Billable vs Non-billable** | ❌ Missing | Need: `is_billable` field |
| **Time Suggestions** | ❌ Missing | Future AI enhancement |

### 4. SALES & CRM

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Deals/Opportunities** | ✅ Exists (`deals`) | Complete |
| **Pipeline Stages** | ✅ Exists (`stage` enum) | Complete |
| **Multiple Pipelines** | ❌ Missing | Need: `pipelines` table |
| **Contacts Management** | ❌ Missing | Need: `contacts` table |
| **Companies/Clients** | ⚠️ Partial (inline on deals/projects) | Need: `companies` table |
| **Proposals/Quotes** | ❌ Missing | Need: `proposals` table |
| **Scenario Builder** | ❌ Missing | Need: `deal_scenarios` table |
| **Win/Loss Tracking** | ⚠️ Partial (`stage` = won/lost) | Need: `lost_reasons` |
| **Sales Forecasting** | ❌ Missing | Need: computed reports |
| **Deal-to-Project Conversion** | ❌ Missing | Need: workflow logic |
| **HubSpot/CRM Integration** | ⚠️ Partial (`integrations`) | Need: sync implementation |

### 5. BUDGETING & PROFITABILITY

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Budget Management** | ✅ Exists (`budgets`, `production_budget_lines`) | Complete |
| **Multiple Budget Types** | ✅ Exists (fixed, T&M via categories) | Complete |
| **Rate Cards** | ❌ Missing | Need: `rate_cards` and `rate_card_items` tables |
| **Client-specific Rates** | ❌ Missing | Need: `client_rate_cards` table |
| **Budget Phases** | ✅ Exists (`phase` on budget lines) | Complete |
| **Real-time Profitability** | ⚠️ Partial | Need: computed profit margins |
| **Budget Warnings/Alerts** | ❌ Missing | Need: `budget_alerts` table |
| **Revenue Recognition** | ❌ Missing | Need: `revenue_recognition` table |
| **Overhead Calculations** | ⚠️ Partial | Need: overhead rate configuration |
| **Margin Tracking** | ⚠️ Partial | Need: computed fields |

### 6. INVOICING & BILLING

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Invoice Creation** | ✅ Exists (`invoices`) | Needs enhancement |
| **Invoice from Time/Expenses** | ❌ Missing | Need: invoice generation logic |
| **Multiple Billing Types** | ❌ Missing | Need: `billing_types` configuration |
| **Retainer/Recurring Invoices** | ❌ Missing | Need: `recurring_invoices` table |
| **Multi-currency Support** | ⚠️ Partial (`currency` field exists) | Need: exchange rates |
| **Invoice Templates** | ❌ Missing | Need: `invoice_templates` table |
| **e-Invoicing (xRechnung)** | ❌ Missing | Future enhancement |
| **Payment Tracking** | ❌ Missing | Need: `payments` table |
| **Credit Notes** | ❌ Missing | Need: `credit_notes` table |
| **Invoice Reminders** | ❌ Missing | Need: automation rules |
| **Client Invoice Portal** | ❌ Missing | Need: client-facing views |

### 7. REPORTING & DASHBOARDS

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Custom Reports** | ✅ Exists (`report_definitions`) | Complete |
| **Dashboard Widgets** | ❌ Missing | Need: `dashboard_widgets` table |
| **Multiple Dashboards** | ❌ Missing | Need: `dashboards` table |
| **Prebuilt Widgets** | ❌ Missing | Need: widget library |
| **AI Report Builder** | ❌ Missing | Future enhancement |
| **Utilization Reports** | ❌ Missing | Need: computed views |
| **Profitability Reports** | ❌ Missing | Need: computed views |
| **Pipeline Reports** | ❌ Missing | Need: computed views |
| **Export Capabilities** | ❌ Missing | Need: export logic |

### 8. DOCUMENTS & COLLABORATION

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Document Editor (Docs)** | ❌ Missing | Need: `documents` table |
| **Real-time Collaboration** | ❌ Missing | Need: WebSocket implementation |
| **Version History** | ❌ Missing | Need: `document_versions` table |
| **Document Templates** | ❌ Missing | Need: `document_templates` table |
| **File Attachments** | ✅ Exists (`vault_documents`) | Complete |
| **Document Sharing** | ⚠️ Partial (`access_level`) | Need: granular permissions |
| **Comments on Docs** | ✅ Exists (`comments` - extensible) | Complete |
| **Task Linking in Docs** | ❌ Missing | Need: entity linking |

### 9. INTEGRATIONS

| Productive.io Feature | FrozenPhoenix Status | Gap Analysis |
|----------------------|---------------------|--------------|
| **Integration Framework** | ✅ Exists (`integrations`) | Complete |
| **QuickBooks/Xero** | ⚠️ Configured | Need: sync implementation |
| **Slack** | ⚠️ Configured | Need: notification hooks |
| **Google Calendar** | ⚠️ Configured | Need: bi-directional sync |
| **Jira** | ❌ Missing | Add to integration types |
| **HubSpot** | ❌ Missing | Add to integration types |
| **Gmail** | ❌ Missing | Add to integration types |
| **Open API** | ❌ Missing | Need: API layer |

---

## Gap Summary: New Tables Required

### Priority 1: Core Enhancements
1. **`custom_fields`** - Define custom fields per entity type
2. **`custom_field_values`** - Store custom field values
3. **`saved_views`** - User-saved task/project views
4. **`automations`** - Workflow automation definitions
5. **`automation_rules`** - Individual automation rules/triggers
6. **`contacts`** - Contact management (separate from stakeholders)
7. **`companies`** - Company/client entities (SSOT for client data)
8. **`rate_cards`** - Billing rate card definitions
9. **`rate_card_items`** - Individual rate card line items

### Priority 2: Resource & Time
10. **`resource_bookings`** - Unified resource booking system
11. **`resource_placeholders`** - Placeholder bookings for planning
12. **`time_off_requests`** - Time off request workflow
13. **`active_timers`** - Running time trackers
14. **`timesheets`** - Weekly timesheet aggregates

### Priority 3: Sales & Billing
15. **`pipelines`** - Multiple sales pipelines
16. **`proposals`** - Proposal/quote management
17. **`proposal_items`** - Proposal line items
18. **`deal_scenarios`** - Pricing/resource scenarios
19. **`recurring_invoices`** - Recurring invoice schedules
20. **`payments`** - Payment tracking
21. **`credit_notes`** - Credit note management

### Priority 4: Reporting & Docs
22. **`dashboards`** - Dashboard definitions
23. **`dashboard_widgets`** - Widget configurations
24. **`documents`** - Collaborative documents
25. **`document_versions`** - Document version history
26. **`document_templates`** - Document templates

---

## Schema Extensions Required

### Existing Table Modifications
- `time_entries` / `production_time_entries`: Add `is_billable BOOLEAN DEFAULT true`
- `deals`: Add `pipeline_id UUID`, `lost_reason TEXT`, `converted_project_id UUID`
- `projects`: Add `company_id UUID`, `billing_type TEXT`
- `tasks` / `production_tasks`: Add `view_position JSONB` for board positions
- `invoices`: Add `template_id UUID`, `sent_at TIMESTAMPTZ`, `viewed_at TIMESTAMPTZ`

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Custom fields system
- Companies/Contacts (CRM foundation)
- Saved views infrastructure
- Rate cards

### Phase 2: Resource Planning (Week 3-4)
- Resource bookings unification
- Placeholders and tentative bookings
- Time off requests
- Utilization calculations

### Phase 3: Sales Enhancement (Week 5-6)
- Multiple pipelines
- Proposals system
- Deal-to-project conversion
- Sales forecasting

### Phase 4: Billing & Invoicing (Week 7-8)
- Enhanced invoicing workflow
- Recurring invoices
- Payment tracking
- Invoice templates

### Phase 5: Reporting & Dashboards (Week 9-10)
- Dashboard system
- Widget library
- Prebuilt reports
- Export capabilities

### Phase 6: Documents & Collaboration (Week 11-12)
- Document editor
- Version history
- Real-time collaboration
- Templates

---

## 3NF Compliance Notes

All new tables will follow these principles:
1. **Atomic values** - No repeating groups or arrays for relational data
2. **No redundancy** - Foreign keys instead of duplicated data
3. **Full functional dependency** - All non-key attributes depend on the entire primary key
4. **No transitive dependencies** - Non-key attributes don't depend on other non-key attributes

### SSOT Enforcement
- `companies` becomes the single source for client/company data
- `contacts` becomes the single source for contact information
- `rate_cards` becomes the single source for billing rates
- All existing inline client data will reference these canonical tables

---

## Creative/Experiential Production Adaptations

The Productive.io feature set is adapted for creative/experiential production:

| Productive.io Concept | FrozenPhoenix Adaptation |
|----------------------|-------------------------|
| Service | Production Phase / Department |
| Budget Service | Budget Line by Phase |
| Project | Production / Show / Activation |
| Resource | Crew Member / Vendor |
| Deal | Brand Opportunity / RFP |
| Client | Brand / Agency |
| Retainer | Ongoing Production Contract |

This maintains the brand/client → producer/operator relationship model while gaining Productive.io's operational capabilities.
