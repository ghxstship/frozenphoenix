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
    DocumentStatus,
    DocumentType,
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
import type { EnumConfig } from "./config-utils";
import { toEnumMap } from "./config-utils";

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

export const DEAL_STAGE_MAP = toEnumMap(DEAL_STAGES);

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

export const PROJECT_PHASE_MAP = toEnumMap(PROJECT_PHASES);

export const PROJECT_PHASE_ORDER: ProjectPhase[] = PROJECT_PHASES.map((p) => p.value);

// ─── Project Status ───
export const PROJECT_STATUSES: EnumConfig<ProjectStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "on_hold", label: "On Hold", variant: "warning" },
    { value: "completed", label: "Completed", variant: "info" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const PROJECT_STATUS_MAP = toEnumMap(PROJECT_STATUSES);

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

export const TASK_STATUS_MAP = toEnumMap(TASK_STATUSES);

export const TASK_STATUS_ORDER: TaskStatus[] = TASK_STATUSES.map((s) => s.value);

// ─── Task Priority ───
export const TASK_PRIORITIES: EnumConfig<TaskPriority>[] = [
    { value: "critical", label: "Critical", variant: "destructive" },
    { value: "high", label: "High", variant: "warning" },
    { value: "medium", label: "Medium", variant: "info" },
    { value: "low", label: "Low", variant: "success" },
    { value: "urgent", label: "Urgent", variant: "destructive" },
];

export const TASK_PRIORITY_MAP = toEnumMap(TASK_PRIORITIES);

// ─── Fabrication Status ───
export const FABRICATION_STATUSES: EnumConfig<FabricationStatus>[] = [
    { value: "not_started", label: "Not Started", variant: "ghost" },
    { value: "design", label: "Design", variant: "info" },
    { value: "cutting", label: "Cutting", variant: "secondary" },
    { value: "assembly", label: "Assembly", variant: "warning" },
    { value: "finishing", label: "Finishing", variant: "info" },
    { value: "complete", label: "Complete", variant: "success" },
];

export const FABRICATION_STATUS_MAP = toEnumMap(FABRICATION_STATUSES);

// ─── Document Type ───
export const DOCUMENT_TYPES: EnumConfig<DocumentType>[] = [
    { value: "doc", label: "Document", variant: "default" },
    { value: "wiki", label: "Wiki", variant: "info" },
    { value: "meeting_notes", label: "Meeting Notes", variant: "secondary" },
    { value: "specification", label: "Specification", variant: "ghost" },
    { value: "proposal_doc", label: "Proposal", variant: "warning" },
    { value: "sow", label: "Scope of Work", variant: "info" },
    { value: "template", label: "Template", variant: "ghost" },
];

export const DOCUMENT_TYPE_MAP = toEnumMap(DOCUMENT_TYPES);

// ─── Document Status ───
export const DOCUMENT_STATUSES: EnumConfig<DocumentStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "pending_review", label: "Pending Review", variant: "warning" },
    { value: "published", label: "Published", variant: "success" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const DOCUMENT_STATUS_MAP = toEnumMap(DOCUMENT_STATUSES);

// ─── Asset Condition ───
export const ASSET_CONDITIONS: EnumConfig<AssetCondition>[] = [
    { value: "new", label: "New", variant: "success" },
    { value: "excellent", label: "Excellent", variant: "success" },
    { value: "good", label: "Good", variant: "info" },
    { value: "fair", label: "Fair", variant: "warning" },
    { value: "needs_repair", label: "Needs Repair", variant: "destructive" },
    { value: "decommissioned", label: "Decommissioned", variant: "ghost" },
];

export const ASSET_CONDITION_MAP = toEnumMap(ASSET_CONDITIONS);

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

export const CERTIFICATION_TYPE_MAP = toEnumMap(CERTIFICATION_TYPES);

// ─── Stakeholder Types ───
export const STAKEHOLDER_TYPES: EnumConfig<StakeholderType>[] = [
    { value: "internal", label: "Internal", variant: "default" },
    { value: "client", label: "Client", variant: "warning" },
    { value: "freelance", label: "Freelance", variant: "info" },
    { value: "subcontractor", label: "Subcontractor", variant: "secondary" },
];

export const STAKEHOLDER_TYPE_MAP = toEnumMap(STAKEHOLDER_TYPES);

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

export const PERMISSION_LEVEL_MAP = toEnumMap(PERMISSION_LEVELS);

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

export const DOCUMENT_CATEGORY_MAP = toEnumMap(DOCUMENT_CATEGORIES);

// ─── Deck Types ───
export type DeckType = "pitch" | "progress" | "wrap";

export const DECK_TYPES: EnumConfig<DeckType>[] = [
    { value: "pitch", label: "Pitch Deck", variant: "default" },
    { value: "progress", label: "Progress Deck", variant: "info" },
    { value: "wrap", label: "Wrap Deck", variant: "success" },
];

export const DECK_TYPE_MAP = toEnumMap(DECK_TYPES);

// ─── Notification Types ───
export type NotificationType = "info" | "warning" | "error" | "success";

export const NOTIFICATION_TYPES: EnumConfig<NotificationType>[] = [
    { value: "info", label: "Info", variant: "info" },
    { value: "warning", label: "Warning", variant: "warning" },
    { value: "error", label: "Error", variant: "destructive" },
    { value: "success", label: "Success", variant: "success" },
];

export const NOTIFICATION_TYPE_MAP = toEnumMap(NOTIFICATION_TYPES);

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

export const CONTRACT_STATUS_MAP = toEnumMap(CONTRACT_STATUSES);

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

export const CONTRACT_TYPE_MAP = toEnumMap(CONTRACT_TYPES);

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

export const INVOICE_DELIVERY_STATUS_MAP = toEnumMap(INVOICE_DELIVERY_STATUSES);

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

export const CALL_SHEET_STATUS_MAP = toEnumMap(CALL_SHEET_STATUSES);

// ─── Tech Sheet Status ───
export type TechSheetStatusType = "draft" | "reviewed" | "approved" | "distributed" | "archived";

export const TECH_SHEET_STATUSES: EnumConfig<TechSheetStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "reviewed", label: "Reviewed", variant: "info" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "distributed", label: "Distributed", variant: "success" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const TECH_SHEET_STATUS_MAP = toEnumMap(TECH_SHEET_STATUSES);

// ─── Workflow Status ───
export type WorkflowStatusType = "draft" | "active" | "paused" | "archived";

export const WORKFLOW_STATUSES: EnumConfig<WorkflowStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "paused", label: "Paused", variant: "warning" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const WORKFLOW_STATUS_MAP = toEnumMap(WORKFLOW_STATUSES);

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

export const WORKFLOW_INSTANCE_STATUS_MAP = toEnumMap(WORKFLOW_INSTANCE_STATUSES);

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

export const LIFECYCLE_STAGE_MAP = toEnumMap(LIFECYCLE_STAGES);

// ─── Signature Status ───
export type SignatureStatusType = "pending" | "signed" | "declined" | "expired";

export const SIGNATURE_STATUSES: EnumConfig<SignatureStatusType>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "signed", label: "Signed", variant: "success" },
    { value: "declined", label: "Declined", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
];

export const SIGNATURE_STATUS_MAP = toEnumMap(SIGNATURE_STATUSES);

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

export const OPPORTUNITY_STAGE_MAP = toEnumMap(OPPORTUNITY_STAGES);

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

export const OPPORTUNITY_TYPE_MAP = toEnumMap(OPPORTUNITY_TYPES);

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

export const CHANGE_ORDER_STATUS_MAP = toEnumMap(CHANGE_ORDER_STATUSES);

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

export const CHANGE_ORDER_TYPE_MAP = toEnumMap(CHANGE_ORDER_TYPES);

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

export const REVENUE_SCHEDULE_STATUS_MAP = toEnumMap(REVENUE_SCHEDULE_STATUSES);

// ─── Account Risk Levels ───
export type AccountRiskLevelType = "low" | "medium" | "high" | "critical";

export const ACCOUNT_RISK_LEVELS: EnumConfig<AccountRiskLevelType>[] = [
    { value: "low", label: "Low Risk", variant: "success" },
    { value: "medium", label: "Medium Risk", variant: "warning" },
    { value: "high", label: "High Risk", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const ACCOUNT_RISK_LEVEL_MAP = toEnumMap(ACCOUNT_RISK_LEVELS);

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

export const CREATIVE_BRIEF_STATUS_MAP = toEnumMap(CREATIVE_BRIEF_STATUSES);

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

export const CREATIVE_BRIEF_TYPE_MAP = toEnumMap(CREATIVE_BRIEF_TYPES);

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

export const CAMPAIGN_STATUS_MAP = toEnumMap(CAMPAIGN_STATUSES);

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

export const CAMPAIGN_ASSET_PRODUCTION_STATUS_MAP = toEnumMap(CAMPAIGN_ASSET_PRODUCTION_STATUSES);

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

export const CREATIVE_REVIEW_STATUS_MAP = toEnumMap(CREATIVE_REVIEW_STATUSES);

// ─── Brand Guideline Status ───
export type BrandGuidelineStatusType = "draft" | "published" | "archived";

export const BRAND_GUIDELINE_STATUSES: EnumConfig<BrandGuidelineStatusType>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "published", label: "Published", variant: "success" },
    { value: "archived", label: "Archived", variant: "secondary" },
];

export const BRAND_GUIDELINE_STATUS_MAP = toEnumMap(BRAND_GUIDELINE_STATUSES);

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

export const USER_LIFECYCLE_STATUS_MAP = toEnumMap(USER_LIFECYCLE_STATUSES);

// ─── Org Membership Status ───
export const ORG_MEMBERSHIP_STATUSES: EnumConfig<OrgMembershipStatus>[] = [
    { value: "invited", label: "Invited", variant: "info" },
    { value: "active", label: "Active", variant: "success" },
    { value: "suspended", label: "Suspended", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const ORG_MEMBERSHIP_STATUS_MAP = toEnumMap(ORG_MEMBERSHIP_STATUSES);

// ─── Invitation Status ───
export const INVITATION_STATUSES: EnumConfig<InvitationStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "accepted", label: "Accepted", variant: "success" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const INVITATION_STATUS_MAP = toEnumMap(INVITATION_STATUSES);

// ─── Onboarding Step Status ───
export const ONBOARDING_STEP_STATUSES: EnumConfig<OnboardingStepStatus>[] = [
    { value: "not_started", label: "Not Started", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "skipped", label: "Skipped", variant: "secondary" },
];

export const ONBOARDING_STEP_STATUS_MAP = toEnumMap(ONBOARDING_STEP_STATUSES);

// ─── API Token Status ───
export const API_TOKEN_STATUSES: EnumConfig<ApiTokenStatus>[] = [
    { value: "active", label: "Active", variant: "success" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const API_TOKEN_STATUS_MAP = toEnumMap(API_TOKEN_STATUSES);

// ─── Access Grant Status ───
export const ACCESS_GRANT_STATUSES: EnumConfig<AccessGrantStatus>[] = [
    { value: "active", label: "Active", variant: "success" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "revoked", label: "Revoked", variant: "destructive" },
];

export const ACCESS_GRANT_STATUS_MAP = toEnumMap(ACCESS_GRANT_STATUSES);

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

export const COMPLIANCE_POLICY_TYPE_MAP = toEnumMap(COMPLIANCE_POLICY_TYPES);

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

export const LIVE_EVENT_PHASE_MAP = toEnumMap(LIVE_EVENT_PHASES);

// ─── Command Layer ───
export const COMMAND_LAYERS: EnumConfig<CommandLayer>[] = [
    { value: "command", label: "Command", variant: "destructive" },
    { value: "tactical", label: "Tactical", variant: "warning" },
    { value: "operations", label: "Operations", variant: "info" },
];

export const COMMAND_LAYER_MAP = toEnumMap(COMMAND_LAYERS);

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

export const DEPARTMENT_LIVE_STATUS_MAP = toEnumMap(DEPARTMENT_LIVE_STATUSES);

// ─── Readiness Gate Status ───
export const READINESS_GATE_STATUSES: EnumConfig<ReadinessGateStatus>[] = [
    { value: "not_started", label: "Not Started", variant: "ghost" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "passed", label: "Passed", variant: "success" },
    { value: "failed", label: "Failed", variant: "destructive" },
    { value: "waived", label: "Waived", variant: "warning" },
];

export const READINESS_GATE_STATUS_MAP = toEnumMap(READINESS_GATE_STATUSES);

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

export const ROS_CUE_STATUS_MAP = toEnumMap(ROS_CUE_STATUSES);

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

export const EQUIPMENT_LIVE_STATUS_MAP = toEnumMap(EQUIPMENT_LIVE_STATUSES);

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

export const FOH_ZONE_TYPE_MAP = toEnumMap(FOH_ZONE_TYPES);

// ─── VIP Tier ───
export const VIP_TIERS: EnumConfig<VipTier>[] = [
    { value: "bronze", label: "Bronze", variant: "ghost" },
    { value: "silver", label: "Silver", variant: "secondary" },
    { value: "gold", label: "Gold", variant: "warning" },
    { value: "platinum", label: "Platinum", variant: "info" },
];

export const VIP_TIER_MAP = toEnumMap(VIP_TIERS);

// ─── Guest Incident Type ───
export const GUEST_INCIDENT_TYPES: EnumConfig<GuestIncidentType>[] = [
    { value: "complaint", label: "Complaint", variant: "warning" },
    { value: "injury", label: "Injury", variant: "destructive" },
    { value: "lost_item", label: "Lost Item", variant: "info" },
    { value: "accessibility", label: "Accessibility", variant: "info" },
    { value: "disturbance", label: "Disturbance", variant: "warning" },
    { value: "ejection", label: "Ejection", variant: "destructive" },
];

export const GUEST_INCIDENT_TYPE_MAP = toEnumMap(GUEST_INCIDENT_TYPES);

// ─── Guest Incident Severity ───
export const GUEST_INCIDENT_SEVERITIES: EnumConfig<GuestIncidentSeverity>[] = [
    { value: "minor", label: "Minor", variant: "ghost" },
    { value: "moderate", label: "Moderate", variant: "warning" },
    { value: "major", label: "Major", variant: "destructive" },
];

export const GUEST_INCIDENT_SEVERITY_MAP = toEnumMap(GUEST_INCIDENT_SEVERITIES);

// ─── Strike Direction ───
export const STRIKE_DIRECTIONS: EnumConfig<StrikeDirection>[] = [
    { value: "load_in", label: "Load-In", variant: "info" },
    { value: "strike", label: "Strike", variant: "warning" },
];

export const STRIKE_DIRECTION_MAP = toEnumMap(STRIKE_DIRECTIONS);

// ─── Reconciliation Status ───
export const RECONCILIATION_STATUSES: EnumConfig<ReconciliationStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "reconciled", label: "Reconciled", variant: "success" },
    { value: "discrepancy", label: "Discrepancy", variant: "destructive" },
    { value: "write_off", label: "Write Off", variant: "ghost" },
];

export const RECONCILIATION_STATUS_MAP = toEnumMap(RECONCILIATION_STATUSES);

// ─── Risk Level ───
export const RISK_LEVELS: EnumConfig<RiskLevel>[] = [
    { value: "low", label: "Low", variant: "success" },
    { value: "moderate", label: "Moderate", variant: "warning" },
    { value: "high", label: "High", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const RISK_LEVEL_MAP = toEnumMap(RISK_LEVELS);

// ─── OT Alert Level ───
export const OT_ALERT_LEVELS: EnumConfig<OtAlertLevel>[] = [
    { value: "none", label: "None", variant: "ghost" },
    { value: "advisory", label: "Advisory", variant: "info" },
    { value: "warning", label: "Warning", variant: "warning" },
    { value: "alert", label: "Alert", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const OT_ALERT_LEVEL_MAP = toEnumMap(OT_ALERT_LEVELS);

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

export const LOCATION_STATUS_MAP = toEnumMap(LOCATION_STATUSES);

// ─── Space Booking Status ───
export const SPACE_BOOKING_STATUSES: EnumConfig<SpaceBookingStatus>[] = [
    { value: "tentative", label: "Tentative", variant: "warning" },
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const SPACE_BOOKING_STATUS_MAP = toEnumMap(SPACE_BOOKING_STATUSES);

// ─── Location Compliance Doc Status ───
export const LOC_COMPLIANCE_DOC_STATUSES: EnumConfig<LocComplianceDocStatus>[] = [
    { value: "valid", label: "Valid", variant: "success" },
    { value: "expiring_soon", label: "Expiring Soon", variant: "warning" },
    { value: "expired", label: "Expired", variant: "destructive" },
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
];

export const LOC_COMPLIANCE_DOC_STATUS_MAP = toEnumMap(LOC_COMPLIANCE_DOC_STATUSES);

// ─── Location Inspection Result ───
export const LOCATION_INSPECTION_RESULTS: EnumConfig<LocationInspectionResult>[] = [
    { value: "passed", label: "Passed", variant: "success" },
    { value: "failed", label: "Failed", variant: "destructive" },
    { value: "conditional", label: "Conditional", variant: "warning" },
    { value: "pending", label: "Pending", variant: "ghost" },
];

export const LOCATION_INSPECTION_RESULT_MAP = toEnumMap(LOCATION_INSPECTION_RESULTS);

// ─── Reservation Status (Asset Logistics) ───
export const RESERVATION_STATUSES: EnumConfig<ReservationStatus>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "checked_out", label: "Checked Out", variant: "info" },
    { value: "released", label: "Released", variant: "ghost" },
    { value: "expired", label: "Expired", variant: "destructive" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const RESERVATION_STATUS_MAP = toEnumMap(RESERVATION_STATUSES);

// ─── Kit Status ───
export const KIT_STATUSES: EnumConfig<KitStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "deployed", label: "Deployed", variant: "info" },
    { value: "retired", label: "Retired", variant: "ghost" },
];

export const KIT_STATUS_MAP = toEnumMap(KIT_STATUSES);

// ─── Load Plan Status ───
export const LOAD_PLAN_STATUSES: EnumConfig<LoadPlanStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "confirmed", label: "Confirmed", variant: "success" },
    { value: "loading", label: "Loading", variant: "info" },
    { value: "loaded", label: "Loaded", variant: "success" },
    { value: "departed", label: "Departed", variant: "secondary" },
];

export const LOAD_PLAN_STATUS_MAP = toEnumMap(LOAD_PLAN_STATUSES);

// ─── Inventory Audit Status ───
export const INVENTORY_AUDIT_STATUSES: EnumConfig<InventoryAuditStatus>[] = [
    { value: "planned", label: "Planned", variant: "secondary" },
    { value: "in_progress", label: "In Progress", variant: "info" },
    { value: "completed", label: "Completed", variant: "success" },
    { value: "cancelled", label: "Cancelled", variant: "destructive" },
];

export const INVENTORY_AUDIT_STATUS_MAP = toEnumMap(INVENTORY_AUDIT_STATUSES);

// ─── Damage Severity ───
export const DAMAGE_SEVERITIES: EnumConfig<DamageSeverity>[] = [
    { value: "minor", label: "Minor", variant: "ghost" },
    { value: "moderate", label: "Moderate", variant: "warning" },
    { value: "major", label: "Major", variant: "destructive" },
    { value: "write_off", label: "Write Off", variant: "destructive" },
];

export const DAMAGE_SEVERITY_MAP = toEnumMap(DAMAGE_SEVERITIES);

// ─── Damage Resolution ───
export const DAMAGE_RESOLUTIONS: EnumConfig<DamageResolution>[] = [
    { value: "pending", label: "Pending", variant: "warning" },
    { value: "repaired", label: "Repaired", variant: "success" },
    { value: "replaced", label: "Replaced", variant: "info" },
    { value: "written_off", label: "Written Off", variant: "ghost" },
    { value: "insurance_claim", label: "Insurance Claim", variant: "secondary" },
];

export const DAMAGE_RESOLUTION_MAP = toEnumMap(DAMAGE_RESOLUTIONS);

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

export const WORK_PACKAGE_STATUS_MAP = toEnumMap(WORK_PACKAGE_STATUSES);

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

export const PRODUCTION_RUN_STATUS_MAP = toEnumMap(PRODUCTION_RUN_STATUSES);

// ─── BOM Type ───
export const BOM_TYPES: EnumConfig<BomType>[] = [
    { value: "assembly", label: "Assembly", variant: "default" },
    { value: "recipe", label: "Recipe", variant: "info" },
    { value: "print_spec", label: "Print Spec", variant: "secondary" },
    { value: "media_package", label: "Media Package", variant: "info" },
    { value: "kit", label: "Kit", variant: "default" },
    { value: "bundle", label: "Bundle", variant: "ghost" },
];

export const BOM_TYPE_MAP = toEnumMap(BOM_TYPES);

// ─── BOM Status ───
export const BOM_STATUSES: EnumConfig<BomStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "active", label: "Active", variant: "success" },
    { value: "superseded", label: "Superseded", variant: "warning" },
    { value: "archived", label: "Archived", variant: "ghost" },
];

export const BOM_STATUS_MAP = toEnumMap(BOM_STATUSES);

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

export const QC_GATE_TYPE_MAP = toEnumMap(QC_GATE_TYPES);

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

export const QC_GATE_STATUS_MAP = toEnumMap(QC_GATE_STATUSES);

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

export const RIGHTS_TYPE_MAP = toEnumMap(RIGHTS_TYPES);

// ─── Rights License Status ───
export const RIGHTS_LICENSE_STATUSES: EnumConfig<RightsLicenseStatus>[] = [
    { value: "pending_clearance", label: "Pending Clearance", variant: "warning" },
    { value: "cleared", label: "Cleared", variant: "success" },
    { value: "denied", label: "Denied", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
    { value: "renewal_needed", label: "Renewal Needed", variant: "warning" },
];

export const RIGHTS_LICENSE_STATUS_MAP = toEnumMap(RIGHTS_LICENSE_STATUSES);

// ─── Rental Agreement Type ───
export const RENTAL_AGREEMENT_TYPES: EnumConfig<RentalAgreementType>[] = [
    { value: "rental", label: "Rental", variant: "info" },
    { value: "sale", label: "Sale", variant: "success" },
    { value: "rental_to_own", label: "Rental to Own", variant: "warning" },
    { value: "consignment", label: "Consignment", variant: "secondary" },
];

export const RENTAL_AGREEMENT_TYPE_MAP = toEnumMap(RENTAL_AGREEMENT_TYPES);

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

export const RENTAL_AGREEMENT_STATUS_MAP = toEnumMap(RENTAL_AGREEMENT_STATUSES);

// ─── Activation Types ───
export type ActivationType = "experiential" | "digital" | "sampling" | "sponsorship" | "retail";

export const ACTIVATION_TYPES: EnumConfig<ActivationType>[] = [
    { value: "experiential", label: "Experiential", variant: "success" },
    { value: "digital", label: "Digital", variant: "info" },
    { value: "sampling", label: "Sampling", variant: "secondary" },
    { value: "sponsorship", label: "Sponsorship", variant: "warning" },
    { value: "retail", label: "Retail", variant: "default" },
];

export const ACTIVATION_TYPE_MAP = toEnumMap(ACTIVATION_TYPES);

// ─── Advance Types ───
export type AdvanceType = "purchase" | "rental" | "service" | "labor" | "other";

export const ADVANCE_TYPES: EnumConfig<AdvanceType>[] = [
    { value: "purchase", label: "Purchase", variant: "default" },
    { value: "rental", label: "Rental", variant: "info" },
    { value: "service", label: "Service", variant: "secondary" },
    { value: "labor", label: "Labor", variant: "warning" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const ADVANCE_TYPE_MAP = toEnumMap(ADVANCE_TYPES);

// ─── Asset Categories ───
export type AssetCategory =
    | "av"
    | "staging"
    | "lighting"
    | "signage"
    | "furniture"
    | "power"
    | "rigging"
    | "other";

export const ASSET_CATEGORIES: EnumConfig<AssetCategory>[] = [
    { value: "av", label: "AV Equipment", variant: "info" },
    { value: "staging", label: "Staging", variant: "default" },
    { value: "lighting", label: "Lighting", variant: "warning" },
    { value: "signage", label: "Signage", variant: "secondary" },
    { value: "furniture", label: "Furniture", variant: "ghost" },
    { value: "power", label: "Power / Electrical", variant: "destructive" },
    { value: "rigging", label: "Rigging", variant: "warning" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const ASSET_CATEGORY_MAP = toEnumMap(ASSET_CATEGORIES);

// ─── Brand Guideline Categories ───
export type BrandGuidelineCategory =
    | "visual_identity"
    | "typography"
    | "color"
    | "tone_of_voice"
    | "photography"
    | "other";

export const BRAND_GUIDELINE_CATEGORIES: EnumConfig<BrandGuidelineCategory>[] = [
    { value: "visual_identity", label: "Visual Identity", variant: "default" },
    { value: "typography", label: "Typography", variant: "info" },
    { value: "color", label: "Color", variant: "secondary" },
    { value: "tone_of_voice", label: "Tone of Voice", variant: "warning" },
    { value: "photography", label: "Photography", variant: "info" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const BRAND_GUIDELINE_CATEGORY_MAP = toEnumMap(BRAND_GUIDELINE_CATEGORIES);

// ─── Budget Line Item Categories ───
export type BudgetLineCategory =
    | "labor"
    | "materials"
    | "equipment"
    | "rentals"
    | "travel"
    | "shipping"
    | "permits"
    | "contingency"
    | "overhead";

export const BUDGET_LINE_CATEGORIES: EnumConfig<BudgetLineCategory>[] = [
    { value: "labor", label: "Labor", variant: "default" },
    { value: "materials", label: "Materials", variant: "info" },
    { value: "equipment", label: "Equipment", variant: "secondary" },
    { value: "rentals", label: "Rentals", variant: "warning" },
    { value: "travel", label: "Travel", variant: "info" },
    { value: "shipping", label: "Shipping", variant: "secondary" },
    { value: "permits", label: "Permits", variant: "warning" },
    { value: "contingency", label: "Contingency", variant: "ghost" },
    { value: "overhead", label: "Overhead", variant: "ghost" },
];

export const BUDGET_LINE_CATEGORY_MAP = toEnumMap(BUDGET_LINE_CATEGORIES);

// ─── Budget Status ───
export type BudgetStatus = "draft" | "pending_approval" | "approved" | "active" | "closed";

export const BUDGET_STATUSES: EnumConfig<BudgetStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "pending_approval", label: "Pending Approval", variant: "warning" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "active", label: "Active", variant: "success" },
    { value: "closed", label: "Closed", variant: "ghost" },
];

export const BUDGET_STATUS_MAP = toEnumMap(BUDGET_STATUSES);

// ─── Checklist Types ───
export type ChecklistType = "custom" | "safety" | "quality" | "setup" | "teardown";

export const CHECKLIST_TYPES: EnumConfig<ChecklistType>[] = [
    { value: "custom", label: "Custom", variant: "ghost" },
    { value: "safety", label: "Safety", variant: "destructive" },
    { value: "quality", label: "Quality", variant: "info" },
    { value: "setup", label: "Setup", variant: "warning" },
    { value: "teardown", label: "Teardown", variant: "secondary" },
];

export const CHECKLIST_TYPE_MAP = toEnumMap(CHECKLIST_TYPES);

// ─── Clause Party ───
export type ClauseParty = "client" | "vendor" | "company" | "both";

export const CLAUSE_PARTIES: EnumConfig<ClauseParty>[] = [
    { value: "client", label: "Client", variant: "default" },
    { value: "vendor", label: "Vendor", variant: "info" },
    { value: "company", label: "Company", variant: "secondary" },
    { value: "both", label: "Both Parties", variant: "warning" },
];

export const CLAUSE_PARTY_MAP = toEnumMap(CLAUSE_PARTIES);

// ─── Company Types ───
export type CompanyType = "client" | "brand" | "agency" | "vendor" | "partner";

export const COMPANY_TYPES: EnumConfig<CompanyType>[] = [
    { value: "client", label: "Client", variant: "default" },
    { value: "brand", label: "Brand", variant: "info" },
    { value: "agency", label: "Agency", variant: "secondary" },
    { value: "vendor", label: "Vendor", variant: "warning" },
    { value: "partner", label: "Partner", variant: "success" },
];

export const COMPANY_TYPE_MAP = toEnumMap(COMPANY_TYPES);

// ─── Creative Brief Types (Form) ───
export type CreativeBriefFormType = "creative" | "production" | "marketing" | "event" | "social";

export const CREATIVE_BRIEF_FORM_TYPES: EnumConfig<CreativeBriefFormType>[] = [
    { value: "creative", label: "Creative", variant: "default" },
    { value: "production", label: "Production", variant: "info" },
    { value: "marketing", label: "Marketing", variant: "secondary" },
    { value: "event", label: "Event", variant: "warning" },
    { value: "social", label: "Social", variant: "info" },
];

export const CREATIVE_BRIEF_FORM_TYPE_MAP = toEnumMap(CREATIVE_BRIEF_FORM_TYPES);

// ─── Digital Asset Classes ───
export type DigitalAssetClass = "image" | "video" | "audio" | "document";

export const DIGITAL_ASSET_CLASSES: EnumConfig<DigitalAssetClass>[] = [
    { value: "image", label: "Image", variant: "info" },
    { value: "video", label: "Video", variant: "warning" },
    { value: "audio", label: "Audio", variant: "secondary" },
    { value: "document", label: "Document", variant: "default" },
];

export const DIGITAL_ASSET_CLASS_MAP = toEnumMap(DIGITAL_ASSET_CLASSES);

// ─── Email Provider ───
export type EmailProvider = "google" | "microsoft" | "imap";

export const EMAIL_PROVIDERS: EnumConfig<EmailProvider>[] = [
    { value: "google", label: "Google Workspace", variant: "default" },
    { value: "microsoft", label: "Microsoft 365", variant: "info" },
    { value: "imap", label: "IMAP / Other", variant: "ghost" },
];

export const EMAIL_PROVIDER_MAP = toEnumMap(EMAIL_PROVIDERS);

// ─── Engineering Approval Entity Types ───
export type EngineeringEntityType = "activation" | "location" | "asset" | "event";

export const ENGINEERING_ENTITY_TYPES: EnumConfig<EngineeringEntityType>[] = [
    { value: "activation", label: "Activation", variant: "success" },
    { value: "location", label: "Location", variant: "info" },
    { value: "asset", label: "Asset", variant: "secondary" },
    { value: "event", label: "Event", variant: "warning" },
];

export const ENGINEERING_ENTITY_TYPE_MAP = toEnumMap(ENGINEERING_ENTITY_TYPES);

// ─── Estimate Status ───
export type EstimateStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export const ESTIMATE_STATUSES: EnumConfig<EstimateStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "sent", label: "Sent", variant: "info" },
    { value: "accepted", label: "Accepted", variant: "success" },
    { value: "rejected", label: "Rejected", variant: "destructive" },
    { value: "expired", label: "Expired", variant: "ghost" },
];

export const ESTIMATE_STATUS_MAP = toEnumMap(ESTIMATE_STATUSES);

// ─── Expense Categories ───
export type ExpenseCategory =
    | "travel"
    | "materials"
    | "equipment"
    | "meals"
    | "transportation"
    | "lodging"
    | "other";

export const EXPENSE_CATEGORIES: EnumConfig<ExpenseCategory>[] = [
    { value: "travel", label: "Travel", variant: "info" },
    { value: "materials", label: "Materials", variant: "default" },
    { value: "equipment", label: "Equipment", variant: "secondary" },
    { value: "meals", label: "Meals", variant: "ghost" },
    { value: "transportation", label: "Transportation", variant: "info" },
    { value: "lodging", label: "Lodging", variant: "warning" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const EXPENSE_CATEGORY_MAP = toEnumMap(EXPENSE_CATEGORIES);

// ─── Goal Types ───
export type GoalType = "individual" | "team" | "company" | "project";

export const GOAL_TYPES: EnumConfig<GoalType>[] = [
    { value: "individual", label: "Individual", variant: "default" },
    { value: "team", label: "Team", variant: "info" },
    { value: "company", label: "Company", variant: "warning" },
    { value: "project", label: "Project", variant: "secondary" },
];

export const GOAL_TYPE_MAP = toEnumMap(GOAL_TYPES);

// ─── Incident Severity ───
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export const INCIDENT_SEVERITIES: EnumConfig<IncidentSeverity>[] = [
    { value: "low", label: "Low", variant: "ghost" },
    { value: "medium", label: "Medium", variant: "warning" },
    { value: "high", label: "High", variant: "destructive" },
    { value: "critical", label: "Critical", variant: "destructive" },
];

export const INCIDENT_SEVERITY_MAP = toEnumMap(INCIDENT_SEVERITIES);

// ─── Integration Types ───
export type IntegrationType =
    | "eventbrite"
    | "square"
    | "front_gate"
    | "intellitix"
    | "custom"
    | "quickbooks"
    | "xero"
    | "stripe"
    | "slack"
    | "google_calendar"
    | "google_drive"
    | "dropbox"
    | "zapier"
    | "hubspot"
    | "docusign"
    | "twilio"
    | "sendgrid"
    | "deputy"
    | "gusto"
    | "asana"
    | "monday"
    | "jira"
    | "salesforce"
    | "microsoft_teams";

export const INTEGRATION_TYPES: EnumConfig<IntegrationType>[] = [
    { value: "eventbrite", label: "Eventbrite", variant: "default" },
    { value: "square", label: "Square", variant: "default" },
    { value: "front_gate", label: "Front Gate Tickets", variant: "default" },
    { value: "intellitix", label: "Intellitix", variant: "default" },
    { value: "custom", label: "Custom", variant: "ghost" },
    { value: "quickbooks", label: "QuickBooks", variant: "info" },
    { value: "xero", label: "Xero", variant: "info" },
    { value: "stripe", label: "Stripe", variant: "info" },
    { value: "slack", label: "Slack", variant: "secondary" },
    { value: "microsoft_teams", label: "Microsoft Teams", variant: "secondary" },
    { value: "google_calendar", label: "Google Calendar", variant: "info" },
    { value: "google_drive", label: "Google Drive", variant: "info" },
    { value: "dropbox", label: "Dropbox", variant: "info" },
    { value: "hubspot", label: "HubSpot", variant: "info" },
    { value: "salesforce", label: "Salesforce", variant: "info" },
    { value: "docusign", label: "DocuSign", variant: "info" },
    { value: "asana", label: "Asana", variant: "secondary" },
    { value: "monday", label: "Monday.com", variant: "secondary" },
    { value: "jira", label: "Jira", variant: "secondary" },
    { value: "deputy", label: "Deputy", variant: "secondary" },
    { value: "gusto", label: "Gusto", variant: "secondary" },
    { value: "twilio", label: "Twilio", variant: "warning" },
    { value: "sendgrid", label: "SendGrid", variant: "warning" },
    { value: "zapier", label: "Zapier", variant: "warning" },
];

export const INTEGRATION_TYPE_MAP = toEnumMap(INTEGRATION_TYPES);

// ─── Invoice Status ───
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export const INVOICE_STATUSES: EnumConfig<InvoiceStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "sent", label: "Sent", variant: "info" },
    { value: "paid", label: "Paid", variant: "success" },
    { value: "overdue", label: "Overdue", variant: "destructive" },
    { value: "void", label: "Void", variant: "ghost" },
];

export const INVOICE_STATUS_MAP = toEnumMap(INVOICE_STATUSES);

// ─── KB Article Categories ───
export type KbArticleCategory = "sop" | "checklist" | "template" | "guide" | "policy" | "training";

export const KB_ARTICLE_CATEGORIES: EnumConfig<KbArticleCategory>[] = [
    { value: "sop", label: "SOP", variant: "secondary" },
    { value: "checklist", label: "Checklist", variant: "info" },
    { value: "template", label: "Template", variant: "ghost" },
    { value: "guide", label: "Guide", variant: "default" },
    { value: "policy", label: "Policy", variant: "warning" },
    { value: "training", label: "Training", variant: "success" },
];

export const KB_ARTICLE_CATEGORY_MAP = toEnumMap(KB_ARTICLE_CATEGORIES);

// ─── Lead Sources ───
export type LeadSource = "website" | "referral" | "cold_outreach" | "event" | "social" | "other";

export const LEAD_SOURCES: EnumConfig<LeadSource>[] = [
    { value: "website", label: "Website", variant: "info" },
    { value: "referral", label: "Referral", variant: "success" },
    { value: "cold_outreach", label: "Cold Outreach", variant: "ghost" },
    { value: "event", label: "Event", variant: "warning" },
    { value: "social", label: "Social Media", variant: "info" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const LEAD_SOURCE_MAP = toEnumMap(LEAD_SOURCES);

// ─── Opportunity Stages (Form) ───
export type OpportunityFormStage =
    | "qualification"
    | "discovery"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";

export const OPPORTUNITY_FORM_STAGES: EnumConfig<OpportunityFormStage>[] = [
    { value: "qualification", label: "Qualification", variant: "info" },
    { value: "discovery", label: "Discovery", variant: "ghost" },
    { value: "proposal", label: "Proposal", variant: "default" },
    { value: "negotiation", label: "Negotiation", variant: "warning" },
    { value: "closed_won", label: "Closed Won", variant: "success" },
    { value: "closed_lost", label: "Closed Lost", variant: "destructive" },
];

export const OPPORTUNITY_FORM_STAGE_MAP = toEnumMap(OPPORTUNITY_FORM_STAGES);

// ─── Project Member Roles ───
export type ProjectMemberRole = "member" | "lead" | "reviewer" | "contributor";

export const PROJECT_MEMBER_ROLES: EnumConfig<ProjectMemberRole>[] = [
    { value: "member", label: "Member", variant: "default" },
    { value: "lead", label: "Lead", variant: "success" },
    { value: "reviewer", label: "Reviewer", variant: "info" },
    { value: "contributor", label: "Contributor", variant: "secondary" },
];

export const PROJECT_MEMBER_ROLE_MAP = toEnumMap(PROJECT_MEMBER_ROLES);

// ─── Project Template Categories ───
export type ProjectTemplateCategory =
    | "festival"
    | "corporate"
    | "brand_activation"
    | "touring"
    | "broadcast"
    | "other";

export const PROJECT_TEMPLATE_CATEGORIES: EnumConfig<ProjectTemplateCategory>[] = [
    { value: "festival", label: "Festival", variant: "success" },
    { value: "corporate", label: "Corporate", variant: "default" },
    { value: "brand_activation", label: "Brand Activation", variant: "info" },
    { value: "touring", label: "Touring", variant: "warning" },
    { value: "broadcast", label: "Broadcast", variant: "secondary" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const PROJECT_TEMPLATE_CATEGORY_MAP = toEnumMap(PROJECT_TEMPLATE_CATEGORIES);

// ─── Purchase Order Status ───
export type PurchaseOrderStatus = "draft" | "issued" | "received" | "closed";

export const PURCHASE_ORDER_STATUSES: EnumConfig<PurchaseOrderStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "issued", label: "Issued", variant: "info" },
    { value: "received", label: "Received", variant: "success" },
    { value: "closed", label: "Closed", variant: "ghost" },
];

export const PURCHASE_ORDER_STATUS_MAP = toEnumMap(PURCHASE_ORDER_STATUSES);

// ─── Purchase Requisition Status ───
export type PurchaseRequisitionStatus = "draft" | "submitted" | "approved" | "ordered" | "received";

export const PURCHASE_REQUISITION_STATUSES: EnumConfig<PurchaseRequisitionStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "submitted", label: "Submitted", variant: "info" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "ordered", label: "Ordered", variant: "info" },
    { value: "received", label: "Received", variant: "success" },
];

export const PURCHASE_REQUISITION_STATUS_MAP = toEnumMap(PURCHASE_REQUISITION_STATUSES);

// ─── Quality Check Entity Types ───
export type QualityCheckEntityType = "asset" | "shipment" | "activation" | "warehouse";

export const QUALITY_CHECK_ENTITY_TYPES: EnumConfig<QualityCheckEntityType>[] = [
    { value: "asset", label: "Asset", variant: "secondary" },
    { value: "shipment", label: "Shipment", variant: "info" },
    { value: "activation", label: "Activation", variant: "success" },
    { value: "warehouse", label: "Warehouse", variant: "default" },
];

export const QUALITY_CHECK_ENTITY_TYPE_MAP = toEnumMap(QUALITY_CHECK_ENTITY_TYPES);

// ─── Saved View Types ───
export type SavedViewType = "table" | "board" | "list" | "calendar" | "timeline" | "gantt";

export const SAVED_VIEW_TYPES: EnumConfig<SavedViewType>[] = [
    { value: "table", label: "Table", variant: "default" },
    { value: "board", label: "Board", variant: "info" },
    { value: "list", label: "List", variant: "ghost" },
    { value: "calendar", label: "Calendar", variant: "secondary" },
    { value: "timeline", label: "Timeline", variant: "warning" },
    { value: "gantt", label: "Gantt", variant: "info" },
];

export const SAVED_VIEW_TYPE_MAP = toEnumMap(SAVED_VIEW_TYPES);

// ─── Scenario Types ───
export type ScenarioType = "combined" | "budget" | "resource" | "timeline";

export const SCENARIO_TYPES: EnumConfig<ScenarioType>[] = [
    { value: "combined", label: "Combined", variant: "default" },
    { value: "budget", label: "Budget", variant: "warning" },
    { value: "resource", label: "Resource", variant: "info" },
    { value: "timeline", label: "Timeline", variant: "secondary" },
];

export const SCENARIO_TYPE_MAP = toEnumMap(SCENARIO_TYPES);

// ─── Service Request Categories ───
export type ServiceRequestCategory =
    | "technical"
    | "logistics"
    | "billing"
    | "design"
    | "staffing"
    | "other";

export const SERVICE_REQUEST_CATEGORIES: EnumConfig<ServiceRequestCategory>[] = [
    { value: "technical", label: "Technical", variant: "info" },
    { value: "logistics", label: "Logistics", variant: "secondary" },
    { value: "billing", label: "Billing", variant: "warning" },
    { value: "design", label: "Design", variant: "default" },
    { value: "staffing", label: "Staffing", variant: "info" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const SERVICE_REQUEST_CATEGORY_MAP = toEnumMap(SERVICE_REQUEST_CATEGORIES);

// ─── Service Request Priority ───
export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";

export const SERVICE_REQUEST_PRIORITIES: EnumConfig<ServiceRequestPriority>[] = [
    { value: "low", label: "Low", variant: "success" },
    { value: "medium", label: "Medium", variant: "info" },
    { value: "high", label: "High", variant: "warning" },
    { value: "urgent", label: "Urgent", variant: "destructive" },
];

export const SERVICE_REQUEST_PRIORITY_MAP = toEnumMap(SERVICE_REQUEST_PRIORITIES);

// ─── Shipment Status ───
export type ShipmentStatus = "pending" | "in_transit" | "delivered" | "returned";

export const SHIPMENT_STATUSES: EnumConfig<ShipmentStatus>[] = [
    { value: "pending", label: "Pending", variant: "ghost" },
    { value: "in_transit", label: "In Transit", variant: "info" },
    { value: "delivered", label: "Delivered", variant: "success" },
    { value: "returned", label: "Returned", variant: "warning" },
];

export const SHIPMENT_STATUS_MAP = toEnumMap(SHIPMENT_STATUSES);

// ─── SOW Status ───
export type SowStatus = "draft" | "in_review" | "approved" | "active";

export const SOW_STATUSES: EnumConfig<SowStatus>[] = [
    { value: "draft", label: "Draft", variant: "ghost" },
    { value: "in_review", label: "In Review", variant: "warning" },
    { value: "approved", label: "Approved", variant: "success" },
    { value: "active", label: "Active", variant: "success" },
];

export const SOW_STATUS_MAP = toEnumMap(SOW_STATUSES);

// ─── Survey Types ───
export type SurveyType = "csat" | "nps" | "post_event" | "post_project" | "custom";

export const SURVEY_TYPES: EnumConfig<SurveyType>[] = [
    { value: "csat", label: "CSAT", variant: "default" },
    { value: "nps", label: "NPS", variant: "info" },
    { value: "post_event", label: "Post-Event", variant: "secondary" },
    { value: "post_project", label: "Post-Project", variant: "secondary" },
    { value: "custom", label: "Custom", variant: "ghost" },
];

export const SURVEY_TYPE_MAP = toEnumMap(SURVEY_TYPES);

// ─── Template Categories ───
export type TemplateCategory =
    | "proposal"
    | "contract"
    | "invoice"
    | "call_sheet"
    | "tech_sheet"
    | "sow"
    | "report"
    | "email";

export const TEMPLATE_CATEGORIES: EnumConfig<TemplateCategory>[] = [
    { value: "proposal", label: "Proposal", variant: "default" },
    { value: "contract", label: "Contract", variant: "info" },
    { value: "invoice", label: "Invoice", variant: "warning" },
    { value: "call_sheet", label: "Call Sheet", variant: "secondary" },
    { value: "tech_sheet", label: "Tech Sheet", variant: "secondary" },
    { value: "sow", label: "SOW", variant: "info" },
    { value: "report", label: "Report", variant: "ghost" },
    { value: "email", label: "Email", variant: "ghost" },
];

export const TEMPLATE_CATEGORY_MAP = toEnumMap(TEMPLATE_CATEGORIES);

// ─── Vendor Categories ───
export type VendorCategory =
    | "production"
    | "av"
    | "catering"
    | "transportation"
    | "staffing"
    | "security"
    | "decor"
    | "other";

export const VENDOR_CATEGORIES: EnumConfig<VendorCategory>[] = [
    { value: "production", label: "Production", variant: "default" },
    { value: "av", label: "AV & Technical", variant: "info" },
    { value: "catering", label: "Catering", variant: "secondary" },
    { value: "transportation", label: "Transportation", variant: "info" },
    { value: "staffing", label: "Staffing", variant: "warning" },
    { value: "security", label: "Security", variant: "destructive" },
    { value: "decor", label: "Décor", variant: "ghost" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const VENDOR_CATEGORY_MAP = toEnumMap(VENDOR_CATEGORIES);

// ─── Vehicle Types ───
export type VehicleType = "box_truck" | "sprinter_van" | "flatbed" | "pickup" | "trailer" | "other";

export const VEHICLE_TYPES: EnumConfig<VehicleType>[] = [
    { value: "box_truck", label: "Box Truck", variant: "default" },
    { value: "sprinter_van", label: "Sprinter Van", variant: "info" },
    { value: "flatbed", label: "Flatbed", variant: "secondary" },
    { value: "pickup", label: "Pickup", variant: "ghost" },
    { value: "trailer", label: "Trailer", variant: "warning" },
    { value: "other", label: "Other", variant: "ghost" },
];

export const VEHICLE_TYPE_MAP = toEnumMap(VEHICLE_TYPES);

// ─── Warehouse Types ───
export type WarehouseType = "primary" | "satellite" | "staging" | "vendor";

export const WAREHOUSE_TYPES: EnumConfig<WarehouseType>[] = [
    { value: "primary", label: "Primary", variant: "success" },
    { value: "satellite", label: "Satellite", variant: "info" },
    { value: "staging", label: "Staging", variant: "warning" },
    { value: "vendor", label: "Vendor", variant: "secondary" },
];

export const WAREHOUSE_TYPE_MAP = toEnumMap(WAREHOUSE_TYPES);

// ─── Work Order Priority ───
export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";

export const WORK_ORDER_PRIORITIES: EnumConfig<WorkOrderPriority>[] = [
    { value: "low", label: "Low", variant: "success" },
    { value: "medium", label: "Medium", variant: "info" },
    { value: "high", label: "High", variant: "warning" },
    { value: "urgent", label: "Urgent", variant: "destructive" },
];

export const WORK_ORDER_PRIORITY_MAP = toEnumMap(WORK_ORDER_PRIORITIES);

// ─── Worker Review Types ───
export type WorkerReviewType = "periodic" | "project_end" | "mid_project";

export const WORKER_REVIEW_TYPES: EnumConfig<WorkerReviewType>[] = [
    { value: "periodic", label: "Periodic", variant: "default" },
    { value: "project_end", label: "End of Project", variant: "info" },
    { value: "mid_project", label: "Mid-Project", variant: "secondary" },
];

export const WORKER_REVIEW_TYPE_MAP = toEnumMap(WORKER_REVIEW_TYPES);

// ─── Worker Target Types ───
export type WorkerTargetType = "employee" | "contractor" | "vendor" | "freelancer" | "intern";

export const WORKER_TARGET_TYPES: EnumConfig<WorkerTargetType>[] = [
    { value: "employee", label: "Employee", variant: "default" },
    { value: "contractor", label: "Contractor", variant: "info" },
    { value: "vendor", label: "Vendor", variant: "secondary" },
    { value: "freelancer", label: "Freelancer", variant: "warning" },
    { value: "intern", label: "Intern", variant: "ghost" },
];

export const WORKER_TARGET_TYPE_MAP = toEnumMap(WORKER_TARGET_TYPES);

// ─── Workforce Status ───
export type WorkforceStatus = "active" | "on_leave" | "inactive" | "terminated";

export const WORKFORCE_STATUSES: EnumConfig<WorkforceStatus>[] = [
    { value: "active", label: "Active", variant: "success" },
    { value: "on_leave", label: "On Leave", variant: "warning" },
    { value: "inactive", label: "Inactive", variant: "ghost" },
    { value: "terminated", label: "Terminated", variant: "destructive" },
];

export const WORKFORCE_STATUS_MAP = toEnumMap(WORKFORCE_STATUSES);

// ─── Messaging: Channel Categories ───
export const CHANNEL_CATEGORIES = [
    { value: "general", label: "General", icon: "Hash", description: "Open discussion channels" },
    {
        value: "project",
        label: "Project",
        icon: "Briefcase",
        description: "Project-scoped channels",
    },
    {
        value: "department",
        label: "Department",
        icon: "Building2",
        description: "Department channels",
    },
    {
        value: "announcement",
        label: "Announcement",
        icon: "Megaphone",
        description: "One-way announcement channels",
    },
    {
        value: "support",
        label: "Support",
        icon: "LifeBuoy",
        description: "Support and help channels",
    },
] as const;

export type ChannelCategory = (typeof CHANNEL_CATEGORIES)[number]["value"];

export const CHANNEL_CATEGORY_MAP = toEnumMap(
    CHANNEL_CATEGORIES as unknown as EnumConfig<ChannelCategory>[]
);

// ─── Messaging: Conversation Types ───
export const CONVERSATION_TYPES = [
    { value: "dm", label: "Direct Message", variant: "ghost" as const },
    { value: "group", label: "Group", variant: "info" as const },
    { value: "channel", label: "Channel", variant: "default" as const },
] as const;

// ─── Helper: Get Config by Value ───
export function getEnumConfig<T extends string>(
    map: Record<T, EnumConfig<T>>,
    value: T
): EnumConfig<T> {
    return map[value];
}
