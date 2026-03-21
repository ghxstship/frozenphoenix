/**
 * Consolidated join-aware return types for all Supabase hooks.
 * SSOT: All WithJoin types live here. Do NOT define these in hook files.
 */

import type { Tables } from "@/types/generated/database.types";

// ─── Generic Join Helper ──────────────────────────────────
export type WithJoin<T, J extends Record<string, unknown>> = T & J;

// ─── Reusable Join Fragments ──────────────────────────────
export type ProfileName = { user_profiles: { display_name: string } | null };
export type ProfileNameAvatar = {
    user_profiles: { display_name: string; avatar_url: string | null } | null;
};
export type ProjectName = { projects: { name: string } | null };
export type VendorName = { vendors: { name: string } | null };
export type LocationName = { locations: { name: string } | null };
export type EventName = { events: { name: string } | null };
export type ActivationName = { activations: { name: string } | null };
export type CompanyName = { companies: { name: string } | null };
export type ContactName = { contacts: { full_name: string } | null };
export type PipelineName = { pipelines: { name: string } | null };
export type AssetName = { assets: { name: string } | null };

// ═══════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════

export type ApprovalWithProfile = WithJoin<Tables<"approvals">, ProfileName>;
export type VaultDocumentWithProfile = WithJoin<Tables<"vault_documents">, ProfileName>;
export type ExpenseWithJoins = WithJoin<Tables<"expenses">, ProfileName & ProjectName>;
export type CommentWithProfile = WithJoin<Tables<"comments">, ProfileNameAvatar>;
export type ActivityLogWithProfile = WithJoin<Tables<"activity_log">, ProfileName>;
export type TimeEntryWithJoins = WithJoin<
    Tables<"time_entries">,
    ProjectName & { tasks: { title: string } | null; crew_members: { name: string } | null }
>;
export type CalendarEventWithProject = WithJoin<Tables<"calendar_events">, ProjectName>;
export type ShiftWithJoins = WithJoin<
    Tables<"shifts">,
    { crew_members: { name: string; role: string } | null } & ProjectName
>;
export type ProjectWithMembers = WithJoin<
    Tables<"projects">,
    { project_members: { profile_id: string }[] } & CompanyName
>;
export type ProjectDetailWithMembers = WithJoin<
    Tables<"projects">,
    {
        project_members: {
            profile_id: string;
            user_profiles: {
                display_name: string;
                email: string;
                avatar_url: string | null;
            } | null;
        }[];
    } & CompanyName
>;
export type TaskWithDeps = WithJoin<
    Tables<"tasks">,
    { task_dependencies: { depends_on_id: string }[] } & ProjectName
>;
export type ActivationWithLocation = WithJoin<Tables<"activations">, LocationName>;
export type EventWithJoins = WithJoin<Tables<"events">, LocationName & ActivationName>;
export type IncidentWithJoins = WithJoin<Tables<"incidents">, ProfileName & LocationName>;
export type BudgetWithLines = WithJoin<
    Tables<"budgets">,
    { production_budget_lines: Tables<"production_budget_lines">[] }
>;
export type MilestoneWithApprovals = WithJoin<
    Tables<"milestones">,
    { approvals: Tables<"approvals">[] | null }
>;

// ═══════════════════════════════════════════════════════════════
// CRM
// ═══════════════════════════════════════════════════════════════

export type StakeholderWithProjects = WithJoin<
    Tables<"stakeholders">,
    { stakeholder_projects: { project_id: string }[] }
>;
export type CaseStudyWithMetrics = WithJoin<
    Tables<"case_studies">,
    { case_study_metrics: Tables<"case_study_metrics">[] }
>;
export type CompanyWithManager = WithJoin<Tables<"companies">, ProfileName>;
export type ContactWithCompany = WithJoin<Tables<"contacts">, CompanyName>;
export type ProposalWithJoins = WithJoin<
    Tables<"proposals">,
    CompanyName & ContactName & { deals: { title: string } | null }
>;
export type DealWithPipeline = WithJoin<Tables<"deals">, PipelineName & CompanyName & ContactName>;

// ═══════════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════════

export type InvoiceWithJoins = WithJoin<
    Tables<"invoices">,
    VendorName & { purchase_orders: { total_amount: number } | null }
>;
export type PurchaseOrderWithJoins = WithJoin<
    Tables<"purchase_orders">,
    VendorName & { purchase_order_items: Tables<"purchase_order_items">[] }
>;
export type CreditNoteWithJoins = WithJoin<
    Tables<"credit_notes">,
    { client_invoices: { number: string } | null }
>;
export type PayrollBatchWithProfile = WithJoin<Tables<"payroll_batches">, ProfileName>;
export type PaymentWithInvoice = WithJoin<
    Tables<"payments">,
    { invoices: { amount: number; status: string } | null }
>;
export type RateCardWithCompany = WithJoin<Tables<"rate_cards">, CompanyName>;
export type RecurringInvoiceWithCompany = WithJoin<
    Tables<"recurring_invoices">,
    CompanyName & ProjectName
>;
export type ReportDefinitionWithProfile = WithJoin<Tables<"report_definitions">, ProfileName>;

// ═══════════════════════════════════════════════════════════════
// WORKFORCE
// ═══════════════════════════════════════════════════════════════

export type CrewMemberWithCerts = WithJoin<
    Tables<"crew_members">,
    { certifications: Tables<"certifications">[] }
>;
export type CrewShiftWithJoins = WithJoin<
    Tables<"crew_shifts">,
    { crew_members: { name: string; email: string; phone: string } | null } & LocationName &
        EventName
>;
export type CrewAvailabilityWithJoins = WithJoin<
    Tables<"crew_availability">,
    { crew_members: { name: string } | null } & ProjectName
>;
export type ResourceBookingWithJoins = WithJoin<
    Tables<"resource_bookings">,
    ProjectName & { crew_members: { name: string } | null }
>;
export type TimeOffRequestWithJoins = WithJoin<
    Tables<"time_off_requests">,
    { crew_members: { name: string } | null } & ProfileName
>;
export type UserCertification = Tables<"user_certifications">;

// ═══════════════════════════════════════════════════════════════
// PRODUCTION
// ═══════════════════════════════════════════════════════════════

export type ProductionTaskWithJoins = WithJoin<
    Tables<"production_tasks">,
    ProfileName & VendorName & LocationName
>;
export type ProductionMilestoneWithJoins = WithJoin<
    Tables<"production_milestones">,
    ProfileName & { approvals: Tables<"approvals">[] }
>;
export type ProductionExpenseWithJoins = WithJoin<
    Tables<"production_expenses">,
    ProjectName & VendorName & ProfileName & LocationName
>;
export type ProductionTimeEntryWithJoins = WithJoin<
    Tables<"production_time_entries">,
    ProfileName & ProjectName & { production_tasks: { title: string } | null }
>;
export type ProjectAssignmentWithJoins = WithJoin<
    Tables<"project_assignments">,
    { crew_members: { name: string } | null } & ProjectName
>;
export type ScheduleEntryWithJoins = WithJoin<
    Tables<"schedule_entries">,
    ProjectName & LocationName & ProfileName
>;
export type ProductionSOPWithProfile = WithJoin<Tables<"production_sops">, ProfileName>;
export type ProductionChecklistWithJoins = WithJoin<
    Tables<"production_checklists">,
    ProfileName & ProjectName & EventName
>;

export interface ScenarioWithProject {
    id: string;
    name: string;
    description: string | null;
    scenario_type: string;
    status: string;
    project_id: string | null;
    created_by: string | null;
    tags: string[] | null;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
    updated_at: string | null;
    projects: { name: string } | null;
}

// ═══════════════════════════════════════════════════════════════
// ASSETS & INVENTORY
// ═══════════════════════════════════════════════════════════════

export type ShipmentWithJoins = WithJoin<
    Tables<"shipments">,
    VendorName & { vehicles: { name: string } | null }
>;
export type AssetAssignmentWithJoins = WithJoin<
    Tables<"asset_assignments">,
    { assets: { name: string; barcode: string } | null } & ProjectName & ProfileName
>;
export type ConsumableWithJoins = WithJoin<Tables<"consumables">, ProjectName>;
export type ConsumableUsageWithJoins = WithJoin<
    Tables<"consumable_usage">,
    { consumables: { name: string } | null } & ProfileName
>;
export type MaintenanceRecordWithAsset = WithJoin<
    Tables<"maintenance_records">,
    AssetName & ProfileName
>;
export type WarehouseWithProfile = WithJoin<Tables<"warehouses">, ProfileName>;

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS & CREATIVE
// ═══════════════════════════════════════════════════════════════

export type DeckWithSlides = WithJoin<
    Tables<"decks">,
    { deck_slides: Tables<"deck_slides">[] } & ProjectName
>;
export type SOPWithAcknowledgments = WithJoin<
    Tables<"sops">,
    { sop_acknowledgments: { user_id: string }[] }
>;
export type KBArticleWithProfile = WithJoin<Tables<"knowledge_articles">, ProfileName>;
export type DocumentWithOwner = WithJoin<Tables<"documents">, ProfileName & ProjectName>;
export type DocumentTemplateRow = Tables<"document_templates">;
export type InvoiceTemplateRow = Tables<"invoice_templates">;

// ═══════════════════════════════════════════════════════════════
// LEGAL
// ═══════════════════════════════════════════════════════════════

export type ContractWithVendor = WithJoin<Tables<"contracts">, VendorName>;
export type RFQWithProfile = WithJoin<Tables<"rfqs">, ProfileName>;

// ═══════════════════════════════════════════════════════════════
// AUTOMATION & ADMIN
// ═══════════════════════════════════════════════════════════════

export type AutomationWithProject = WithJoin<Tables<"automations">, ProjectName>;
export type SavedViewWithOwner = WithJoin<Tables<"saved_views">, ProfileName>;
export type DashboardWithOwner = WithJoin<Tables<"dashboards">, ProfileName>;
export type CustomField = Tables<"custom_field_definitions">;
export type LostReasonRow = Tables<"lost_reasons">;
export type OrganizationRow = Tables<"organizations">;
export type ActivityRow = Tables<"activities">;
export type AutomationLogRow = Tables<"automation_executions">;
export type StakeholderProjectRow = Tables<"stakeholder_projects">;

export interface CustomFieldDefinitionRow {
    id: string;
    name: string;
    field_key: string;
    field_type: string;
    entity_types: string[];
    is_required: boolean | null;
    is_filterable: boolean | null;
    options: unknown;
    default_value: string | null;
    display_order: number | null;
    section: string | null;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    organization_id: string | null;
}
