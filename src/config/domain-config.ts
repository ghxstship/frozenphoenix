/* ═══════════════════════════════════════════════════════════════
   DOMAIN CONFIGURATION — Single Source of Truth for Business Logic
   ═══════════════════════════════════════════════════════════════
   
   3NF Compliance:
   - Domain enums defined once with all metadata
   - No redundant label/variant definitions across pages
   - All pages reference this config
   ═══════════════════════════════════════════════════════════════ */

import type {
    AccessGrantStatus,
    ApiTokenStatus,
    AssetCondition,
    BomStatus,
    BomType,
    CertificationType,
    CommandLayer,
    CompliancePolicyType,
    DamageResolution,
    DamageSeverity,
    DealStage,
    DepartmentLiveStatus,
    EquipmentLiveStatus,
    FabricationStatus,
    FohZoneType,
    GuestIncidentSeverity,
    GuestIncidentType,
    InventoryAuditStatus,
    InvitationStatus,
    KitStatus,
    LiveEventPhase,
    LoadPlanStatus,
    LocationInspectionResult,
    LocationStatus,
    LocComplianceDocStatus,
    OnboardingStepStatus,
    OrgMembershipStatus,
    OtAlertLevel,
    PermissionLevel,
    ProductionRunStatus,
    ProjectPhase,
    ProjectStatus,
    QcGateStatus,
    QcGateType,
    ReadinessGateStatus,
    ReconciliationStatus,
    RentalAgreementStatus,
    RentalAgreementType,
    ReservationStatus,
    RightsLicenseStatus,
    RightsType,
    RiskLevel,
    RosCueStatus,
    SpaceBookingStatus,
    StakeholderType,
    StrikeDirection,
    TaskPriority,
    TaskStatus,
    UserLifecycleStatus,
    VipTier,
    WorkPackageStatus,
} from "@/types";
import type { BadgeVariant } from "./ui-variants";

// ─── Generic Config Interface ───
interface EnumConfig<T extends string> {
    value: T;
    label: string;
    variant: BadgeVariant;
    description?: string;
}

// ─── Deal Stages ───
export const DEAL_STAGES: EnumConfig<DealStage>[] = [
    { value: "lead", label: "Lead", variant: "ghost", description: "Initial contact" },
    {
        value: "qualified",
        label: "Qualified",
        variant: "info",
        description: "Budget and timeline confirmed",
    },
    { value: "proposal", label: "Proposal", variant: "default", description: "Proposal submitted" },
    {
        value: "negotiation",
        label: "Negotiation",
        variant: "warning",
        description: "Terms being finalized",
    },
    { value: "won", label: "Won", variant: "success", description: "Deal closed" },
    { value: "lost", label: "Lost", variant: "destructive", description: "Deal lost" },
];

export const DEAL_STAGE_MAP = Object.fromEntries(DEAL_STAGES.map((s) => [s.value, s])) as Record<
    DealStage,
    EnumConfig<DealStage>
>;

export const DEAL_STAGES_KANBAN: { id: DealStage; label: string; color: string }[] =
    DEAL_STAGES.map((stage) => ({
        id: stage.value,
        label: stage.label,
        color: `var(--color-${stage.variant === "default" ? "primary" : stage.variant})`,
    }));

// ─── Project Phases ───
export const PROJECT_PHASES: EnumConfig<ProjectPhase>[] = [
    { value: "pre_production", label: "Pre-Production", variant: "ghost" },
    { value: "fabrication", label: "Fabrication", variant: "info" },
    { value: "logistics", label: "Logistics", variant: "secondary" },
    { value: "load_in", label: "Load-In", variant: "warning" },
    { value: "show", label: "Show", variant: "success" },
    { value: "strike", label: "Strike", variant: "warning" },
    { value: "load_out", label: "Load-Out", variant: "ghost" },
];

export const PROJECT_PHASE_MAP = Object.fromEntries(
    PROJECT_PHASES.map((p) => [p.value, p])
) as Record<ProjectPhase, EnumConfig<ProjectPhase>>;

export const PROJECT_PHASE_ORDER: ProjectPhase[] = PROJECT_PHASES.map((p) => p.value);

// ─── Project Status ───
export const PROJECT_STATUSES: EnumConfig<ProjectStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "on_hold", label: "On Hold", variant: "warning" },
    { value: "completed", label: "Completed", variant: "info" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const PROJECT_STATUS_MAP = Object.fromEntries(
    PROJECT_STATUSES.map((s) => [s.value, s])
) as Record<ProjectStatus, EnumConfig<ProjectStatus>>;

// ─── Task Status ───
export const TASK_STATUSES: EnumConfig<TaskStatus>[] = [
    { value: "backlog", label: "Backlog", variant: "ghost" },
    { value: "todo", label: "To Do", variant: "secondary" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "review", label: "Review", variant: "warning" },
    { value: "done", label: "Done", variant: "success" },
    { value: "blocked", label: "Blocked", variant: "destructive" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "ghost" },
];

export const TASK_STATUS_MAP = Object.fromEntries(TASK_STATUSES.map((s) => [s.value, s])) as Record<
    TaskStatus,
    EnumConfig<TaskStatus>
>;

export const TASK_STATUS_ORDER: TaskStatus[] = TASK_STATUSES.map((s) => s.value);

// ─── Task Priority ───
export const TASK_PRIORITIES: EnumConfig<TaskPriority>[] = [
    { value: "critical", label: "Critical", variant: "destructive" },
    { value: "high", label: "High", variant: "warning" },
    { value: "medium", label: "Medium", variant: "info" },
    { value: "low", label: "Low", variant: "success" },
    { value: "urgent", label: "Urgent", variant: "destructive" },
];

export const TASK_PRIORITY_MAP = Object.fromEntries(
    TASK_PRIORITIES.map((p) => [p.value, p])
) as Record<TaskPriority, EnumConfig<TaskPriority>>;

// ─── Fabrication Status ───
export const FABRICATION_STATUSES: EnumConfig<FabricationStatus>[] = [
    { value: "not_started", label: "Not Started", variant: "ghost" },
    { value: "design", label: "Design", variant: "info" },
    { value: "cutting", label: "Cutting", variant: "secondary" },
    { value: "assembly", label: "Assembly", variant: "warning" },
    { value: "finishing", label: "Finishing", variant: "info" },
    { value: "complete", label: "Complete", variant: "success" },
];

export const FABRICATION_STATUS_MAP = Object.fromEntries(
    FABRICATION_STATUSES.map((s) => [s.value, s])
) as Record<FabricationStatus, EnumConfig<FabricationStatus>>;

// ─── Asset Condition ───
export const ASSET_CONDITIONS: EnumConfig<AssetCondition>[] = [
    { value: "new", label: "New", variant: "success" },
    { value: "excellent", label: "Excellent", variant: "success" },
    { value: "good", label: "Good", variant: "info" },
    { value: "fair", label: "Fair", variant: "warning" },
    { value: "needs_repair", label: "Needs Repair", variant: "destructive" },
    { value: "decommissioned", label: "Decommissioned", variant: "ghost" },
];

export const ASSET_CONDITION_MAP = Object.fromEntries(
    ASSET_CONDITIONS.map((c) => [c.value, c])
) as Record<AssetCondition, EnumConfig<AssetCondition>>;

// ─── Certification Types ───
export const CERTIFICATION_TYPES: EnumConfig<CertificationType>[] = [
    { value: "osha_10", label: "OSHA 10", variant: "info" },
    { value: "osha_30", label: "OSHA 30", variant: "info" },
    { value: "forklift", label: "Forklift", variant: "secondary" },
    { value: "rigging", label: "Rigging", variant: "warning" },
    { value: "electrical", label: "Electrical", variant: "destructive" },
    { value: "union_card", label: "Union Card", variant: "default" },
    { value: "first_aid", label: "First Aid", variant: "success" },
];

export const CERTIFICATION_TYPE_MAP = Object.fromEntries(
    CERTIFICATION_TYPES.map((c) => [c.value, c])
) as Record<CertificationType, EnumConfig<CertificationType>>;

// ─── Stakeholder Types ───
export const STAKEHOLDER_TYPES: EnumConfig<StakeholderType>[] = [
    { value: "internal", label: "Internal", variant: "default" },
    { value: "client", label: "Client", variant: "warning" },
    { value: "freelance", label: "Freelance", variant: "info" },
    { value: "subcontractor", label: "Subcontractor", variant: "secondary" },
];

export const STAKEHOLDER_TYPE_MAP = Object.fromEntries(
    STAKEHOLDER_TYPES.map((t) => [t.value, t])
) as Record<StakeholderType, EnumConfig<StakeholderType>>;

// ─── Permission Levels ───
export const PERMISSION_LEVELS: EnumConfig<PermissionLevel>[] = [
    { value: "exec", label: "Executive", variant: "default", description: "Full access" },
    {
        value: "director",
        label: "Director",
        variant: "info",
        description: "Cross-project oversight",
    },
    {
        value: "pm",
        label: "Project Manager",
        variant: "info",
        description: "Project-scoped access",
    },
    {
        value: "member",
        label: "Team Member",
        variant: "secondary",
        description: "Task execution access",
    },
    {
        value: "client",
        label: "Client",
        variant: "warning",
        description: "Approved deliverables only",
    },
    {
        value: "collaborator",
        label: "Collaborator",
        variant: "secondary",
        description: "External partner access",
    },
];

export const PERMISSION_LEVEL_MAP = Object.fromEntries(
    PERMISSION_LEVELS.map((p) => [p.value, p])
) as Record<PermissionLevel, EnumConfig<PermissionLevel>>;

// ─── Document Categories ───
export type DocumentCategory = "site_map" | "nda" | "contract" | "blueprint" | "permit" | "other";

export const DOCUMENT_CATEGORIES: EnumConfig<DocumentCategory>[] = [
    { value: "site_map", label: "Site Map", variant: "info" },
    { value: "nda", label: "NDA", variant: "warning" },
    { value: "contract", label: "Contract", variant: "default" },
    { value: "blueprint", label: "Blueprint", variant: "secondary" },
    { value: "permit", label: "Permit", variant: "success" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const DOCUMENT_CATEGORY_MAP = Object.fromEntries(
    DOCUMENT_CATEGORIES.map((c) => [c.value, c])
) as Record<DocumentCategory, EnumConfig<DocumentCategory>>;

// ─── Deck Types ───
export type DeckType = "pitch" | "progress" | "wrap";

export const DECK_TYPES: EnumConfig<DeckType>[] = [
    { value: "pitch", label: "Pitch Deck", variant: "default" },
    { value: "progress", label: "Progress Deck", variant: "info" },
    { value: "wrap", label: "Wrap Deck", variant: "success" },
];

export const DECK_TYPE_MAP = Object.fromEntries(DECK_TYPES.map((t) => [t.value, t])) as Record<
    DeckType,
    EnumConfig<DeckType>
>;

// ─── Notification Types ───
export type NotificationType = "info" | "warning" | "error" | "success";

export const NOTIFICATION_TYPES: EnumConfig<NotificationType>[] = [
    { value: "info", label: "Info", variant: "info" },
    { value: "warning", label: "Warning", variant: "warning" },
    { value: "error", label: "Error", variant: "destructive" },
    { value: "success", label: "Success", variant: "success" },
];

export const NOTIFICATION_TYPE_MAP = Object.fromEntries(
    NOTIFICATION_TYPES.map((t) => [t.value, t])
) as Record<NotificationType, EnumConfig<NotificationType>>;

// ─── Contract Status ───
export type ContractStatusType =
    | "draft"
    | "pending_review"
    | "pending_signature"
    | "active"
    | "expired"
    | "terminated"
    | "renewed";

export const CONTRACT_STATUSES: EnumConfig<ContractStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "pending_review", label: "Pending Review", variant: "warning" },
    { value: "pending_signature", label: "Pending Signature", variant: "info" },
    { value: "active", label: "Active", variant: "success" },
    { value: "expired", label: "Expired", variant: "destructive" },
    { value: "terminated", label: "Terminated", variant: "destructive" },
    { value: "renewed", label: "Renewed", variant: "default" },
];

export const CONTRACT_STATUS_MAP = Object.fromEntries(
    CONTRACT_STATUSES.map((s) => [s.value, s])
) as Record<ContractStatusType, EnumConfig<ContractStatusType>>;

// ─── Contract Types ───
export type ContractType = "vendor" | "client" | "nda" | "msa" | "sow" | "amendment";

export const CONTRACT_TYPES: EnumConfig<ContractType>[] = [
    { value: "vendor", label: "Vendor Agreement", variant: "secondary" },
    { value: "client", label: "Client Agreement", variant: "default" },
    { value: "nda", label: "NDA", variant: "warning" },
    { value: "msa", label: "MSA", variant: "info" },
    { value: "sow", label: "Statement of Work", variant: "info" },
    { value: "amendment", label: "Amendment", variant: "ghost" },
];

export const CONTRACT_TYPE_MAP = Object.fromEntries(
    CONTRACT_TYPES.map((t) => [t.value, t])
) as Record<ContractType, EnumConfig<ContractType>>;

// ─── Invoice Delivery Status ───
export type InvoiceDeliveryStatusType =
    | "draft"
    | "sent"
    | "viewed"
    | "reminded"
    | "paid"
    | "overdue"
    | "disputed"
    | "void";

export const INVOICE_DELIVERY_STATUSES: EnumConfig<InvoiceDeliveryStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "sent", label: "Sent", variant: "info" },
    { value: "viewed", label: "Viewed", variant: "secondary" },
    { value: "reminded", label: "Reminded", variant: "warning" },
    { value: "paid", label: "Paid", variant: "success" },
    { value: "overdue", label: "Overdue", variant: "destructive" },
    { value: "disputed", label: "Disputed", variant: "destructive" },
    { value: "void", label: "Void", variant: "ghost" },
];

export const INVOICE_DELIVERY_STATUS_MAP = Object.fromEntries(
    INVOICE_DELIVERY_STATUSES.map((s) => [s.value, s])
) as Record<InvoiceDeliveryStatusType, EnumConfig<InvoiceDeliveryStatusType>>;

// ─── Call Sheet Status ───
export type CallSheetStatusType =
    | "draft"
    | "published"
    | "distributed"
    | "acknowledged"
    | "archived";

export const CALL_SHEET_STATUSES: EnumConfig<CallSheetStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "published", label: "Published", variant: "info" },
    { value: "distributed", label: "Distributed", variant: "success" },
    { value: "acknowledged", label: "Acknowledged", variant: "success" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const CALL_SHEET_STATUS_MAP = Object.fromEntries(
    CALL_SHEET_STATUSES.map((s) => [s.value, s])
) as Record<CallSheetStatusType, EnumConfig<CallSheetStatusType>>;

// ─── Tech Sheet Status ───
export type TechSheetStatusType = "draft" | "reviewed" | "approved" | "distributed" | "archived";

export const TECH_SHEET_STATUSES: EnumConfig<TechSheetStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "reviewed", label: "Reviewed", variant: "info" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "distributed", label: "Distributed", variant: "success" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const TECH_SHEET_STATUS_MAP = Object.fromEntries(
    TECH_SHEET_STATUSES.map((s) => [s.value, s])
) as Record<TechSheetStatusType, EnumConfig<TechSheetStatusType>>;

// ─── Workflow Status ───
export type WorkflowStatusType = "draft" | "active" | "paused" | "archived";

export const WORKFLOW_STATUSES: EnumConfig<WorkflowStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "paused", label: "Paused", variant: "warning" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const WORKFLOW_STATUS_MAP = Object.fromEntries(
    WORKFLOW_STATUSES.map((s) => [s.value, s])
) as Record<WorkflowStatusType, EnumConfig<WorkflowStatusType>>;

// ─── Workflow Instance Status ───
export type WorkflowInstanceStatusType =
    | "pending"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "escalated";

export const WORKFLOW_INSTANCE_STATUSES: EnumConfig<WorkflowInstanceStatusType>[] = [
    { value: "pending", label: "Pending", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
    { value: "escalated", label: "Escalated", variant: "warning" },
];

export const WORKFLOW_INSTANCE_STATUS_MAP = Object.fromEntries(
    WORKFLOW_INSTANCE_STATUSES.map((s) => [s.value, s])
) as Record<WorkflowInstanceStatusType, EnumConfig<WorkflowInstanceStatusType>>;

// ─── Lifecycle Approval Stages ───
export type LifecycleStage =
    | "lead_qualified"
    | "qualified_proposal"
    | "proposal_sent"
    | "proposal_contract"
    | "contract_signed"
    | "contract_project"
    | "pre_production"
    | "fabrication_qc"
    | "procurement_po"
    | "logistics_shipping"
    | "load_in_site"
    | "show_ros"
    | "strike_completion"
    | "invoice_finance"
    | "payment_receipt"
    | "reconciliation_close";

export const LIFECYCLE_STAGES: EnumConfig<LifecycleStage>[] = [
    {
        value: "lead_qualified",
        label: "Lead → Qualified",
        variant: "ghost",
        description: "Sales Manager Review",
    },
    {
        value: "qualified_proposal",
        label: "Qualified → Proposal",
        variant: "ghost",
        description: "Scope/Budget Approval",
    },
    {
        value: "proposal_sent",
        label: "Proposal Sent",
        variant: "info",
        description: "Client Acceptance",
    },
    {
        value: "proposal_contract",
        label: "Proposal → Contract",
        variant: "info",
        description: "Legal Review",
    },
    {
        value: "contract_signed",
        label: "Contract Signed",
        variant: "info",
        description: "Finance Approval",
    },
    {
        value: "contract_project",
        label: "Contract → Project",
        variant: "default",
        description: "PM Assignment",
    },
    {
        value: "pre_production",
        label: "Pre-Production",
        variant: "secondary",
        description: "Creative Approval",
    },
    {
        value: "fabrication_qc",
        label: "Fabrication",
        variant: "warning",
        description: "QC Checkpoints",
    },
    {
        value: "procurement_po",
        label: "Procurement",
        variant: "warning",
        description: "PO Approval",
    },
    {
        value: "logistics_shipping",
        label: "Logistics",
        variant: "info",
        description: "Shipping Approval",
    },
    { value: "load_in_site", label: "Load-In", variant: "info", description: "Site Readiness" },
    { value: "show_ros", label: "Show", variant: "success", description: "Run-of-Show Approval" },
    {
        value: "strike_completion",
        label: "Strike",
        variant: "warning",
        description: "Completion Sign-off",
    },
    {
        value: "invoice_finance",
        label: "Invoice",
        variant: "default",
        description: "Finance Approval",
    },
    {
        value: "payment_receipt",
        label: "Payment",
        variant: "success",
        description: "Receipt Confirmation",
    },
    {
        value: "reconciliation_close",
        label: "Reconciliation",
        variant: "success",
        description: "Final Close-out",
    },
];

export const LIFECYCLE_STAGE_MAP = Object.fromEntries(
    LIFECYCLE_STAGES.map((s) => [s.value, s])
) as Record<LifecycleStage, EnumConfig<LifecycleStage>>;

// ─── Signature Status ───
export type SignatureStatusType = "pending" | "signed" | "declined" | "expired";

export const SIGNATURE_STATUSES: EnumConfig<SignatureStatusType>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "signed", label: "Signed", variant: "success" },
    { value: "declined", label: "Declined", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
];

export const SIGNATURE_STATUS_MAP = Object.fromEntries(
    SIGNATURE_STATUSES.map((s) => [s.value, s])
) as Record<SignatureStatusType, EnumConfig<SignatureStatusType>>;

// ─── Opportunity Stages ───
export type OpportunityStageType =
    | "discovery"
    | "qualification"
    | "proposal_sent"
    | "proposal_review"
    | "negotiation"
    | "contract_sent"
    | "won"
    | "lost"
    | "on_hold";

export const OPPORTUNITY_STAGES: EnumConfig<OpportunityStageType>[] = [
    {
        value: "discovery",
        label: "Discovery",
        variant: "ghost",
        description: "Initial needs assessment",
    },
    {
        value: "qualification",
        label: "Qualification",
        variant: "info",
        description: "Budget, authority, need, timeline confirmed",
    },
    {
        value: "proposal_sent",
        label: "Proposal Sent",
        variant: "default",
        description: "Formal proposal delivered",
    },
    {
        value: "proposal_review",
        label: "Proposal Review",
        variant: "secondary",
        description: "Client reviewing proposal",
    },
    {
        value: "negotiation",
        label: "Negotiation",
        variant: "warning",
        description: "Terms being finalized",
    },
    {
        value: "contract_sent",
        label: "Contract Sent",
        variant: "info",
        description: "Contract delivered for signature",
    },
    { value: "won", label: "Won", variant: "success", description: "Contract signed" },
    { value: "lost", label: "Lost", variant: "destructive", description: "Opportunity lost" },
    { value: "on_hold", label: "On Hold", variant: "ghost", description: "Temporarily paused" },
];

export const OPPORTUNITY_STAGE_MAP = Object.fromEntries(
    OPPORTUNITY_STAGES.map((s) => [s.value, s])
) as Record<OpportunityStageType, EnumConfig<OpportunityStageType>>;

export const OPPORTUNITY_STAGES_KANBAN: { id: string; label: string; color: string }[] =
    OPPORTUNITY_STAGES.map((stage) => ({
        id: stage.value,
        label: stage.label,
        color: `var(--color-${stage.variant === "default" ? "primary" : stage.variant})`,
    }));

// ─── Opportunity Types ───
export type OpportunityTypeConfig = "new_business" | "expansion" | "renewal" | "upsell";

export const OPPORTUNITY_TYPES: EnumConfig<OpportunityTypeConfig>[] = [
    { value: "new_business", label: "New Business", variant: "default" },
    { value: "expansion", label: "Expansion", variant: "info" },
    { value: "renewal", label: "Renewal", variant: "success" },
    { value: "upsell", label: "Upsell", variant: "warning" },
];

export const OPPORTUNITY_TYPE_MAP = Object.fromEntries(
    OPPORTUNITY_TYPES.map((t) => [t.value, t])
) as Record<OpportunityTypeConfig, EnumConfig<OpportunityTypeConfig>>;

// ─── Change Order Status ───
export type ChangeOrderStatusType =
    | "draft"
    | "pending_review"
    | "pending_client"
    | "approved"
    | "rejected"
    | "void";

export const CHANGE_ORDER_STATUSES: EnumConfig<ChangeOrderStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "pending_review", label: "Pending Review", variant: "warning" },
    { value: "pending_client", label: "Pending Client", variant: "info" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
    { value: "void", label: "Void", variant: "ghost" },
];

export const CHANGE_ORDER_STATUS_MAP = Object.fromEntries(
    CHANGE_ORDER_STATUSES.map((s) => [s.value, s])
) as Record<ChangeOrderStatusType, EnumConfig<ChangeOrderStatusType>>;

// ─── Change Order Types ───
export type ChangeOrderTypeConfig =
    | "scope_addition"
    | "scope_reduction"
    | "timeline_change"
    | "budget_adjustment"
    | "combined";

export const CHANGE_ORDER_TYPES: EnumConfig<ChangeOrderTypeConfig>[] = [
    { value: "scope_addition", label: "Scope Addition", variant: "info" },
    { value: "scope_reduction", label: "Scope Reduction", variant: "warning" },
    { value: "timeline_change", label: "Timeline Change", variant: "secondary" },
    { value: "budget_adjustment", label: "Budget Adjustment", variant: "default" },
    { value: "combined", label: "Combined", variant: "ghost" },
];

export const CHANGE_ORDER_TYPE_MAP = Object.fromEntries(
    CHANGE_ORDER_TYPES.map((t) => [t.value, t])
) as Record<ChangeOrderTypeConfig, EnumConfig<ChangeOrderTypeConfig>>;

// ─── Revenue Schedule Status ───
export type RevenueScheduleStatusType =
    | "scheduled"
    | "invoiced"
    | "recognized"
    | "deferred"
    | "reversed";

export const REVENUE_SCHEDULE_STATUSES: EnumConfig<RevenueScheduleStatusType>[] = [
    { value: "scheduled", label: "Scheduled", variant: "ghost" },
    { value: "invoiced", label: "Invoiced", variant: "info" },
    { value: "recognized", label: "Recognized", variant: "success" },
    { value: "deferred", label: "Deferred", variant: "warning" },
    { value: "reversed", label: "Reversed", variant: "destructive" },
];

export const REVENUE_SCHEDULE_STATUS_MAP = Object.fromEntries(
    REVENUE_SCHEDULE_STATUSES.map((s) => [s.value, s])
) as Record<RevenueScheduleStatusType, EnumConfig<RevenueScheduleStatusType>>;

// ─── Account Risk Levels ───
export type AccountRiskLevelType = "low" | "medium" | "high" | "critical";

export const ACCOUNT_RISK_LEVELS: EnumConfig<AccountRiskLevelType>[] = [
    { value: "low", label: "Low Risk", variant: "success" },
    { value: "medium", label: "Medium Risk", variant: "warning" },
    { value: "high", label: "High Risk", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const ACCOUNT_RISK_LEVEL_MAP = Object.fromEntries(
    ACCOUNT_RISK_LEVELS.map((r) => [r.value, r])
) as Record<AccountRiskLevelType, EnumConfig<AccountRiskLevelType>>;

// ─── Creative Brief Status ───
export type CreativeBriefStatusType =
    | "draft"
    | "stakeholder_review"
    | "strategy_approved"
    | "budget_approved"
    | "final_approved"
    | "active"
    | "completed"
    | "archived";

export const CREATIVE_BRIEF_STATUSES: EnumConfig<CreativeBriefStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "stakeholder_review", label: "Stakeholder Review", variant: "warning" },
    { value: "strategy_approved", label: "Strategy Approved", variant: "info" },
    { value: "budget_approved", label: "Budget Approved", variant: "info" },
    { value: "final_approved", label: "Final Approved", variant: "success" },
    { value: "active", label: "Active", variant: "success" },
    { value: "completed", label: "Completed", variant: "info" },
    { value: "archived", label: "Archived", variant: "ghost" },
];

export const CREATIVE_BRIEF_STATUS_MAP = Object.fromEntries(
    CREATIVE_BRIEF_STATUSES.map((s) => [s.value, s])
) as Record<CreativeBriefStatusType, EnumConfig<CreativeBriefStatusType>>;

// ─── Creative Brief Types ───
export type CreativeBriefTypeConfig =
    | "brand"
    | "campaign"
    | "product"
    | "event"
    | "social"
    | "content"
    | "experiential";

export const CREATIVE_BRIEF_TYPES: EnumConfig<CreativeBriefTypeConfig>[] = [
    { value: "brand", label: "Brand", variant: "default" },
    { value: "campaign", label: "Campaign", variant: "info" },
    { value: "product", label: "Product", variant: "secondary" },
    { value: "event", label: "Event", variant: "warning" },
    { value: "social", label: "Social", variant: "info" },
    { value: "content", label: "Content", variant: "ghost" },
    { value: "experiential", label: "Experiential", variant: "success" },
];

export const CREATIVE_BRIEF_TYPE_MAP = Object.fromEntries(
    CREATIVE_BRIEF_TYPES.map((t) => [t.value, t])
) as Record<CreativeBriefTypeConfig, EnumConfig<CreativeBriefTypeConfig>>;

// ─── Campaign Status ───
export type CampaignStatusType =
    | "planning"
    | "brief_approved"
    | "in_production"
    | "review"
    | "approved"
    | "launching"
    | "live"
    | "optimizing"
    | "completed"
    | "archived";

export const CAMPAIGN_STATUSES: EnumConfig<CampaignStatusType>[] = [
    { value: "planning", label: "Planning", variant: "ghost" },
    { value: "brief_approved", label: "Brief Approved", variant: "info" },
    { value: "in_production", label: "In Production", variant: "warning" },
    { value: "review", label: "Review", variant: "warning" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "launching", label: "Launching", variant: "info" },
    { value: "live", label: "Live", variant: "success" },
    { value: "optimizing", label: "Optimizing", variant: "info" },
    { value: "completed", label: "Completed", variant: "info" },
    { value: "archived", label: "Archived", variant: "ghost" },
];

export const CAMPAIGN_STATUS_MAP = Object.fromEntries(
    CAMPAIGN_STATUSES.map((s) => [s.value, s])
) as Record<CampaignStatusType, EnumConfig<CampaignStatusType>>;

// ─── Campaign Asset Production Status ───
export type CampaignAssetProductionStatusType =
    | "briefed"
    | "in_production"
    | "in_review"
    | "revision_requested"
    | "approved"
    | "deployed"
    | "retired";

export const CAMPAIGN_ASSET_PRODUCTION_STATUSES: EnumConfig<CampaignAssetProductionStatusType>[] = [
    { value: "briefed", label: "Briefed", variant: "ghost" },
    { value: "in_production", label: "In Production", variant: "warning" },
    { value: "in_review", label: "In Review", variant: "warning" },
    { value: "revision_requested", label: "Revision Requested", variant: "destructive" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "deployed", label: "Deployed", variant: "success" },
    { value: "retired", label: "Retired", variant: "ghost" },
];

export const CAMPAIGN_ASSET_PRODUCTION_STATUS_MAP = Object.fromEntries(
    CAMPAIGN_ASSET_PRODUCTION_STATUSES.map((s) => [s.value, s])
) as Record<CampaignAssetProductionStatusType, EnumConfig<CampaignAssetProductionStatusType>>;

// ─── Creative Review Status ───
export type CreativeReviewStatusType =
    | "requested"
    | "in_review"
    | "approved"
    | "revision_requested"
    | "rejected";

export const CREATIVE_REVIEW_STATUSES: EnumConfig<CreativeReviewStatusType>[] = [
    { value: "requested", label: "Requested", variant: "ghost" },
    { value: "in_review", label: "In Review", variant: "warning" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "revision_requested", label: "Revision Requested", variant: "destructive" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
];

export const CREATIVE_REVIEW_STATUS_MAP = Object.fromEntries(
    CREATIVE_REVIEW_STATUSES.map((s) => [s.value, s])
) as Record<CreativeReviewStatusType, EnumConfig<CreativeReviewStatusType>>;

// ─── Brand Guideline Status ───
export type BrandGuidelineStatusType = "draft" | "published" | "archived";

export const BRAND_GUIDELINE_STATUSES: EnumConfig<BrandGuidelineStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "published", label: "Published", variant: "success" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const BRAND_GUIDELINE_STATUS_MAP = Object.fromEntries(
    BRAND_GUIDELINE_STATUSES.map((s) => [s.value, s])
) as Record<BrandGuidelineStatusType, EnumConfig<BrandGuidelineStatusType>>;

// ─── User Lifecycle Status ───
export const USER_LIFECYCLE_STATUSES: EnumConfig<UserLifecycleStatus>[] = [
    {
        value: "pending_verification",
        label: "Pending Verification",
        variant: "warning",
        description: "Email not yet confirmed",
    },
    {
        value: "onboarding",
        label: "Onboarding",
        variant: "info",
        description: "First-time setup in progress",
    },
    { value: "active", label: "Active", variant: "success", description: "Full access" },
    {
        value: "suspended",
        label: "Suspended",
        variant: "destructive",
        description: "Access temporarily revoked",
    },
    {
        value: "deactivated",
        label: "Deactivated",
        variant: "ghost",
        description: "Account disabled",
    },
    {
        value: "pending_deletion",
        label: "Pending Deletion",
        variant: "destructive",
        description: "Deletion requested — retention period",
    },
    {
        value: "anonymized",
        label: "Anonymized",
        variant: "ghost",
        description: "PII removed — tombstone record",
    },
];

export const USER_LIFECYCLE_STATUS_MAP = Object.fromEntries(
    USER_LIFECYCLE_STATUSES.map((s) => [s.value, s])
) as Record<UserLifecycleStatus, EnumConfig<UserLifecycleStatus>>;

// ─── Org Membership Status ───
export const ORG_MEMBERSHIP_STATUSES: EnumConfig<OrgMembershipStatus>[] = [
    { value: "invited", label: "Invited", variant: "info" },
    { value: "active", label: "Active", variant: "success" },
    { value: "suspended", label: "Suspended", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const ORG_MEMBERSHIP_STATUS_MAP = Object.fromEntries(
    ORG_MEMBERSHIP_STATUSES.map((s) => [s.value, s])
) as Record<OrgMembershipStatus, EnumConfig<OrgMembershipStatus>>;

// ─── Invitation Status ───
export const INVITATION_STATUSES: EnumConfig<InvitationStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "accepted", label: "Accepted", variant: "success" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const INVITATION_STATUS_MAP = Object.fromEntries(
    INVITATION_STATUSES.map((s) => [s.value, s])
) as Record<InvitationStatus, EnumConfig<InvitationStatus>>;

// ─── Onboarding Step Status ───
export const ONBOARDING_STEP_STATUSES: EnumConfig<OnboardingStepStatus>[] = [
    { value: "not_started", label: "Not Started", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "skipped", label: "Skipped", variant: "secondary" },
];

export const ONBOARDING_STEP_STATUS_MAP = Object.fromEntries(
    ONBOARDING_STEP_STATUSES.map((s) => [s.value, s])
) as Record<OnboardingStepStatus, EnumConfig<OnboardingStepStatus>>;

// ─── API Token Status ───
export const API_TOKEN_STATUSES: EnumConfig<ApiTokenStatus>[] = [
    { value: "active", label: "Active", variant: "success" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const API_TOKEN_STATUS_MAP = Object.fromEntries(
    API_TOKEN_STATUSES.map((s) => [s.value, s])
) as Record<ApiTokenStatus, EnumConfig<ApiTokenStatus>>;

// ─── Access Grant Status ───
export const ACCESS_GRANT_STATUSES: EnumConfig<AccessGrantStatus>[] = [
    { value: "active", label: "Active", variant: "success" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const ACCESS_GRANT_STATUS_MAP = Object.fromEntries(
    ACCESS_GRANT_STATUSES.map((s) => [s.value, s])
) as Record<AccessGrantStatus, EnumConfig<AccessGrantStatus>>;

// ─── Compliance Policy Types ───
export const COMPLIANCE_POLICY_TYPES: EnumConfig<CompliancePolicyType>[] = [
    { value: "terms_of_service", label: "Terms of Service", variant: "default" },
    { value: "privacy_policy", label: "Privacy Policy", variant: "info" },
    { value: "acceptable_use", label: "Acceptable Use", variant: "secondary" },
    { value: "nda", label: "NDA", variant: "warning" },
    { value: "data_processing", label: "Data Processing", variant: "info" },
    { value: "cookie_policy", label: "Cookie Policy", variant: "ghost" },
    { value: "sop", label: "SOP", variant: "secondary" },
    { value: "custom", label: "Custom", variant: "ghost" },
];

export const COMPLIANCE_POLICY_TYPE_MAP = Object.fromEntries(
    COMPLIANCE_POLICY_TYPES.map((t) => [t.value, t])
) as Record<CompliancePolicyType, EnumConfig<CompliancePolicyType>>;

// ─── Live Event Phase ───
export const LIVE_EVENT_PHASES: EnumConfig<LiveEventPhase>[] = [
    { value: "advance", label: "Advance", variant: "ghost", description: "Pre-arrival site prep" },
    {
        value: "load_in",
        label: "Load-In",
        variant: "info",
        description: "Equipment & crew arrival",
    },
    { value: "setup", label: "Setup", variant: "info", description: "Installation & rigging" },
    {
        value: "rehearsal",
        label: "Rehearsal",
        variant: "warning",
        description: "Technical & dress rehearsals",
    },
    { value: "ready", label: "Ready", variant: "success", description: "All gates passed" },
    { value: "live", label: "Live", variant: "success", description: "Active show/event" },
    { value: "hold", label: "Hold", variant: "destructive", description: "Emergency pause" },
    { value: "strike", label: "Strike", variant: "warning", description: "Demobilization" },
    { value: "wrapped", label: "Wrapped", variant: "ghost", description: "Post-event closeout" },
];

export const LIVE_EVENT_PHASE_MAP = Object.fromEntries(
    LIVE_EVENT_PHASES.map((p) => [p.value, p])
) as Record<LiveEventPhase, EnumConfig<LiveEventPhase>>;

// ─── Command Layer ───
export const COMMAND_LAYERS: EnumConfig<CommandLayer>[] = [
    { value: "command", label: "Command", variant: "destructive" },
    { value: "tactical", label: "Tactical", variant: "warning" },
    { value: "operations", label: "Operations", variant: "info" },
];

export const COMMAND_LAYER_MAP = Object.fromEntries(
    COMMAND_LAYERS.map((l) => [l.value, l])
) as Record<CommandLayer, EnumConfig<CommandLayer>>;

// ─── Department Live Status ───
export const DEPARTMENT_LIVE_STATUSES: EnumConfig<DepartmentLiveStatus>[] = [
    { value: "not_checked_in", label: "Not Checked In", variant: "ghost" },
    { value: "setting_up", label: "Setting Up", variant: "info" },
    { value: "ready", label: "Ready", variant: "success" },
    { value: "active", label: "Active", variant: "success" },
    { value: "issue", label: "Issue", variant: "warning" },
    { value: "blocked", label: "Blocked", variant: "destructive" },
    { value: "striking", label: "Striking", variant: "warning" },
    { value: "wrapped", label: "Wrapped", variant: "ghost" },
];

export const DEPARTMENT_LIVE_STATUS_MAP = Object.fromEntries(
    DEPARTMENT_LIVE_STATUSES.map((s) => [s.value, s])
) as Record<DepartmentLiveStatus, EnumConfig<DepartmentLiveStatus>>;

// ─── Readiness Gate Status ───
export const READINESS_GATE_STATUSES: EnumConfig<ReadinessGateStatus>[] = [
    { value: "not_started", label: "Not Started", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "passed", label: "Passed", variant: "success" },
    { value: "failed", label: "Failed", variant: "destructive" },
    { value: "waived", label: "Waived", variant: "warning" },
];

export const READINESS_GATE_STATUS_MAP = Object.fromEntries(
    READINESS_GATE_STATUSES.map((s) => [s.value, s])
) as Record<ReadinessGateStatus, EnumConfig<ReadinessGateStatus>>;

// ─── ROS Cue Status ───
export const ROS_CUE_STATUSES: EnumConfig<RosCueStatus>[] = [
    { value: "pending", label: "Pending", variant: "ghost" },
    { value: "standby", label: "Standby", variant: "warning" },
    { value: "called", label: "Called", variant: "info" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "skipped", label: "Skipped", variant: "ghost" },
    { value: "held", label: "Held", variant: "destructive" },
];

export const ROS_CUE_STATUS_MAP = Object.fromEntries(
    ROS_CUE_STATUSES.map((s) => [s.value, s])
) as Record<RosCueStatus, EnumConfig<RosCueStatus>>;

// ─── Equipment Live Status ───
export const EQUIPMENT_LIVE_STATUSES: EnumConfig<EquipmentLiveStatus>[] = [
    { value: "checked_in", label: "Checked In", variant: "info" },
    { value: "deployed", label: "Deployed", variant: "success" },
    { value: "standby", label: "Standby", variant: "ghost" },
    { value: "issue_reported", label: "Issue Reported", variant: "warning" },
    { value: "failed", label: "Failed", variant: "destructive" },
    { value: "being_repaired", label: "Being Repaired", variant: "warning" },
    { value: "struck", label: "Struck", variant: "secondary" },
    { value: "loaded_out", label: "Loaded Out", variant: "ghost" },
];

export const EQUIPMENT_LIVE_STATUS_MAP = Object.fromEntries(
    EQUIPMENT_LIVE_STATUSES.map((s) => [s.value, s])
) as Record<EquipmentLiveStatus, EnumConfig<EquipmentLiveStatus>>;

// ─── FOH Zone Type ───
export const FOH_ZONE_TYPES: EnumConfig<FohZoneType>[] = [
    { value: "entry", label: "Entry", variant: "info" },
    { value: "general", label: "General Admission", variant: "default" },
    { value: "vip", label: "VIP", variant: "warning" },
    { value: "stage", label: "Stage", variant: "info" },
    { value: "fb", label: "F&B", variant: "secondary" },
    { value: "merch", label: "Merchandise", variant: "secondary" },
    { value: "amenity", label: "Amenity", variant: "ghost" },
    { value: "medical", label: "Medical", variant: "destructive" },
    { value: "parking", label: "Parking", variant: "ghost" },
    { value: "accessibility", label: "Accessibility", variant: "info" },
];

export const FOH_ZONE_TYPE_MAP = Object.fromEntries(
    FOH_ZONE_TYPES.map((t) => [t.value, t])
) as Record<FohZoneType, EnumConfig<FohZoneType>>;

// ─── VIP Tier ───
export const VIP_TIERS: EnumConfig<VipTier>[] = [
    { value: "bronze", label: "Bronze", variant: "ghost" },
    { value: "silver", label: "Silver", variant: "secondary" },
    { value: "gold", label: "Gold", variant: "warning" },
    { value: "platinum", label: "Platinum", variant: "info" },
];

export const VIP_TIER_MAP = Object.fromEntries(VIP_TIERS.map((t) => [t.value, t])) as Record<
    VipTier,
    EnumConfig<VipTier>
>;

// ─── Guest Incident Type ───
export const GUEST_INCIDENT_TYPES: EnumConfig<GuestIncidentType>[] = [
    { value: "complaint", label: "Complaint", variant: "warning" },
    { value: "injury", label: "Injury", variant: "destructive" },
    { value: "lost_item", label: "Lost Item", variant: "info" },
    { value: "accessibility", label: "Accessibility", variant: "info" },
    { value: "disturbance", label: "Disturbance", variant: "warning" },
    { value: "ejection", label: "Ejection", variant: "destructive" },
];

export const GUEST_INCIDENT_TYPE_MAP = Object.fromEntries(
    GUEST_INCIDENT_TYPES.map((t) => [t.value, t])
) as Record<GuestIncidentType, EnumConfig<GuestIncidentType>>;

// ─── Guest Incident Severity ───
export const GUEST_INCIDENT_SEVERITIES: EnumConfig<GuestIncidentSeverity>[] = [
    { value: "minor", label: "Minor", variant: "ghost" },
    { value: "moderate", label: "Moderate", variant: "warning" },
    { value: "major", label: "Major", variant: "destructive" },
];

export const GUEST_INCIDENT_SEVERITY_MAP = Object.fromEntries(
    GUEST_INCIDENT_SEVERITIES.map((s) => [s.value, s])
) as Record<GuestIncidentSeverity, EnumConfig<GuestIncidentSeverity>>;

// ─── Strike Direction ───
export const STRIKE_DIRECTIONS: EnumConfig<StrikeDirection>[] = [
    { value: "load_in", label: "Load-In", variant: "info" },
    { value: "strike", label: "Strike", variant: "warning" },
];

export const STRIKE_DIRECTION_MAP = Object.fromEntries(
    STRIKE_DIRECTIONS.map((d) => [d.value, d])
) as Record<StrikeDirection, EnumConfig<StrikeDirection>>;

// ─── Reconciliation Status ───
export const RECONCILIATION_STATUSES: EnumConfig<ReconciliationStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "reconciled", label: "Reconciled", variant: "success" },
    { value: "discrepancy", label: "Discrepancy", variant: "destructive" },
    { value: "write_off", label: "Write Off", variant: "ghost" },
];

export const RECONCILIATION_STATUS_MAP = Object.fromEntries(
    RECONCILIATION_STATUSES.map((s) => [s.value, s])
) as Record<ReconciliationStatus, EnumConfig<ReconciliationStatus>>;

// ─── Risk Level ───
export const RISK_LEVELS: EnumConfig<RiskLevel>[] = [
    { value: "low", label: "Low", variant: "success" },
    { value: "moderate", label: "Moderate", variant: "warning" },
    { value: "high", label: "High", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const RISK_LEVEL_MAP = Object.fromEntries(RISK_LEVELS.map((r) => [r.value, r])) as Record<
    RiskLevel,
    EnumConfig<RiskLevel>
>;

// ─── OT Alert Level ───
export const OT_ALERT_LEVELS: EnumConfig<OtAlertLevel>[] = [
    { value: "none", label: "None", variant: "ghost" },
    { value: "advisory", label: "Advisory", variant: "info" },
    { value: "warning", label: "Warning", variant: "warning" },
    { value: "alert", label: "Alert", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const OT_ALERT_LEVEL_MAP = Object.fromEntries(
    OT_ALERT_LEVELS.map((l) => [l.value, l])
) as Record<OtAlertLevel, EnumConfig<OtAlertLevel>>;

// ─── Location Status (Spatial Hierarchy) ───
export const LOCATION_STATUSES: EnumConfig<LocationStatus>[] = [
    { value: "prospecting", label: "Prospecting", variant: "ghost" },
    { value: "onboarding", label: "Onboarding", variant: "info" },
    { value: "active", label: "Active", variant: "success" },
    { value: "seasonal", label: "Seasonal", variant: "secondary" },
    { value: "maintenance", label: "Maintenance", variant: "warning" },
    { value: "reconfiguring", label: "Reconfiguring", variant: "info" },
    { value: "archived", label: "Archived", variant: "ghost" },
];

export const LOCATION_STATUS_MAP = Object.fromEntries(
    LOCATION_STATUSES.map((s) => [s.value, s])
) as Record<LocationStatus, EnumConfig<LocationStatus>>;

// ─── Space Booking Status ───
export const SPACE_BOOKING_STATUSES: EnumConfig<SpaceBookingStatus>[] = [
    { value: "tentative", label: "Tentative", variant: "warning" },
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const SPACE_BOOKING_STATUS_MAP = Object.fromEntries(
    SPACE_BOOKING_STATUSES.map((s) => [s.value, s])
) as Record<SpaceBookingStatus, EnumConfig<SpaceBookingStatus>>;

// ─── Location Compliance Doc Status ───
export const LOC_COMPLIANCE_DOC_STATUSES: EnumConfig<LocComplianceDocStatus>[] = [
    { value: "valid", label: "Valid", variant: "success" },
    { value: "expiring_soon", label: "Expiring Soon", variant: "warning" },
    { value: "expired", label: "Expired", variant: "destructive" },
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
];

export const LOC_COMPLIANCE_DOC_STATUS_MAP = Object.fromEntries(
    LOC_COMPLIANCE_DOC_STATUSES.map((s) => [s.value, s])
) as Record<LocComplianceDocStatus, EnumConfig<LocComplianceDocStatus>>;

// ─── Location Inspection Result ───
export const LOCATION_INSPECTION_RESULTS: EnumConfig<LocationInspectionResult>[] = [
    { value: "passed", label: "Passed", variant: "success" },
    { value: "failed", label: "Failed", variant: "destructive" },
    { value: "conditional", label: "Conditional", variant: "warning" },
    { value: "pending", label: "Pending", variant: "ghost" },
];

export const LOCATION_INSPECTION_RESULT_MAP = Object.fromEntries(
    LOCATION_INSPECTION_RESULTS.map((r) => [r.value, r])
) as Record<LocationInspectionResult, EnumConfig<LocationInspectionResult>>;

// ─── Reservation Status (Asset Logistics) ───
export const RESERVATION_STATUSES: EnumConfig<ReservationStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "checked_out", label: "Checked Out", variant: "info" },
    { value: "released", label: "Released", variant: "ghost" },
    { value: "expired", label: "Expired", variant: "destructive" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const RESERVATION_STATUS_MAP = Object.fromEntries(
    RESERVATION_STATUSES.map((s) => [s.value, s])
) as Record<ReservationStatus, EnumConfig<ReservationStatus>>;

// ─── Kit Status ───
export const KIT_STATUSES: EnumConfig<KitStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "deployed", label: "Deployed", variant: "info" },
    { value: "retired", label: "Retired", variant: "ghost" },
];

export const KIT_STATUS_MAP = Object.fromEntries(KIT_STATUSES.map((s) => [s.value, s])) as Record<
    KitStatus,
    EnumConfig<KitStatus>
>;

// ─── Load Plan Status ───
export const LOAD_PLAN_STATUSES: EnumConfig<LoadPlanStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "loading", label: "Loading", variant: "info" },
    { value: "loaded", label: "Loaded", variant: "success" },
    { value: "departed", label: "Departed", variant: "secondary" },
];

export const LOAD_PLAN_STATUS_MAP = Object.fromEntries(
    LOAD_PLAN_STATUSES.map((s) => [s.value, s])
) as Record<LoadPlanStatus, EnumConfig<LoadPlanStatus>>;

// ─── Inventory Audit Status ───
export const INVENTORY_AUDIT_STATUSES: EnumConfig<InventoryAuditStatus>[] = [
    { value: "planned", label: "Planned", variant: "secondary" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const INVENTORY_AUDIT_STATUS_MAP = Object.fromEntries(
    INVENTORY_AUDIT_STATUSES.map((s) => [s.value, s])
) as Record<InventoryAuditStatus, EnumConfig<InventoryAuditStatus>>;

// ─── Damage Severity ───
export const DAMAGE_SEVERITIES: EnumConfig<DamageSeverity>[] = [
    { value: "minor", label: "Minor", variant: "ghost" },
    { value: "moderate", label: "Moderate", variant: "warning" },
    { value: "major", label: "Major", variant: "destructive" },
    { value: "write_off", label: "Write Off", variant: "destructive" },
];

export const DAMAGE_SEVERITY_MAP = Object.fromEntries(
    DAMAGE_SEVERITIES.map((s) => [s.value, s])
) as Record<DamageSeverity, EnumConfig<DamageSeverity>>;

// ─── Damage Resolution ───
export const DAMAGE_RESOLUTIONS: EnumConfig<DamageResolution>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "repaired", label: "Repaired", variant: "success" },
    { value: "replaced", label: "Replaced", variant: "info" },
    { value: "written_off", label: "Written Off", variant: "ghost" },
    { value: "insurance_claim", label: "Insurance Claim", variant: "secondary" },
];

export const DAMAGE_RESOLUTION_MAP = Object.fromEntries(
    DAMAGE_RESOLUTIONS.map((r) => [r.value, r])
) as Record<DamageResolution, EnumConfig<DamageResolution>>;

// ─── Work Package Status (Production Lifecycle) ───
export const WORK_PACKAGE_STATUSES: EnumConfig<WorkPackageStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "planning", label: "Planning", variant: "info" },
    { value: "approved", label: "Approved", variant: "default" },
    { value: "in_progress", label: "In Progress", variant: "warning" },
    { value: "qc_review", label: "QC Review", variant: "secondary" },
    { value: "done", label: "Done", variant: "success" },
    { value: "rework", label: "Rework", variant: "destructive" },
    { value: "on_hold", label: "On Hold", variant: "warning" },
    { value: "cancelled", label: "Cancelled", variant: "ghost" },
];

export const WORK_PACKAGE_STATUS_MAP = Object.fromEntries(
    WORK_PACKAGE_STATUSES.map((s) => [s.value, s])
) as Record<WorkPackageStatus, EnumConfig<WorkPackageStatus>>;

// ─── Production Run Status ───
export const PRODUCTION_RUN_STATUSES: EnumConfig<ProductionRunStatus>[] = [
    { value: "setup", label: "Setup", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "warning" },
    { value: "qc_pending", label: "QC Pending", variant: "secondary" },
    { value: "passed", label: "Passed", variant: "success" },
    { value: "rework", label: "Rework", variant: "destructive" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "waste_logged", label: "Waste Logged", variant: "info" },
];

export const PRODUCTION_RUN_STATUS_MAP = Object.fromEntries(
    PRODUCTION_RUN_STATUSES.map((s) => [s.value, s])
) as Record<ProductionRunStatus, EnumConfig<ProductionRunStatus>>;

// ─── BOM Type ───
export const BOM_TYPES: EnumConfig<BomType>[] = [
    { value: "assembly", label: "Assembly", variant: "default" },
    { value: "recipe", label: "Recipe", variant: "info" },
    { value: "print_spec", label: "Print Spec", variant: "secondary" },
    { value: "media_package", label: "Media Package", variant: "info" },
    { value: "kit", label: "Kit", variant: "default" },
    { value: "bundle", label: "Bundle", variant: "ghost" },
];

export const BOM_TYPE_MAP = Object.fromEntries(BOM_TYPES.map((t) => [t.value, t])) as Record<
    BomType,
    EnumConfig<BomType>
>;

// ─── BOM Status ───
export const BOM_STATUSES: EnumConfig<BomStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "superseded", label: "Superseded", variant: "warning" },
    { value: "archived", label: "Archived", variant: "ghost" },
];

export const BOM_STATUS_MAP = Object.fromEntries(BOM_STATUSES.map((s) => [s.value, s])) as Record<
    BomStatus,
    EnumConfig<BomStatus>
>;

// ─── QC Gate Type ───
export const QC_GATE_TYPES: EnumConfig<QcGateType>[] = [
    { value: "design_review", label: "Design Review", variant: "info" },
    { value: "engineering_stamp", label: "Engineering Stamp", variant: "warning" },
    { value: "client_approval", label: "Client Approval", variant: "default" },
    { value: "brand_compliance", label: "Brand Compliance", variant: "info" },
    { value: "safety_inspection", label: "Safety Inspection", variant: "destructive" },
    { value: "health_inspection", label: "Health Inspection", variant: "destructive" },
    { value: "color_proof", label: "Color Proof", variant: "info" },
    { value: "sound_check", label: "Sound Check", variant: "info" },
    { value: "broadcast_standards", label: "Broadcast Standards", variant: "warning" },
    { value: "structural_inspection", label: "Structural Inspection", variant: "destructive" },
    { value: "fire_marshal", label: "Fire Marshal", variant: "destructive" },
    { value: "rights_clearance", label: "Rights Clearance", variant: "warning" },
    { value: "general_qc", label: "General QC", variant: "default" },
];

export const QC_GATE_TYPE_MAP = Object.fromEntries(
    QC_GATE_TYPES.map((t) => [t.value, t])
) as Record<QcGateType, EnumConfig<QcGateType>>;

// ─── QC Gate Status ───
export const QC_GATE_STATUSES: EnumConfig<QcGateStatus>[] = [
    { value: "pending", label: "Pending", variant: "ghost" },
    { value: "in_review", label: "In Review", variant: "info" },
    { value: "passed", label: "Passed", variant: "success" },
    { value: "conditional_pass", label: "Conditional Pass", variant: "warning" },
    { value: "rework", label: "Rework", variant: "destructive" },
    { value: "failed", label: "Failed", variant: "destructive" },
    { value: "waived", label: "Waived", variant: "ghost" },
];

export const QC_GATE_STATUS_MAP = Object.fromEntries(
    QC_GATE_STATUSES.map((s) => [s.value, s])
) as Record<QcGateStatus, EnumConfig<QcGateStatus>>;

// ─── Rights Type ───
export const RIGHTS_TYPES: EnumConfig<RightsType>[] = [
    { value: "music_sync", label: "Music Sync", variant: "info" },
    { value: "music_master", label: "Music Master", variant: "info" },
    { value: "music_performance", label: "Music Performance", variant: "info" },
    { value: "image_rights", label: "Image Rights", variant: "default" },
    { value: "talent_likeness", label: "Talent Likeness", variant: "default" },
    { value: "content_distribution", label: "Content Distribution", variant: "secondary" },
    { value: "software_license", label: "Software License", variant: "ghost" },
    { value: "font_license", label: "Font License", variant: "ghost" },
    { value: "stock_media", label: "Stock Media", variant: "ghost" },
    { value: "patent", label: "Patent", variant: "warning" },
    { value: "trademark", label: "Trademark", variant: "warning" },
];

export const RIGHTS_TYPE_MAP = Object.fromEntries(RIGHTS_TYPES.map((t) => [t.value, t])) as Record<
    RightsType,
    EnumConfig<RightsType>
>;

// ─── Rights License Status ───
export const RIGHTS_LICENSE_STATUSES: EnumConfig<RightsLicenseStatus>[] = [
    { value: "pending_clearance", label: "Pending Clearance", variant: "warning" },
    { value: "cleared", label: "Cleared", variant: "success" },
    { value: "denied", label: "Denied", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "renewal_needed", label: "Renewal Needed", variant: "warning" },
];

export const RIGHTS_LICENSE_STATUS_MAP = Object.fromEntries(
    RIGHTS_LICENSE_STATUSES.map((s) => [s.value, s])
) as Record<RightsLicenseStatus, EnumConfig<RightsLicenseStatus>>;

// ─── Rental Agreement Type ───
export const RENTAL_AGREEMENT_TYPES: EnumConfig<RentalAgreementType>[] = [
    { value: "rental", label: "Rental", variant: "info" },
    { value: "sale", label: "Sale", variant: "success" },
    { value: "rental_to_own", label: "Rental to Own", variant: "warning" },
    { value: "consignment", label: "Consignment", variant: "secondary" },
];

export const RENTAL_AGREEMENT_TYPE_MAP = Object.fromEntries(
    RENTAL_AGREEMENT_TYPES.map((t) => [t.value, t])
) as Record<RentalAgreementType, EnumConfig<RentalAgreementType>>;

// ─── Rental Agreement Status ───
export const RENTAL_AGREEMENT_STATUSES: EnumConfig<RentalAgreementStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "quoted", label: "Quoted", variant: "info" },
    { value: "confirmed", label: "Confirmed", variant: "default" },
    { value: "active", label: "Active", variant: "success" },
    { value: "returned", label: "Returned", variant: "info" },
    { value: "closed", label: "Closed", variant: "ghost" },
    { value: "disputed", label: "Disputed", variant: "destructive" },
];

export const RENTAL_AGREEMENT_STATUS_MAP = Object.fromEntries(
    RENTAL_AGREEMENT_STATUSES.map((s) => [s.value, s])
) as Record<RentalAgreementStatus, EnumConfig<RentalAgreementStatus>>;

// ─── Helper: Get Config by Value ───
export function getEnumConfig<T extends string>(
    map: Record<T, EnumConfig<T>>,
    value: T
): EnumConfig<T> {
    return map[value];
}
