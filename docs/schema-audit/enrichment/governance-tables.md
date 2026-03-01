# Schema Enrichment Report — Legal, Compliance & Governance Tables

> **Migration Sources:** 016, 022
> **Tables:** insurance_policies, permits, engineering_approvals, compliance_checklists, compliance_checklist_items, asset_certifications, budget_approvals, payment_approvals, entity_dependencies, governance_audit_logs, audit_findings, remediation_plans, remediation_tasks, control_assessments, evidence_artifacts

---

## insurance_policies (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | vendors/, projects/ |
| **Current Columns** | ~15 |
| **Compliance Score** | 90% |

### Assessment

Full insurance tracking with `insurance_type` enum (general_liability, workers_comp, auto, umbrella, professional_liability, cyber, pollution, event_cancellation), coverage amounts, certificate holder info, additional insured status, and expiry alerts. Critical for venue and vendor compliance.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `waiver_of_subrogation` | FT-BOOL-001 | BOOLEAN | Common venue/client requirement; affects liability allocation | pro |
| `per_occurrence_limit` | FT-FIN-001 | NUMERIC(12,2) | Per-occurrence vs aggregate distinction; underwriting requirement | pro |

---

## permits (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | projects/ (compliance) |
| **Current Columns** | ~15 |
| **Compliance Score** | 88% |

### Assessment

Multi-jurisdiction permit tracking with `permit_type` enum (building, fire, noise, road_closure, alcohol, food, fireworks, special_event, temporary_structure, electrical, plumbing, environmental, occupancy), issuing authority, fee tracking, and expiry management. Covers the regulatory landscape for live events.

### Columns to Add

| Column | SSOT Type ID | Type | Justification | RBAC Tier |
|---|---|---|---|---|
| `jurisdiction_contact_phone` | FT-PII-004 | TEXT | Direct contact for day-of regulatory issues | core |
| `conditions_of_approval` | FT-TEXT-002 | TEXT | Special conditions attached to permit (noise limits, hours, etc.) | core |

---

## engineering_approvals (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | projects/, approvals/ |
| **Current Columns** | ~12 |
| **Compliance Score** | 92% |

### Assessment

Professional engineer sign-offs for structural elements. Links to projects and technical specs. Includes PE license verification, stamp document URL, and load calculations. Aligns with ESTA E1.2 (Entertainment Technology — Design, Manufacture, and Use of Aluminum Trusses and Towers). No enrichment needed.

---

## compliance_checklists / compliance_checklist_items (Migration 016)

| Attribute | Value |
|---|---|
| **Migration** | 016 |
| **Route(s)** | projects/ (compliance) |
| **Compliance Score** | 90% |

### Assessment

Template-driven compliance checklists with `checklist_type` enum, item-level sign-off, evidence URLs, and due dates. Supports OSHA safety plans, ADA compliance, fire marshal inspections, and environmental compliance. Well-designed for pre-event safety documentation.

---

## audit_findings / remediation_plans / remediation_tasks (Migration 022)

| Attribute | Value |
|---|---|
| **Migration** | 022 |
| **Route(s)** | settings/ (compliance dashboard) |
| **Compliance Score** | 92% |

### Assessment

Full audit remediation lifecycle with `finding_severity` enum, `finding_status` enum, remediation plan tracking, task assignment, and evidence collection. Designed for SOC2/ISO 27001 audit management. Enterprise-grade. No enrichment needed.

---

## control_assessments / evidence_artifacts (Migration 022)

| Attribute | Value |
|---|---|
| **Migration** | 022 |
| **Route(s)** | settings/ (compliance) |
| **Compliance Score** | 92% |

### Assessment

Control effectiveness assessment with scoring, testing methodology, and evidence artifact management. Links to audit findings for traceability. SOC2 CC4.1 compliant. No enrichment needed.
