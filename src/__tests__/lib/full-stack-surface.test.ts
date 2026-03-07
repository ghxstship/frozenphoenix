/**
 * Full-Stack Surface Area Validation
 *
 * Verifies that every API route, Edge Function, and DB migration
 * referenced in the Workstream & Workflow Inventory actually exists.
 * This is a structural integrity test — not a functional test.
 */

import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import { join } from "path";

// process.cwd() is the project root when vitest runs
const ROOT = process.cwd();

function fileExists(relativePath: string): boolean {
    return existsSync(join(ROOT, relativePath));
}

// ═══════════════════════════════════════════════════════════════
// API ROUTES — Every route.ts file must exist
// ═══════════════════════════════════════════════════════════════

describe("API Route Surface Area", () => {
    const API_ROUTES = [
        // WS-02: Production Lifecycle
        "src/app/api/projects/route.ts",
        "src/app/api/projects/[id]/route.ts",
        "src/app/api/tasks/route.ts",
        "src/app/api/tasks/[id]/route.ts",
        "src/app/api/contracts/route.ts",
        "src/app/api/contracts/[id]/route.ts",

        // WS-03: Approval & Governance
        "src/app/api/approval-engine/initiate/route.ts",
        "src/app/api/approval-engine/decide/route.ts",
        "src/app/api/approval-engine/escalate/route.ts",
        "src/app/api/approval-engine/cancel/route.ts",
        "src/app/api/approval-engine/status/[instanceId]/route.ts",
        "src/app/api/advancing/route.ts",
        "src/app/api/advancing/[id]/route.ts",
        "src/app/api/advancing/[id]/approve/route.ts",
        "src/app/api/advancing/[id]/reject/route.ts",
        "src/app/api/advancing/[id]/submit/route.ts",
        "src/app/api/advancing/[id]/cancel/route.ts",
        "src/app/api/advancing/[id]/items/route.ts",
        "src/app/api/advancing/[id]/items/[itemId]/route.ts",
        "src/app/api/advancing/[id]/items/[itemId]/status/route.ts",
        "src/app/api/advancing/templates/route.ts",
        "src/app/api/advancing/catalog/search/route.ts",

        // WS-04: Finance & Billing
        "src/app/api/invoices/route.ts",
        "src/app/api/invoices/[id]/route.ts",
        "src/app/api/vendors/route.ts",
        "src/app/api/vendors/[id]/route.ts",

        // WS-08: Messaging & Comms
        "src/app/api/conversations/route.ts",
        "src/app/api/conversations/[id]/route.ts",
        "src/app/api/conversations/[id]/messages/route.ts",
        "src/app/api/conversations/[id]/members/route.ts",
        "src/app/api/conversations/[id]/export/route.ts",
        "src/app/api/messages/[id]/route.ts",
        "src/app/api/messages/[id]/pin/route.ts",
        "src/app/api/messages/[id]/reactions/route.ts",
        "src/app/api/messages/[id]/read/route.ts",
        "src/app/api/messages/entity/route.ts",
        "src/app/api/messages/search/route.ts",
        "src/app/api/notifications/dispatch/route.ts",

        // WS-09: Live Event Ops
        "src/app/api/events/[id]/channels/route.ts",

        // WS-10: Integrations & Sync
        "src/app/api/integrations/connections/route.ts",
        "src/app/api/integrations/sync-log/route.ts",
        "src/app/api/credentials/assign/route.ts",
        "src/app/api/credentials/bulk-import/route.ts",
        "src/app/api/credentials/export/route.ts",
        "src/app/api/credentials/scan/route.ts",
        "src/app/api/catalog/route.ts",
        "src/app/api/catalog/[id]/route.ts",

        // WS-11: Creative & Documents
        "src/app/api/docs/route.ts",

        // WS-13: Auth Identity & Onboarding
        "src/app/api/auth/session/route.ts",
        "src/app/api/auth/reset-password/route.ts",
        "src/app/api/auth/log-event/route.ts",
        "src/app/api/auth/validate-password/route.ts",
        "src/app/api/invitations/route.ts",
        "src/app/api/invitations/[token]/accept/route.ts",
        "src/app/api/invitations/send-email/route.ts",
        "src/app/api/onboarding/progress/route.ts",
        "src/app/api/organizations/route.ts",
        "src/app/api/organizations/[id]/security/route.ts",
        "src/app/api/usernames/check/route.ts",
        "src/app/api/usernames/claim/route.ts",
        "src/app/api/usernames/change/route.ts",

        // WS-14: Settings RBAC & Admin
        "src/app/api/settings/change-requests/route.ts",
        "src/app/api/settings/change-requests/[id]/review/route.ts",
        "src/app/api/settings/drift-detection/route.ts",
        "src/app/api/fields/access/route.ts",
        "src/app/api/fields/bundles/route.ts",
        "src/app/api/fields/usage/route.ts",

        // WS-15: Automation Engine
        "src/app/api/automations/execute/route.ts",

        // WS-16: Quality & Deployment
        "src/app/api/health/route.ts",
    ];

    it.each(API_ROUTES)("API route exists: %s", (route) => {
        expect(fileExists(route), `Missing API route: ${route}`).toBe(true);
    });

    it(`has ${API_ROUTES.length} expected API routes`, () => {
        const existing = API_ROUTES.filter(fileExists);
        expect(existing.length).toBe(API_ROUTES.length);
    });
});

// ═══════════════════════════════════════════════════════════════
// SUPABASE EDGE FUNCTIONS — Each function directory must exist
// ═══════════════════════════════════════════════════════════════

describe("Edge Function Surface Area", () => {
    const EDGE_FUNCTIONS = [
        "supabase/functions/archive-event-channels",
        "supabase/functions/cue-to-channel",
        "supabase/functions/entity-status-to-channel",
        "supabase/functions/escalation-engine",
        "supabase/functions/incident-to-thread",
        "supabase/functions/send-scheduled-messages",
        "supabase/functions/sync-outbound",
        "supabase/functions/sync-pos-aggregate",
        "supabase/functions/webhook-eventbrite",
        "supabase/functions/webhook-square",
    ];

    it.each(EDGE_FUNCTIONS)("Edge function exists: %s", (fn) => {
        expect(fileExists(fn), `Missing Edge function: ${fn}`).toBe(true);
    });

    it("has 10 Edge Functions", () => {
        expect(EDGE_FUNCTIONS.filter(fileExists).length).toBe(10);
    });

    it("shared utilities exist", () => {
        expect(fileExists("supabase/functions/_shared")).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// DB MIGRATIONS — All 43 migrations must exist
// ═══════════════════════════════════════════════════════════════

describe("DB Migration Surface Area", () => {
    const MIGRATIONS = [
        "001_initial_schema.sql",
        "002_extended_schema.sql",
        "003_production_lifecycle.sql",
        "004_crm_public.sql",
        "005_productive_features.sql",
        "006_workflow_documents.sql",
        "007_sow_lifecycle.sql",
        "008_vendor_contractor_lifecycle.sql",
        "009_scenario_builder.sql",
        "010_service_requests.sql",
        "011_unified_workforce.sql",
        "012_production_consolidation.sql",
        "013_crm_revenue_pipeline.sql",
        "014_digital_asset_lifecycle.sql",
        "015_creative_brand_campaign.sql",
        "016_legal_compliance_finance_procurement.sql",
        "017_location_spatial_hierarchy.sql",
        "018_user_lifecycle_identity.sql",
        "019_asset_inventory_logistics_warehousing.sql",
        "020_live_event_operations.sql",
        "021_integrated_production_lifecycle.sql",
        "022_audit_remediation.sql",
        "023_fix_handle_new_user_trigger.sql",
        "024_harden_handle_new_user.sql",
        "025_seed_defaults_and_onboarding.sql",
        "026_settings_framework.sql",
        "027_feature_flags.sql",
        "028_rbac_custom_roles.sql",
        "029_role_based_rls.sql",
        "030_data_retention_policy.sql",
        "031_field_level_rbac_pricing.sql",
        "032_extend_login_event_type_enum.sql",
        "033_competitive_feature_gaps.sql",
        "034_v2_feature_gaps.sql",
        "035_settings_approval_workflow.sql",
        "036_extend_organizations.sql",
        "037_create_org_bootstrap_fn.sql",
        "038_rbac_6tier_expansion.sql",
        "039_usernames_handles.sql",
        "040_fix_auth_user_fk_cascades.sql",
        "041_fix_org_memberships_rls_recursion.sql",
        "042_fix_remaining_rls_and_trigger.sql",
        "043_fix_trigger_search_path.sql",
    ];

    it.each(MIGRATIONS)("Migration exists: %s", (name) => {
        expect(fileExists(`supabase/migrations/${name}`), `Missing migration: ${name}`).toBe(true);
    });

    it("has 43 migrations total", () => {
        expect(MIGRATIONS.length).toBe(43);
        const existing = MIGRATIONS.filter((m) => fileExists(`supabase/migrations/${m}`));
        expect(existing.length).toBe(43);
    });
});

// ═══════════════════════════════════════════════════════════════
// CORE LIB MODULES — Critical libraries must exist
// ═══════════════════════════════════════════════════════════════

describe("Core Library Surface Area", () => {
    const CORE_LIBS = [
        "src/lib/state-machine.ts",
        "src/lib/state-machines/index.ts",
        "src/lib/state-machines/registry.ts",
        "src/lib/approval-engine.ts",
        "src/lib/auth-utils.ts",
        "src/lib/supabase/hooks.ts",
        "src/lib/supabase/middleware.ts",
        "src/lib/supabase/realtime.ts",
        "src/lib/supabase/storage.ts",
        "src/lib/supabase/auth-actions.ts",
        "src/lib/supabase/hooks-extended.ts",
        "src/lib/supabase/auth-context.tsx",
        "src/config/rbac.ts",
        "src/config/navigation.ts",
        "src/config/domain-config.ts",
        "quality-gate.config.ts",
        "middleware.ts",
    ];

    it.each(CORE_LIBS)("Core lib exists: %s", (lib) => {
        expect(fileExists(lib), `Missing core library: ${lib}`).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════
// STATE MACHINES — All 27 machine files must exist
// ═══════════════════════════════════════════════════════════════

describe("State Machine File Surface Area", () => {
    const MACHINES = [
        "project",
        "task",
        "deal",
        "contract",
        "invoice",
        "sow",
        "expense",
        "vendor",
        "work-order",
        "asset",
        "shipment",
        "opportunity",
        "change-order",
        "service-request",
        "purchase-order",
        "milestone",
        "crew-shift",
        "time-entry",
        "live-event",
        "ros-cue",
        "readiness-gate",
        "document",
        "incident",
        "approval-instance",
        "estimate",
        "rental-agreement",
        "rights",
    ];

    it.each(MACHINES)("State machine file exists: %s.ts", (name) => {
        expect(
            fileExists(`src/lib/state-machines/${name}.ts`),
            `Missing state machine: ${name}.ts`
        ).toBe(true);
    });

    it("has 27 state machine files", () => {
        expect(MACHINES.length).toBe(27);
    });
});
