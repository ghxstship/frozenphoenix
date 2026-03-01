# Frozen Phoenix — Migration Priority Matrix

> **Version:** 1.0.0 | **Total Enrichment Items:** 78 columns across 35 tables
> **Methodology:** Risk x Impact / Effort scoring (1-5 each)

---

## Priority Tiers

| Tier | Score | Timeline | Description |
|---|---|---|---|
| **P0** | >= 8 | Week 1-2 | Security, safety, or compliance blockers |
| **P1** | 4-7.9 | Week 3-4 | Business-critical gaps |
| **P2** | 2-3.9 | Week 5-8 | Enterprise features |
| **P3** | < 2 | Backlog | Nice-to-have |

---

## P0 — Critical

| # | Table | Change | Justification | Score |
|---|---|---|---|---|
| 1 | permission_grants | +expires_at, +granted_by | SOC2 CC6.1 temporal access + delegation audit | 25.0 |
| 2 | role_definitions | +inherits_from UUID FK | Permission inheritance chain | 20.0 |
| 3 | crew_members | +emergency_contact_name, +emergency_contact_phone | OSHA 1910.38 safety-critical | 20.0 |
| 4 | contacts | +gdpr_consent_at, +communication_opt_out | GDPR Art. 7 / CAN-SPAM | 20.0 |
| 5 | tasks | +safety_critical boolean | OSHA rigging/electrical/pyro flagging | 15.0 |
| 6 | live_events | +fire_marshal_capacity, +emergency_services_notified | Fire code + EMS life safety | 15.0 |
| 7 | vehicles | +last_inspection_date, +next_inspection_due | DOT 49 CFR annual inspection | 12.0 |
| 8 | certifications | +issuing_authority, +renewal_reminder_days | Certification source + proactive compliance | 12.0 |
| 9 | shipments | +hazmat_class | DOT HAZMAT (pyrotechnics, compressed gases) | 10.0 |
| 10 | environmental_readings | +wet_bulb_globe_temp | OSHA/NIOSH heat stress | 8.0 |

## P1 — High

| # | Table | Change | Justification | Score |
|---|---|---|---|---|
| 11 | budget_line_items | +gl_account_id FK, +cost_center, +committed_amount | GAAP cost coding + 3-bucket budgeting | 7.5 |
| 12 | purchase_orders | +po_number, +currency, +payment_terms, +approved_by | Procurement audit + SOX segregation | 6.0 |
| 13 | invoices | +invoice_number, +currency, +tax_amount | 3-way match + international VAT | 6.0 |
| 14 | projects | +timezone, +load_out_completed_at | Kill switch trigger + local scheduling | 6.0 |
| 15 | deals | +source_id FK, +lost_reason_id FK, +weighted_value, +currency | Pipeline attribution + forecasting | 5.0 |
| 16 | crew_members | +union_local, +union_classification | IATSE/Teamsters rate card compliance | 4.5 |
| 17 | shifts | +location_id FK, +break_minutes, +overtime_flag, +checked_in_at | FLSA compliance + variance tracking | 4.5 |
| 18 | stakeholders | +account_id FK, +contact_id FK | CRM deduplication bridge | 4.0 |
| 19 | goods_receipts | +warehouse_location_id FK | Inventory placement tracking | 4.0 |

## P2 — Medium

| # | Table | Change | Justification | Score |
|---|---|---|---|---|
| 20 | organizations | +tax_id, +billing_email, +default_currency, +fiscal_year_start_month | Billing + multi-currency + GAAP | 3.5 |
| 21 | user_profiles | +preferred_locale, +timezone, +emergency_contact_json | i18n + GDPR Art. 12 + OSHA | 3.0 |
| 22 | vendors | +tax_id, +payment_terms_default, +insurance_minimum, +diversity_classification, +preferred_vendor | 1099 + procurement optimization | 3.0 |
| 23 | crew_members | +i9_verified, +i9_verified_at, +w9_uploaded | USCIS + IRS contractor reporting | 3.0 |
| 24 | client_invoices | +asc_606_recognized_at, +retention_percent | ASC 606 revenue recognition | 3.0 |
| 25 | payroll_batches | +tax_withholding_total, +union_dues_total, +workers_comp_total | IRS + union deductions | 2.5 |
| 26 | case_studies | +industry_tags, +client_approved, +video_url, +testimonial_quote | Marketing content enrichment | 2.5 |
| 27 | digital_assets | +ai_generated, +model_release_on_file | FTC/EU AI Act + IP protection | 2.5 |
| 28 | locations | +ada_compliant, +ada_notes, +noise_ordinance_curfew | ADA Title III + noise compliance | 2.5 |
| 29 | contracts | +indemnification_clause, +jurisdiction | Liability + international ops | 2.0 |
| 30 | notification_preferences | +quiet_hours_start, +quiet_hours_end, +digest_frequency | UX improvement | 2.0 |

## P3 — Low (Backlog)

| # | Table | Change | Justification | Score |
|---|---|---|---|---|
| 31 | projects | +weather_contingency_plan, +insurance_policy_id, +sustainability_score, +post_mortem_score | Risk mitigation + ESG | 1.5 |
| 32 | campaigns | +geo_targeting, +a_b_test_config | Multi-market + testing | 1.5 |
| 33 | brand_kits | +brand_voice_guidelines, +do_not_use_notes, +approved_by | Brand consistency | 1.5 |
| 34 | technical_specs | +structural_engineer_signoff, +pe_stamp_document_url | ESTA E1.2 structural | 1.5 |
| 35 | vehicles | +vin, +odometer_reading, +insurance_policy_number | Fleet management | 1.5 |
| 36 | insurance_policies | +waiver_of_subrogation, +per_occurrence_limit | Underwriting detail | 1.0 |
| 37 | permits | +jurisdiction_contact_phone, +conditions_of_approval | Day-of regulatory | 1.0 |
| 38 | post_event_reports | +nps_score, +carbon_footprint_kg | Client satisfaction + ESG | 1.0 |
| 39 | location_contacts | +available_hours, +emergency_contact flag | Contact enrichment | 1.0 |
| 40 | invitations | +max_uses, +use_count | Bulk invite support | 1.0 |
| 41 | brands | +custom_domain | White-label vanity URLs | 1.0 |

---

## Migration Packaging Recommendation

### Migration 031: Safety & Compliance Enrichment (P0 items 1-10)
- 10 ALTER TABLE statements
- All safety-critical fields default to CORE tier
- Estimated: ~60 lines SQL

### Migration 032: Business Operations Enrichment (P1 items 11-19)
- 9 ALTER TABLE statements + FK additions
- New indexes for GL account lookups
- Estimated: ~80 lines SQL

### Migration 033: Enterprise Features Enrichment (P2 items 20-30)
- 11 ALTER TABLE statements
- PII fields require encryption setup
- Estimated: ~70 lines SQL

### Migration 034: RBAC + Pricing Architecture (Phase 3)
- New tables: field_type_registry, field_tier_assignments, field_bundles, etc.
- Covered in Phase 3 deliverables
- Estimated: ~300 lines SQL

---

## TypeScript Alignment Required

For each migration batch:
1. Regenerate `database.types.ts` via `supabase gen types typescript`
2. Update `src/types/index.ts` with new field interfaces
3. Add Zod schemas in `src/lib/validation/schemas.ts`
4. Update React Query hooks that touch modified tables
