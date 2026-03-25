import {
    AlertTriangle,
    BadgeCheck,
    BarChart3,
    BarChartHorizontal,
    Bell,
    BookLock,
    BookMarked,
    BookOpen,
    Boxes,
    Brush,
    Building2,
    Calendar,
    CalendarCheck,
    CalendarDays,
    CheckSquare,
    CircleDollarSign,
    ClipboardCheck,
    ClipboardMinus,
    Clock,
    Compass,
    DollarSign,
    FileBadge,
    FileCheck,
    FileSignature,
    Filter,
    Fingerprint,
    FolderKanban,
    FolderOpen,
    GitBranch,
    HardHat,
    Inbox,
    Layers,
    LayoutDashboard,
    Link2,
    Lock,
    Mail,
    MapPin,
    Megaphone,
    Navigation,
    Package,
    PenTool,
    PiggyBank,
    Radio,
    Receipt,
    SearchCheck,
    Settings,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Store,
    SwatchBook,
    Ticket,
    Timer,
    Truck,
    Users,
    UsersRound,
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
    /** i18n key for title — when provided, resolved at runtime via t() */
    titleKey?: string | undefined;
    path: string;
    icon: LucideIcon;
    badge?: string | number | undefined;
    permission?:
        | string
        | undefined; /** Minimum pricing tier required to see this item. Omit = visible on all tiers. */
    minTier?: PricingTier | undefined;
    children?: NavItem[] | undefined;
}

export interface NavSection {
    title: string;
    /** i18n key for section title — when provided, resolved at runtime via t() */
    titleKey?: string | undefined;
    items: NavItem[];
    defaultExpanded?:
        | boolean
        | undefined; /** Section only appears when a live event is in-progress */
    contextual?: "live-ops" | undefined;
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
    includeContextual?: boolean | undefined;
    contextualVisibility?:
        | Partial<Record<NonNullable<NavSection["contextual"]>, boolean>>
        | undefined;
    /** Current org pricing tier — items with minTier above this are hidden */
    currentTier?: PricingTier | undefined;
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

export const navigationConfig: NavSection[] = [
    // ── 1. Home ──
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
                title: "Calendar",
                path: "/calendar",
                icon: CalendarDays,
                permission: "calendar.read",
            },
            {
                title: "Notifications",
                path: "/notifications",
                icon: Bell,
                permission: "dashboard.read",
            },
            { title: "Messages", path: "/messages", icon: Mail, permission: "messaging_dm.read" },
            { title: "My Tasks", path: "/home/tasks", icon: CheckSquare, permission: "tasks.read" },
            {
                title: "My Documents",
                path: "/home/documents",
                icon: FileCheck,
                permission: "documents.read",
            },
            {
                title: "Analytics",
                path: "/reports",
                icon: BarChart3,
                permission: "reports.read",
            },
        ],
    },

    // ── 2. Production ──
    {
        title: "Production",
        defaultExpanded: false,
        items: [
            {
                title: "Projects",
                path: "/projects",
                icon: FolderKanban,
                permission: "projects.read",
            },
            { title: "Tasks", path: "/tasks", icon: CheckSquare, permission: "tasks.read" },
            {
                title: "Events",
                path: "/events",
                icon: Calendar,
                permission: "events.read",
            },
            {
                title: "Activations",
                path: "/activations",
                icon: Sparkles,
                permission: "activations.read",
            },
            {
                title: "Advances",
                path: "/advancing",
                icon: ShoppingCart,
                permission: "advancing.read",
            },
            { title: "Locations", path: "/locations", icon: MapPin, permission: "locations.read" },
        ],
    },

    // ── 3. Operations ──
    {
        title: "Operations",
        defaultExpanded: false,
        items: [
            { title: "Overview", path: "/live-ops", icon: Radio, permission: "live_events.read" },
            {
                title: "Workflows",
                path: "/workflows",
                icon: Workflow,
                permission: "automations.read",
            },
            {
                title: "Service Requests",
                path: "/service-requests",
                icon: Inbox,
                permission: "service_requests.read",
            },
            {
                title: "Approvals",
                path: "/approvals",
                icon: ShieldCheck,
                permission: "approvals.read",
            },
            {
                title: "Quality Checks",
                path: "/quality-checks",
                icon: SearchCheck,
                permission: "approvals.read",
            },
            {
                title: "Documents",
                path: "/documents",
                icon: FolderOpen,
                permission: "documents.read",
            },
        ],
    },

    // ── 4. Workforce ──
    {
        title: "Workforce",
        defaultExpanded: false,
        items: [
            { title: "Personnel", path: "/crew", icon: HardHat, permission: "crew.read" },
            { title: "Shifts", path: "/shifts", icon: Clock, permission: "crew.read" },
            {
                title: "Availability",
                path: "/crew-availability",
                icon: CalendarCheck,
                permission: "crew.read",
            },
            {
                title: "Time Tracking",
                path: "/time-tracking",
                icon: Timer,
                permission: "time_tracking.read",
            },
            {
                title: "Resource Planner",
                path: "/resource-planner",
                icon: BarChartHorizontal,
                permission: "resource_planner.read",
            },
            {
                title: "Human Resources",
                path: "/workforce",
                icon: UsersRound,
                permission: "workforce.read",
            },
            {
                title: "Certifications",
                path: "/certifications",
                icon: BadgeCheck,
                permission: "certifications.read",
            },
        ],
    },

    // ── 5. Supply Chain (merged Vendors + Resources) ──
    {
        title: "Supply Chain",
        defaultExpanded: false,
        items: [
            {
                title: "Assets",
                path: "/assets",
                icon: Package,
                permission: "assets.read",
            },
            { title: "Inventory", path: "/inventory", icon: Boxes, permission: "inventory.read" },
            {
                title: "Warehousing",
                path: "/warehouses",
                icon: Warehouse,
                permission: "warehouses.read",
            },
            { title: "Logistics", path: "/shipments", icon: Truck, permission: "shipments.read" },
            {
                title: "Dispatch",
                path: "/dispatch",
                icon: Navigation,
                permission: "dispatch.read",
            },
            { title: "Vendors", path: "/vendors", icon: Store, permission: "vendors.read" },
            {
                title: "Work Orders",
                path: "/work-orders",
                icon: ClipboardCheck,
                permission: "work_orders.read",
            },
            {
                title: "Supplier Discovery",
                path: "/supplier-discovery",
                icon: Compass,
                permission: "vendors.read",
            },
        ],
    },

    // ── 6. Creative ──
    {
        title: "Creative",
        defaultExpanded: false,
        items: [
            { title: "Briefs", path: "/briefs", icon: PenTool, permission: "creative_briefs.read" },
            { title: "Brand", path: "/brand-kit", icon: SwatchBook, permission: "brand.read" },
            {
                title: "Creative",
                path: "/creative-assets",
                icon: Brush,
                permission: "creative_reviews.read",
            },
            {
                title: "Campaigns",
                path: "/campaigns",
                icon: Megaphone,
                permission: "campaigns.read",
            },
        ],
    },

    // ── 7. Finance ──
    {
        title: "Finance",
        defaultExpanded: false,
        items: [
            {
                title: "Budgets",
                path: "/budgets",
                icon: PiggyBank,
                permission: "budgets.read",
            },
            {
                title: "Revenue",
                path: "/revenue",
                icon: DollarSign,
                permission: "revenue.read",
            },
            {
                title: "Expenses",
                path: "/expenses",
                icon: Receipt,
                permission: "expenses.read",
            },
            {
                title: "Procurement",
                path: "/procurement",
                icon: ShoppingCart,
                permission: "procurement.read",
            },
            {
                title: "Governance",
                path: "/gl-accounts",
                icon: CircleDollarSign,
                permission: "gl_accounts.read",
            },
        ],
    },

    // ── 8. Sales (was Business — CRM funnel compressed) ──
    {
        title: "Sales",
        defaultExpanded: false,
        items: [
            {
                title: "CRM",
                path: "/pipeline",
                icon: Filter,
                permission: "pipeline.read",
            },
            {
                title: "Accounts",
                path: "/accounts",
                icon: Building2,
                permission: "accounts.read",
            },
        ],
    },

    // ── 9. Legal ──
    {
        title: "Legal",
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
                title: "Licences & Permits",
                path: "/permits",
                icon: FileBadge,
                permission: "permits.read",
            },
            {
                title: "Engineering",
                path: "/engineering-approvals",
                icon: Wrench,
                permission: "engineering_approvals.read",
            },
            {
                title: "IP & Usage Rights",
                path: "/ip-rights",
                icon: Fingerprint,
                permission: "ip_rights.read",
            },
            {
                title: "Incidents",
                path: "/incidents",
                icon: AlertTriangle,
                permission: "incidents.read",
            },
            {
                title: "Obligations",
                path: "/obligations",
                icon: ClipboardMinus,
                permission: "obligations.read",
            },
            {
                title: "Compliance",
                path: "/compliance-checklists",
                icon: FileCheck,
                permission: "compliance_checklists.read",
            },
            {
                title: "Clause Library",
                path: "/clause-library",
                icon: BookLock,
                permission: "clause_library.read",
            },
        ],
    },

    // ── 10. Admin (merged with Platform) ──
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
            { title: "Roles", path: "/roles", icon: Shield, permission: "roles.manage" },
            { title: "Teams", path: "/teams", icon: Users, permission: "teams.read" },
            {
                title: "Org Chart",
                path: "/org-chart",
                icon: GitBranch,
                permission: "org_chart.read",
            },
            {
                title: "Knowledge Base",
                path: "/knowledge-base",
                icon: BookOpen,
                permission: "kb.read",
            },
            { title: "SOPs", path: "/sops", icon: BookMarked, permission: "sops.read" },
            { title: "Vault", path: "/vault", icon: Lock, permission: "vault.read" },
            {
                title: "Automations",
                path: "/automations",
                icon: Zap,
                permission: "automations.read",
            },
            {
                title: "Integrations",
                path: "/integrations",
                icon: Link2,
                permission: "provider_connections.read",
            },
            {
                title: "Credentials",
                path: "/credentials",
                icon: Ticket,
                permission: "credential_types.read",
            },
            { title: "Tags", path: "/tags", icon: Layers, permission: "settings.manage" },
            {
                title: "Client Portal",
                path: "/client-portal",
                icon: Users,
                permission: "client_portal.read",
            },
            {
                title: "Settings",
                path: "/settings",
                icon: Settings,
                permission: "settings.read",
            },
        ],
    },
];

interface NavItemMatch {
    section: NavSection;
    item: NavItem;
    parentItem?: NavItem | undefined;
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
    parentItem?: NavItem | undefined;
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
