/* ═══════════════════════════════════════════════════════════════
   CUSTOM ROUTE REGISTRY — Non-CRUD endpoints
   
   Declarative registry for API routes that don't follow the
   standard CRUD factory pattern. Each entry maps directly to
   an OpenAPI path + operation.
   ═══════════════════════════════════════════════════════════════ */

import { errorResponses } from "./shared-schemas";

// ─── Types ───────────────────────────────────────────────────

interface CustomOperation {
    operationId: string;
    summary: string;
    description?: string | undefined;
    tags: string[];
    parameters?: Record<string, unknown>[] | undefined;
    requestBody?: Record<string, unknown> | undefined;
    responses: Record<string, Record<string, unknown>>;
    security?: Record<string, unknown>[] | undefined;
    "x-rbac-resource"?: string;
    "x-rbac-action"?: string;
}

interface CustomRoute {
    path: string;
    method: string;
    operation: CustomOperation;
}

// ─── Helper ──────────────────────────────────────────────────

const AUTH_SECURITY = [{ bearerAuth: [] }, { cookieAuth: [] }];
const NO_AUTH: Record<string, unknown>[] = [];

function json(schema: Record<string, unknown>) {
    return { content: { "application/json": { schema } } };
}

// ─── Registry ────────────────────────────────────────────────

const CUSTOM_ROUTES: CustomRoute[] = [
    // ── System ───────────────────────────────────────────────
    {
        path: "/api/health",
        method: "get",
        operation: {
            operationId: "healthCheck",
            summary: "Health check",
            tags: ["System"],
            security: NO_AUTH,
            responses: {
                "200": {
                    description: "Service is healthy",
                    ...json({
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["ok"] },
                            timestamp: { type: "string", format: "date-time" },
                        },
                        required: ["status", "timestamp"],
                    }),
                },
            },
        },
    },
    {
        path: "/api/docs",
        method: "get",
        operation: {
            operationId: "getOpenApiSpec",
            summary: "OpenAPI 3.1 specification",
            description: "Returns the auto-generated OpenAPI 3.1 JSON specification.",
            tags: ["System"],
            security: NO_AUTH,
            responses: {
                "200": { description: "OpenAPI 3.1 JSON spec" },
            },
        },
    },
    {
        path: "/api/docs/ui",
        method: "get",
        operation: {
            operationId: "getApiDocsUi",
            summary: "Interactive API documentation UI",
            description: "Serves the Scalar API reference UI. RBAC-gated to admin roles.",
            tags: ["System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "HTML page with interactive API docs" },
                ...errorResponses("401", "403"),
            },
        },
    },

    // ── Auth ─────────────────────────────────────────────────
    {
        path: "/api/auth/log-event",
        method: "post",
        operation: {
            operationId: "logAuthEvent",
            summary: "Log authentication event",
            tags: ["Auth"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["event_type"],
                    properties: {
                        event_type: { type: "string" },
                        metadata: { type: "object", additionalProperties: true },
                    },
                }),
            },
            responses: {
                "200": {
                    description: "Event logged",
                    ...json({ type: "object", properties: { success: { type: "boolean" } } }),
                },
                ...errorResponses("401", "422", "500"),
            },
        },
    },
    {
        path: "/api/auth/session",
        method: "get",
        operation: {
            operationId: "getSession",
            summary: "Get current session and profile",
            tags: ["Auth"],
            security: AUTH_SECURITY,
            responses: {
                "200": {
                    description: "Current user session and profile data",
                    ...json({
                        type: "object",
                        properties: {
                            user: { type: "object" },
                            profile: { type: "object" },
                        },
                    }),
                },
                ...errorResponses("401", "500"),
            },
        },
    },
    {
        path: "/api/auth/reset-password",
        method: "post",
        operation: {
            operationId: "resetPassword",
            summary: "Request password reset",
            tags: ["Auth"],
            security: NO_AUTH,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["email"],
                    properties: { email: { type: "string", format: "email" } },
                }),
            },
            responses: {
                "200": {
                    description: "Reset email sent (always returns 200 to prevent enumeration)",
                },
                ...errorResponses("422", "500"),
            },
        },
    },
    {
        path: "/api/auth/signout",
        method: "post",
        operation: {
            operationId: "signOut",
            summary: "Sign out current session",
            tags: ["Auth"],
            security: AUTH_SECURITY,
            responses: {
                "200": { description: "Signed out successfully" },
            },
        },
    },
    {
        path: "/api/auth/validate-password",
        method: "post",
        operation: {
            operationId: "validatePassword",
            summary: "Validate password strength",
            tags: ["Auth"],
            security: NO_AUTH,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["password"],
                    properties: { password: { type: "string" } },
                }),
            },
            responses: {
                "200": {
                    description: "Password validation result",
                    ...json({
                        type: "object",
                        properties: {
                            valid: { type: "boolean" },
                            score: { type: "integer" },
                            feedback: { type: "array", items: { type: "string" } },
                        },
                    }),
                },
            },
        },
    },

    // ── Organizations ────────────────────────────────────────
    {
        path: "/api/organizations",
        method: "post",
        operation: {
            operationId: "createOrganization",
            summary: "Create organization",
            tags: ["Organizations", "System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string", minLength: 1, maxLength: 200 },
                        industry: { type: "string" },
                        timezone: { type: "string" },
                    },
                }),
            },
            responses: {
                "201": { description: "Organization created" },
                ...errorResponses("401", "422", "500"),
            },
        },
    },
    {
        path: "/api/organizations/transfer-ownership",
        method: "post",
        operation: {
            operationId: "transferOrgOwnership",
            summary: "Transfer organization ownership",
            tags: ["Organizations", "System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "manage",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["target_user_id", "confirmation"],
                    properties: {
                        target_user_id: { type: "string", format: "uuid" },
                        confirmation: { type: "string" },
                    },
                }),
            },
            responses: {
                "200": { description: "Ownership transferred" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },

    // ── Invitations ──────────────────────────────────────────
    {
        path: "/api/invitations",
        method: "post",
        operation: {
            operationId: "sendInvitations",
            summary: "Send team invitations",
            tags: ["Invitations", "System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "invitations",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["invitations"],
                    properties: {
                        invitations: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["email", "role"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    role: { type: "string" },
                                },
                            },
                        },
                    },
                }),
            },
            responses: {
                "200": { description: "Invitations sent" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },

    // ── Onboarding ───────────────────────────────────────────
    {
        path: "/api/onboarding/progress",
        method: "get",
        operation: {
            operationId: "getOnboardingProgress",
            summary: "Get onboarding progress",
            tags: ["Onboarding", "System"],
            security: AUTH_SECURITY,
            responses: {
                "200": { description: "Current onboarding steps and progress" },
                ...errorResponses("401", "500"),
            },
        },
    },
    {
        path: "/api/onboarding/progress",
        method: "post",
        operation: {
            operationId: "updateOnboardingProgress",
            summary: "Update onboarding step",
            tags: ["Onboarding", "System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["step_key"],
                    properties: {
                        step_key: { type: "string" },
                        completed: { type: "boolean" },
                    },
                }),
            },
            responses: {
                "200": { description: "Progress updated" },
                ...errorResponses("401", "422", "500"),
            },
        },
    },

    // ── Billing ──────────────────────────────────────────────
    {
        path: "/api/billing/subscribe",
        method: "get",
        operation: {
            operationId: "getBillingPlan",
            summary: "Get current billing plan",
            tags: ["Billing", "System"],
            security: AUTH_SECURITY,
            responses: {
                "200": { description: "Current subscription details" },
                ...errorResponses("401", "500"),
            },
        },
    },
    {
        path: "/api/billing/subscribe",
        method: "post",
        operation: {
            operationId: "updateBillingPlan",
            summary: "Update billing subscription",
            tags: ["Billing", "System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["pricing_tier", "billing_cycle"],
                    properties: {
                        pricing_tier: { type: "string", enum: ["core", "pro", "enterprise"] },
                        billing_cycle: { type: "string", enum: ["monthly", "annual"] },
                    },
                }),
            },
            responses: {
                "200": { description: "Subscription updated" },
                ...errorResponses("401", "422", "500"),
            },
        },
    },

    // ── Settings ─────────────────────────────────────────────
    {
        path: "/api/settings",
        method: "get",
        operation: {
            operationId: "getSettings",
            summary: "Get settings for current scope",
            tags: ["Settings", "System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Settings object" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },
    {
        path: "/api/settings/change-requests",
        method: "post",
        operation: {
            operationId: "createSettingsChangeRequest",
            summary: "Create a settings change request",
            tags: ["Settings", "System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Change request created" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/settings/drift-detection",
        method: "get",
        operation: {
            operationId: "getSettingsDriftDetection",
            summary: "Check for configuration drift",
            tags: ["Settings", "System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Drift detection results" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },

    // ── Automations ──────────────────────────────────────────
    {
        path: "/api/automations/execute",
        method: "post",
        operation: {
            operationId: "executeAutomation",
            summary: "Execute automation rules",
            tags: ["Automations", "System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "automations",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["trigger_type", "entity_type", "record"],
                    properties: {
                        trigger_type: { type: "string" },
                        entity_type: { type: "string" },
                        record: { type: "object", additionalProperties: true },
                    },
                }),
            },
            responses: {
                "200": {
                    description: "Automation execution results",
                    ...json({
                        type: "object",
                        properties: {
                            executed: { type: "integer" },
                            total_duration_ms: { type: "number" },
                        },
                    }),
                },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },

    // ── Advancing ────────────────────────────────────────────
    {
        path: "/api/advancing",
        method: "get",
        operation: {
            operationId: "listAdvances",
            summary: "List advance requests",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            parameters: [
                { name: "project_id", in: "query", schema: { type: "string", format: "uuid" } },
                { name: "status", in: "query", schema: { type: "string" } },
            ],
            responses: {
                "200": { description: "List of advance requests with items" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },
    {
        path: "/api/advancing",
        method: "post",
        operation: {
            operationId: "createAdvance",
            summary: "Create advance request with items",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Advance created with nested items" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/approve",
        method: "post",
        operation: {
            operationId: "approveAdvance",
            summary: "Approve advance request",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            responses: {
                "200": { description: "Advance approved" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/reject",
        method: "post",
        operation: {
            operationId: "rejectAdvance",
            summary: "Reject advance request",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            responses: {
                "200": { description: "Advance rejected" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/submit",
        method: "post",
        operation: {
            operationId: "submitAdvance",
            summary: "Submit advance for approval",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            responses: {
                "200": { description: "Advance submitted" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/cancel",
        method: "post",
        operation: {
            operationId: "cancelAdvance",
            summary: "Cancel advance request",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            responses: {
                "200": { description: "Advance cancelled" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },
    {
        path: "/api/advancing/catalog/search",
        method: "get",
        operation: {
            operationId: "searchAdvancingCatalog",
            summary: "Search advancing catalog",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            parameters: [
                { name: "q", in: "query", schema: { type: "string" }, description: "Search query" },
            ],
            responses: {
                "200": { description: "Catalog search results" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },
    {
        path: "/api/advancing/templates",
        method: "get",
        operation: {
            operationId: "listAdvancingTemplates",
            summary: "List advancing templates",
            tags: ["Advancing", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Advancing templates" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },

    // ── Approval Engine ──────────────────────────────────────
    {
        path: "/api/approval-engine/initiate",
        method: "post",
        operation: {
            operationId: "initiateApproval",
            summary: "Initiate approval workflow",
            tags: ["Approval Engine", "Governance"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "approvals",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Approval workflow initiated" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/approval-engine/decide",
        method: "post",
        operation: {
            operationId: "decideApproval",
            summary: "Approve or reject approval step",
            tags: ["Approval Engine", "Governance"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "approvals",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["instance_id", "decision"],
                    properties: {
                        instance_id: { type: "string", format: "uuid" },
                        decision: { type: "string", enum: ["approve", "reject"] },
                        comments: { type: "string" },
                    },
                }),
            },
            responses: {
                "200": { description: "Decision recorded" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/approval-engine/escalate",
        method: "post",
        operation: {
            operationId: "escalateApproval",
            summary: "Escalate approval",
            tags: ["Approval Engine", "Governance"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "approvals",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Approval escalated" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/approval-engine/cancel",
        method: "post",
        operation: {
            operationId: "cancelApproval",
            summary: "Cancel approval workflow",
            tags: ["Approval Engine", "Governance"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "approvals",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Approval cancelled" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/approval-engine/status/{instanceId}",
        method: "get",
        operation: {
            operationId: "getApprovalStatus",
            summary: "Get approval workflow status",
            tags: ["Approval Engine", "Governance"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "approvals",
            "x-rbac-action": "read",
            parameters: [
                {
                    name: "instanceId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            responses: {
                "200": { description: "Approval workflow status" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },

    // ── Tasks ────────────────────────────────────────────────
    {
        path: "/api/tasks/counts",
        method: "get",
        operation: {
            operationId: "getTaskCounts",
            summary: "Get task counts by status",
            tags: ["Tasks", "Production"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "tasks",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Task count breakdown" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },

    // ── Usernames ────────────────────────────────────────────
    {
        path: "/api/usernames/check",
        method: "post",
        operation: {
            operationId: "checkUsername",
            summary: "Check username availability",
            tags: ["Users", "System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["username"],
                    properties: { username: { type: "string" } },
                }),
            },
            responses: {
                "200": {
                    description: "Availability result",
                    ...json({
                        type: "object",
                        properties: { available: { type: "boolean" } },
                    }),
                },
                ...errorResponses("401", "422"),
            },
        },
    },
    {
        path: "/api/usernames/claim",
        method: "post",
        operation: {
            operationId: "claimUsername",
            summary: "Claim a username",
            tags: ["Users", "System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["username"],
                    properties: { username: { type: "string" } },
                }),
            },
            responses: {
                "200": { description: "Username claimed" },
                ...errorResponses("401", "422", "500"),
            },
        },
    },
    {
        path: "/api/usernames/change",
        method: "post",
        operation: {
            operationId: "changeUsername",
            summary: "Change username",
            tags: ["Users", "System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["username"],
                    properties: { username: { type: "string" } },
                }),
            },
            responses: {
                "200": { description: "Username changed" },
                ...errorResponses("401", "422", "500"),
            },
        },
    },

    // ── Messaging ────────────────────────────────────────────
    {
        path: "/api/conversations/{id}/messages",
        method: "get",
        operation: {
            operationId: "listConversationMessages",
            summary: "List messages in a conversation",
            tags: ["Messaging"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging_message",
            "x-rbac-action": "read",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
                { name: "cursor", in: "query", schema: { type: "string" } },
                { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
            ],
            responses: {
                "200": { description: "Paginated messages" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },
    {
        path: "/api/conversations/{id}/messages",
        method: "post",
        operation: {
            operationId: "sendMessage",
            summary: "Send message to conversation",
            tags: ["Messaging"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging_message",
            "x-rbac-action": "write",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["content"],
                    properties: {
                        content: { type: "string" },
                        reply_to_id: { type: "string", format: "uuid" },
                        mentions: { type: "array", items: { type: "string", format: "uuid" } },
                    },
                }),
            },
            responses: {
                "201": { description: "Message sent" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },
    {
        path: "/api/messages/search",
        method: "get",
        operation: {
            operationId: "searchMessages",
            summary: "Search messages across conversations",
            tags: ["Messaging"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging_message",
            "x-rbac-action": "read",
            parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }],
            responses: {
                "200": { description: "Search results" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },
    {
        path: "/api/conversations/{id}/export",
        method: "get",
        operation: {
            operationId: "exportConversation",
            summary: "Export conversation (CSV/JSON)",
            tags: ["Messaging"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging_export",
            "x-rbac-action": "read",
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
                { name: "format", in: "query", schema: { type: "string", enum: ["csv", "json"] } },
            ],
            responses: {
                "200": { description: "Exported conversation data" },
                ...errorResponses("401", "403", "404", "500"),
            },
        },
    },

    // ── Credentials ──────────────────────────────────────────
    {
        path: "/api/credentials/scan",
        method: "post",
        operation: {
            operationId: "scanCredential",
            summary: "Scan a credential at gate",
            tags: ["Credentialing", "Live Operations"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "credential_scans",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    required: ["credential_id", "scan_type"],
                    properties: {
                        credential_id: { type: "string" },
                        scan_type: { type: "string", enum: ["check_in", "check_out"] },
                        zone_id: { type: "string", format: "uuid" },
                    },
                }),
            },
            responses: {
                "200": { description: "Scan result" },
                ...errorResponses("401", "403", "422", "500"),
            },
        },
    },

    // ── Views ────────────────────────────────────────────────
    {
        path: "/api/v-client-invoice-aging",
        method: "get",
        operation: {
            operationId: "getClientInvoiceAging",
            summary: "Client invoice aging report (view)",
            tags: ["Finance", "Reports"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "invoices",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Aging report data" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },
    {
        path: "/api/v-sow-deliverable-summary",
        method: "get",
        operation: {
            operationId: "getSowDeliverableSummary",
            summary: "Scope of work deliverable summary (view)",
            tags: ["Production", "Reports"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "sow",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "SOW deliverable summary data" },
                ...errorResponses("401", "403", "500"),
            },
        },
    },
    // ── Advancing (sub-resources) ────────────────────────────
    {
        path: "/api/advancing/{id}",
        method: "get",
        operation: {
            operationId: "getAdvanceRequestById",
            summary: "Get advance request by ID",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Advance request details" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/items",
        method: "get",
        operation: {
            operationId: "listAdvanceRequestItems",
            summary: "List items for an advance request",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Advance request items" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/items",
        method: "post",
        operation: {
            operationId: "addAdvanceRequestItem",
            summary: "Add item to advance request",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Item added" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/items/{itemId}",
        method: "patch",
        operation: {
            operationId: "updateAdvanceRequestItem",
            summary: "Update advance request item",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
                {
                    name: "itemId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Item updated" },
                ...errorResponses("401", "403", "404", "422"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/items/{itemId}",
        method: "delete",
        operation: {
            operationId: "deleteAdvanceRequestItem",
            summary: "Remove item from advance request",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
                {
                    name: "itemId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            responses: {
                "200": { description: "Item removed" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/advancing/{id}/items/{itemId}/status",
        method: "patch",
        operation: {
            operationId: "updateAdvanceItemStatus",
            summary: "Update advance item status",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
                {
                    name: "itemId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: { status: { type: "string" } },
                    required: ["status"],
                }),
            },
            responses: {
                "200": { description: "Status updated" },
                ...errorResponses("401", "403", "404", "422"),
            },
        },
    },
    // ── Catalog ────────────────────────────────────────────────
    {
        path: "/api/catalog",
        method: "get",
        operation: {
            operationId: "listCatalogItems",
            summary: "List catalog items for advancing",
            tags: ["Advancing"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Catalog items list" },
                ...errorResponses("401", "403"),
            },
        },
    },
    {
        path: "/api/catalog/{id}",
        method: "get",
        operation: {
            operationId: "getCatalogItem",
            summary: "Get catalog item by ID",
            tags: ["Advancing"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "advancing",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Catalog item details" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    // ── Conversations (sub-resources) ──────────────────────────
    {
        path: "/api/conversations/{id}/members",
        method: "get",
        operation: {
            operationId: "listConversationMembers",
            summary: "List members of a conversation",
            tags: ["Messaging"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Conversation members" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/conversations/{id}/members",
        method: "post",
        operation: {
            operationId: "addConversationMember",
            summary: "Add member to conversation",
            tags: ["Messaging"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: { user_id: { type: "string", format: "uuid" } },
                    required: ["user_id"],
                }),
            },
            responses: {
                "201": { description: "Member added" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/conversations/{id}/members",
        method: "delete",
        operation: {
            operationId: "removeConversationMember",
            summary: "Remove member from conversation",
            tags: ["Messaging"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "write",
            responses: {
                "200": { description: "Member removed" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    // ── Credentialing ──────────────────────────────────────────
    {
        path: "/api/credentials/assign",
        method: "post",
        operation: {
            operationId: "assignCredential",
            summary: "Assign credential to person",
            tags: ["Credentialing"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "credentialing",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Credential assigned" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/credentials/bulk-import",
        method: "post",
        operation: {
            operationId: "bulkImportCredentials",
            summary: "Bulk import credentials from CSV/spreadsheet",
            tags: ["Credentialing"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "credentialing",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Import results" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/credentials/export",
        method: "get",
        operation: {
            operationId: "exportCredentials",
            summary: "Export credentials data",
            tags: ["Credentialing"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "credentialing",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Exported credential data" },
                ...errorResponses("401", "403"),
            },
        },
    },
    // ── CSV Import/Export ───────────────────────────────────────
    {
        path: "/api/csv/export",
        method: "post",
        operation: {
            operationId: "exportCsv",
            summary: "Export entity data as CSV",
            tags: ["System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: { entity: { type: "string" }, filters: { type: "object" } },
                    required: ["entity"],
                }),
            },
            responses: {
                "200": { description: "CSV file download" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/csv/import",
        method: "post",
        operation: {
            operationId: "importCsv",
            summary: "Import entity data from CSV",
            tags: ["System"],
            security: AUTH_SECURITY,
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Import results" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/csv/template/{entity}",
        method: "get",
        operation: {
            operationId: "getCsvTemplate",
            summary: "Download CSV import template for entity",
            tags: ["System"],
            parameters: [
                { name: "entity", in: "path", required: true, schema: { type: "string" } },
            ],
            security: AUTH_SECURITY,
            responses: {
                "200": { description: "CSV template file" },
                ...errorResponses("401", "404"),
            },
        },
    },
    // ── Document Templates (filesystem routes — slug differs from ENTITY_CONFIGS)
    {
        path: "/api/document-templates",
        method: "get",
        operation: {
            operationId: "listDocTemplates",
            summary: "List document templates",
            tags: ["Documents"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "documents",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Document templates list" },
                ...errorResponses("401", "403"),
            },
        },
    },
    {
        path: "/api/document-templates",
        method: "post",
        operation: {
            operationId: "createDocTemplate",
            summary: "Create document template",
            tags: ["Documents"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "documents",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Template created" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/document-templates/{id}",
        method: "get",
        operation: {
            operationId: "getDocTemplateById",
            summary: "Get document template by ID",
            tags: ["Documents"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "documents",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Document template details" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/document-templates/{id}",
        method: "patch",
        operation: {
            operationId: "updateDocTemplate",
            summary: "Update document template",
            tags: ["Documents"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "documents",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Template updated" },
                ...errorResponses("401", "403", "404", "422"),
            },
        },
    },
    // ── Events (channels sub-resource) ─────────────────────────
    {
        path: "/api/events/{id}/channels",
        method: "get",
        operation: {
            operationId: "listEventChannels",
            summary: "List channels for a live event",
            tags: ["Live Operations"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "events",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Event channels" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    // ── Fields (custom fields management) ──────────────────────
    {
        path: "/api/fields/access",
        method: "get",
        operation: {
            operationId: "getFieldAccess",
            summary: "Get field-level access rules",
            tags: ["Settings"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Field access configuration" },
                ...errorResponses("401", "403"),
            },
        },
    },
    {
        path: "/api/fields/bundles",
        method: "get",
        operation: {
            operationId: "getFieldBundles",
            summary: "Get field bundle definitions",
            tags: ["Settings"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "read",
            responses: { "200": { description: "Field bundles" }, ...errorResponses("401", "403") },
        },
    },
    {
        path: "/api/fields/usage",
        method: "get",
        operation: {
            operationId: "getFieldUsage",
            summary: "Get field usage analytics",
            tags: ["Settings"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Field usage data" },
                ...errorResponses("401", "403"),
            },
        },
    },
    // ── Integrations (sub-resources) ───────────────────────────
    {
        path: "/api/integrations/connections",
        method: "get",
        operation: {
            operationId: "listIntegrationConnections",
            summary: "List active integration connections",
            tags: ["Settings"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "integrations",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Integration connections" },
                ...errorResponses("401", "403"),
            },
        },
    },
    {
        path: "/api/integrations/sync-log",
        method: "get",
        operation: {
            operationId: "getIntegrationSyncLog",
            summary: "Get integration sync history",
            tags: ["Settings"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "integrations",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Sync log entries" },
                ...errorResponses("401", "403"),
            },
        },
    },
    // ── Invitations (sub-routes) ───────────────────────────────
    {
        path: "/api/invitations/send-email",
        method: "post",
        operation: {
            operationId: "sendInvitationEmail",
            summary: "Send invitation email to user",
            tags: ["Invitations"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "invitations",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: {
                        email: { type: "string", format: "email" },
                        role: { type: "string" },
                    },
                    required: ["email"],
                }),
            },
            responses: {
                "200": { description: "Email sent" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/invitations/{token}/accept",
        method: "post",
        operation: {
            operationId: "acceptInvitation",
            summary: "Accept a team invitation",
            tags: ["Invitations"],
            parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" } }],
            security: AUTH_SECURITY,
            "x-rbac-resource": "invitations",
            "x-rbac-action": "write",
            responses: {
                "200": { description: "Invitation accepted" },
                ...errorResponses("401", "404", "410"),
            },
        },
    },
    // ── Knowledge Base Articles (filesystem routes — slug differs from ENTITY_CONFIGS)
    {
        path: "/api/knowledge-base-articles",
        method: "get",
        operation: {
            operationId: "listKbArticles",
            summary: "List knowledge base articles",
            tags: ["Documents"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "knowledge_base",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Knowledge base articles" },
                ...errorResponses("401", "403"),
            },
        },
    },
    {
        path: "/api/knowledge-base-articles",
        method: "post",
        operation: {
            operationId: "createKbArticle",
            summary: "Create knowledge base article",
            tags: ["Documents"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "knowledge_base",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Article created" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/knowledge-base-articles/{id}",
        method: "get",
        operation: {
            operationId: "getKbArticleById",
            summary: "Get knowledge base article by ID",
            tags: ["Documents"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "knowledge_base",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Article details" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/knowledge-base-articles/{id}",
        method: "patch",
        operation: {
            operationId: "updateKbArticle",
            summary: "Update knowledge base article",
            tags: ["Documents"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "knowledge_base",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Article updated" },
                ...errorResponses("401", "403", "404", "422"),
            },
        },
    },
    // ── Messages (sub-resources) ───────────────────────────────
    {
        path: "/api/messages/entity",
        method: "get",
        operation: {
            operationId: "getEntityMessages",
            summary: "Get messages scoped to an entity",
            tags: ["Messaging"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Entity-scoped messages" },
                ...errorResponses("401", "403"),
            },
        },
    },
    {
        path: "/api/messages/{id}/pin",
        method: "post",
        operation: {
            operationId: "toggleMessagePin",
            summary: "Pin or unpin a message",
            tags: ["Messaging"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "write",
            responses: {
                "200": { description: "Pin toggled" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/messages/{id}/reactions",
        method: "post",
        operation: {
            operationId: "toggleMessageReaction",
            summary: "Toggle reaction on a message",
            tags: ["Messaging"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: { emoji: { type: "string" } },
                    required: ["emoji"],
                }),
            },
            responses: {
                "200": { description: "Reaction toggled" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/messages/{id}/read",
        method: "post",
        operation: {
            operationId: "markMessageRead",
            summary: "Mark a message as read",
            tags: ["Messaging"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "messaging",
            "x-rbac-action": "write",
            responses: {
                "200": { description: "Marked as read" },
                ...errorResponses("401", "404"),
            },
        },
    },
    // ── Notifications ──────────────────────────────────────────
    {
        path: "/api/notifications/dispatch",
        method: "post",
        operation: {
            operationId: "dispatchNotification",
            summary: "Dispatch a notification to users",
            tags: ["System"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "notifications",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Notification dispatched" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    // ── Organizations (sub-resources) ──────────────────────────
    {
        path: "/api/organizations/{id}/security",
        method: "get",
        operation: {
            operationId: "getOrganizationSecurity",
            summary: "Get organization security settings",
            tags: ["Organizations"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "organizations",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Security settings" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    // ── Settings (change request review) ───────────────────────
    {
        path: "/api/settings/change-requests/{id}/review",
        method: "post",
        operation: {
            operationId: "reviewSettingsChangeRequest",
            summary: "Review a settings change request",
            tags: ["Settings"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "settings",
            "x-rbac-action": "manage",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: {
                        action: { type: "string", enum: ["approve", "reject"] },
                        reason: { type: "string" },
                    },
                    required: ["action"],
                }),
            },
            responses: {
                "200": { description: "Change request reviewed" },
                ...errorResponses("401", "403", "404", "422"),
            },
        },
    },
    // ── Teams (sub-resources) ──────────────────────────────────
    {
        path: "/api/teams/{id}/members",
        method: "get",
        operation: {
            operationId: "listTeamMembers",
            summary: "List members of a team",
            tags: ["Organizations"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "teams",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Team members" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/teams/{id}/members",
        method: "post",
        operation: {
            operationId: "addTeamMember",
            summary: "Add member to team",
            tags: ["Organizations"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "teams",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({
                    type: "object",
                    properties: {
                        user_id: { type: "string", format: "uuid" },
                        role: { type: "string" },
                    },
                    required: ["user_id"],
                }),
            },
            responses: {
                "201": { description: "Member added" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/teams/{id}/members/{memberId}",
        method: "delete",
        operation: {
            operationId: "removeTeamMember",
            summary: "Remove member from team",
            tags: ["Organizations"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
                {
                    name: "memberId",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "teams",
            "x-rbac-action": "write",
            responses: {
                "200": { description: "Member removed" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    // ── Vehicles (filesystem routes — ENTITY_CONFIGS slug is 'fleet')
    {
        path: "/api/vehicles",
        method: "get",
        operation: {
            operationId: "listVehicleFleet",
            summary: "List vehicles",
            tags: ["Resources"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "vehicles",
            "x-rbac-action": "read",
            responses: { "200": { description: "Vehicles list" }, ...errorResponses("401", "403") },
        },
    },
    {
        path: "/api/vehicles",
        method: "post",
        operation: {
            operationId: "registerVehicle",
            summary: "Register a new vehicle",
            tags: ["Resources"],
            security: AUTH_SECURITY,
            "x-rbac-resource": "vehicles",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "201": { description: "Vehicle created" },
                ...errorResponses("401", "403", "422"),
            },
        },
    },
    {
        path: "/api/vehicles/{id}",
        method: "get",
        operation: {
            operationId: "getVehicleDetails",
            summary: "Get vehicle by ID",
            tags: ["Resources"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "vehicles",
            "x-rbac-action": "read",
            responses: {
                "200": { description: "Vehicle details" },
                ...errorResponses("401", "403", "404"),
            },
        },
    },
    {
        path: "/api/vehicles/{id}",
        method: "patch",
        operation: {
            operationId: "patchVehicle",
            summary: "Update vehicle",
            tags: ["Resources"],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string", format: "uuid" },
                },
            ],
            security: AUTH_SECURITY,
            "x-rbac-resource": "vehicles",
            "x-rbac-action": "write",
            requestBody: {
                required: true,
                ...json({ type: "object", additionalProperties: true }),
            },
            responses: {
                "200": { description: "Vehicle updated" },
                ...errorResponses("401", "403", "404", "422"),
            },
        },
    },
];

// ─── Public API ──────────────────────────────────────────────

export function getCustomRoutes(): Record<string, Record<string, unknown>> {
    const paths: Record<string, Record<string, unknown>> = {};

    for (const route of CUSTOM_ROUTES) {
        if (!paths[route.path]) {
            paths[route.path] = {};
        }
        (paths[route.path] as Record<string, unknown>)[route.method] = route.operation;
    }

    return paths;
}
