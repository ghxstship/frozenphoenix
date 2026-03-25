/* ═══════════════════════════════════════════════════════════════
   LIST PAGE CONFIG REGISTRY — Lazy Loading

   Maps string keys to ListPageConfig objects via dynamic import().
   Each domain module (crm, finance, marketing, etc.) is loaded
   on-demand as a separate webpack chunk — only the module needed
   for the current page is fetched. This eliminates the multi-
   second delay caused by eagerly bundling all 233 configs + their
   transitive dependencies (icons, create-entity configs, domain
   maps) into a single monolithic chunk.

   Consumers call resolveListPageConfig(key) which returns a
   cached Promise<ListPageConfig>.
   ═══════════════════════════════════════════════════════════════ */

import type { ListPageConfig } from "@/types/list-page-config";

// ─── Module loaders (each becomes a separate webpack chunk) ───

type ModuleLoader = () => Promise<Record<string, ListPageConfig>>;

const loadCrm: ModuleLoader = () => import("./crm") as Promise<Record<string, ListPageConfig>>;
const loadFinance: ModuleLoader = () =>
    import("./finance") as Promise<Record<string, ListPageConfig>>;
const loadMarketing: ModuleLoader = () =>
    import("./marketing") as Promise<Record<string, ListPageConfig>>;
const loadOperations: ModuleLoader = () =>
    import("./operations") as Promise<Record<string, ListPageConfig>>;
const loadPeople: ModuleLoader = () =>
    import("./people") as Promise<Record<string, ListPageConfig>>;
const loadPrimary: ModuleLoader = () =>
    import("./primary") as Promise<Record<string, ListPageConfig>>;
const loadProduction: ModuleLoader = () =>
    import("./production") as Promise<Record<string, ListPageConfig>>;
const loadProjects: ModuleLoader = () =>
    import("./projects") as Promise<Record<string, ListPageConfig>>;
const loadSystem: ModuleLoader = () =>
    import("./system") as Promise<Record<string, ListPageConfig>>;
const loadVendor: ModuleLoader = () =>
    import("./vendor") as Promise<Record<string, ListPageConfig>>;

// ─── Key → Module mapping ─────────────────────────────────────

const CONFIG_KEY_MODULE: Record<string, ModuleLoader> = {
    // crm
    CONTACTS_PAGE: loadCrm,
    GUEST_INCIDENTS_PAGE: loadCrm,
    LOST_REASONS_PAGE: loadCrm,
    TESTIMONIALS_PAGE: loadCrm,
    VIP_GUESTS_PAGE: loadCrm,
    VIP_SERVICE_REQUESTS_PAGE: loadCrm,
    ACCOUNT_HEALTH_SCORES_PAGE: loadCrm,
    UPSELL_EVENTS_PAGE: loadCrm,
    UPSELL_TRIGGERS_PAGE: loadCrm,

    // finance
    DEPRECIATION_SCHEDULES_PAGE: loadFinance,
    EXPENSE_REPORTS_PAGE: loadFinance,
    INVOICE_TEMPLATES_PAGE: loadFinance,
    PAYROLL_BATCHES_PAGE: loadFinance,
    REVENUE_SCHEDULES_PAGE: loadFinance,
    JOB_COST_ENTRIES_PAGE: loadFinance,
    BUDGET_LINE_ITEMS_PAGE: loadFinance,
    POS_TRANSACTIONS_PAGE: loadFinance,
    REVENUE_RECOGNITION_ENTRIES_PAGE: loadFinance,
    FINANCIAL_PERIODS_PAGE: loadFinance,

    // marketing
    BRANDS_PAGE: loadMarketing,
    BRIEF_TEMPLATES_PAGE: loadMarketing,
    CREATIVE_REVIEWS_PAGE: loadMarketing,
    SURVEY_TEMPLATES_PAGE: loadMarketing,
    BRAND_GUIDELINE_SECTIONS_PAGE: loadMarketing,
    BRAND_KITS_PAGE: loadMarketing,
    CAMPAIGN_ASSETS_PAGE: loadMarketing,
    CAMPAIGN_CHANNELS_PAGE: loadMarketing,
    CAMPAIGN_KPIS_PAGE: loadMarketing,
    CATALOG_CATEGORIES_PAGE: loadMarketing,
    CATALOG_ITEMS_PAGE: loadMarketing,
    SURVEY_RESPONSES_PAGE: loadMarketing,

    // operations
    BOMS_PAGE: loadOperations,
    CONSUMABLES_PAGE: loadOperations,
    INVENTORY_AUDITS_PAGE: loadOperations,
    KITS_PAGE: loadOperations,
    LOAD_PLANS_PAGE: loadOperations,
    MAINTENANCE_RECORDS_PAGE: loadOperations,
    QC_GATES_PAGE: loadOperations,
    QUALITY_CHECK_TEMPLATES_PAGE: loadOperations,
    RENTAL_AGREEMENTS_PAGE: loadOperations,
    RESOURCE_BOOKINGS_PAGE: loadOperations,
    CONSUMABLE_USAGE_PAGE: loadOperations,
    EQUIPMENT_CHECK_INS_PAGE: loadOperations,
    INVENTORY_RESERVATIONS_PAGE: loadOperations,
    LOGISTICS_EVENTS_PAGE: loadOperations,
    MAINTENANCE_SCHEDULES_PAGE: loadOperations,
    TRANSFER_ORDERS_PAGE: loadOperations,

    // people
    CREDENTIAL_TYPES_PAGE: loadPeople,
    GOALS_PAGE: loadPeople,
    REVIEW_CYCLES_PAGE: loadPeople,
    REVIEWS_PAGE: loadPeople,
    TIME_OFF_REQUESTS_PAGE: loadPeople,
    TIMESHEETS_PAGE: loadPeople,
    WORKER_OFFBOARDING_RUNS_PAGE: loadPeople,
    WORKER_ONBOARDING_RUNS_PAGE: loadPeople,
    CERTIFICATIONS_PAGE: loadPeople,
    CREDENTIAL_ASSIGNMENTS_PAGE: loadPeople,
    CREDENTIAL_INVENTORY_POOLS_PAGE: loadPeople,
    CREW_AVAILABILITY_PAGE: loadPeople,
    CREW_SHIFTS_PAGE: loadPeople,
    LIVE_CREW_ASSIGNMENTS_PAGE: loadPeople,
    SCHEDULE_ENTRIES_PAGE: loadPeople,
    SHIFTS_PAGE: loadPeople,
    TEAM_MEMBERS_PAGE: loadPeople,
    TIME_ENTRIES_PAGE: loadPeople,
    TIME_TRACKING_POLICIES_PAGE: loadPeople,
    WORKER_CLASSIFICATIONS_PAGE: loadPeople,
    WORKER_COMPLIANCE_DOCS_PAGE: loadPeople,
    WORKER_PROFILES_PAGE: loadPeople,
    WORKER_REVIEWS_PAGE: loadPeople,

    // primary
    DEALS_PAGE: loadPrimary,
    OPPORTUNITIES_PAGE: loadPrimary,
    COMPANIES_PAGE: loadPrimary,
    INVOICES_PAGE: loadPrimary,
    CLIENT_INVOICES_PAGE: loadPrimary,
    RECURRING_INVOICES_PAGE: loadPrimary,
    EXPENSES_PAGE: loadPrimary,
    PAYMENTS_PAGE: loadPrimary,
    CREDIT_NOTES_PAGE: loadPrimary,
    GL_ACCOUNTS_PAGE: loadPrimary,
    BUDGETS_PAGE: loadPrimary,
    BUDGET_APPROVALS_PAGE: loadPrimary,
    PAYMENT_APPROVALS_PAGE: loadPrimary,
    GOODS_RECEIPTS_PAGE: loadPrimary,
    CAMPAIGNS_PAGE: loadPrimary,
    BRIEFS_PAGE: loadPrimary,
    CASE_STUDIES_PAGE: loadPrimary,
    DIGITAL_ASSETS_PAGE: loadPrimary,
    CREATIVE_ASSETS_PAGE: loadPrimary,
    DECKS_PAGE: loadPrimary,
    CONTRACTS_PAGE: loadPrimary,
    CLAUSE_LIBRARY_PAGE: loadPrimary,
    SCOPES_OF_WORK_PAGE: loadPrimary,
    CHANGE_ORDERS_PAGE: loadPrimary,
    PROPOSALS_PAGE: loadPrimary,
    ESTIMATES_PAGE: loadPrimary,
    CALL_SHEETS_PAGE: loadPrimary,
    CHECKLISTS_PAGE: loadPrimary,
    COMPLIANCE_CHECKLISTS_PAGE: loadPrimary,
    DISPATCH_PAGE: loadPrimary,
    FLEET_PAGE: loadPrimary,
    WAREHOUSES_PAGE: loadPrimary,
    INVENTORY_PAGE: loadPrimary,
    LOCATIONS_PAGE: loadPrimary,
    SERVICE_REQUESTS_PAGE: loadPrimary,
    WORK_ORDERS_PAGE: loadPrimary,
    INCIDENTS_PAGE: loadPrimary,
    INSURANCE_POLICIES_PAGE: loadPrimary,
    PERMITS_PAGE: loadPrimary,
    PURCHASE_ORDERS_PAGE: loadPrimary,
    PURCHASE_REQUISITIONS_PAGE: loadPrimary,
    PEOPLE_PAGE: loadPrimary,
    TEAMS_PAGE: loadPrimary,
    WORKFORCE_PAGE: loadPrimary,
    DOCUMENTS_PAGE: loadPrimary,
    KNOWLEDGE_BASE_PAGE: loadPrimary,
    SOPS_PAGE: loadPrimary,
    TEMPLATES_PAGE: loadPrimary,
    TECH_SHEETS_PAGE: loadPrimary,
    RATE_CARDS_PAGE: loadPrimary,
    SAVED_VIEWS_PAGE: loadPrimary,
    EVENTS_PAGE: loadPrimary,
    IP_RIGHTS_PAGE: loadPrimary,
    INTEGRATIONS_PAGE: loadPrimary,
    ENGINEERING_APPROVALS_PAGE: loadPrimary,
    QUALITY_CHECKS_PAGE: loadPrimary,
    VENDOR_REVIEWS_PAGE: loadPrimary,
    ACCOUNTS_PAGE: loadPrimary,
    PIPELINE_PAGE: loadPrimary,
    FEATURE_FLAGS_PAGE: loadPrimary,
    VENDOR_RISK_PAGE: loadPrimary,
    VENDOR_ONBOARDING_PAGE: loadPrimary,
    ACTIVATIONS_PAGE: loadPrimary,
    ASSETS_PAGE: loadPrimary,
    CREDENTIALS_PAGE: loadPrimary,
    CREW_PAGE: loadPrimary,
    LEADS_PAGE: loadPrimary,
    PROJECTS_PAGE: loadPrimary,
    PROCUREMENT_PAGE: loadPrimary,
    SHIPMENTS_PAGE: loadPrimary,
    SURVEYS_PAGE: loadPrimary,
    TASKS_PAGE: loadPrimary,
    VENDORS_PAGE: loadPrimary,
    ROLES_PAGE: loadPrimary,
    APPROVALS_PAGE: loadPrimary,

    // production
    ADVANCE_TEMPLATES_PAGE: loadProduction,
    FOH_ZONES_PAGE: loadProduction,
    POST_EVENT_REPORTS_PAGE: loadProduction,
    PRODUCTION_ADVANCES_PAGE: loadProduction,
    PRODUCTION_CHECKLISTS_PAGE: loadProduction,
    PRODUCTION_EXPENSES_PAGE: loadProduction,
    PRODUCTION_RUNS_PAGE: loadProduction,
    PRODUCTION_SOPS_PAGE: loadProduction,
    PRODUCTION_VERTICALS_PAGE: loadProduction,
    SPACE_BOOKINGS_PAGE: loadProduction,
    STRIKE_SEQUENCES_PAGE: loadProduction,
    TECHNICAL_SPECS_PAGE: loadProduction,
    COMMAND_POSITIONS_PAGE: loadProduction,
    ENVIRONMENTAL_READINGS_PAGE: loadProduction,
    FOH_ZONE_READINGS_PAGE: loadProduction,
    LIVE_EVENT_INSTANCES_PAGE: loadProduction,
    LIVE_FINANCIAL_SNAPSHOTS_PAGE: loadProduction,
    PRODUCTION_ADVANCE_ITEMS_PAGE: loadProduction,
    PRODUCTION_BUDGET_LINES_PAGE: loadProduction,
    PRODUCTION_MILESTONES_PAGE: loadProduction,
    PRODUCTION_TASKS_PAGE: loadProduction,
    PRODUCTION_TIME_ENTRIES_PAGE: loadProduction,
    READINESS_GATES_PAGE: loadProduction,
    ROS_CUES_PAGE: loadProduction,

    // projects
    CHECKLIST_TEMPLATES_PAGE: loadProjects,
    PROJECT_TEMPLATES_PAGE: loadProjects,
    STAKEHOLDERS_PAGE: loadProjects,
    WORK_PACKAGES_PAGE: loadProjects,
    MILESTONES_PAGE: loadProjects,
    PROJECT_ASSIGNMENTS_PAGE: loadProjects,
    STAKEHOLDER_PROJECTS_PAGE: loadProjects,

    // system
    AUTOMATION_RULES_PAGE: loadSystem,
    CUSTOM_FIELD_DEFINITIONS_PAGE: loadSystem,
    DATA_EXPORT_REQUESTS_PAGE: loadSystem,
    INVITATIONS_PAGE: loadSystem,
    PROVIDER_CONNECTIONS_PAGE: loadSystem,
    REPORT_DEFINITIONS_PAGE: loadSystem,
    RESILIENCE_TARGETS_PAGE: loadSystem,
    SLA_DEFINITIONS_PAGE: loadSystem,
    TEMPORARY_ACCESS_GRANTS_PAGE: loadSystem,
    VAULT_DOCUMENTS_PAGE: loadSystem,
    WORKFLOWS_PAGE: loadSystem,
    ACCESS_AUDIT_LOG_PAGE: loadSystem,
    ACTIVITIES_PAGE: loadSystem,
    ACTIVITY_LOG_PAGE: loadSystem,
    ADVANCE_STATUS_HISTORY_PAGE: loadSystem,
    APPROVAL_STEPS_PAGE: loadSystem,
    APPROVAL_WORKFLOWS_PAGE: loadSystem,
    ASSET_ASSIGNMENTS_PAGE: loadSystem,
    ASSET_TAGS_PAGE: loadSystem,
    ASSET_VERSIONS_PAGE: loadSystem,
    AUTOMATION_EXECUTIONS_PAGE: loadSystem,
    AUTOMATION_LOGS_PAGE: loadSystem,
    CALENDAR_EVENTS_PAGE: loadSystem,
    CHANNEL_TEMPLATES_PAGE: loadSystem,
    COMM_CHANNELS_PAGE: loadSystem,
    COMMENTS_PAGE: loadSystem,
    CONVERSATIONS_PAGE: loadSystem,
    CUSTOM_FIELDS_PAGE: loadSystem,
    DASHBOARD_WIDGETS_PAGE: loadSystem,
    DOCUMENT_VERSIONS_PAGE: loadSystem,
    DOMAIN_EVENTS_PAGE: loadSystem,
    EMAIL_MESSAGES_PAGE: loadSystem,
    KNOWLEDGE_ARTICLES_PAGE: loadSystem,
    LOGIN_AUDIT_LOG_PAGE: loadSystem,
    NOTIFICATIONS_PAGE: loadSystem,
    ORGANIZATIONS_PAGE: loadSystem,
    PROFILES_PAGE: loadSystem,
    ROLE_CHANGE_LOG_PAGE: loadSystem,
    SCAN_EVENTS_PAGE: loadSystem,
    SERVICE_HEALTH_CHECKS_PAGE: loadSystem,
    SLA_POLICIES_PAGE: loadSystem,
    SLA_TRACKING_PAGE: loadSystem,
    STORAGE_OBJECTS_PAGE: loadSystem,
    SYNC_EVENTS_PAGE: loadSystem,
    USER_MANAGEMENT_PAGE: loadSystem,
    TAGS_PAGE: loadSystem,

    // vendor
    COMPLIANCE_REQUIREMENTS_PAGE: loadVendor,
    COMPLIANCE_TEMPLATES_PAGE: loadVendor,
    CONTRACT_AMENDMENTS_PAGE: loadVendor,
    CONTRACT_OBLIGATIONS_PAGE: loadVendor,
    E_SIGNATURES_PAGE: loadVendor,
    ENGAGEMENT_TERMS_PAGE: loadVendor,
    INSURANCE_REQUIREMENTS_PAGE: loadVendor,
    LEGAL_HOLDS_PAGE: loadVendor,
    RFQS_PAGE: loadVendor,
    RIGHTS_PAGE: loadVendor,
    RISK_ASSESSMENTS_PAGE: loadVendor,
    VENDOR_COMMUNICATIONS_PAGE: loadVendor,
    VENDOR_COMPLIANCE_DOCUMENTS_PAGE: loadVendor,
};

// ─── All valid config keys (type-safe) ────────────────────────

export type ListPageConfigKey = keyof typeof CONFIG_KEY_MODULE;

// ─── Resolved config cache ────────────────────────────────────

const configCache = new Map<string, ListPageConfig>();

/**
 * Lazily resolve a ListPageConfig by key.
 * Loads only the source module chunk for that key (not all 233 configs).
 * Result is cached in-memory — subsequent calls for the same key are synchronous.
 */
export async function resolveListPageConfig(key: string): Promise<ListPageConfig> {
    const cached = configCache.get(key);
    if (cached) return cached;

    const loader = CONFIG_KEY_MODULE[key];
    if (!loader) {
        throw new Error(
            `resolveListPageConfig: unknown key "${key}". ` +
                `Valid keys: ${Object.keys(CONFIG_KEY_MODULE).join(", ")}`
        );
    }

    const mod = await loader();
    const config = mod[key];
    if (!config) {
        throw new Error(
            `resolveListPageConfig: key "${key}" not found in loaded module. ` +
                `Available exports: ${Object.keys(mod).join(", ")}`
        );
    }

    configCache.set(key, config);
    return config;
}

/**
 * Synchronously retrieve a previously-resolved config.
 * Returns undefined if the config hasn't been loaded yet.
 */
export function getResolvedConfig(key: string): ListPageConfig | undefined {
    return configCache.get(key);
}

// ─── Idle-time prefetch ──────────────────────────────────────

/**
 * Unique module loaders — deduplicated set of the 10 domain chunk loaders.
 * Used by prefetchAllConfigs to load every chunk without duplicating work.
 */
const UNIQUE_LOADERS: ModuleLoader[] = [
    loadCrm,
    loadFinance,
    loadMarketing,
    loadOperations,
    loadPeople,
    loadPrimary,
    loadProduction,
    loadProjects,
    loadSystem,
    loadVendor,
];

let prefetchStarted = false;

/**
 * Prefetch all config domain chunks during browser idle time.
 *
 * Call once after the first config resolves. Uses requestIdleCallback
 * (with setTimeout fallback) to avoid blocking interaction. Each chunk
 * is loaded sequentially with a small yield between chunks so the main
 * thread stays responsive. All resolved configs are cached, making
 * every subsequent page navigation instant (zero async wait).
 */
export function prefetchAllConfigs(): void {
    if (prefetchStarted) return;
    if (typeof window === "undefined") return;
    prefetchStarted = true;

    const schedule =
        typeof requestIdleCallback === "function"
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 50);

    schedule(async () => {
        for (const loader of UNIQUE_LOADERS) {
            try {
                const mod = await loader();
                // Cache every exported config from this module
                for (const [exportName, config] of Object.entries(mod)) {
                    if (exportName in CONFIG_KEY_MODULE && !configCache.has(exportName)) {
                        configCache.set(exportName, config);
                    }
                }
            } catch {
                // Non-critical — individual chunks will load on demand if prefetch fails
            }
            // Yield between chunks so we don't monopolize the main thread
            await new Promise((r) => setTimeout(r, 0));
        }
    });
}
