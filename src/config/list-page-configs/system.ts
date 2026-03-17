/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIGS — System Domain
   
   Declarative ListPageConfig objects for the system domain.
   Consumed by ListPageShell — no imperative page code needed.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";
import {
    CREATE_CUSTOM_FIELD_CONFIG,
    CREATE_SLA_POLICY_CONFIG,
    CREATE_USER_INVITE_CONFIG,
    CREATE_VAULT_DOCUMENT_CONFIG,
} from "@/config/create-entity-configs";
import {
    CREATE_APPROVAL_STEP_CONFIG,
    CREATE_ASSET_ASSIGNMENT_CONFIG,
    CREATE_ASSET_TAG_CONFIG,
    CREATE_ASSET_VERSION_CONFIG,
    CREATE_AUTOMATION_RULE_CONFIG,
    CREATE_BUDGET_APPROVAL_CONFIG,
    CREATE_CALENDAR_EVENT_CONFIG,
    CREATE_CHANNEL_TEMPLATE_CONFIG,
    CREATE_COMM_CHANNEL_CONFIG,
    CREATE_COMMENT_CONFIG,
    CREATE_CONVERSATION_CONFIG,
    CREATE_CUSTOM_FIELD_DEFINITION_CONFIG,
    CREATE_DASHBOARD_WIDGET_CONFIG,
    CREATE_DATA_EXPORT_REQUEST_CONFIG,
    CREATE_DOCUMENT_TEMPLATE_CONFIG,
    CREATE_INVITATION_CONFIG,
    CREATE_KNOWLEDGE_BASE_ARTICLE_CONFIG,
    CREATE_ORGANIZATION_CONFIG,
    CREATE_PROFILE_CONFIG,
    CREATE_PROVIDER_CONNECTION_CONFIG,
    CREATE_REPORT_DEFINITION_CONFIG,
    CREATE_RESILIENCE_TARGET_CONFIG,
    CREATE_SLA_DEFINITION_CONFIG,
    CREATE_TEMPORARY_ACCESS_GRANT_CONFIG,
    CREATE_WORKFLOW_CONFIG,
} from "@/config/phase-h-create-entity-configs";
import {
    Activity,
    Bell,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle,
    Cog,
    Download,
    FileClock,
    FileSearch,
    Gauge,
    GitBranch,
    HardDrive,
    HeartPulse,
    History,
    LayoutGrid,
    Link,
    Lock,
    LogIn,
    Mail,
    MessageCircle,
    MessageSquare,
    Monitor,
    Package,
    Radio,
    RefreshCw,
    ScrollText,
    Settings2,
    Shield,
    ShieldAlert,
    Tags,
    Target,
    Timer,
    UserCog,
    Users,
    Zap,
} from "lucide-react";

// ─── automation_rule ───

export const AUTOMATION_RULES_PAGE: ListPageConfig = {
    entityKey: "automation_rule",
    description: "Define rules that trigger automated workflows and actions",
    icon: Zap,
    createConfig: CREATE_AUTOMATION_RULE_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Rule", accessorKey: "name" },
        { id: "trigger_type", header: "Trigger", accessorKey: "trigger_type", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── custom_field_definition ───

export const CUSTOM_FIELD_DEFINITIONS_PAGE: ListPageConfig = {
    entityKey: "custom_field_definition",
    description: "Define custom fields to extend entity data models per tenant",
    icon: Settings2,
    createConfig: CREATE_CUSTOM_FIELD_DEFINITION_CONFIG,
    searchKeys: ["name", "field_key"],
    columns: [
        { id: "name", header: "Field", accessorKey: "name" },
        { id: "field_key", header: "Key", accessorKey: "field_key" },
        { id: "field_type", header: "Type", accessorKey: "field_type", fieldType: "status" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type" },
        { id: "is_required", header: "Required", accessorKey: "is_required", fieldType: "status" },
    ],
    exportable: true,
};

// ─── data_export_request ───

export const DATA_EXPORT_REQUESTS_PAGE: ListPageConfig = {
    entityKey: "data_export_request",
    description: "Track and manage data export requests for compliance and reporting",
    icon: Download,
    createConfig: CREATE_DATA_EXPORT_REQUEST_CONFIG,
    searchKeys: ["name", "export_type"],
    columns: [
        { id: "name", header: "Export", accessorKey: "name" },
        { id: "export_type", header: "Type", accessorKey: "export_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "requested_at", header: "Requested", accessorKey: "requested_at", fieldType: "date" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── invitation ───

export const INVITATIONS_PAGE: ListPageConfig = {
    entityKey: "invitation",
    description: "Manage pending, accepted, and expired user invitations",
    icon: MessageSquare,
    createConfig: CREATE_INVITATION_CONFIG,
    searchKeys: ["email"],
    columns: [
        { id: "email", header: "Email", accessorKey: "email" },
        {
            id: "permission_level",
            header: "Role",
            accessorKey: "permission_level",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expires_at", header: "Expires", accessorKey: "expires_at", fieldType: "date" },
        { id: "created_at", header: "Sent", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── provider_connection ───

export const PROVIDER_CONNECTIONS_PAGE: ListPageConfig = {
    entityKey: "provider_connection",
    description: "External service provider connections and integrations",
    icon: Link,
    createConfig: CREATE_PROVIDER_CONNECTION_CONFIG,
    searchKeys: ["name", "provider"],
    columns: [
        { id: "name", header: "Connection", accessorKey: "name" },
        { id: "provider", header: "Provider", accessorKey: "provider" },
        {
            id: "connection_type",
            header: "Type",
            accessorKey: "connection_type",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── report_definition ───

export const REPORT_DEFINITIONS_PAGE: ListPageConfig = {
    entityKey: "report_definition",
    description: "Custom report definitions and saved report configurations",
    icon: FileSearch,
    createConfig: CREATE_REPORT_DEFINITION_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Report", accessorKey: "name" },
        { id: "report_type", header: "Type", accessorKey: "report_type", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── resilience_target ───

export const RESILIENCE_TARGETS_PAGE: ListPageConfig = {
    entityKey: "resilience_target",
    description: "Business continuity and resilience targets for critical services",
    icon: ShieldAlert,
    createConfig: CREATE_RESILIENCE_TARGET_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Target", accessorKey: "name" },
        { id: "target_type", header: "Type", accessorKey: "target_type", fieldType: "status" },
        { id: "rto_hours", header: "RTO (hrs)", accessorKey: "rto_hours" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── sla_definition ───

export const SLA_DEFINITIONS_PAGE: ListPageConfig = {
    entityKey: "sla_definition",
    description: "Service level agreement definitions and response time targets",
    icon: Timer,
    createConfig: CREATE_SLA_DEFINITION_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "SLA", accessorKey: "name" },
        { id: "response_time_hours", header: "Response (hrs)", accessorKey: "response_time_hours" },
        {
            id: "resolution_time_hours",
            header: "Resolution (hrs)",
            accessorKey: "resolution_time_hours",
        },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── temporary_access_grant ───

export const TEMPORARY_ACCESS_GRANTS_PAGE: ListPageConfig = {
    entityKey: "temporary_access_grant",
    description: "Time-limited access grants for contractors and temporary personnel",
    icon: Lock,
    createConfig: CREATE_TEMPORARY_ACCESS_GRANT_CONFIG,
    searchKeys: ["grantee_name", "description"],
    columns: [
        { id: "grantee_name", header: "Grantee", accessorKey: "grantee_name" },
        { id: "access_level", header: "Level", accessorKey: "access_level", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expires_at", header: "Expires", accessorKey: "expires_at", fieldType: "date" },
        { id: "created_at", header: "Granted", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── vault_document ───

export const VAULT_DOCUMENTS_PAGE: ListPageConfig = {
    entityKey: "vault_document",
    description: "Secure document vault for contracts, certificates, and sensitive files",
    icon: Lock,
    createConfig: CREATE_VAULT_DOCUMENT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Document", accessorKey: "title" },
        { id: "document_type", header: "Type", accessorKey: "document_type", fieldType: "status" },
        {
            id: "classification",
            header: "Classification",
            accessorKey: "classification",
            fieldType: "status",
        },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── workflow ───

export const WORKFLOWS_PAGE: ListPageConfig = {
    entityKey: "workflow",
    description: "Workflow definitions, automation sequences, and process templates",
    icon: Cog,
    createConfig: CREATE_WORKFLOW_CONFIG,
    searchKeys: ["name", "description"],
    columns: [
        { id: "name", header: "Workflow", accessorKey: "name" },
        { id: "workflow_type", header: "Type", accessorKey: "workflow_type", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── access_audit_log ───

export const ACCESS_AUDIT_LOG_PAGE: ListPageConfig = {
    entityKey: "access_audit_log",
    description: "Audit trail of access control events and permission changes",
    icon: Shield,
    searchKeys: ["action", "resource"],
    columns: [
        { id: "action", header: "Action", accessorKey: "action" },
        { id: "resource", header: "Resource", accessorKey: "resource", fieldType: "status" },
        { id: "actor_id", header: "Actor", accessorKey: "actor_id" },
        { id: "created_at", header: "Timestamp", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── activity ───

export const ACTIVITIES_PAGE: ListPageConfig = {
    entityKey: "activity",
    description: "Activity log entries across all entities and workflows",
    icon: Activity,
    searchKeys: ["description", "activity_type"],
    columns: [
        { id: "description", header: "Activity", accessorKey: "description" },
        { id: "activity_type", header: "Type", accessorKey: "activity_type", fieldType: "status" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type", fieldType: "status" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── activity_log_entry ───

export const ACTIVITY_LOG_PAGE: ListPageConfig = {
    entityKey: "activity_log_entry",
    description: "System-wide activity and change log",
    icon: History,
    searchKeys: ["action", "entity_type"],
    columns: [
        { id: "action", header: "Action", accessorKey: "action" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type", fieldType: "status" },
        { id: "actor_id", header: "Actor", accessorKey: "actor_id" },
        { id: "created_at", header: "Timestamp", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── advance_status_history ───

export const ADVANCE_STATUS_HISTORY_PAGE: ListPageConfig = {
    entityKey: "advance_status_history",
    description: "Status change history for production advances",
    icon: FileClock,
    searchKeys: ["advance_id", "status"],
    columns: [
        { id: "advance_id", header: "Advance", accessorKey: "advance_id" },
        { id: "from_status", header: "From", accessorKey: "from_status", fieldType: "status" },
        { id: "to_status", header: "To", accessorKey: "to_status", fieldType: "status" },
        { id: "changed_by", header: "Changed By", accessorKey: "changed_by" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── approval_step ───

export const APPROVAL_STEPS_PAGE: ListPageConfig = {
    entityKey: "approval_step",
    description: "Individual steps within approval workflows",
    icon: CheckCircle,
    createConfig: CREATE_APPROVAL_STEP_CONFIG,
    searchKeys: ["name", "approver_role"],
    columns: [
        { id: "name", header: "Step", accessorKey: "name" },
        {
            id: "approver_role",
            header: "Approver Role",
            accessorKey: "approver_role",
            fieldType: "status",
        },
        { id: "order", header: "Order", accessorKey: "order" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── approval_workflow ───

export const APPROVAL_WORKFLOWS_PAGE: ListPageConfig = {
    entityKey: "approval_workflow",
    description: "Multi-step approval workflow definitions and templates",
    icon: GitBranch,
    createConfig: CREATE_BUDGET_APPROVAL_CONFIG,
    searchKeys: ["name", "entity_type"],
    columns: [
        { id: "name", header: "Workflow", accessorKey: "name" },
        {
            id: "entity_type",
            header: "Entity Type",
            accessorKey: "entity_type",
            fieldType: "status",
        },
        { id: "steps_count", header: "Steps", accessorKey: "steps_count" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── asset_assignment ───

export const ASSET_ASSIGNMENTS_PAGE: ListPageConfig = {
    entityKey: "asset_assignment",
    description: "Track asset assignments to people, projects, and locations",
    icon: Package,
    createConfig: CREATE_ASSET_ASSIGNMENT_CONFIG,
    searchKeys: ["asset_name", "assignee_name"],
    columns: [
        { id: "asset_name", header: "Asset", accessorKey: "asset_name" },
        { id: "assignee_name", header: "Assignee", accessorKey: "assignee_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "assigned_date",
            header: "Assigned",
            accessorKey: "assigned_date",
            fieldType: "date",
        },
        { id: "return_date", header: "Return", accessorKey: "return_date", fieldType: "date" },
    ],
    views: ["table", "board", "timeline"],
    defaultView: "table",
    boardConfig: {
        groupByKey: "status",
        cardTitleKey: "asset_name",
        cardSubtitleKey: "assignee_name",
    },
    timelineConfig: {
        labelKey: "asset_name",
        sublabelKey: "assignee_name",
        startDateKey: "assigned_date",
        endDateKey: "return_date",
        colorKey: "status",
    },
    exportable: true,
};

// ─── asset_tag ───

export const ASSET_TAGS_PAGE: ListPageConfig = {
    entityKey: "asset_tag",
    description: "Tags and labels for organizing and categorizing assets",
    icon: Tags,
    createConfig: CREATE_ASSET_TAG_CONFIG,
    searchKeys: ["name", "tag_type"],
    columns: [
        { id: "name", header: "Tag", accessorKey: "name" },
        { id: "tag_type", header: "Type", accessorKey: "tag_type", fieldType: "status" },
        { id: "usage_count", header: "Usage", accessorKey: "usage_count" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── asset_version ───

export const ASSET_VERSIONS_PAGE: ListPageConfig = {
    entityKey: "asset_version",
    description: "Version history and revisions for digital and physical assets",
    icon: FileClock,
    createConfig: CREATE_ASSET_VERSION_CONFIG,
    searchKeys: ["asset_name", "version_number"],
    columns: [
        { id: "asset_name", header: "Asset", accessorKey: "asset_name" },
        { id: "version_number", header: "Version", accessorKey: "version_number" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_by", header: "Author", accessorKey: "created_by" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── automation_execution ───

export const AUTOMATION_EXECUTIONS_PAGE: ListPageConfig = {
    entityKey: "automation_execution",
    description: "Execution logs for automation rule runs",
    icon: Zap,
    searchKeys: ["rule_name", "status"],
    columns: [
        { id: "rule_name", header: "Rule", accessorKey: "rule_name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "trigger_type", header: "Trigger", accessorKey: "trigger_type", fieldType: "status" },
        { id: "duration_ms", header: "Duration", accessorKey: "duration_ms" },
        { id: "executed_at", header: "Executed", accessorKey: "executed_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── automation_log ───

export const AUTOMATION_LOGS_PAGE: ListPageConfig = {
    entityKey: "automation_log",
    description: "Detailed logs of automation actions and outcomes",
    icon: ScrollText,
    searchKeys: ["message", "level"],
    columns: [
        { id: "message", header: "Message", accessorKey: "message" },
        { id: "level", header: "Level", accessorKey: "level", fieldType: "status" },
        { id: "execution_id", header: "Execution", accessorKey: "execution_id" },
        { id: "created_at", header: "Timestamp", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── calendar_event ───

export const CALENDAR_EVENTS_PAGE: ListPageConfig = {
    entityKey: "calendar_event",
    description: "Calendar events, meetings, and scheduled activities",
    icon: CalendarDays,
    createConfig: CREATE_CALENDAR_EVENT_CONFIG,
    searchKeys: ["title", "description"],
    columns: [
        { id: "title", header: "Event", accessorKey: "title" },
        { id: "event_type", header: "Type", accessorKey: "event_type", fieldType: "status" },
        { id: "start_time", header: "Start", accessorKey: "start_time", fieldType: "date" },
        { id: "end_time", header: "End", accessorKey: "end_time", fieldType: "date" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
    ],
    views: ["table", "calendar", "timeline"],
    defaultView: "calendar",
    calendarConfig: {
        titleKey: "title",
        dateKey: "start_time",
        endDateKey: "end_time",
        colorKey: "event_type",
    },
    timelineConfig: {
        labelKey: "title",
        sublabelKey: "event_type",
        startDateKey: "start_time",
        endDateKey: "end_time",
        colorKey: "status",
    },
    exportable: true,
};

// ─── channel_template ───

export const CHANNEL_TEMPLATES_PAGE: ListPageConfig = {
    entityKey: "channel_template",
    description: "Reusable templates for communication channels",
    icon: MessageSquare,
    createConfig: CREATE_CHANNEL_TEMPLATE_CONFIG,
    searchKeys: ["name", "channel_type"],
    columns: [
        { id: "name", header: "Template", accessorKey: "name" },
        { id: "channel_type", header: "Channel", accessorKey: "channel_type", fieldType: "status" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── comm_channel ───

export const COMM_CHANNELS_PAGE: ListPageConfig = {
    entityKey: "comm_channel",
    description: "Communication channels for events and productions",
    icon: Radio,
    createConfig: CREATE_COMM_CHANNEL_CONFIG,
    searchKeys: ["name", "channel_type"],
    columns: [
        { id: "name", header: "Channel", accessorKey: "name" },
        { id: "channel_type", header: "Type", accessorKey: "channel_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── comment ───

export const COMMENTS_PAGE: ListPageConfig = {
    entityKey: "comment",
    description: "Comments and discussions across all entities",
    icon: MessageCircle,
    createConfig: CREATE_COMMENT_CONFIG,
    searchKeys: ["content", "author_name"],
    columns: [
        { id: "content", header: "Comment", accessorKey: "content" },
        { id: "author_name", header: "Author", accessorKey: "author_name" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type", fieldType: "status" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── conversation ───

export const CONVERSATIONS_PAGE: ListPageConfig = {
    entityKey: "conversation",
    description: "Internal conversations and message threads",
    icon: MessageCircle,
    createConfig: CREATE_CONVERSATION_CONFIG,
    searchKeys: ["subject", "participant_names"],
    columns: [
        { id: "subject", header: "Subject", accessorKey: "subject" },
        { id: "participant_count", header: "Participants", accessorKey: "participant_count" },
        { id: "message_count", header: "Messages", accessorKey: "message_count" },
        {
            id: "last_message_at",
            header: "Last Activity",
            accessorKey: "last_message_at",
            fieldType: "date",
        },
    ],
    exportable: true,
};

// ─── custom_field ───

export const CUSTOM_FIELDS_PAGE: ListPageConfig = {
    entityKey: "custom_field",
    description: "Custom field values on entities",
    icon: Settings2,
    createConfig: CREATE_CUSTOM_FIELD_CONFIG,
    searchKeys: ["field_name", "entity_type"],
    columns: [
        { id: "field_name", header: "Field", accessorKey: "field_name" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type", fieldType: "status" },
        { id: "field_type", header: "Type", accessorKey: "field_type", fieldType: "status" },
        { id: "value", header: "Value", accessorKey: "value" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── dashboard_widget ───

export const DASHBOARD_WIDGETS_PAGE: ListPageConfig = {
    entityKey: "dashboard_widget",
    description: "Configurable dashboard widget definitions",
    icon: LayoutGrid,
    createConfig: CREATE_DASHBOARD_WIDGET_CONFIG,
    searchKeys: ["title", "widget_type"],
    columns: [
        { id: "title", header: "Widget", accessorKey: "title" },
        { id: "widget_type", header: "Type", accessorKey: "widget_type", fieldType: "status" },
        { id: "position", header: "Position", accessorKey: "position" },
        { id: "is_visible", header: "Visible", accessorKey: "is_visible", fieldType: "status" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── document_version ───

export const DOCUMENT_VERSIONS_PAGE: ListPageConfig = {
    entityKey: "document_version",
    description: "Version history for documents and templates",
    icon: FileClock,
    createConfig: CREATE_DOCUMENT_TEMPLATE_CONFIG,
    searchKeys: ["document_name", "version_number"],
    columns: [
        { id: "document_name", header: "Document", accessorKey: "document_name" },
        { id: "version_number", header: "Version", accessorKey: "version_number" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_by", header: "Author", accessorKey: "created_by" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── domain_event ───

export const DOMAIN_EVENTS_PAGE: ListPageConfig = {
    entityKey: "domain_event",
    description: "Domain events emitted across the platform",
    icon: Zap,
    searchKeys: ["event_type", "entity_type"],
    columns: [
        { id: "event_type", header: "Event", accessorKey: "event_type" },
        { id: "entity_type", header: "Entity", accessorKey: "entity_type", fieldType: "status" },
        { id: "actor_id", header: "Actor", accessorKey: "actor_id" },
        { id: "created_at", header: "Timestamp", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── email_message ───

export const EMAIL_MESSAGES_PAGE: ListPageConfig = {
    entityKey: "email_message",
    description: "Email messages linked to entities and records",
    icon: Mail,
    searchKeys: ["subject", "from_address"],
    columns: [
        { id: "subject", header: "Subject", accessorKey: "subject" },
        { id: "from_address", header: "From", accessorKey: "from_address" },
        { id: "to_address", header: "To", accessorKey: "to_address" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "sent_at", header: "Sent", accessorKey: "sent_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── knowledge_article ───

export const KNOWLEDGE_ARTICLES_PAGE: ListPageConfig = {
    entityKey: "knowledge_article",
    description: "Knowledge base articles and documentation",
    icon: BookOpen,
    createConfig: CREATE_KNOWLEDGE_BASE_ARTICLE_CONFIG,
    searchKeys: ["title", "category"],
    columns: [
        { id: "title", header: "Article", accessorKey: "title" },
        { id: "category", header: "Category", accessorKey: "category", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "views_count", header: "Views", accessorKey: "views_count" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "title",
        subtitleKey: "category",
        statusKey: "status",
        fields: [{ id: "views_count", label: "Views", accessorKey: "views_count" }],
    },
    exportable: true,
};

// ─── login_audit_log ───

export const LOGIN_AUDIT_LOG_PAGE: ListPageConfig = {
    entityKey: "login_audit_log",
    description: "Login attempts and authentication audit trail",
    icon: LogIn,
    searchKeys: ["email", "ip_address"],
    columns: [
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "ip_address", header: "IP Address", accessorKey: "ip_address" },
        { id: "result", header: "Result", accessorKey: "result", fieldType: "status" },
        { id: "user_agent", header: "User Agent", accessorKey: "user_agent" },
        { id: "created_at", header: "Timestamp", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── notification ───

export const NOTIFICATIONS_PAGE: ListPageConfig = {
    entityKey: "notification",
    description: "System notifications and alerts",
    icon: Bell,
    searchKeys: ["title", "message"],
    columns: [
        { id: "title", header: "Notification", accessorKey: "title" },
        {
            id: "notification_type",
            header: "Type",
            accessorKey: "notification_type",
            fieldType: "status",
        },
        { id: "is_read", header: "Read", accessorKey: "is_read", fieldType: "status" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── organization ───

export const ORGANIZATIONS_PAGE: ListPageConfig = {
    entityKey: "organization",
    description: "Organizations and tenants in the platform",
    icon: Building2,
    createConfig: CREATE_ORGANIZATION_CONFIG,
    searchKeys: ["name", "industry"],
    columns: [
        { id: "name", header: "Organization", accessorKey: "name" },
        { id: "industry", header: "Industry", accessorKey: "industry", fieldType: "status" },
        { id: "member_count", header: "Members", accessorKey: "member_count" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── profile ───

export const PROFILES_PAGE: ListPageConfig = {
    entityKey: "profile",
    description: "User profiles and account information",
    icon: UserCog,
    createConfig: CREATE_PROFILE_CONFIG,
    searchKeys: ["display_name", "email"],
    columns: [
        { id: "display_name", header: "Name", accessorKey: "display_name" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        {
            id: "last_login_at",
            header: "Last Login",
            accessorKey: "last_login_at",
            fieldType: "date",
        },
    ],
    views: ["table", "cards"],
    defaultView: "table",
    cardConfig: {
        titleKey: "display_name",
        subtitleKey: "email",
        statusKey: "role",
        fields: [{ id: "status", label: "Status", accessorKey: "status", fieldType: "status" }],
    },
    exportable: true,
};

// ─── role_change_log ───

export const ROLE_CHANGE_LOG_PAGE: ListPageConfig = {
    entityKey: "role_change_log",
    description: "Audit log of role and permission changes",
    icon: Shield,
    searchKeys: ["user_name", "from_role"],
    columns: [
        { id: "user_name", header: "User", accessorKey: "user_name" },
        { id: "from_role", header: "From", accessorKey: "from_role", fieldType: "status" },
        { id: "to_role", header: "To", accessorKey: "to_role", fieldType: "status" },
        { id: "changed_by", header: "Changed By", accessorKey: "changed_by" },
        { id: "created_at", header: "Date", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── scan_event ───

export const SCAN_EVENTS_PAGE: ListPageConfig = {
    entityKey: "scan_event",
    description: "Credential and badge scan events",
    icon: Monitor,
    searchKeys: ["scan_type", "location_name"],
    columns: [
        { id: "scan_type", header: "Type", accessorKey: "scan_type" },
        { id: "location_name", header: "Location", accessorKey: "location_name" },
        { id: "result", header: "Result", accessorKey: "result", fieldType: "status" },
        { id: "scanned_by", header: "Scanned By", accessorKey: "scanned_by" },
        { id: "scanned_at", header: "Date", accessorKey: "scanned_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── service_health_check ───

export const SERVICE_HEALTH_CHECKS_PAGE: ListPageConfig = {
    entityKey: "service_health_check",
    description: "Service health check results and uptime monitoring",
    icon: HeartPulse,
    searchKeys: ["service_name", "check_type"],
    columns: [
        { id: "service_name", header: "Service", accessorKey: "service_name" },
        { id: "check_type", header: "Type", accessorKey: "check_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "response_time_ms", header: "Response (ms)", accessorKey: "response_time_ms" },
        { id: "checked_at", header: "Checked", accessorKey: "checked_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── sla_policy ───

export const SLA_POLICIES_PAGE: ListPageConfig = {
    entityKey: "sla_policy",
    description: "Service level agreement policy definitions",
    icon: Target,
    createConfig: CREATE_SLA_POLICY_CONFIG,
    searchKeys: ["name", "policy_type"],
    columns: [
        { id: "name", header: "Policy", accessorKey: "name" },
        { id: "policy_type", header: "Type", accessorKey: "policy_type", fieldType: "status" },
        { id: "response_time", header: "Response Time", accessorKey: "response_time" },
        { id: "resolution_time", header: "Resolution Time", accessorKey: "resolution_time" },
        { id: "is_active", header: "Active", accessorKey: "is_active", fieldType: "status" },
    ],
    exportable: true,
};

// ─── sla_tracking ───

export const SLA_TRACKING_PAGE: ListPageConfig = {
    entityKey: "sla_tracking",
    description: "SLA compliance tracking and breach monitoring",
    icon: Gauge,
    searchKeys: ["entity_name", "sla_name"],
    columns: [
        { id: "entity_name", header: "Entity", accessorKey: "entity_name" },
        { id: "sla_name", header: "SLA", accessorKey: "sla_name" },
        {
            id: "compliance_status",
            header: "Status",
            accessorKey: "compliance_status",
            fieldType: "status",
        },
        { id: "breach_count", header: "Breaches", accessorKey: "breach_count" },
        { id: "updated_at", header: "Updated", accessorKey: "updated_at", fieldType: "date" },
    ],
    views: ["table", "chart"],
    defaultView: "table",
    chartConfig: {
        type: "pie",
        categoryKey: "compliance_status",
    },
    exportable: true,
};

// ─── storage_object ───

export const STORAGE_OBJECTS_PAGE: ListPageConfig = {
    entityKey: "storage_object",
    description: "File storage objects and attachments",
    icon: HardDrive,
    searchKeys: ["name", "mime_type"],
    columns: [
        { id: "name", header: "File", accessorKey: "name" },
        { id: "mime_type", header: "Type", accessorKey: "mime_type", fieldType: "status" },
        { id: "size_bytes", header: "Size", accessorKey: "size_bytes" },
        { id: "uploaded_by", header: "Uploaded By", accessorKey: "uploaded_by" },
        { id: "created_at", header: "Uploaded", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── sync_event ───

export const SYNC_EVENTS_PAGE: ListPageConfig = {
    entityKey: "sync_event",
    description: "Data synchronization events with external systems",
    icon: RefreshCw,
    searchKeys: ["provider_name", "sync_type"],
    columns: [
        { id: "provider_name", header: "Provider", accessorKey: "provider_name" },
        { id: "sync_type", header: "Type", accessorKey: "sync_type", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "records_synced", header: "Records", accessorKey: "records_synced" },
        { id: "synced_at", header: "Synced", accessorKey: "synced_at", fieldType: "date" },
    ],
    exportable: true,
};

// ─── user_management ───

export const USER_MANAGEMENT_PAGE: ListPageConfig = {
    entityKey: "user_management",
    description: "Manage users, roles, and access across your organization",
    icon: Users,
    createConfig: CREATE_USER_INVITE_CONFIG,
    searchKeys: ["name", "email", "role"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "email", header: "Email", accessorKey: "email" },
        { id: "role", header: "Role", accessorKey: "role", fieldType: "status" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Joined", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};
