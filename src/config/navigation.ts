import {
    AlertTriangle,
    ArrowLeftRight,
    ArrowRightLeft,
    Award,
    BadgeCheck,
    Banknote,
    BarChart3,
    BarChartHorizontal,
    Blocks,
    BookLock,
    BookOpen,
    Boxes,
    Brain,
    Brush,
    Building2,
    Calculator,
    Calendar,
    CalendarDays,
    Car,
    CheckSquare,
    CircleDollarSign,
    ClipboardCheck,
    ClipboardList,
    ClipboardMinus,
    ClipboardPenLine,
    ContactRound,
    Cpu,
    CreditCard,
    Crown,
    DollarSign,
    Download,
    Drama,
    FileBadge,
    FileBarChart,
    FileCheck,
    FilePenLine,
    FileSignature,
    FileSpreadsheet,
    Filter,
    Fingerprint,
    FlaskConical,
    FolderKanban,
    FolderOpen,
    GanttChart,
    Gauge,
    GitBranch,
    Handshake,
    HardDriveDownload,
    HardHat,
    HeartPulse,
    ImagePlus,
    Inbox,
    KeyRound,
    Landmark,
    Layers,
    LayoutDashboard,
    LayoutList,
    LayoutTemplate,
    Link2,
    ListChecks,
    Lock,
    Mail,
    MapPin,
    Megaphone,
    MessageSquareQuote,
    Navigation,
    Package,
    Palette,
    Palmtree,
    PenTool,
    PiggyBank,
    Presentation,
    QrCode,
    Radio,
    Receipt,
    ReceiptText,
    RefreshCw,
    Repeat,
    Scale,
    ScanBarcode,
    ScrollText,
    SearchCheck,
    Send,
    Settings,
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    ShoppingCart,
    Sparkles,
    Star,
    Store,
    SwatchBook,
    Target,
    Thermometer,
    Ticket,
    Timer,
    TrendingUp,
    Truck,
    UserCircle,
    UserPlus,
    Users,
    UsersRound,
    WalletCards,
    Warehouse,
    Workflow,
    Wrench,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasPermission } from "@/config/rbac";
import { isTierAtLeast, type PricingTier } from "@/config/tier-entitlements";
import type { PermissionLevel } from "@/types";

export interface NavItem {
    title: string;
    path: string;
    icon: LucideIcon;
    badge?: string | number;
    permission?: string;
    /** Minimum pricing tier required to see this item. Omit = visible on all tiers. */
    minTier?: PricingTier;
    children?: NavItem[];
}

export interface NavSection {
    title: string;
    items: NavItem[];
    defaultExpanded?: boolean;
    /** Section only appears when a live event is in-progress */
    contextual?: "live-ops";
}

// ─── Helper: flatten all NavItems (including children) from the config ───
export function flattenNavItems(sections: NavSection[]): NavItem[] {
    const result: NavItem[] = [];
    for (const section of sections) {
        for (const item of section.items) {
            result.push(item);
            if (item.children) {
                for (const child of item.children) {
                    result.push(child);
                }
            }
        }
    }
    return result;
}

export interface NavigationVisibilityOptions {
    includeContextual?: boolean;
    contextualVisibility?: Partial<Record<NonNullable<NavSection["contextual"]>, boolean>>;
    /** Current org pricing tier — items with minTier above this are hidden */
    currentTier?: PricingTier;
}

function isItemPermitted(item: NavItem, role: PermissionLevel | undefined): boolean {
    if (!role) return false;
    if (role === "exec") return true;
    if (!item.permission) return true;

    const parts = item.permission.split(".");
    const resource = parts[0] ?? "";
    const action = parts[1] as "read" | "write" | "delete" | "manage" | undefined;
    return hasPermission(role, resource, action ?? "read");
}

function isItemTierAllowed(item: NavItem, currentTier: PricingTier | undefined): boolean {
    if (!item.minTier) return true;
    if (!currentTier) return true;
    return isTierAtLeast(currentTier, item.minTier);
}

function filterItems(
    items: NavItem[],
    role: PermissionLevel | undefined,
    currentTier: PricingTier | undefined
): NavItem[] {
    return items
        .filter((item) => isItemPermitted(item, role) && isItemTierAllowed(item, currentTier))
        .map((item) => {
            if (!item.children || item.children.length === 0) {
                return item;
            }

            return {
                ...item,
                children: filterItems(item.children, role, currentTier),
            };
        });
}

function isContextualSectionVisible(
    section: NavSection,
    options?: NavigationVisibilityOptions
): boolean {
    if (!section.contextual) return true;
    if (options?.includeContextual) return true;
    return Boolean(options?.contextualVisibility?.[section.contextual]);
}

export function getNavigationSectionsForRole(
    role: PermissionLevel | undefined,
    options?: NavigationVisibilityOptions,
    sections: NavSection[] = navigationConfig
): NavSection[] {
    return sections
        .filter((section) => isContextualSectionVisible(section, options))
        .map((section) => ({
            ...section,
            items: filterItems(section.items, role, options?.currentTier),
        }))
        .filter((section) => section.items.length > 0);
}

// ═══════════════════════════════════════════════════════════════════════
// INFORMATION ARCHITECTURE v3
//
// Design principles:
//   1. Tier 1 (always visible): Universal anchors — Dashboard, Calendar
//   2. Tier 2 (primary domains): 8 groups aligned to user mental models
//   3. Tier 3 (governance/admin): Collapsed by default, bottom of nav
//   4. Contextual: Live Ops appears only when event is in-progress
//   5. Two-level nesting via children[] for large sections
//   6. Every item has a unique icon — no duplicates in collapsed view
//   7. RBAC filtering removes inaccessible items (enforced in sidebar)
//
// Sections: 12 (+ 1 contextual)
// Max visible top-level items per section: 7 (Miller's Law)
// ═══════════════════════════════════════════════════════════════════════

export const navigationConfig: NavSection[] = [
    // ── Tier 1: Always Visible ──
    {
        title: "Home",
        defaultExpanded: true,
        items: [
            {
                title: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
                permission: "dashboard.read",
            },
            {
                title: "Tasks",
                path: "/home/tasks",
                icon: CheckSquare,
                permission: "tasks.read",
            },
            {
                title: "Documents",
                path: "/home/documents",
                icon: FileCheck,
                permission: "documents.read",
            },
            {
                title: "Calendar",
                path: "/calendar",
                icon: CalendarDays,
                permission: "calendar.read",
            },
            {
                title: "Messages",
                path: "/messages",
                icon: Mail,
                permission: "messaging_dm.read",
            },
            {
                title: "Insights",
                path: "/reports",
                icon: BarChart3,
                permission: "reports.read",
                children: [
                    {
                        title: "Forecasting",
                        path: "/forecasting",
                        icon: TrendingUp,
                        permission: "forecasting.read",
                    },
                    {
                        title: "Scenarios",
                        path: "/scenarios",
                        icon: FlaskConical,
                        permission: "scenarios.read",
                    },
                    {
                        title: "AI Reports",
                        path: "/reports/ai",
                        icon: Brain,
                        permission: "reports.read",
                    },
                    {
                        title: "Saved Views",
                        path: "/saved-views",
                        icon: LayoutList,
                        permission: "saved_views.read",
                    },
                    {
                        title: "Custom Dashboards",
                        path: "/dashboards",
                        icon: GanttChart,
                        permission: "dashboards.read",
                    },
                ],
            },
        ],
    },

    // ── Tier 2: Primary Domains ──
    {
        title: "Business",
        defaultExpanded: true,
        items: [
            { title: "Pipeline", path: "/pipeline", icon: Filter, permission: "pipeline.read" },
            { title: "Leads", path: "/leads", icon: UserPlus, permission: "leads.read" },
            {
                title: "Opportunities",
                path: "/opportunities",
                icon: Target,
                permission: "opportunities.read",
            },
            { title: "Accounts", path: "/accounts", icon: Building2, permission: "accounts.read" },
            {
                title: "Contacts",
                path: "/companies",
                icon: ContactRound,
                permission: "people.read",
            },
            {
                title: "Deals",
                path: "/deals",
                icon: Handshake,
                permission: "deals.read",
                children: [
                    {
                        title: "Proposals",
                        path: "/proposals",
                        icon: FilePenLine,
                        permission: "proposals.read",
                    },
                    {
                        title: "Estimates",
                        path: "/estimates",
                        icon: FileSignature,
                        permission: "estimates.read",
                    },
                    {
                        title: "Change Orders",
                        path: "/change-orders",
                        icon: ArrowRightLeft,
                        permission: "change_orders.read",
                    },
                ],
            },
        ],
    },
    {
        title: "Marketing",
        defaultExpanded: false,
        items: [
            {
                title: "Campaigns",
                path: "/campaigns",
                icon: Megaphone,
                permission: "campaigns.read",
            },
            {
                title: "Case Studies",
                path: "/case-studies",
                icon: Award,
                permission: "case_studies.read",
            },
            {
                title: "Surveys",
                path: "/surveys",
                icon: ClipboardPenLine,
                permission: "surveys.read",
            },
            {
                title: "Testimonials",
                path: "/testimonials",
                icon: MessageSquareQuote,
                permission: "case_studies.read",
            },
        ],
    },
    {
        title: "Production",
        defaultExpanded: true,
        items: [
            {
                title: "Projects",
                path: "/projects",
                icon: FolderKanban,
                permission: "projects.read",
            },
            { title: "Events", path: "/events", icon: Calendar, permission: "events.read" },
            {
                title: "Activations",
                path: "/activations",
                icon: Sparkles,
                permission: "activations.read",
            },
            { title: "Tasks", path: "/tasks", icon: CheckSquare, permission: "tasks.read" },
            {
                title: "Scopes of Work",
                path: "/scopes-of-work",
                icon: ScrollText,
                permission: "sow.read",
            },
            {
                title: "Schedule",
                path: "/scheduling",
                icon: GanttChart,
                permission: "schedule.read",
            },
            { title: "Locations", path: "/locations", icon: MapPin, permission: "locations.read" },
            {
                title: "Advancing",
                path: "/advancing",
                icon: ShoppingCart,
                permission: "advancing.read",
                children: [
                    {
                        title: "New Advance",
                        path: "/advancing/new",
                        icon: Package,
                        permission: "advancing.write",
                    },
                    {
                        title: "Approval Queue",
                        path: "/advancing/queue",
                        icon: ClipboardCheck,
                        permission: "advancing.manage",
                    },
                    {
                        title: "Fulfillment",
                        path: "/advancing/fulfillment",
                        icon: Truck,
                        permission: "advancing.manage",
                    },
                    {
                        title: "Catalog",
                        path: "/advancing/catalog",
                        icon: Boxes,
                        permission: "advancing.manage",
                    },
                    {
                        title: "Inventory",
                        path: "/advancing/inventory",
                        icon: Warehouse,
                        permission: "advancing.manage",
                    },
                    {
                        title: "Templates",
                        path: "/advancing/templates",
                        icon: LayoutTemplate,
                        permission: "advancing.manage",
                    },
                    {
                        title: "Reports",
                        path: "/advancing/reports",
                        icon: FileBarChart,
                        permission: "advancing.manage",
                    },
                ],
            },
        ],
    },
    {
        title: "People",
        defaultExpanded: false,
        items: [
            { title: "Crew", path: "/crew", icon: HardHat, permission: "crew.read" },
            {
                title: "Time Tracking",
                path: "/time-tracking",
                icon: Timer,
                permission: "time_tracking.read",
            },
            { title: "Time Off", path: "/time-off", icon: Palmtree, permission: "time_off.read" },
            {
                title: "Resource Planner",
                path: "/resource-planner",
                icon: BarChartHorizontal,
                permission: "resource_planner.read",
            },
            {
                title: "Certifications",
                path: "/certifications",
                icon: BadgeCheck,
                permission: "certifications.read",
            },
            {
                title: "Workforce",
                path: "/workforce",
                icon: UsersRound,
                permission: "workforce.read",
                children: [
                    {
                        title: "Onboarding / Offboarding",
                        path: "/workforce/onboarding",
                        icon: UserPlus,
                        permission: "workforce_onboarding.read",
                    },
                    {
                        title: "Performance Reviews",
                        path: "/workforce/reviews",
                        icon: Star,
                        permission: "workforce_reviews.read",
                    },
                    {
                        title: "Goals & OKRs",
                        path: "/workforce/goals",
                        icon: Target,
                        permission: "workforce.read",
                    },
                ],
            },
        ],
    },
    {
        title: "Resources",
        defaultExpanded: false,
        items: [
            { title: "Assets", path: "/assets", icon: Package, permission: "assets.read" },
            { title: "Inventory", path: "/inventory", icon: Boxes, permission: "inventory.read" },
            {
                title: "Warehouses",
                path: "/warehouses",
                icon: Warehouse,
                permission: "warehouses.read",
            },
            { title: "Shipments", path: "/shipments", icon: Truck, permission: "shipments.read" },
            { title: "Fleet", path: "/fleet", icon: Car, permission: "fleet.read" },
            { title: "Dispatch", path: "/dispatch", icon: Navigation, permission: "dispatch.read" },
        ],
    },
    {
        title: "Finance",
        defaultExpanded: false,
        items: [
            { title: "Overview", path: "/finance", icon: Landmark, permission: "finance.read" },
            { title: "Revenue", path: "/revenue", icon: DollarSign, permission: "revenue.read" },
            {
                title: "Revenue Recognition",
                path: "/finance/revenue-recognition",
                icon: TrendingUp,
                permission: "finance.read",
            },
            { title: "Expenses", path: "/expenses", icon: Receipt, permission: "expenses.read" },
            {
                title: "Billing",
                path: "/invoices",
                icon: FileSpreadsheet,
                permission: "invoices.read",
                children: [
                    {
                        title: "Client Invoices",
                        path: "/client-invoices",
                        icon: Send,
                        permission: "client_invoices.read",
                    },
                    {
                        title: "Payments",
                        path: "/payments",
                        icon: Banknote,
                        permission: "payments.read",
                    },
                    {
                        title: "Credit Notes",
                        path: "/credit-notes",
                        icon: ReceiptText,
                        permission: "credit_notes.read",
                    },
                    {
                        title: "Recurring Invoices",
                        path: "/recurring-invoices",
                        icon: Repeat,
                        permission: "recurring_invoices.read",
                    },
                ],
            },
            {
                title: "Budgeting",
                path: "/budgets",
                icon: PiggyBank,
                permission: "budgets.read",
                children: [
                    {
                        title: "Job Costing",
                        path: "/job-costing",
                        icon: Calculator,
                        permission: "job_costing.read",
                    },
                    {
                        title: "Rate Cards",
                        path: "/rate-cards",
                        icon: CreditCard,
                        permission: "rate_cards.read",
                    },
                ],
            },
            {
                title: "Governance",
                path: "/gl-accounts",
                icon: CircleDollarSign,
                permission: "gl_accounts.read",
                children: [
                    {
                        title: "Budget Approvals",
                        path: "/budget-approvals",
                        icon: ShieldCheck,
                        permission: "budget_approvals.read",
                    },
                    {
                        title: "Payment Approvals",
                        path: "/payment-approvals",
                        icon: WalletCards,
                        permission: "payment_approvals.read",
                    },
                ],
            },
        ],
    },
    {
        title: "Creative",
        defaultExpanded: false,
        items: [
            { title: "Briefs", path: "/briefs", icon: PenTool, permission: "creative_briefs.read" },
            {
                title: "Brand Guidelines",
                path: "/brand-guidelines",
                icon: Palette,
                permission: "brand_guidelines.read",
            },
            {
                title: "Creative Assets",
                path: "/creative-assets",
                icon: Brush,
                permission: "creative_reviews.read",
            },
            {
                title: "Digital Assets",
                path: "/digital-assets",
                icon: ImagePlus,
                permission: "digital_assets.read",
            },
            { title: "Brand Kit", path: "/brand-kit", icon: SwatchBook, permission: "brand.read" },
            { title: "Decks", path: "/decks", icon: Presentation, permission: "decks.read" },
            {
                title: "Documents",
                path: "/documents",
                icon: FolderOpen,
                permission: "documents.read",
                children: [
                    {
                        title: "Call Sheets",
                        path: "/call-sheets",
                        icon: ClipboardList,
                        permission: "call_sheets.read",
                    },
                    {
                        title: "Tech Sheets",
                        path: "/tech-sheets",
                        icon: Cpu,
                        permission: "tech_sheets.read",
                    },
                    {
                        title: "Templates",
                        path: "/templates",
                        icon: LayoutTemplate,
                        permission: "templates.read",
                    },
                ],
            },
        ],
    },

    // ── Tier 3: Governance & Admin ──
    {
        title: "Vendors",
        defaultExpanded: false,
        items: [
            { title: "Vendors", path: "/vendors", icon: Store, permission: "vendors.read" },
            {
                title: "Vendor Onboarding",
                path: "/vendor-onboarding",
                icon: UserPlus,
                permission: "vendor_onboarding.read",
            },
            {
                title: "Vendor Compliance",
                path: "/vendor-compliance",
                icon: ShieldAlert,
                permission: "vendor_compliance.read",
            },
            {
                title: "Vendor Reviews",
                path: "/vendor-reviews",
                icon: Star,
                permission: "vendor_reviews.read",
            },
            {
                title: "Work Orders",
                path: "/work-orders",
                icon: ClipboardCheck,
                permission: "work_orders.read",
            },
            {
                title: "Procurement",
                path: "/procurement",
                icon: ShoppingCart,
                permission: "procurement.read",
                children: [
                    {
                        title: "Purchase Requisitions",
                        path: "/purchase-requisitions",
                        icon: ClipboardList,
                        permission: "purchase_requisitions.read",
                    },
                    {
                        title: "Goods Receipts",
                        path: "/goods-receipts",
                        icon: HardDriveDownload,
                        permission: "goods_receipts.read",
                    },
                    {
                        title: "Vendor Risk",
                        path: "/vendor-risk",
                        icon: Scale,
                        permission: "vendor_risk.read",
                    },
                ],
            },
        ],
    },
    {
        title: "Operations",
        defaultExpanded: false,
        items: [
            {
                title: "Approvals",
                path: "/approvals",
                icon: ShieldCheck,
                permission: "approvals.read",
            },
            {
                title: "Checklists",
                path: "/checklists",
                icon: ListChecks,
                permission: "checklists.read",
            },
            {
                title: "Automations",
                path: "/automations",
                icon: Zap,
                permission: "automations.read",
            },
            {
                title: "Quality Checks",
                path: "/quality-checks",
                icon: SearchCheck,
                permission: "approvals.read",
            },
            {
                title: "Service Requests",
                path: "/service-requests",
                icon: Inbox,
                permission: "service_requests.read",
            },
            {
                title: "Workflows",
                path: "/workflows",
                icon: Workflow,
                permission: "automations.read",
            },
        ],
    },
    {
        title: "Legal & Compliance",
        defaultExpanded: false,
        items: [
            {
                title: "Contracts",
                path: "/contracts",
                icon: FileSignature,
                permission: "contracts.read",
            },
            {
                title: "Insurance",
                path: "/insurance-policies",
                icon: Shield,
                permission: "insurance_policies.read",
            },
            {
                title: "IP & Usage Rights",
                path: "/ip-rights",
                icon: Fingerprint,
                permission: "ip_rights.read",
            },
            {
                title: "Clause Library",
                path: "/clause-library",
                icon: BookLock,
                permission: "clause_library.read",
            },
            {
                title: "Obligations",
                path: "/obligations",
                icon: ClipboardMinus,
                permission: "obligations.read",
            },
            {
                title: "Incidents",
                path: "/incidents",
                icon: AlertTriangle,
                permission: "incidents.read",
            },
            {
                title: "Permits & Licenses",
                path: "/permits",
                icon: FileBadge,
                permission: "permits.read",
            },
            {
                title: "Engineering Approvals",
                path: "/engineering-approvals",
                icon: Wrench,
                permission: "engineering_approvals.read",
            },
            {
                title: "Compliance Checklists",
                path: "/compliance-checklists",
                icon: FileCheck,
                permission: "compliance_checklists.read",
            },
        ],
    },
    {
        title: "Admin",
        defaultExpanded: false,
        items: [
            {
                title: "Users",
                path: "/user-management",
                icon: UsersRound,
                permission: "user_management.read",
            },
            {
                title: "Invitations",
                path: "/user-management/invitations",
                icon: UserPlus,
                permission: "invitations.read",
            },
            {
                title: "Access Reviews",
                path: "/user-management/access-reviews",
                icon: ShieldQuestion,
                permission: "access_reviews.read",
            },
            {
                title: "Audit Log",
                path: "/user-management/audit-log",
                icon: KeyRound,
                permission: "audit_log.read",
            },
            { title: "People", path: "/people", icon: UserCircle, permission: "people.read" },
            {
                title: "Org Chart",
                path: "/org-chart",
                icon: GitBranch,
                permission: "org_chart.read",
            },
            {
                title: "Teams",
                path: "/teams",
                icon: Users,
                permission: "teams.read",
            },
            { title: "Roles", path: "/roles", icon: Shield, permission: "roles.manage" },
            {
                title: "Knowledge Base",
                path: "/knowledge-base",
                icon: BookOpen,
                permission: "kb.read",
            },
            { title: "SOPs", path: "/sops", icon: Layers, permission: "sops.read" },
            { title: "Vault", path: "/vault", icon: Lock, permission: "vault.read" },
            { title: "Settings", path: "/settings", icon: Settings, permission: "settings.manage" },
            {
                title: "Custom Fields",
                path: "/settings/custom-fields",
                icon: Blocks,
                permission: "settings.manage",
            },
            {
                title: "Email Integration",
                path: "/settings/email-integration",
                icon: Mail,
                permission: "settings.manage",
            },
            {
                title: "Integrations",
                path: "/integrations",
                icon: Link2,
                permission: "provider_connections.read",
                children: [
                    {
                        title: "Sync Log",
                        path: "/integrations/sync-log",
                        icon: RefreshCw,
                        permission: "sync_events.read",
                    },
                ],
            },
            {
                title: "System Health",
                path: "/system-health",
                icon: HeartPulse,
                permission: "system_health.read",
            },
            {
                title: "Data Export",
                path: "/data-export",
                icon: Download,
                permission: "data_export.read",
            },
            {
                title: "Credentials",
                path: "/credentials",
                icon: Ticket,
                permission: "credential_types.read",
                children: [
                    {
                        title: "Assignments",
                        path: "/credentials/assignments",
                        icon: BadgeCheck,
                        permission: "credential_assignments.read",
                    },
                ],
            },
            {
                title: "Client Portal",
                path: "/client-portal",
                icon: Users,
                permission: "client_portal.read",
            },
            {
                title: "Vendor Portal",
                path: "/vendor-portal",
                icon: ScanBarcode,
                permission: "vendor_portal.read",
            },
        ],
    },

    // ── Contextual: Live Operations (visible only when event is in-progress) ──
    {
        title: "Live Operations",
        defaultExpanded: true,
        contextual: "live-ops",
        items: [
            {
                title: "Command Dashboard",
                path: "/live-ops",
                icon: Radio,
                permission: "live_events.read",
            },
            {
                title: "Run of Show",
                path: "/live-ops/run-of-show",
                icon: Megaphone,
                permission: "ros_cues.read",
            },
            {
                title: "Readiness Gates",
                path: "/live-ops/readiness",
                icon: Gauge,
                permission: "readiness_gates.read",
            },
            {
                title: "Department Status",
                path: "/live-ops/departments",
                icon: LayoutList,
                permission: "department_statuses.read",
            },
            {
                title: "Live Crew",
                path: "/live-ops/crew",
                icon: HardHat,
                permission: "live_crew.read",
            },
            {
                title: "Equipment",
                path: "/live-ops/equipment",
                icon: ScanBarcode,
                permission: "equipment_check_ins.read",
            },
            {
                title: "Comms",
                path: "/live-ops/comms",
                icon: Radio,
                permission: "comm_channels.read",
            },
            {
                title: "Environment",
                path: "/live-ops/environment",
                icon: Thermometer,
                permission: "environmental_readings.read",
            },
            {
                title: "Financials",
                path: "/live-ops/financials",
                icon: Landmark,
                permission: "live_financial.read",
            },
            {
                title: "Front of House",
                path: "/live-ops/foh",
                icon: Drama,
                permission: "foh_zones.read",
            },
            {
                title: "Credentials",
                path: "/live-ops/credentials",
                icon: Ticket,
                permission: "credential_assignments.read",
            },
            {
                title: "Gate Scanner",
                path: "/live-ops/gate",
                icon: QrCode,
                permission: "gate_operations.read",
            },
            {
                title: "VIP Management",
                path: "/live-ops/vip",
                icon: Crown,
                permission: "vip_guests.read",
            },
            {
                title: "Guest Incidents",
                path: "/live-ops/guest-incidents",
                icon: AlertTriangle,
                permission: "guest_incidents.read",
            },
            {
                title: "Strike & Load-Out",
                path: "/live-ops/strike",
                icon: ArrowLeftRight,
                permission: "strike_sequences.read",
            },
            {
                title: "Reconciliation",
                path: "/live-ops/reconciliation",
                icon: ClipboardCheck,
                permission: "asset_reconciliation.read",
            },
            {
                title: "Post-Event Reports",
                path: "/live-ops/reports",
                icon: FileBarChart,
                permission: "post_event_reports.read",
            },
        ],
    },
];

interface NavItemMatch {
    section: NavSection;
    item: NavItem;
    parentItem?: NavItem;
    matchLength: number;
}

function normalizeNavigationPath(path: string): string {
    if (!path) return "/";
    const withoutQuery = path.split(/[?#]/)[0] ?? path;
    const normalized = withoutQuery.replace(/\/+$/, "");
    return normalized === "" ? "/" : normalized;
}

function isPathMatch(candidatePath: string, currentPath: string): boolean {
    const candidate = normalizeNavigationPath(candidatePath);
    const current = normalizeNavigationPath(currentPath);
    return current === candidate || current.startsWith(`${candidate}/`);
}

export function getContextualNavigationVisibility(
    pathname: string
): NavigationVisibilityOptions["contextualVisibility"] {
    const currentPath = normalizeNavigationPath(pathname);

    return {
        "live-ops": currentPath === "/live-ops" || currentPath.startsWith("/live-ops/"),
    };
}

function findLongestNavItemMatch(pathname: string, sections: NavSection[]): NavItemMatch | null {
    const currentPath = normalizeNavigationPath(pathname);
    let bestMatch: NavItemMatch | null = null;

    const visit = (section: NavSection, item: NavItem, parentItem?: NavItem) => {
        if (isPathMatch(item.path, currentPath)) {
            const matchLength = normalizeNavigationPath(item.path).length;
            if (!bestMatch || matchLength > bestMatch.matchLength) {
                bestMatch = { section, item, parentItem, matchLength };
            }
        }

        for (const child of item.children ?? []) {
            visit(section, child, item);
        }
    };

    for (const section of sections) {
        for (const item of section.items) {
            visit(section, item);
        }
    }

    return bestMatch;
}

export interface NavigationContext {
    section: NavSection;
    item: NavItem;
    parentItem?: NavItem;
}

export interface NavigationBreadcrumb {
    label: string;
    path: string;
    isLast: boolean;
}

export function getNavigationContext(
    pathname: string,
    sections: NavSection[] = navigationConfig
): NavigationContext | null {
    const match = findLongestNavItemMatch(pathname, sections);
    if (!match) return null;

    return {
        section: match.section,
        item: match.item,
        parentItem: match.parentItem,
    };
}

function getNavigationLabel(
    pathname: string,
    sections: NavSection[] = navigationConfig
): string | null {
    const targetPath = normalizeNavigationPath(pathname);

    const findExact = (items: NavItem[]): string | null => {
        for (const item of items) {
            if (normalizeNavigationPath(item.path) === targetPath) {
                return item.title;
            }

            if (item.children) {
                const childMatch = findExact(item.children);
                if (childMatch) return childMatch;
            }
        }

        return null;
    };

    for (const section of sections) {
        const match = findExact(section.items);
        if (match) return match;
    }

    return null;
}

function formatPathSegment(segment: string): string {
    const decoded = decodeURIComponent(segment);
    return decoded.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getNavigationBreadcrumbs(
    pathname: string,
    sections: NavSection[] = navigationConfig
): NavigationBreadcrumb[] {
    const normalizedPath = normalizeNavigationPath(pathname);
    const segments = normalizedPath.split("/").filter(Boolean);

    if (segments.length === 0) {
        return [];
    }

    return segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const label = getNavigationLabel(path, sections) ?? formatPathSegment(segment);

        return {
            label,
            path,
            isLast: index === segments.length - 1,
        };
    });
}
