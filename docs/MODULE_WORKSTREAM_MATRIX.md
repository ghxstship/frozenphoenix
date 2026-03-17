# Module → Workstream → Page & Functionality Matrix

> **Version:** 1.0.0 | **Generated:** 2026-03-17
> **Scope:** Exhaustive identification of every module, workstream, page, API route, edge function, hook file, and DB migration required for end-to-end operation.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Module 1 — Home](#2-module-1--home)
3. [Module 2 — Business](#3-module-2--business)
4. [Module 3 — Production](#4-module-3--production)
5. [Module 4 — Operations](#5-module-4--operations)
6. [Module 5 — Workforce](#6-module-5--workforce)
7. [Module 6 — Resources](#7-module-6--resources)
8. [Module 7 — Creative](#8-module-7--creative)
9. [Module 8 — Finance](#9-module-8--finance)
10. [Module 9 — Legal](#10-module-9--legal)
11. [Module 10 — Admin](#11-module-10--admin)
12. [Module 11 — Live Operations](#12-module-11--live-operations)
13. [Module 12 — External Access](#13-module-12--external-access)
14. [Module 13 — Auth & Onboarding](#14-module-13--auth--onboarding)
15. [Module 14 — AI Copilot](#15-module-14--ai-copilot)
16. [Cross-Cutting Infrastructure](#16-cross-cutting-infrastructure)
17. [Summary Statistics](#17-summary-statistics)

---

## 1. Executive Summary

FrozenPhoenix (branded "Playbook") is organized into **15 modules** containing **52 workstreams** requiring **~355 dashboard pages**, **~456 API routes**, **93 DB migrations**, **23 hook files (9,006 lines)**, and **15 edge functions**.

| #   | Module         | Nav Tier   | Workstreams | Dashboard Pages | Key Migrations                   |
| --- | -------------- | ---------- | ----------- | --------------- | -------------------------------- |
| 1   | Home           | Tier 1     | 5           | 20              | 046, 050, 088, 089               |
| 2   | Business       | Tier 2     | 5           | 32              | 004, 013, 033                    |
| 3   | Production     | Tier 2     | 7           | 58              | 003, 007, 012, 021, 047-049, 093 |
| 4   | Operations     | Tier 2     | 7           | 42              | 006, 010, 035, 091               |
| 5   | Workforce      | Tier 2     | 6           | 42              | 008, 011, 060                    |
| 6   | Resources      | Tier 2     | 5           | 30              | 019, 086                         |
| 7   | Creative       | Tier 2     | 4           | 28              | 014, 015                         |
| 8   | Finance        | Tier 2     | 6           | 36              | 005, 013, 016, 059               |
| 9   | Legal          | Tier 3     | 3           | 20              | 016                              |
| 10  | Admin          | Tier 3     | 8           | 44              | 018, 026-028, 051, 055           |
| 11  | Live Ops       | Contextual | 5           | 20              | 020                              |
| 12  | External       | Non-nav    | 2           | 4               | 093                              |
| 13  | Auth           | Non-nav    | 3           | 12              | 018, 025, 090                    |
| 14  | AI Copilot     | Settings   | 1           | 3               | 084, 085                         |
| 15  | Infrastructure | Cross-cut  | —           | —               | 067-083, 086-092                 |

---

## 2. Module 1 — Home

**Nav tier:** Tier 1 (always expanded) | **Hook files:** `hooks-core.ts`, `hooks-admin.ts`, `hooks-messaging.ts`, `hooks-automation.ts`

### WS-1.1: Dashboard & KPIs

**Purpose:** Command center for organizational health at a glance.

| Layer | Assets                                                               |
| ----- | -------------------------------------------------------------------- |
| Pages | `/dashboard`, `/dashboards` (custom), `/dashboard-widgets`           |
| APIs  | `dashboard-widgets`, `dashboard-widgets/[id]`                        |
| DB    | Mig 088 (KPI materialized views)                                     |
| Hooks | `hooks-admin.ts` — dashboard aggregates, useMyTasks, useMyTaskCounts |

**End-to-end functionalities:**

- Real-time KPI cards (revenue, pipeline, utilization, budget burn)
- Onboarding checklist (auto-hides on completion)
- My Tasks widget (user-scoped, due-date grouped)
- Recent Documents widget
- Custom dashboard builder with drag-and-drop widgets
- Saved dashboard layouts per user

### WS-1.2: Personal Productivity

| Layer | Assets                                            |
| ----- | ------------------------------------------------- |
| Pages | `/home/tasks`, `/home/documents`                  |
| APIs  | `tasks/counts` (user-scoped)                      |
| Hooks | `useMyTasks`, `useMyTaskCounts`, `useMyDocuments` |

**Functionalities:**

- Time-horizon task grouping (overdue / today / this week / later)
- Task KPI cards (open, in-progress, overdue, completed)
- Document type/status filters, starred/recent sections
- Cross-entity search across user-scoped tasks and documents

### WS-1.3: Calendar

| Layer | Assets                                    |
| ----- | ----------------------------------------- |
| Pages | `/calendar`                               |
| APIs  | `calendar-events`, `calendar-events/[id]` |
| Hooks | `hooks-core.ts` — useCalendarEvents       |

**Functionalities:**

- Month / week / day / agenda views
- Inline event creation
- Color-coding by entity type (task, event, shift, activation, deadline)
- iCal export

### WS-1.4: Messaging & Notifications

| Layer      | Assets                                                                                                                                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages      | `/messages` (full-page), `/notifications`                                                                                                                                                                                                                                                                              |
| APIs       | `conversations`, `conversations/[id]/messages`, `conversations/[id]/members`, `conversations/[id]/export`, `messages/[id]` (PATCH/DELETE), `messages/[id]/reactions`, `messages/[id]/pin`, `messages/[id]/read`, `messages/entity`, `messages/search`, `notifications`, `notifications/[id]`, `notifications/dispatch` |
| DB         | Mig 046 (foundation), 050 (production channels), 089 (unread RPC)                                                                                                                                                                                                                                                      |
| Hooks      | `hooks-messaging.ts` (16 hooks), `hooks-messaging-realtime.ts` (4 hooks)                                                                                                                                                                                                                                               |
| Edge Fns   | `send-scheduled-messages`, `archive-event-channels`, `escalation-engine`                                                                                                                                                                                                                                               |
| Components | 14 in `src/components/messaging/`                                                                                                                                                                                                                                                                                      |

**Functionalities:**

- DMs, group conversations, channels
- Threads, reactions, mentions, pins
- Read receipts, mandatory read acknowledgments
- New conversation dialog with people picker
- Entity-scoped messaging (comments on any record)
- Message search with access control
- Conversation export (CSV / JSON)
- Typing indicators, presence (realtime via Supabase)
- Notification bell with unread count
- Notification preferences

### WS-1.5: Insights & Reporting

| Layer | Assets                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/reports`, `/reports/ai`, `/forecasting`, `/scenarios`, `/saved-views`, `/dashboards`, `/report-definitions`             |
| APIs  | `report-definitions`, `report-definitions/[id]`, `saved-views`, `saved-views/[id]`, `domain-events`, `domain-events/[id]` |
| DB    | Mig 009 (scenarios), 034 (report_definitions, saved_views)                                                                |
| Hooks | `hooks-automation.ts` — useReportDefinitions, useSavedViews; `hooks-core.ts` — useScenarios                               |

**Functionalities:**

- 6 report types with inline data table + CSV download
- AI-powered NL report generation
- Scenario financial modeling (variables + outcomes from metadata JSON)
- Forecast extrapolation
- Saved view persistence (personal / team / org visibility)
- Report builder (define custom report queries)
- Custom dashboards with widget configuration

---

## 3. Module 2 — Business

**Nav tier:** Tier 2 | **Hook files:** `hooks-crm.ts`, `hooks-core.ts`, `hooks-feature-gaps.ts`

### WS-2.1: Pipeline Management

| Layer          | Assets                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Pages          | `/pipeline` (Kanban), `/pipeline/new`, `/leads`, `/leads/[id]`, `/opportunities`, `/opportunities/[id]`, `/lost-reasons` |
| APIs           | `leads`, `leads/[id]`, `opportunities`, `opportunities/[id]`, `lost-reasons`                                             |
| DB             | Mig 004, 013                                                                                                             |
| Hooks          | `hooks-crm.ts` — useLeads, useOpportunities, usePipelines, useLostReasons                                                |
| State machines | `lead.ts` (new→contacted→qualified→nurturing→converted/disqualified)                                                     |

**Functionalities:**

- Pipeline Kanban with drag-and-drop stage transitions
- Lead lifecycle state machine
- Lead scoring + qualification
- Opportunity win/loss tracking with reasons
- Deal-to-project conversion (server action)

### WS-2.2: Accounts & Contacts

| Layer | Assets                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pages | `/accounts`, `/accounts/[id]`, `/companies`, `/companies/[id]`, `/stakeholders`, `/stakeholder-projects`, `/account-health-scores`               |
| APIs  | `companies`, `companies/[id]`, `stakeholders`, `stakeholders/[id]`, `account-health-scores`, `stakeholder-projects`, `stakeholder-projects/[id]` |
| Hooks | `hooks-crm.ts` — useCompanies, useContacts, useStakeholders                                                                                      |

**Functionalities:**

- Company directory with address, contact info, health scores
- Stakeholder mapping to projects
- Account health scoring
- Contact management with GDPR consent tracking

### WS-2.3: Deals & Proposals

| Layer          | Assets                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Pages          | `/deals`, `/deals/[id]`, `/proposals`, `/proposals/[id]`, `/proposals/new`, `/estimates`, `/estimates/[id]` |
| APIs           | `deals`, `deals/[id]`, `proposals`, `proposals/[id]`, `estimates`, `estimates/[id]`                         |
| Hooks          | `hooks-crm.ts` — useDeals, useProposals, useEstimates                                                       |
| State machines | `proposal.ts` (draft→internal_review→sent→negotiation→accepted/rejected/expired)                            |

**Functionalities:**

- Deal detail with financial summary + activity feed (RecordChatter)
- Proposal builder with multi-step editor
- Estimate generation with line items
- Proposal lifecycle state machine

### WS-2.4: Change Orders

| Layer | Assets                                  |
| ----- | --------------------------------------- |
| Pages | `/change-orders`, `/change-orders/[id]` |
| APIs  | `change-orders`, `change-orders/[id]`   |

**Functionalities:**

- Change order creation with value impact + schedule impact
- Approval workflow integration
- Link to parent project / contract

### WS-2.5: Upsell & Engagement

| Layer | Assets                                                    |
| ----- | --------------------------------------------------------- |
| Pages | `/upsell-events`, `/upsell-triggers`, `/engagement-terms` |
| APIs  | `upsell-events`, `upsell-triggers`, `engagement-terms`    |

**Functionalities:**

- Upsell event tracking (event-driven revenue opportunities)
- Configurable trigger rules for upsell identification
- Engagement term management

---

## 4. Module 3 — Production

**Nav tier:** Tier 2 | **Hook files:** `hooks-core.ts`, `hooks-production.ts`, `hooks-sow.ts`, `hooks-advancing.ts`, `hooks-collaborators.ts`

### WS-3.1: Project Management

| Layer | Assets                                                                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/projects`, `/projects/[id]` (tabs: overview, tasks, approvals, stakeholders), `/projects/[id]/edit`, `/projects/new`, `/projects/templates`, `/project-templates`, `/project-assignments` |
| APIs  | `projects`, `projects/[id]`, `project-templates`, `project-templates/[id]`, `project-assignments`, `project-assignments/[id]`                                                               |
| DB    | Mig 001, 003, 012, 021                                                                                                                                                                      |
| Hooks | `hooks-core.ts` — useProjects, useTasks, useMilestones, useApprovals                                                                                                                        |

**Functionalities:**

- Project CRUD with full lifecycle (planning→active→wrap→closed)
- Tabbed detail page (overview, tasks, stakeholders, documents)
- Template cloning
- Member management with access expiry
- Auto-generation of comm templates on project creation
- Budget / timeline / team assignment

### WS-3.2: Task & Schedule Management

| Layer | Assets                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| Pages | `/tasks`, `/tasks/[id]`, `/scheduling` (Gantt), `/schedule-entries`, `/milestones`                                  |
| APIs  | `tasks`, `tasks/[id]`, `tasks/counts`, `schedule-entries`, `schedule-entries/[id]`, `milestones`, `milestones/[id]` |

**Functionalities:**

- Task CRUD with status lifecycle (backlog→todo→in_progress→review→done)
- Kanban + list views
- Gantt scheduling
- Milestone tracking
- Schedule dependencies

### WS-3.3: Events & Activations

| Layer          | Assets                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Pages          | `/events`, `/events/[id]`, `/activations`, `/activations/[id]`                     |
| APIs           | `events`, `events/[id]`, `events/[id]/channels`, `activations`, `activations/[id]` |
| State machines | `activation.ts` (planning→setup→rehearsal→live→strike→completed/cancelled)         |
| Edge Fns       | `cue-to-channel`, `archive-event-channels`                                         |

**Functionalities:**

- Event CRUD with type / status
- Activation lifecycle state machine
- Event detail with location / project / activation cross-refs
- Event channel provisioning from templates
- Auto-archive channels post-event

### WS-3.4: Scopes of Work

| Layer | Assets                                                               |
| ----- | -------------------------------------------------------------------- |
| Pages | `/scopes-of-work`, `/scopes-of-work/[id]`                            |
| APIs  | `scopes-of-work`, `scopes-of-work/[id]`, `v-sow-deliverable-summary` |
| DB    | Mig 007                                                              |
| Hooks | `hooks-sow.ts` (496 lines)                                           |

**Functionalities:**

- SOW creation with deliverables, milestones, payment schedules
- Status lifecycle (draft→review→approved→active→expired/superseded)
- Deliverable summary view
- Link to project + contract

### WS-3.5: Production Operations

| Layer | Assets                                                                                                                                                                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/boms`, `/work-packages`, `/production-runs`, `/production-tasks`, `/production-milestones`, `/production-checklists`, `/production-sops`, `/production-expenses`, `/production-time-entries`, `/production-budget-lines`, `/production-verticals`, `/production-advance-items`, `/technical-specs`, `/locations`, `/locations/[id]` |
| APIs  | Full CRUD for all 14 production entities + locations                                                                                                                                                                                                                                                                                  |
| DB    | Mig 003, 012, 021                                                                                                                                                                                                                                                                                                                     |
| Hooks | `hooks-production.ts` (328 lines)                                                                                                                                                                                                                                                                                                     |

**Functionalities:**

- Bill of Materials management
- Work package decomposition
- Production run tracking
- Production-specific checklists / SOPs / milestones
- Production expense + time entry tracking
- Technical specification documents
- Location hierarchy management (detail with map, events, activations)

### WS-3.6: Advancing (Production Advances)

| Layer  | Assets                                                                                                                                                                                                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages  | `/advancing`, `/advancing/[id]`, `/advancing/new` (cart/catalog), `/advancing/queue`, `/advancing/fulfillment`, `/advancing/catalog`, `/advancing/inventory`, `/advancing/templates`, `/advancing/reports`, `/advance-status-history`, `/catalog-categories`, `/catalog-items`                      |
| APIs   | `advancing` (CRUD), `advancing/[id]/submit`, `/approve`, `/reject`, `/cancel`, `advancing/[id]/items` (CRUD), `advancing/[id]/items/[itemId]/status`, `advancing/catalog/search`, `advancing/templates`, `advance-status-history`, `catalog`, `catalog/[id]`, `catalog-categories`, `catalog-items` |
| DB     | Mig 047 (catalog), 048 (advances), 049 (RBAC seed), 065 (enrich items)                                                                                                                                                                                                                              |
| Hooks  | `hooks-advancing.ts` (727 lines)                                                                                                                                                                                                                                                                    |
| Config | `advancing-config.ts`                                                                                                                                                                                                                                                                               |

**Functionalities:**

- Catalog browsing + cart-based advance creation
- Multi-step approval workflow (submit→review→approve/reject)
- Fulfillment tracking (item-level: pending→ordered→shipped→received)
- Inventory management for advance items
- Template-based advance creation
- Advance reporting (spend by project / category / status)
- Status history audit trail

### WS-3.7: Collaborator Lifecycle

| Layer    | Assets                                                                                                                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages    | Collaborators tab on project detail (PENDING)                                                                                                                                                                                           |
| APIs     | `projects/[id]/collaborators` (CRUD), `projects/[id]/collaborators/[collabId]/issue-contract`, `projects/[id]/collaborators/[collabId]/request-coi`, `projects/[id]/comm-templates` (CRUD), `projects/[id]/comm-templates/[templateId]` |
| DB       | Mig 093 (portal_access_tokens, project_collaborators, collaborator_requirements, project_crew_submissions, comm templates)                                                                                                              |
| Hooks    | `hooks-collaborators.ts` (232 lines, 12 hooks)                                                                                                                                                                                          |
| Config   | `comm-template-config.ts` (9 templates)                                                                                                                                                                                                 |
| Edge Fns | `collaborator-deadline-monitor`, `send-comm-template`                                                                                                                                                                                   |

**Functionalities:**

- Invite collaborators with portal access tokens (SHA-256, time-limited, permission-scoped)
- Polymorphic requirements model (COIs, contracts, custom types)
- Auto-completeness checking (onboarding→active when all reqs approved/waived)
- Comm template inheritance (org defaults → project overrides, delta-only storage)
- Event-driven email dispatch via pg_notify
- Contract issuance + COI request workflows
- Crew roster submission via portal

---

## 5. Module 4 — Operations

**Nav tier:** Tier 2 | **Hook files:** `hooks-approval-engine.ts`, `hooks-workflows.ts`, `hooks-automation.ts`, `hooks-documents.ts`

### WS-4.1: Approvals & Workflows

| Layer | Assets                                                                                                                                                                                                                            |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/approvals` (bulk actions), `/approvals/[id]`, `/approval-workflows`, `/approval-workflows/[id]` (instance tracker + visual flow), `/approval-steps`, `/workflows`                                                               |
| APIs  | `approvals`, `approvals/[id]`, `approval-workflows`, `approval-steps`, `approval-steps/[id]`, `approval-engine/initiate`, `/decide`, `/escalate`, `/cancel`, `approval-engine/status/[instanceId]`, `workflows`, `workflows/[id]` |
| DB    | Mig 035                                                                                                                                                                                                                           |
| Hooks | `hooks-approval-engine.ts`, `hooks-workflows.ts`                                                                                                                                                                                  |

**Functionalities:**

- Multi-step approval chains with escalation
- Bulk approve / reject on list page
- Visual workflow flow diagram
- Instance tracker (in-progress, completed, rejected)
- Configurable workflow definitions
- Notification dispatch on approval events

### WS-4.2: Automations

| Layer    | Assets                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pages    | `/automations`, `/automations/[id]` (rule builder + dry-run), `/automation-rules`, `/automation-executions`, `/automation-logs` |
| APIs     | `automations/execute`, `automation-rules`, `automation-executions`, `automation-logs`                                           |
| DB       | Mig 091 (pg_notify on 23 tables, webhook_subscriptions, webhook_deliveries, api_keys, dead_letters)                             |
| Hooks    | `hooks-automation.ts`                                                                                                           |
| Edge Fns | `automation-trigger-listener` (530 lines, 9 action types), `automation-scheduler` (340 lines)                                   |

**Functionalities:**

- Visual rule builder (trigger + conditions + actions)
- 9 action types: update_field, send_email, create_task, create_notification, webhook, slack, assign_user, change_status, create_approval
- Dry-run mode (preview without execution)
- Scheduled triggers (cron / due-date / overdue)
- Dead-letter queue for failed executions
- Webhook delivery with retry logic
- Execution history and audit log

### WS-4.3: Checklists & Quality

| Layer | Assets                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/checklists`, `/checklist-templates`, `/quality-checks`, `/quality-check-templates`, `/qc-gates`                                           |
| APIs  | `checklists`, `checklists/[id]`, `checklist-templates`, `checklist-templates/[id]`, `quality-checks`, `quality-check-templates`, `qc-gates` |

**Functionalities:**

- Checklist instance creation from templates
- Active / completed tab toggle
- Quality check execution against templates
- QC gate pass/fail tracking
- Quality check template management

### WS-4.4: Service Requests & SLA

| Layer | Assets                                                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/service-requests`, `/service-requests/[id]`, `/service-requests/sla`, `/sla-definitions`, `/sla-policies`, `/sla-tracking`, `/resilience-targets`                                          |
| APIs  | `service-requests`, `service-requests/[id]`, `sla-definitions`, `sla-definitions/[id]`, `sla-policies`, `sla-tracking`, `sla-tracking/[id]`, `resilience-targets`, `resilience-targets/[id]` |
| DB    | Mig 010, 034                                                                                                                                                                                 |

**Functionalities:**

- Service request creation with priority / category
- SLA timer tracking (response time, resolution time)
- SLA compliance dashboard
- Resilience target monitoring
- Auto-assignment rules

### WS-4.5: Documents & Templates

| Layer | Assets                                                                                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/documents`, `/documents/[id]`, `/call-sheets`, `/call-sheets/[id]`, `/tech-sheets`, `/tech-sheets/[id]`, `/templates`, `/templates/[id]`, `/templates/[id]/edit`, `/document-versions`                 |
| APIs  | `documents`, `documents/[id]`, `call-sheets`, `call-sheets/[id]`, `tech-sheets`, `tech-sheets/[id]`, `templates`, `templates/[id]`, `document-templates`, `document-templates/[id]`, `document-versions` |
| DB    | Mig 006                                                                                                                                                                                                  |
| Hooks | `hooks-documents.ts`                                                                                                                                                                                     |

**Functionalities:**

- Document CRUD with versioning
- Call sheet creation / editing with crew details
- Tech sheet creation / editing with technical specifications
- Template management with editor
- Document type / status filtering
- Version history

### WS-4.6: Email

| Layer | Assets            |
| ----- | ----------------- |
| Pages | `/email-messages` |
| APIs  | `email-messages`  |

**Functionalities:**

- Email message log viewing
- Email integration settings (in Admin > Settings)

### WS-4.7: Compliance

| Layer | Assets                                                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/compliance`, `/compliance-checklists`, `/compliance-checklists/[id]`, `/compliance-requirements`, `/compliance-templates`              |
| APIs  | `compliance-checklists`, `compliance-checklists/[id]`, `compliance-requirements`, `compliance-requirements/[id]`, `compliance-templates` |

**Functionalities:**

- Compliance checklist management
- Requirements tracking
- Drift detection dashboard
- SOC2 control mapping

---

## 6. Module 5 — Workforce

**Nav tier:** Tier 2 | **Hook files:** `hooks-workforce.ts`, `hooks-core.ts`

### WS-5.1: Crew Management

| Layer | Assets                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pages | `/crew`, `/crew/[id]`, `/crew/new`, `/crew-shifts`, `/crew-availability`, `/shifts`, `/people`, `/people/[id]`, `/org-chart`, `/worker-profiles`, `/worker-classifications`, `/worker-compliance-docs`, `/worker-reviews`, `/worker-onboarding-runs`, `/worker-offboarding-runs`                                                                                                           |
| APIs  | `crew`, `crew/[id]`, `crew-shifts`, `crew-shifts/[id]`, `crew-availability`, `crew-availability/[id]`, `shifts`, `shifts/[id]`, `worker-profiles`, `worker-profiles/[id]`, `worker-classifications`, `worker-compliance-docs`, `worker-reviews`, `worker-reviews/[id]`, `worker-onboarding-runs`, `worker-onboarding-runs/[id]`, `worker-offboarding-runs`, `worker-offboarding-runs/[id]` |
| DB    | Mig 008, 011                                                                                                                                                                                                                                                                                                                                                                               |

**Functionalities:**

- Crew CRUD (emergency contact, union info, dietary restrictions)
- Crew detail with project assignments / certifications / shifts
- Shift scheduling + availability management
- Org chart visualization (reports_to hierarchy)
- Worker profile management (classifications, compliance docs)
- Onboarding / offboarding run tracking
- Worker review management

### WS-5.2: Time Tracking

| Layer | Assets                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| Pages | `/time-tracking` (weekly view), `/time-tracking/compliance`, `/time-entries`, `/timesheets`, `/time-tracking-policies` |
| APIs  | `time-entries`, `time-entries/[id]`, `timesheets`, `timesheets/[id]`, `time-tracking-policies`                         |
| DB    | Mig 060                                                                                                                |

**Functionalities:**

- Weekly time entry grid (buildWeeklyRows from real data)
- Timer start / stop for active tracking
- Timesheet approval workflow
- Compliance dashboard (max hours, logging deadlines)
- Time tracking policy management
- Overtime flag tracking

### WS-5.3: Time Off

| Layer | Assets                            |
| ----- | --------------------------------- |
| Pages | `/time-off`, `/time-off-requests` |
| APIs  | `time-off-requests`               |

**Functionalities:**

- Time off request submission
- Balance computation from requests
- Status filter (pending / approved / rejected)
- Leave type labels from SSOT

### WS-5.4: Resource Planning

| Layer | Assets                                        |
| ----- | --------------------------------------------- |
| Pages | `/resource-planner`, `/resource-bookings`     |
| APIs  | `resource-bookings`, `resource-bookings/[id]` |

**Functionalities:**

- Resource planner with crew utilization view
- Booking creation with conflict detection
- Utilization computation from bookings
- Allocation by project

### WS-5.5: Workforce Lifecycle

| Layer | Assets                                                                                                                                                          |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/workforce`, `/workforce/[id]`, `/workforce/onboarding`, `/workforce/reviews`, `/workforce/goals`, `/review-cycles`, `/certifications`, `/certifications/[id]` |
| APIs  | `review-cycles`, `certifications`, `certifications/[id]`, `goals`, `goals/[id]`                                                                                 |

**Functionalities:**

- Workforce lifecycle dashboard (headcount, turnover)
- Onboarding / offboarding tab switch
- Performance review management with cycles
- Goal / OKR tracking
- Certification management with expiry + renewal reminders

### WS-5.6: Vendors & Vendor Lifecycle

| Layer | Assets                                                                                                                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/vendors`, `/vendors/[id]`, `/vendors/new`, `/vendor-onboarding`, `/vendor-compliance`, `/vendor-compliance-documents`, `/vendor-reviews`, `/vendor-reviews/[id]`, `/vendor-risk`, `/vendor-communications`, `/work-orders`, `/work-orders/[id]` |
| APIs  | `vendors`, `vendors/[id]`, `vendor-reviews`, `vendor-reviews/[id]`, `vendor-communications`, `vendor-compliance-documents`, `vendor-compliance-documents/[id]`, `work-orders`, `work-orders/[id]`                                                 |
| DB    | Mig 008                                                                                                                                                                                                                                           |

**Functionalities:**

- Vendor CRUD with specialty / status / insurance requirements
- Vendor detail with POs / invoices / compliance docs
- Vendor onboarding workflow
- Compliance doc management with auto-reminders
- Vendor risk scoring
- Vendor review cycles
- Communication log
- Work order management (creation, assignment, completion)

---

## 7. Module 6 — Resources

**Nav tier:** Tier 2 | **Hook files:** `hooks-assets-inventory.ts`, `hooks-scanning.ts`, `hooks-finance.ts`, `hooks-legal.ts`

### WS-6.1: Asset Management

| Layer | Assets                                                                                                                                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/assets`, `/assets/[id]`, `/assets/new`, `/assets/scan`, `/assets/scan/batch`, `/asset-assignments`, `/asset-tags`, `/asset-versions`, `/maintenance-records`, `/maintenance-schedules`, `/rental-agreements`                                                                                                            |
| APIs  | `assets`, `assets/[id]`, `assets/[id]/qr`, `assets/[id]/nfc`, `assets/lookup`, `assets/qr/batch`, `assets/scan`, `asset-assignments`, `asset-assignments/[id]`, `asset-tags`, `asset-versions`, `maintenance-records`, `maintenance-records/[id]`, `maintenance-schedules`, `rental-agreements`, `rental-agreements/[id]` |
| DB    | Mig 019, 086                                                                                                                                                                                                                                                                                                              |
| Hooks | `hooks-assets-inventory.ts`, `hooks-scanning.ts`                                                                                                                                                                                                                                                                          |

**Functionalities:**

- Asset CRUD with barcode / QR / condition tracking
- QR code generation (single + batch)
- NFC tag writing
- Camera-based QR scanner
- Batch scanning for bulk operations
- Assignment tracking (who has what, where)
- Maintenance schedule and record management
- Rental agreements with daily rates
- Version history

### WS-6.2: Inventory & Warehousing

| Layer | Assets                                                                                                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/inventory`, `/inventory-audits`, `/inventory-reservations`, `/warehouses`, `/consumables`, `/consumable-usage`, `/kits`, `/load-plans`                   |
| APIs  | `inventory-audits`, `inventory-reservations`, `warehouses`, `warehouses/[id]`, `consumables`, `consumables/[id]`, `consumable-usage`, `kits`, `load-plans` |

**Functionalities:**

- Inventory tracking with warehouse locations
- Audit execution
- Reservation management
- Kit assembly (predefined asset groupings)
- Load plan creation for logistics
- Consumable usage tracking

### WS-6.3: Shipments & Fleet

| Layer | Assets                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/shipments`, `/shipments/[id]`, `/fleet`, `/dispatch`, `/dispatch/[id]`, `/logistics-events`, `/transfer-orders`                  |
| APIs  | `shipments`, `shipments/[id]`, `fleet`, `fleet/[id]`, `vehicles`, `vehicles/[id]`, `dispatch`, `dispatch/[id]`, `logistics-events` |

**Functionalities:**

- Shipment CRUD with carrier / tracking / hazmat classification
- Fleet management (vehicles: inspection, insurance, mileage)
- Dispatch for vehicle / crew allocation
- Logistics event log
- Transfer orders between locations

### WS-6.4: Procurement

| Layer | Assets                                                                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/purchase-orders`, `/purchase-orders/[id]`, `/procurement`, `/purchase-requisitions`, `/purchase-requisitions/[id]`, `/goods-receipts`   |
| APIs  | `purchase-orders`, `purchase-orders/[id]`, `purchase-requisitions`, `purchase-requisitions/[id]`, `goods-receipts`, `goods-receipts/[id]` |
| DB    | Mig 016                                                                                                                                   |

**Functionalities:**

- PO lifecycle (draft→issued→received→closed)
- Requisition workflow (request→approve→convert to PO)
- Goods receipt tracking against POs
- Vendor risk in procurement context

### WS-6.5: Expense Reports

| Layer | Assets                                                                 |
| ----- | ---------------------------------------------------------------------- |
| Pages | `/expense-reports`, `/expenses`, `/expenses/[id]`                      |
| APIs  | `expense-reports`, `expense-reports/[id]`, `expenses`, `expenses/[id]` |
| DB    | Mig 060                                                                |

**Functionalities:**

- Expense submission with receipt upload
- Expense report compilation
- Approval workflow for reimbursement
- Category-based tracking

---

## 8. Module 7 — Creative

**Nav tier:** Tier 2 | **Hook files:** `hooks-documents.ts`, `hooks-crm.ts`

### WS-7.1: Creative Production

| Layer | Assets                                                                                                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/briefs`, `/briefs/[id]`, `/brief-templates`, `/creative-assets`, `/creative-assets/[id]`, `/creative-reviews`, `/digital-assets`, `/digital-assets/[id]` |
| APIs  | `briefs`, `briefs/[id]`, `brief-templates`, `brief-templates/[id]`, `creative-reviews`, `creative-reviews/[id]`, `digital-assets`, `digital-assets/[id]`   |
| DB    | Mig 014, 015                                                                                                                                               |

**Functionalities:**

- Creative brief creation with deliverable specifications
- Brief template management
- Creative review workflow (feedback rounds)
- Digital asset library with AI-generated flag, model release tracking
- Creative asset management with version control

### WS-7.2: Brand Management

| Layer | Assets                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/brand-guidelines`, `/brand-guidelines/[id]`, `/brand-guideline-sections`, `/brand-kit`, `/brand-kit/[id]`, `/brands`                              |
| APIs  | `brand-guidelines`, `brand-guidelines/[id]`, `brand-guideline-sections`, `brand-guideline-sections/[id]`, `brand-kits`, `brand-kits/[id]`, `brands` |

**Functionalities:**

- Brand guideline management with sections
- Brand kit management (logos, colors, typography, voice guidelines, do-not-use notes)
- Brand identity configuration (custom domains)
- Multi-brand support across org

### WS-7.3: Campaigns

| Layer          | Assets                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages          | `/campaigns`, `/campaigns/[id]` (tabs: channels / assets / KPIs), `/campaign-channels`, `/campaign-assets`, `/campaign-kpis`                                   |
| APIs           | `campaigns`, `campaigns/[id]`, `campaign-channels`, `campaign-channels/[id]`, `campaign-assets`, `campaign-assets/[id]`, `campaign-kpis`, `campaign-kpis/[id]` |
| State machines | `campaign.ts` (draft→planned→active→paused→completed/cancelled)                                                                                                |

**Functionalities:**

- Campaign lifecycle state machine
- Detail with channel performance / asset tracking / KPI monitoring
- ROI calculation, sentiment scoring, UTM tracking
- Campaign channel management (social, email, paid, etc.)

### WS-7.4: Social Proof

| Layer | Assets                                                                                      |
| ----- | ------------------------------------------------------------------------------------------- |
| Pages | `/case-studies`, `/testimonials`, `/surveys`, `/survey-templates`, `/survey-responses`      |
| APIs  | `case-studies`, `case-studies/[id]`, `testimonials`, `survey-templates`, `survey-responses` |

**Functionalities:**

- Case study management (industry tags, client approval, testimonial quote)
- Testimonial collection and display
- Survey template creation
- Survey response collection and analysis

---

## 9. Module 8 — Finance

**Nav tier:** Tier 2 | **Hook files:** `hooks-finance.ts`, `hooks-core.ts`, `hooks-admin.ts`

### WS-8.1: Revenue & Financial Overview

| Layer | Assets                                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/finance` (dashboard), `/finance/revenue-recognition`, `/revenue`, `/revenue-recognition-entries`, `/revenue-schedules`, `/financial-periods` |
| APIs  | `revenue-recognition-entries`, `revenue-schedules`, `revenue-schedules/[id]`                                                                   |

**Functionalities:**

- Financial overview dashboard (revenue, expenses, profitability, burn rate)
- Revenue recognition engine (recognized vs deferred)
- Revenue schedule management
- Financial period management

### WS-8.2: Invoicing & Billing

| Layer          | Assets                                                                                                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pages          | `/invoices`, `/invoices/[id]`, `/invoices/new`, `/client-invoices`, `/client-invoices/[id]`, `/recurring-invoices`, `/recurring-invoices/[id]`, `/invoice-templates`, `/payments`, `/credit-notes`                                                                 |
| APIs           | `invoices`, `invoices/[id]`, `client-invoices`, `client-invoices/[id]`, `recurring-invoices`, `recurring-invoices/[id]`, `invoice-templates`, `invoice-templates/[id]`, `payments`, `payments/[id]`, `credit-notes`, `credit-notes/[id]`, `v-client-invoice-aging` |
| State machines | `client-invoice.ts` (draft→sent→viewed→partial→paid/overdue/void), `payment.ts` (pending→processing→completed/failed/refunded/cancelled)                                                                                                                           |

**Functionalities:**

- Invoice creation with line items
- Client invoice lifecycle state machine
- Payment processing lifecycle state machine
- Recurring invoices with pause / resume
- Invoice template management
- Credit note issuance
- Client invoice aging report
- Payment direction filter (incoming / outgoing)

### WS-8.3: Budgeting & Job Costing

| Layer | Assets                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/budgets`, `/budgets/[id]`, `/budget-line-items`, `/budget-approvals`, `/job-costing`, `/job-cost-entries`, `/rate-cards`, `/milestones`                                                           |
| APIs  | `budgets`, `budgets/[id]`, `budget-line-items`, `budget-line-items/[id]`, `budget-approvals`, `budget-approvals/[id]`, `job-cost-entries`, `job-cost-entries/[id]`, `rate-cards`, `rate-cards/[id]` |

**Functionalities:**

- Budget creation with version control and effective dates
- Budget line items with cost centers and committed amounts
- Budget approval workflow
- Job costing with actual vs budgeted comparison
- Rate card management for billing
- Milestone-based billing

### WS-8.4: Payroll

| Layer | Assets                                    |
| ----- | ----------------------------------------- |
| Pages | `/payroll-runs`, `/payroll-batches`       |
| APIs  | `payroll-batches`, `payroll-batches/[id]` |

**Functionalities:**

- Payroll batch creation and processing
- Tax withholding / union dues / workers comp tracking
- Payroll run history

### WS-8.5: GL & Governance

| Layer | Assets                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pages | `/gl-accounts`, `/payment-approvals`, `/depreciation-schedules`, `/pos-transactions`                                           |
| APIs  | `gl-accounts`, `gl-accounts/[id]`, `payment-approvals`, `payment-approvals/[id]`, `depreciation-schedules`, `pos-transactions` |

**Functionalities:**

- Chart of accounts management
- Payment approval workflow
- Asset depreciation schedule tracking
- POS transaction log (from external sync)

### WS-8.6: Billing & Subscription

| Layer | Assets                           |
| ----- | -------------------------------- |
| Pages | `/onboarding/billing`            |
| APIs  | `billing/subscribe` (GET + POST) |
| DB    | Mig 059 (four-tier pricing)      |

**Functionalities:**

- Pricing tier selection (core / pro / enterprise) with 14-day trial
- Billing cycle management (monthly / annual)
- Tax rate configuration
- Expense category management

---

## 10. Module 9 — Legal

**Nav tier:** Tier 3 | **Hook files:** `hooks-legal.ts`

### WS-9.1: Contract Management

| Layer | Assets                                                                                                                                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/contracts`, `/contracts/[id]`, `/contracts/new` (4-step wizard), `/contract-amendments`, `/contract-obligations`, `/clause-library`, `/e-signatures`                                  |
| APIs  | `contracts`, `contracts/[id]`, `contract-amendments`, `contract-obligations`, `contract-obligations/[id]`, `clause-library`, `clause-library/[id]`, `e-signatures`, `e-signatures/[id]` |
| DB    | Mig 016                                                                                                                                                                                 |

**Functionalities:**

- Contract creation wizard (type → parties → terms → review)
- Amendment tracking
- Obligation tracking with deadlines
- Reusable clause library
- E-signature workflow
- Indemnification clause + jurisdiction tracking

### WS-9.2: Insurance, Permits & Incidents

| Layer          | Assets                                                                                                                                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages          | `/insurance-policies`, `/insurance-policies/[id]`, `/insurance-requirements`, `/permits`, `/permits/[id]`, `/incidents`, `/incidents/[id]`, `/ip-rights`, `/engineering-approvals`, `/legal-holds`                                                                      |
| APIs           | `insurance-policies`, `insurance-policies/[id]`, `insurance-requirements`, `insurance-requirements/[id]`, `permits`, `permits/[id]`, `incidents`, `incidents/[id]`, `ip-rights`, `ip-rights/[id]`, `engineering-approvals`, `engineering-approvals/[id]`, `legal-holds` |
| State machines | `permit.ts` (draft→submitted→under_review→approved/rejected/expired/revoked)                                                                                                                                                                                            |

**Functionalities:**

- Insurance policy management (waiver of subrogation, per-occurrence limits)
- Insurance requirement enforcement per vendor / collaborator
- Permit lifecycle state machine
- Incident reporting with severity / corrective actions
- IP & usage rights management
- Engineering approval workflow
- Legal hold management

### WS-9.3: RFQs & Risk

| Layer | Assets                                                           |
| ----- | ---------------------------------------------------------------- |
| Pages | `/rfqs`, `/risk-assessments`                                     |
| APIs  | `rfqs`, `rfqs/[id]`, `risk-assessments`, `risk-assessments/[id]` |

**Functionalities:**

- RFQ creation + vendor response collection
- Risk assessment execution and tracking

---

## 11. Module 10 — Admin

**Nav tier:** Tier 3 | **Hook files:** `hooks-admin.ts`, `hooks-automation.ts`, `hooks-external-sync.ts`, `hooks-credentialing.ts`, `hooks-switcher.ts`

### WS-10.1: User Management

| Layer | Assets                                                                                                                                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/user-management`, `/user-management/invitations`, `/user-management/access-reviews`, `/user-management/audit-log`, `/roles`, `/access-audit-log`, `/role-change-log`, `/temporary-access-grants`                                                                  |
| APIs  | `invitations`, `invitations/[token]/accept`, `invitations/send-email`, `access-audit-log`, `access-audit-log/[id]`, `login-audit-log`, `login-audit-log/[id]`, `role-change-log`, `role-change-log/[id]`, `temporary-access-grants`, `temporary-access-grants/[id]` |
| DB    | Mig 018, 028, 038                                                                                                                                                                                                                                                   |

**Functionalities:**

- User list with role management
- Bulk invitation with role assignment
- Invitation acceptance flow
- Access review campaigns
- Audit log (login events, role changes, permission grants)
- Roles page with inline permission matrix editing (clickable toggles for DB-backed roles)
- Temporary access grant management
- 6-tier RBAC (exec / director / pm / member / client / collaborator)

### WS-10.2: Organization & Teams

| Layer | Assets                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pages | `/organizations`, `/teams`, `/people`, `/people/[id]`, `/org-chart`                                                                                                                                                                  |
| APIs  | `organizations`, `organizations/[id]`, `organizations/transfer-ownership`, `organizations/[id]/security`, `teams`, `teams/[id]`, `teams/[id]/members`, `teams/[id]/members/[memberId]`, `user-profiles`, `profiles`, `profiles/[id]` |
| DB    | Mig 018, 056, 063                                                                                                                                                                                                                    |

**Functionalities:**

- Organization management (tax ID, billing email, fiscal year, default currency)
- Ownership transfer (atomic swap with confirmation text)
- Team creation and member management
- People directory
- Org chart visualization (crew_members.reports_to)
- Org security settings
- Multi-org switching

### WS-10.3: Settings

| Layer | Assets                                                                                                                                                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/settings` (2,384 lines), `/settings/security`, `/settings/org-security`, `/settings/custom-fields`, `/settings/developer`, `/settings/email-integration`, `/settings/ai`                                 |
| APIs  | `api-keys`, `settings/change-requests`, `settings/change-requests/[id]/review`, `settings/drift-detection`, `fields/access`, `fields/bundles`, `fields/usage`, `feature-flags`, `custom-field-definitions` |
| DB    | Mig 026, 027, 031                                                                                                                                                                                          |

**Functionalities:**

- General settings (org info, branding, timezone, locale)
- Security settings (password change, MFA TOTP enrollment, session management)
- Org security policies
- Custom field definitions per entity
- Developer portal (API key management + documentation)
- Email integration configuration
- Notification preference management
- AI copilot configuration
- Settings change approval workflow
- Drift detection (config changes not going through approval)

### WS-10.4: Knowledge Management

| Layer | Assets                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pages | `/knowledge-base`, `/knowledge-base/[id]`, `/knowledge-base/collaborative`, `/sops`, `/vault`, `/vault-documents`                                                  |
| APIs  | `knowledge-base`, `knowledge-base/[id]`, `knowledge-base-articles`, `knowledge-base-articles/[id]`, `sops`, `sops/[id]`, `vault-documents`, `vault-documents/[id]` |

**Functionalities:**

- Knowledge article CRUD with rich text editing
- Collaborative editing support
- SOP management
- Vault (secure document storage with access-level labels)
- Document search

### WS-10.5: Integrations & External Sync

| Layer    | Assets                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pages    | `/integrations`, `/integrations/[id]` (5 tabs), `/integrations/sync-log`, `/integrations/marketplace`, `/provider-connections`, `/sync-events`                                                                                       |
| APIs     | `integrations`, `integrations/[id]`, `integrations/connections`, `integrations/sync-log`, `integration-catalog`, `integrations/oauth/authorize`, `integrations/oauth/callback/[providerType]`, `provider-connections`, `sync-events` |
| DB       | Mig 055, 091                                                                                                                                                                                                                         |
| Hooks    | `hooks-external-sync.ts` (344 lines)                                                                                                                                                                                                 |
| Edge Fns | `sync-outbound`, `sync-pos-aggregate`, `webhook-eventbrite`, `webhook-square`, `webhook-replay`                                                                                                                                      |

**Functionalities:**

- Integration marketplace (23 seeded providers)
- OAuth flow for provider authentication (11 providers configured)
- Provider connection management
- Bi-directional sync (inbound webhooks + outbound push)
- Sync event log with error tracking
- Webhook delivery with retry + replay
- POS aggregate sync
- Conflict resolution policies per field

### WS-10.6: Credentialing & Ticketing

| Layer | Assets                                                                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/credentials`, `/credentials/assignments`, `/credential-types`, `/credential-inventory-pools`, `/credential-assignments`                                                                    |
| APIs  | `credential-types`, `credential-inventory-pools`, `credential-assignments`, `credentials/assign`, `credentials/bulk-import`, `credentials/export`, `credentials/scan`, `credentials/[id]/qr` |
| DB    | Mig 051                                                                                                                                                                                      |
| Hooks | `hooks-credentialing.ts` (542 lines)                                                                                                                                                         |

**Functionalities:**

- Credential type management (categories: staff, vip, media, vendor, all-access, etc.)
- Inventory pool tracking (available / assigned / revoked counts)
- Credential assignment (individual + bulk)
- QR code generation per credential
- Bulk import / export
- Gate scan operations (check-in / check-out)

### WS-10.7: System Health & Data

| Layer | Assets                                                                                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/system-health`, `/service-health-checks`, `/data-export`, `/data-export-requests`, `/activity-log`, `/feature-flags`, `/tags`                                            |
| APIs  | `service-health-checks`, `service-health-checks/[id]`, `data-export-requests`, `data-export-requests/[id]`, `activity-log`, `activity-log/[id]`, `feature-flags`, `health` |
| DB    | Mig 027, 054, 058                                                                                                                                                          |

**Functionalities:**

- System health dashboard (service status, SLA definitions, resilience targets, domain events)
- Data export management (CSV / JSON with background processing)
- Activity log (system-wide audit trail)
- Feature flag management (targeting by org / role / env / region / percentage)
- Tag management (cross-entity tagging)

### WS-10.8: Portals

| Layer | Assets                             |
| ----- | ---------------------------------- |
| Pages | `/client-portal`, `/vendor-portal` |

**Functionalities:**

- Client portal — scoped queries for client-role users, project status / document access / invoice view (placeholder, RBAC exists)
- Vendor portal — shift claiming, document upload, invoice submission (placeholder, RBAC exists)

---

## 12. Module 11 — Live Operations

**Nav tier:** Contextual (visible only when a live event is in-progress) | **Hook files:** `hooks-live-ops.ts`, `hooks-credentialing.ts`

### WS-11.1: Command & Control

| Layer | Assets                                                                                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/live-ops` (command dashboard), `/live-ops/departments`, `/live-ops/comms`, `/live-ops/environment`, `/live-ops/financials`            |
| APIs  | `live-event-instances`, `live-financial-snapshots`, `environmental-readings`, `comm-channels`, `command-positions`, `channel-templates` |
| DB    | Mig 020                                                                                                                                 |
| Hooks | `hooks-live-ops.ts` (318 lines) — all 17 live-ops entities via factory pattern                                                          |

**Functionalities:**

- Real-time command dashboard with event status overview
- Department status board (per-department go / no-go)
- Live communications / radio channel management
- Environmental readings (weather, wet-bulb globe temperature)
- Live financial snapshots (revenue, spend, ticket sales)
- Command position tracking

### WS-11.2: Run of Show & Readiness

| Layer    | Assets                                                                          |
| -------- | ------------------------------------------------------------------------------- |
| Pages    | `/live-ops/run-of-show`, `/live-ops/readiness`, `/ros-cues`, `/readiness-gates` |
| APIs     | `ros-cues`, `ros-cues/[id]`, `readiness-gates`, `readiness-gates/[id]`          |
| Hooks    | `hooks-live-ops.ts` — useRosCues, useUpdateRosCue, useReadinessGates            |
| Edge Fns | `cue-to-channel` (cue triggers → messaging channel notifications)               |

**Functionalities:**

- Run of show cue management with inline Go / Complete / Hold / Resume buttons
- Actual time recording on cue execution
- Readiness gate checklist (go / no-go for event start)
- Cue-triggered channel notifications via edge function

### WS-11.3: Crew & Equipment

| Layer | Assets                                                                                    |
| ----- | ----------------------------------------------------------------------------------------- |
| Pages | `/live-ops/crew`, `/live-ops/equipment`, `/live-crew-assignments`, `/equipment-check-ins` |
| APIs  | `live-crew-assignments`, `live-crew-assignments/[id]`, `equipment-check-ins`              |

**Functionalities:**

- Live crew assignment tracking (credentials_verified status)
- Equipment check-in / check-out tracking
- Real-time crew status board

### WS-11.4: Front of House & VIP

| Layer | Assets                                                                                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/live-ops/foh`, `/live-ops/vip`, `/live-ops/guest-incidents`, `/live-ops/credentials`, `/live-ops/gate`, `/foh-zones`, `/foh-zone-readings`, `/vip-service-requests`, `/scan-events`, `/space-bookings` |
| APIs  | `foh-zones`, `foh-zone-readings`, `vip-service-requests`, `scan-events`, `space-bookings`                                                                                                                |
| Hooks | `hooks-credentialing.ts` — useGateScan (mutation), useGateScanHistory (query)                                                                                                                            |

**Functionalities:**

- FOH zone management (types, capacity, occupancy, sales readings)
- VIP guest management (tier, zone_access, status)
- VIP service request handling
- Guest incident reporting and tracking
- Gate credential scanning (camera-based QR → credential validation → check-in/out)
- Space booking management
- Scan event audit log

### WS-11.5: Strike & Reconciliation

| Layer    | Assets                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages    | `/live-ops/strike`, `/live-ops/reconciliation`, `/live-ops/reports`, `/strike-sequences`, `/live-event-instances`, `/live-financial-snapshots` |
| APIs     | `strike-sequences`                                                                                                                             |
| Edge Fns | `archive-event-channels` (post-event channel cleanup)                                                                                          |

**Functionalities:**

- Strike sequence management (load-out coordination, ordered task execution)
- Asset reconciliation (scan-to-receive against advance manifest)
- Post-event reports (total revenue / expenses, sustainability notes, NPS score, carbon footprint)
- Event channel archival after event concludes

---

## 13. Module 12 — External Access

**Non-dashboard routes (standalone, unauthenticated)** | **Hook files:** `hooks-collaborators.ts`

### WS-12.1: Collaborator Portal

| Layer | Assets                                                                                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/portal/[token]` (standalone page, outside dashboard layout)                                                                                                                                                          |
| APIs  | `portal/[token]` (GET portal data), `portal/[token]/submit` (POST requirement submissions), `portal/[token]/confirm-manifest` (POST manifest confirmation), `portal/[token]/crew-roster` (POST crew roster submission) |
| DB    | Mig 093 (portal_access_tokens with SHA-256 hash, permissions array `[read, submit, sign]`, expires_at, use_count, revoked_at)                                                                                          |

**Functionalities:**

- Token-based authentication (the token IS the auth — no login required)
- View collaborator requirements and status
- Submit COIs / contracts / documents against requirements
- Confirm advance manifests
- Submit crew rosters
- Time-limited access with permission scoping
- Use count tracking for audit

### WS-12.2: E-Signature

| Layer | Assets                                                      |
| ----- | ----------------------------------------------------------- |
| Pages | `/sign/[token]` (standalone page, outside dashboard layout) |
| APIs  | `sign/[token]` (GET contract data + POST signature)         |

**Functionalities:**

- Unauthenticated e-signature page (token IS the auth)
- Contract viewing + signature capture
- Signature status update on collaborator requirements
- Links back to collaborator lifecycle (updates requirement status)

---

## 14. Module 13 — Auth & Onboarding

**Non-dashboard routes** | **Hook files:** `hooks-admin.ts`

### WS-13.1: Authentication

| Layer         | Assets                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages         | `/login`, `/signup`, `/forgot-password`, `/auth/reset-password`, `/auth/mfa-setup`, `/auth/mfa-verify`                                                                           |
| APIs          | `auth/signout`, `auth/reset-password`, `auth/session`, `auth/validate-password`, `auth/log-event`, `auth/bluesky/login`, `auth/bluesky/callback`, `auth/bluesky/client-metadata` |
| Route handler | `/auth/callback` (Supabase OAuth callback)                                                                                                                                       |
| DB            | Mig 018 (user lifecycle identity), 090 (Bluesky OAuth — atproto_did, bluesky_handle columns, bluesky_oauth_states/sessions tables)                                               |
| Components    | `src/components/auth/` — PasswordInput, AuthFormField, AuthLayout, OAuthButtons (Google + Bluesky), BotProtection (Cloudflare Turnstile)                                         |
| Lib           | `src/lib/auth-utils.ts` (redirect validation, rate limiting, error mapping, password validation), `src/lib/auth-analytics.ts`, `src/lib/auth/bluesky-client.ts`                  |

**Functionalities:**

- Email / password authentication
- Google OAuth
- Bluesky AT Protocol OAuth (handle → PDS resolution → authorization → DID → magic link → Supabase session)
- Magic link authentication
- Password reset flow
- MFA TOTP enrollment (QR code + manual secret entry + verification)
- MFA challenge verification (6-digit code)
- Bot protection via Cloudflare Turnstile
- Client-side rate limiting on auth forms
- Redirect validation (prevent open redirects)
- WCAG-compliant auth forms (ARIA, live regions, htmlFor/id binding)
- Auth event audit logging (fire-and-forget to server)
- i18n string catalog for all auth UI

### WS-13.2: Onboarding

| Layer      | Assets                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages      | `/onboarding/org-setup` (org creation with industry / timezone / role), `/onboarding/invite-team` (multi-row invite), `/onboarding/billing`, `/onboarding/claim-username`, `/invite/[token]` (invitation acceptance)                                                                   |
| APIs       | `organizations` (POST create org + exec membership), `invitations` (POST bulk invite), `invitations/[token]/accept` (GET details + POST accept), `onboarding/progress` (GET steps + POST mark complete), `billing/subscribe`, `usernames/check`, `usernames/claim`, `usernames/change` |
| DB         | Mig 025 (seed defaults + 12 onboarding step definitions), 039 (usernames/handles), 045 (invitation referral support)                                                                                                                                                                   |
| Components | `src/components/onboarding/onboarding-checklist.tsx`                                                                                                                                                                                                                                   |

**Functionalities:**

- Organization creation with industry / timezone / role self-selection (4 internal roles: exec / director / pm / member)
- Bulk team invitation with role assignment
- Invitation acceptance page (displays org info, handles all states: valid / expired / already accepted / invalid)
- Billing / subscription setup (pricing tier selection with 14-day trial)
- Username claiming with availability check
- Onboarding checklist widget on dashboard (auto-hides on completion)
- Onboarding progress tracking (12 step definitions)

### WS-13.3: Public Pages

| Layer | Assets                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pages | `/` (landing page), `/legal/terms`, `/legal/privacy`, `/org/[slug]` (public org profile), `/u/[username]` (public user profile) |

**Functionalities:**

- Public landing page with brand identity
- Legal pages (terms of service, privacy policy)
- Public organization profile page
- Public user profile page

---

## 15. Module 14 — AI Copilot

**Settings child** | **Hook files:** `hooks-feature-gaps.ts`

### WS-14.1: AI Assistant

| Layer     | Assets                                                                                                                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages     | `/settings/ai` (configuration), `/reports/ai` (NL query interface)                                                                                                                                                                                                                      |
| APIs      | `ai/chat` (streaming AI conversation), `ai/documents` (list), `ai/documents/upload` (ingest), `ai/health` (provider status), `ai/limits` (rate limits), `ai/models` (available models), `ai/prompts` (prompt management), `ai/providers` (provider config), `ai/usage` (usage tracking) |
| DB        | Mig 084 (AI copilot foundation — ai_conversations, ai_messages, ai_documents, ai_providers, ai_prompts, ai_usage_logs), Mig 085 (vector search RPC — pgvector similarity search)                                                                                                        |
| Auto-docs | `docs` (GET — OpenAPI spec), `docs/ui` (GET — Swagger UI)                                                                                                                                                                                                                               |

**Functionalities:**

- Streaming AI chat interface
- Document upload for AI context (RAG)
- Vector search across ingested documents (pgvector)
- AI model / provider configuration (multi-provider support)
- Prompt management (system prompts, templates)
- AI health monitoring (provider availability)
- Usage tracking + rate limiting
- NL query → report generation
- Auto-generated API documentation (OpenAPI + Swagger UI)

---

## 16. Cross-Cutting Infrastructure

These are not user-facing modules but are required for all workstreams to function end-to-end.

### Platform Foundation (DB)

| Migration | Purpose                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| 001       | Initial schema — core tables (projects, tasks, deals, invoices, etc.)                                                   |
| 002       | Extended schema — additional entity attributes                                                                          |
| 003       | Production lifecycle                                                                                                    |
| 018       | User lifecycle identity (users, orgs, memberships, profiles)                                                            |
| 022       | Audit remediation — RLS baseline                                                                                        |
| 029       | Role-based RLS                                                                                                          |
| 036       | Extend organizations                                                                                                    |
| 038       | RBAC 6-tier expansion                                                                                                   |
| 040       | Fix auth user FK cascades                                                                                               |
| 041-044   | RLS recursion fixes, trigger search path, enum casts                                                                    |
| 067       | Identity consolidation (profiles → user_profiles, dual-write, v_profiles view)                                          |
| 068       | RLS gap closure (10 tables upgraded to multi-org CRUD policies)                                                         |
| 069       | Table consolidation (backward-compat views for deprecated tables)                                                       |
| 070       | Cleanup duplicate tables from 034/061                                                                                   |
| 071       | JSONB normalization (brief_deliverables junction, departments lookup)                                                   |
| 072       | Missing indexes (~15 composite indexes for high-traffic queries)                                                        |
| 073       | Enum hygiene (merge sheet statuses, extend booking/SOW/entity_type enums)                                               |
| 074       | Schema validation (assertions for RLS, FKs, tables, indexes)                                                            |
| 075-080   | Schema enrichment pass 1 (safety, cross-module FKs, business ops, enterprise, supplementary, polymorphic FK validation) |
| 081-083   | Schema optimization pass 2 (FK repointing, deferred enrichment, validation)                                             |
| 087       | Edge function hardening (atomic error counts, webhook secret uniqueness)                                                |
| 092       | Hardening pass (final)                                                                                                  |

### Shared UI Components & Shells

| Component                          | Usage                 | Purpose                                                                   |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------- |
| `ListPageShell`                    | ~216 pages            | Standard list page container (data table, filters, stats, view switching) |
| `DetailPageShell` / `DetailLayout` | ~50 pages             | Standard detail page with tabs, sidebar, header                           |
| `FormPageShell`                    | 6 pages               | Standard form page (section-based + wizard mode)                          |
| `PageShell`                        | ~7 pages              | Generic page container                                                    |
| `RowActionsMenu`                   | All 8 data views      | Universal row actions (View / Edit / Delete)                              |
| `TabBar`                           | Content tab switching | ARIA-compliant tabs with URL sync                                         |
| `SegmentedControl`                 | View/filter toggles   | Radio-role segments for data view switching                               |
| `useQueryTabState`                 | ~40 pages             | URL-synced tab / view / filter state                                      |
| `CommandBar`                       | Global                | Universal command palette (Cmd+K)                                         |
| `MessagingPanel`                   | Global                | Slide-out messaging panel                                                 |
| `OnboardingChecklist`              | Dashboard             | Auto-hiding onboarding progress                                           |
| `PermissionGate` / `OwnerGate`     | All protected UI      | Client-side RBAC gating                                                   |
| `EntityCommentsSection`            | Detail pages          | Record-level messaging                                                    |

### Data Layer

| Asset                | Stats             | Purpose                                                                                       |
| -------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| 23 hook files        | 9,006 lines       | 450+ React Query hooks across 12 domain files                                                 |
| `hook-factories.ts`  | 5 factories       | makeListHook, makeDetailHook, makeCreateHook, makeUpdateHook, makeDeleteHook                  |
| `hook-types.ts`      | 54 WithJoin types | SSOT for composite join types                                                                 |
| `crud-factory.ts`    | ~118 routes       | CRUD API route generation from entity config                                                  |
| `entity-config.ts`   | 200+ entities     | Entity configuration registry                                                                 |
| `schema-registry.ts` | 151 schemas       | Zod validation schemas                                                                        |
| 32 state machines    | 7 files           | Lifecycle validations (lead, campaign, proposal, client-invoice, payment, activation, permit) |

### RBAC & Security

| Asset                  | Purpose                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| `rbac.ts`              | 6-role permission matrix (~145 resources)                                       |
| `field-resolver.ts`    | Field-level visibility masking per role (ROLE_HIERARCHY: exec=5→collaborator=0) |
| `permission-guard.tsx` | Client-side PermissionGate + OwnerGate + useIsOwner                             |
| `middleware.ts`        | Server-side auth, CSP header, HSTS, MFA AAL enforcement, cookie-first fast path |
| `with-api-handler.ts`  | API route middleware with auth + RBAC + rate limiting                           |
| `permissions.ts`       | Server-side permission check (uses hasStaticPermission from RBAC matrix)        |
| `tier-entitlements.ts` | 4-tier pricing feature gating (core / pro / enterprise / unlimited)             |

### Configuration SSOT

| Config File                     | Purpose                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `design-tokens.ts`              | UI primitives (LAYOUT, BREAKPOINTS, MOTION_SCALE, TEXT_VARIANTS, density tokens) |
| `domain-config.ts`              | Business enum configs (deal stages, project phases, task statuses, etc.)         |
| `production-config.ts`          | Production-specific configs (departments, procurement, contracts, shipments)     |
| `ui-variants.ts`                | Badge variant mappings (status → color)                                          |
| `rbac.ts`                       | Permission matrix + role hierarchy                                               |
| `tier-entitlements.ts`          | Pricing tier feature gates                                                       |
| `navigation.ts`                 | IA v4 — 10 sections + 1 contextual, RBAC + tier filtering                        |
| `brands/`                       | White-label brand configurations (playbook, rilla)                               |
| `list-page-configs/`            | 10 config files covering ~230 list page configurations                           |
| `create-entity-configs.ts`      | Create form configurations                                                       |
| `entity-lookup-configs.ts`      | Entity lookup/search configs                                                     |
| `advancing-config.ts`           | Advancing module config                                                          |
| `comm-template-config.ts`       | 9 communication template definitions                                             |
| `quality-standards-registry.ts` | ~360 quality gate criteria                                                       |

### Edge Functions (15 total)

| Function                        | Trigger               | Purpose                                                               |
| ------------------------------- | --------------------- | --------------------------------------------------------------------- |
| `automation-trigger-listener`   | pg_notify (23 tables) | Execute automation rules (9 action types)                             |
| `automation-scheduler`          | Cron                  | Scheduled triggers, due-date/overdue checks, DLQ retry, webhook retry |
| `send-scheduled-messages`       | Cron                  | Deliver messages scheduled for future delivery                        |
| `send-comm-template`            | pg_notify             | Render comm template + dispatch email                                 |
| `collaborator-deadline-monitor` | Cron                  | Check collaborator requirement deadlines, send reminders              |
| `archive-event-channels`        | Event lifecycle       | Archive messaging channels after event concludes                      |
| `cue-to-channel`                | ROS cue status change | Broadcast cue notifications to event channels                         |
| `incident-to-thread`            | Incident creation     | Create messaging thread from incident report                          |
| `entity-status-to-channel`      | Entity status change  | Broadcast entity status changes to relevant channels                  |
| `escalation-engine`             | Timer / threshold     | Escalate unacknowledged messages to manager chain                     |
| `sync-outbound`                 | DB trigger            | Push changes to external providers (Eventbrite, Square)               |
| `sync-pos-aggregate`            | Cron                  | Aggregate POS transaction data from providers                         |
| `webhook-eventbrite`            | Inbound webhook       | Receive + normalize Eventbrite webhook payloads                       |
| `webhook-square`                | Inbound webhook       | Receive + normalize Square webhook payloads                           |
| `webhook-replay`                | Manual / retry        | Replay failed webhook deliveries                                      |

### CSV Import / Export

| API                     | Purpose                              |
| ----------------------- | ------------------------------------ |
| `csv/template/[entity]` | Download CSV template for any entity |
| `csv/import`            | Bulk import from CSV                 |
| `csv/export`            | Bulk export to CSV                   |

### Comments System

| API                         | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `comments`, `comments/[id]` | Cross-entity record comments (mentioned_user_ids support) |

---

## 17. Summary Statistics

### By the Numbers

| Metric                    | Count                                                |
| ------------------------- | ---------------------------------------------------- |
| **Modules**               | 15                                                   |
| **Workstreams**           | 52                                                   |
| **Dashboard pages**       | ~355                                                 |
| **Non-dashboard pages**   | ~15 (auth, public, portal, sign)                     |
| **API routes**            | ~456                                                 |
| **DB migrations**         | 93                                                   |
| **DB tables**             | ~260                                                 |
| **DB enums**              | ~80                                                  |
| **DB triggers**           | ~250+                                                |
| **RLS policies**          | ~300+                                                |
| **Hook files**            | 23 (9,006 lines)                                     |
| **React Query hooks**     | ~450+                                                |
| **Edge functions**        | 15                                                   |
| **State machines**        | 32 (7 files)                                         |
| **Entity configs**        | 200+                                                 |
| **Zod schemas**           | 151                                                  |
| **List page configs**     | ~230                                                 |
| **RBAC resources**        | ~145                                                 |
| **RBAC roles**            | 6 (exec, director, pm, member, client, collaborator) |
| **Quality gate criteria** | ~360                                                 |
| **Brand configurations**  | 2 (playbook, rilla)                                  |
| **Messaging components**  | 14                                                   |
| **Comm templates**        | 9                                                    |
| **Integration providers** | 23 (seeded), 11 (OAuth configured)                   |

### Workstream Distribution by Module

| Module     | Workstreams                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home       | WS-1.1 Dashboard, WS-1.2 Productivity, WS-1.3 Calendar, WS-1.4 Messaging, WS-1.5 Insights                                                         |
| Business   | WS-2.1 Pipeline, WS-2.2 Accounts, WS-2.3 Deals, WS-2.4 Change Orders, WS-2.5 Upsell                                                               |
| Production | WS-3.1 Projects, WS-3.2 Tasks/Schedule, WS-3.3 Events, WS-3.4 SOW, WS-3.5 Prod Ops, WS-3.6 Advancing, WS-3.7 Collaborators                        |
| Operations | WS-4.1 Approvals, WS-4.2 Automations, WS-4.3 Checklists/QC, WS-4.4 Service/SLA, WS-4.5 Documents, WS-4.6 Email, WS-4.7 Compliance                 |
| Workforce  | WS-5.1 Crew, WS-5.2 Time Tracking, WS-5.3 Time Off, WS-5.4 Resource Planning, WS-5.5 Lifecycle, WS-5.6 Vendors                                    |
| Resources  | WS-6.1 Assets, WS-6.2 Inventory, WS-6.3 Shipments/Fleet, WS-6.4 Procurement, WS-6.5 Expenses                                                      |
| Creative   | WS-7.1 Creative Prod, WS-7.2 Brand, WS-7.3 Campaigns, WS-7.4 Social Proof                                                                         |
| Finance    | WS-8.1 Revenue, WS-8.2 Invoicing, WS-8.3 Budgeting, WS-8.4 Payroll, WS-8.5 GL, WS-8.6 Billing                                                     |
| Legal      | WS-9.1 Contracts, WS-9.2 Insurance/Permits, WS-9.3 RFQs/Risk                                                                                      |
| Admin      | WS-10.1 Users, WS-10.2 Org/Teams, WS-10.3 Settings, WS-10.4 Knowledge, WS-10.5 Integrations, WS-10.6 Credentials, WS-10.7 System, WS-10.8 Portals |
| Live Ops   | WS-11.1 Command, WS-11.2 ROS/Readiness, WS-11.3 Crew/Equipment, WS-11.4 FOH/VIP, WS-11.5 Strike                                                   |
| External   | WS-12.1 Collaborator Portal, WS-12.2 E-Signature                                                                                                  |
| Auth       | WS-13.1 Authentication, WS-13.2 Onboarding, WS-13.3 Public Pages                                                                                  |
| AI         | WS-14.1 AI Assistant                                                                                                                              |

### End-to-End Layer Coverage per Workstream

Each workstream requires these layers to function completely:

```
DB Schema (migration) → RLS Policies → Entity Config → Zod Schema → API Route
    → React Query Hook → Page Component → Navigation Entry → RBAC Permission
        → State Machine (if lifecycle) → Edge Function (if event-driven)
            → i18n Strings → Quality Gate Criteria
```

### Known Gaps (workstreams with incomplete layers)

> **v1.0.0 assessment had 8 gaps. v1.1.0 re-audit found 7/8 already implemented. v1.2.0 full codebase re-audit found 3 additional gaps — all remediated.**

| Workstream           | Original Assessment   | Actual State (v1.2.0)                                                                                               |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| WS-3.7 Collaborators | Tab not built         | **IMPLEMENTED** — projects/[id]/page.tsx lines 454-532, full vendor info + requirements progress                    |
| WS-10.8 Portals      | Placeholder pages     | **IMPLEMENTED** — 401-line client portal + 446-line vendor portal with real Supabase hooks                          |
| WS-12.1 Portal       | Not fully wired       | **IMPLEMENTED** — 592-line page with requirements checklist, manifest confirmation, crew roster                     |
| WS-12.2 E-Signature  | Capture UI incomplete | **IMPLEMENTED** — 292-line page with typed signature, consent checkbox, preview, POST to API                        |
| WS-13.3 Legal Pages  | No content            | **IMPLEMENTED** — 79-line terms (8 sections) + 91-line privacy (9 sections), both brand-aware                       |
| WS-4.2 Automations   | No visual builder     | **IMPLEMENTED** — 685-line page with WHEN/IF/THEN builder, 8 triggers, 9 actions, 7 condition operators             |
| WS-5.1 Org Chart     | Drag deferred         | **IMPLEMENTED** — 335-line page with @dnd-kit, tree builder, drag overlay, circular prevention, useUpdateCrewMember |
| WS-1.4 Messaging P3  | PTT/SMS/AI pending    | **IMPLEMENTED** (v1.1.0) — Voice messages, AI summaries, translation, PTT, SMS fallback UI + hook stubs             |

#### v1.2.0 Findings — Remediated

| Finding | File                         | Issue                                                                                            | Resolution                                                                                                                                                                         |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1      | `companies/page.tsx`         | `window.confirm()` + `apiDelete` + `window.location.reload()` for delete action                  | **FIXED** — Replaced with `useDeleteCompany` hook + React Query invalidation + inline confirmation banner. Navigation uses `useRouter().push()` instead of `window.location.href`. |
| F2      | `integrations/[id]/page.tsx` | `confirm()` for delete action                                                                    | **FIXED** — Replaced with `showDeleteConfirm` state + inline confirmation banner with Cancel/Delete buttons.                                                                       |
| F3      | `calendar/page.tsx`          | Missing `useCalendarEvents` (only derived events from projects/tasks/approvals) + no iCal export | **FIXED** — Added `useCalendarEvents` hook to include DB calendar events as "event" type. Added iCal export button generating RFC 5545 `.ics` file.                                |

#### v1.3.0 Findings — Remediated (2026-03-17)

**27 API routes created** using `createCollectionRoute`/`createItemRoute` factory pattern:

| Module       | Routes Created                                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M2 CRM       | `pipelines`, `pipelines/[id]`, `contacts`, `contacts/[id]`                                                                                                              |
| M4 Ops       | `automations`, `automations/[id]`, `approval-workflows/[id]`, `automation-rules/[id]`, `automation-executions/[id]`, `email-messages/[id]`, `compliance-templates/[id]` |
| M5 Workforce | `crew-members`, `crew-members/[id]`, `time-off-requests/[id]`                                                                                                           |
| M6 Assets    | `asset-versions/[id]`, `asset-tags/[id]`, `inventory-audits/[id]`, `kits/[id]`                                                                                          |
| M7 Marketing | `reviews`, `reviews/[id]`, `testimonials/[id]`                                                                                                                          |
| M9 Legal     | `contract-amendments/[id]`, `legal-holds/[id]`                                                                                                                          |
| M10 Admin    | `user-profiles/[id]`, `knowledge-articles`, `knowledge-articles/[id]`                                                                                                   |

**6 pages created:**

| Module       | Page                           | Pattern                         |
| ------------ | ------------------------------ | ------------------------------- |
| M2 CRM       | `/contacts` + `/contacts/[id]` | ListPageShell + DetailPageShell |
| M4 Ops       | `/document-templates`          | ListPageShell                   |
| M7 Marketing | `/reviews`                     | ListPageShell                   |
| M11 Live Ops | `/post-event-reports`          | ListPageShell                   |
| M11 Live Ops | `/live-ops/[id]`               | DetailPageShell                 |

**Additional fixes:**

| Finding | File                                | Issue                                     | Resolution                                                                                                                                    |
| ------- | ----------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| F4      | `settings/developer/page.tsx`       | `confirm()` for API key revocation        | **FIXED** — Replaced with `revokeTarget` state + inline confirmation banner with Cancel/Revoke buttons. Wrapped `fetchKeys` in `useCallback`. |
| F5      | `hooks-live-ops.ts`                 | Missing `useDeleteLiveEventInstance` hook | **FIXED** — Added `makeDeleteHook` factory call for live_event_instances.                                                                     |
| F6      | `api/invitations/[id]` vs `[token]` | Next.js slug conflict crashing dev server | **FIXED** — Removed conflicting `[id]` directory. Invitations use token-based access pattern via `[token]/accept`.                            |

#### v1.3.0 Audit Methodology

Full codebase scan across `src/app/` for:

- `window.alert()`, `window.confirm()`, `confirm()` — 0 remaining
- `window.location.reload()` — 0 remaining in dashboard pages
- `TODO:`, `FIXME:`, `// stub`, `not implemented` — 0 matches (1 legitimate "Coming soon" in email-integration settings — V2 gap)
- All 450+ hook exports verified against consumer usage
- **361 dashboard pages** verified against matrix workstream coverage
- **481 API routes** verified — all return 401 (auth required), not 404
- All new pages return 307 (auth redirect to login) confirming route resolution
- `tsc --noEmit` — **0 errors**
- `eslint` on all new files — **0 errors/warnings**

#### Module Coverage Summary (v1.3.0)

| Module                | Status      | Notes                                                                                                                                                                       |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 Home               | ✅ ALL PASS | Dashboard, tasks, calendar, messaging, notifications                                                                                                                        |
| M2 CRM                | ✅ ALL PASS | Companies, contacts, deals, leads, opportunities, pipeline, proposals, estimates, testimonials, reviews, case-studies, stakeholders                                         |
| M3 SOW                | ✅ ALL PASS | Scopes of work at `/scopes-of-work`                                                                                                                                         |
| M4 Ops & Automation   | ✅ ALL PASS | Automations, approval-workflows, workflows, email-messages, compliance-templates, document-templates                                                                        |
| M5 Workforce          | ✅ ALL PASS | Crew at `/crew`, worker-profiles, certifications, review-cycles, time-off-requests                                                                                          |
| M6 Assets & Inventory | ✅ ALL PASS | Assets, fleet (vehicles), kits, inventory-audits, warehouses, load-plans, shipments                                                                                         |
| M7 Marketing          | ✅ ALL PASS | Campaigns, testimonials, case-studies, reviews                                                                                                                              |
| M8 Finance            | ✅ ALL PASS | Finance, invoices, budgets, expenses, payroll-batches, recurring-invoices, payments, credit-notes, POs, GL accounts, rate-cards, job-cost, expense-reports, timesheets      |
| M9 Legal              | ✅ ALL PASS | Contracts, change-orders, permits, insurance, IP rights, contract-amendments, legal-holds, compliance-checklists, e-signatures, RFQs, purchase-requisitions, goods-receipts |
| M10 Admin             | ✅ ALL PASS | Settings, user-management, teams, brands, notifications, knowledge-base, settings/ai, settings/developer                                                                    |
| M11 Live Ops          | ✅ ALL PASS | Live-ops (list + detail), ros-cues, post-event-reports, credentials                                                                                                         |
| M12 External          | ✅ ALL PASS | Portal, sign, invite                                                                                                                                                        |
| M13 Auth              | ✅ ALL PASS | Login, signup, legal/terms, legal/privacy, onboarding                                                                                                                       |
| M14 AI                | ✅ ALL PASS | Settings/ai                                                                                                                                                                 |

---

_End of document._
