/* ═══════════════════════════════════════════════════════════════
   TIER ENTITLEMENTS — Single Source of Truth
   ═══════════════════════════════════════════════════════════════
   
   Declarative definition of what each pricing tier unlocks.
   Every enforcement point (API middleware, UI gating, nav filtering,
   feature flags) reads from this config. No duplication.
   
   Tier ordering: starter < core < team < pro < enterprise
   ═══════════════════════════════════════════════════════════════ */

import type { PermissionLevel } from "@/types";

// ─── Pricing Tier Type ───────────────────────────────────────

export const PRICING_TIERS = ["starter", "core", "team", "pro", "enterprise"] as const;
export type PricingTier = (typeof PRICING_TIERS)[number];

export const TIER_RANK: Record<PricingTier, number> = {
    starter: 0,
    core: 1,
    team: 2,
    pro: 3,
    enterprise: 4,
};

export function isTierAtLeast(current: PricingTier, required: PricingTier): boolean {
    return TIER_RANK[current] >= TIER_RANK[required];
}

export function getNextTier(current: PricingTier): PricingTier | null {
    const idx = PRICING_TIERS.indexOf(current);
    return idx < PRICING_TIERS.length - 1 ? PRICING_TIERS[idx + 1]! : null;
}

// ─── Entitlement Shape ───────────────────────────────────────

export type ApiAccessLevel = "none" | "read" | "full" | "admin";

export interface TierEntitlements {
    // ── Pricing ──
    pricing: {
        monthlyBaseCents: number;
        annualBaseCents: number;
        includedSeats: number;
        overagePerSeatCents: number;
    };

    // ── Module Access (maps to feature_flag keys) ──
    modules: {
        crm: boolean;
        finance: boolean;
        invoicing: boolean;
        resourcePlanner: boolean;
        production: boolean;
        liveOps: boolean;
        creative: boolean;
        legal: boolean;
        vendorLifecycle: boolean;
        spatial: boolean;
        revenueEngine: boolean;
    };

    // ── RBAC Depth ──
    rbac: {
        availableRoles: PermissionLevel[];
        customRoles: boolean;
        conditionalPermissions: boolean;
        fieldMasking: boolean;
        approvalSteps: number;
        auditRetentionDays: number;
    };

    // ── Integrations ──
    integrations: {
        providerConnections: number;
        webhooksInbound: boolean;
        syncOutbound: boolean;
        apiAccess: ApiAccessLevel;
        sso: boolean;
        emailIntegration: boolean;
    };

    // ── Automations ──
    automations: {
        ruleLimit: number;
        canCreate: boolean;
        scheduled: boolean;
        multiStep: boolean;
        escalation: boolean;
    };

    // ── AI ──
    ai: {
        reportGeneration: number;
        copilot: boolean;
        messageSummaries: boolean;
        nlQuery: boolean;
        predictiveScoring: boolean;
    };

    // ── Customization & White-Label ──
    customization: {
        logoAndAccent: boolean;
        fullBrandKit: boolean;
        clientPortalBranding: boolean;
        vendorPortalBranding: boolean;
        multiBrand: boolean;
        customFieldsPerEntity: number;
        customPdfTemplates: boolean;
        whitelabelDomain: boolean;
    };
}

// ─── Tier Definitions ────────────────────────────────────────

const STARTER: TierEntitlements = {
    pricing: {
        monthlyBaseCents: 0,
        annualBaseCents: 0,
        includedSeats: 3,
        overagePerSeatCents: 0,
    },
    modules: {
        crm: true,
        finance: false,
        invoicing: false,
        resourcePlanner: false,
        production: false,
        liveOps: false,
        creative: false,
        legal: false,
        vendorLifecycle: false,
        spatial: false,
        revenueEngine: false,
    },
    rbac: {
        availableRoles: ["exec", "pm", "member"],
        customRoles: false,
        conditionalPermissions: false,
        fieldMasking: false,
        approvalSteps: 0,
        auditRetentionDays: 0,
    },
    integrations: {
        providerConnections: 0,
        webhooksInbound: false,
        syncOutbound: false,
        apiAccess: "none",
        sso: false,
        emailIntegration: false,
    },
    automations: {
        ruleLimit: 0,
        canCreate: false,
        scheduled: false,
        multiStep: false,
        escalation: false,
    },
    ai: {
        reportGeneration: 0,
        copilot: false,
        messageSummaries: false,
        nlQuery: false,
        predictiveScoring: false,
    },
    customization: {
        logoAndAccent: false,
        fullBrandKit: false,
        clientPortalBranding: false,
        vendorPortalBranding: false,
        multiBrand: false,
        customFieldsPerEntity: 0,
        customPdfTemplates: false,
        whitelabelDomain: false,
    },
};

const CORE: TierEntitlements = {
    pricing: {
        monthlyBaseCents: 4900,
        annualBaseCents: 47000,
        includedSeats: 5,
        overagePerSeatCents: 900,
    },
    modules: {
        crm: true,
        finance: true,
        invoicing: false,
        resourcePlanner: false,
        production: false,
        liveOps: false,
        creative: false,
        legal: false,
        vendorLifecycle: false,
        spatial: false,
        revenueEngine: false,
    },
    rbac: {
        availableRoles: ["exec", "pm", "member"],
        customRoles: false,
        conditionalPermissions: false,
        fieldMasking: false,
        approvalSteps: 0,
        auditRetentionDays: 0,
    },
    integrations: {
        providerConnections: 0,
        webhooksInbound: false,
        syncOutbound: false,
        apiAccess: "none",
        sso: false,
        emailIntegration: false,
    },
    automations: {
        ruleLimit: 0,
        canCreate: false,
        scheduled: false,
        multiStep: false,
        escalation: false,
    },
    ai: {
        reportGeneration: 0,
        copilot: false,
        messageSummaries: false,
        nlQuery: false,
        predictiveScoring: false,
    },
    customization: {
        logoAndAccent: false,
        fullBrandKit: false,
        clientPortalBranding: false,
        vendorPortalBranding: false,
        multiBrand: false,
        customFieldsPerEntity: 0,
        customPdfTemplates: false,
        whitelabelDomain: false,
    },
};

const TEAM: TierEntitlements = {
    pricing: {
        monthlyBaseCents: 19900,
        annualBaseCents: 191000,
        includedSeats: 15,
        overagePerSeatCents: 1200,
    },
    modules: {
        crm: true,
        finance: true,
        invoicing: true,
        resourcePlanner: true,
        production: false,
        liveOps: false,
        creative: false,
        legal: false,
        vendorLifecycle: false,
        spatial: false,
        revenueEngine: false,
    },
    rbac: {
        availableRoles: ["exec", "director", "pm", "member", "client", "collaborator"],
        customRoles: false,
        conditionalPermissions: false,
        fieldMasking: false,
        approvalSteps: 1,
        auditRetentionDays: 30,
    },
    integrations: {
        providerConnections: 1,
        webhooksInbound: false,
        syncOutbound: false,
        apiAccess: "read",
        sso: false,
        emailIntegration: false,
    },
    automations: {
        ruleLimit: 10,
        canCreate: true,
        scheduled: false,
        multiStep: false,
        escalation: false,
    },
    ai: {
        reportGeneration: 0,
        copilot: false,
        messageSummaries: false,
        nlQuery: false,
        predictiveScoring: false,
    },
    customization: {
        logoAndAccent: true,
        fullBrandKit: false,
        clientPortalBranding: false,
        vendorPortalBranding: false,
        multiBrand: false,
        customFieldsPerEntity: 0,
        customPdfTemplates: false,
        whitelabelDomain: false,
    },
};

const PRO: TierEntitlements = {
    pricing: {
        monthlyBaseCents: 49900,
        annualBaseCents: 479000,
        includedSeats: 30,
        overagePerSeatCents: 1500,
    },
    modules: {
        crm: true,
        finance: true,
        invoicing: true,
        resourcePlanner: true,
        production: true,
        liveOps: true,
        creative: true,
        legal: true,
        vendorLifecycle: true,
        spatial: false,
        revenueEngine: false,
    },
    rbac: {
        availableRoles: ["exec", "director", "pm", "member", "client", "collaborator"],
        customRoles: false,
        conditionalPermissions: false,
        fieldMasking: true,
        approvalSteps: -1,
        auditRetentionDays: 365,
    },
    integrations: {
        providerConnections: 5,
        webhooksInbound: true,
        syncOutbound: false,
        apiAccess: "full",
        sso: false,
        emailIntegration: false,
    },
    automations: {
        ruleLimit: 50,
        canCreate: true,
        scheduled: true,
        multiStep: false,
        escalation: true,
    },
    ai: {
        reportGeneration: 5,
        copilot: true,
        messageSummaries: false,
        nlQuery: false,
        predictiveScoring: false,
    },
    customization: {
        logoAndAccent: true,
        fullBrandKit: true,
        clientPortalBranding: true,
        vendorPortalBranding: false,
        multiBrand: false,
        customFieldsPerEntity: 5,
        customPdfTemplates: true,
        whitelabelDomain: false,
    },
};

const ENTERPRISE: TierEntitlements = {
    pricing: {
        monthlyBaseCents: 129900,
        annualBaseCents: 1247000,
        includedSeats: 75,
        overagePerSeatCents: 1800,
    },
    modules: {
        crm: true,
        finance: true,
        invoicing: true,
        resourcePlanner: true,
        production: true,
        liveOps: true,
        creative: true,
        legal: true,
        vendorLifecycle: true,
        spatial: true,
        revenueEngine: true,
    },
    rbac: {
        availableRoles: ["exec", "director", "pm", "member", "client", "collaborator"],
        customRoles: true,
        conditionalPermissions: true,
        fieldMasking: true,
        approvalSteps: -1,
        auditRetentionDays: -1,
    },
    integrations: {
        providerConnections: -1,
        webhooksInbound: true,
        syncOutbound: true,
        apiAccess: "admin",
        sso: true,
        emailIntegration: true,
    },
    automations: {
        ruleLimit: -1,
        canCreate: true,
        scheduled: true,
        multiStep: true,
        escalation: true,
    },
    ai: {
        reportGeneration: -1,
        copilot: true,
        messageSummaries: true,
        nlQuery: true,
        predictiveScoring: true,
    },
    customization: {
        logoAndAccent: true,
        fullBrandKit: true,
        clientPortalBranding: true,
        vendorPortalBranding: true,
        multiBrand: true,
        customFieldsPerEntity: -1,
        customPdfTemplates: true,
        whitelabelDomain: true,
    },
};

// ─── Exported SSOT Map ───────────────────────────────────────

export const TIER_ENTITLEMENTS: Record<PricingTier, TierEntitlements> = {
    starter: STARTER,
    core: CORE,
    team: TEAM,
    pro: PRO,
    enterprise: ENTERPRISE,
};

// ─── Capability Resolver ─────────────────────────────────────

type NestedKeyOf<T> = T extends object
    ? {
          [K in keyof T & string]: T[K] extends object ? `${K}.${keyof T[K] & string}` : K;
      }[keyof T & string]
    : never;

export type EntitlementPath = NestedKeyOf<Omit<TierEntitlements, "pricing">>;

export function getEntitlementValue(
    tier: PricingTier,
    path: EntitlementPath
): boolean | number | string | string[] {
    const entitlements = TIER_ENTITLEMENTS[tier];
    const [section, key] = path.split(".") as [string, string];
    const sectionObj = entitlements[section as keyof Omit<TierEntitlements, "pricing">];
    if (!sectionObj || !(key in sectionObj)) return false;
    return sectionObj[key as keyof typeof sectionObj] as boolean | number | string | string[];
}

export function isEntitlementEnabled(tier: PricingTier, path: EntitlementPath): boolean {
    const value = getEntitlementValue(tier, path);
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value !== "none" && value !== "";
    if (Array.isArray(value)) return value.length > 0;
    return false;
}

export function getEntitlementLimit(tier: PricingTier, path: EntitlementPath): number {
    const value = getEntitlementValue(tier, path);
    if (typeof value === "number") return value;
    return 0;
}

export function getRequiredTierForEntitlement(path: EntitlementPath): PricingTier {
    for (const tier of PRICING_TIERS) {
        if (isEntitlementEnabled(tier, path)) return tier;
    }
    return "enterprise";
}

// ─── Display Helpers ─────────────────────────────────────────

export const TIER_DISPLAY: Record<PricingTier, { name: string; tagline: string }> = {
    starter: { name: "Starter", tagline: "Free forever" },
    core: { name: "Core", tagline: "Solo & freelance" },
    team: { name: "Team", tagline: "Growing production teams" },
    pro: { name: "Pro", tagline: "Full-service agencies" },
    enterprise: { name: "Enterprise", tagline: "Multi-brand organizations" },
};

export function formatTierPrice(tier: PricingTier, cycle: "monthly" | "annual"): string {
    const { pricing } = TIER_ENTITLEMENTS[tier];
    if (pricing.monthlyBaseCents === 0) return "Free";
    const cents = cycle === "monthly" ? pricing.monthlyBaseCents : pricing.annualBaseCents;
    const monthly = cycle === "annual" ? Math.round(cents / 12) : cents;
    return `$${(monthly / 100).toFixed(0)}`;
}
