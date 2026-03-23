/**
 * Quality Standards Registry
 *
 * Machine-readable, typed representation of every audit criterion from
 * prompt-audit.md. Each criterion is a deploy blocker by default.
 * Versioned and extensible — new criteria added by appending entries.
 *
 * @version 2026.1
 */

import type {
    AttestationRequirement,
    CheckCategory,
    CheckType,
    SeverityLevel,
    StandardsVersion,
    ThresholdOverride,
} from "../../quality-gate.config";

// ---------------------------------------------------------------------------
// Criterion Type
// ---------------------------------------------------------------------------

export interface QualityCriterion {
    readonly id: string;
    readonly section: number;
    readonly subsection: number;
    readonly title: string;
    readonly description: string;
    readonly category: CheckCategory;
    readonly originalSeverity: SeverityLevel;
    readonly isDeployBlocker: boolean;
    readonly checkType: CheckType;
    readonly automatedCheck: string | null;
    readonly attestation: AttestationRequirement | null;
    readonly threshold: ThresholdOverride | null;
    readonly addedInVersion: StandardsVersion;
    readonly lastUpdatedVersion: StandardsVersion;
    readonly externalRef: string | null;
    readonly tags: ReadonlyArray<string>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const V1: StandardsVersion = "2026.1";

function c(
    id: string,
    s: number,
    ss: number,
    title: string,
    desc: string,
    cat: CheckCategory,
    sev: SeverityLevel,
    ct: CheckType,
    opts: {
        ac?: string | undefined;
        at?: AttestationRequirement | undefined;
        th?: ThresholdOverride | undefined;
        er?: string | undefined;
        tg?: string[] | undefined;
    } = {}
): QualityCriterion {
    return {
        id,
        section: s,
        subsection: ss,
        title,
        description: desc,
        category: cat,
        originalSeverity: sev,
        isDeployBlocker: true,
        checkType: ct,
        automatedCheck: opts.ac ?? null,
        attestation: opts.at ?? null,
        threshold: opts.th ?? null,
        addedInVersion: V1,
        lastUpdatedVersion: V1,
        externalRef: opts.er ?? null,
        tags: opts.tg ?? [],
    };
}

const engA: AttestationRequirement = {
    requiredRole: "engineer",
    evidenceRequired: true,
    reattestIntervalDays: 30,
};
const leadA: AttestationRequirement = {
    requiredRole: "lead",
    evidenceRequired: true,
    reattestIntervalDays: 30,
};
const secA: AttestationRequirement = {
    requiredRole: "security",
    evidenceRequired: true,
    reattestIntervalDays: 30,
};
const a11yA: AttestationRequirement = {
    requiredRole: "accessibility",
    evidenceRequired: true,
    reattestIntervalDays: 30,
};
const legalA: AttestationRequirement = {
    requiredRole: "legal",
    evidenceRequired: true,
    reattestIntervalDays: 90,
};
const qaA: AttestationRequirement = {
    requiredRole: "qa",
    evidenceRequired: true,
    reattestIntervalDays: 30,
};

// ---------------------------------------------------------------------------
// Exported helpers — used by quality-standards-registry.ts
// ---------------------------------------------------------------------------

export { c, V1, engA, leadA, secA, a11yA, legalA, qaA };
