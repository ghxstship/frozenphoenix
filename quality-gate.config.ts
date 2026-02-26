/**
 * Quality Gate Configuration
 * 
 * Master configuration for the deployment quality gate system.
 * Every criterion in the quality standards registry is a deploy blocker by default.
 * 
 * This file controls:
 * - Version tracking for the standards themselves
 * - Global enforcement policy
 * - Threshold overrides for automated checks
 * - Attestation requirements for manual checks
 * - Extension points for new criteria as industry standards evolve
 * 
 * @version 2026.1
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StandardsVersion = `${number}.${number}`;

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type EnforcementPolicy = 'BLOCK_DEPLOY' | 'WARN_ONLY' | 'AUDIT_LOG';

export type CheckType =
  | 'automated'       // Runs in CI automatically (lint, type-check, test, etc.)
  | 'semi-automated'  // Requires tooling output + human interpretation
  | 'manual'          // Requires human attestation with evidence
  | 'continuous';     // Monitored post-deploy (uptime, RUM, etc.)

export type CheckCategory =
  | 'database'
  | 'components'
  | 'white-label'
  | 'i18n'
  | 'accessibility'
  | 'mobile'
  | 'security'
  | 'compliance'
  | 'api'
  | 'performance'
  | 'testing'
  | 'code-quality'
  | 'ci-cd'
  | 'cross-cutting';

export interface ThresholdOverride {
  readonly metric: string;
  readonly min?: number;
  readonly max?: number;
  readonly unit?: string;
}

export interface AttestationRequirement {
  readonly requiredRole: 'engineer' | 'lead' | 'security' | 'accessibility' | 'legal' | 'qa';
  readonly evidenceRequired: boolean;
  readonly reattestIntervalDays: number;
}

export interface QualityGateConfig {
  /** Semantic version of the standards being enforced */
  readonly standardsVersion: StandardsVersion;

  /** ISO-8601 date of last standards update */
  readonly lastUpdated: string;

  /** 
   * Global enforcement policy.
   * BLOCK_DEPLOY = all criteria must pass for deploy to proceed.
   * No exceptions without an explicit, time-boxed waiver.
   */
  readonly globalPolicy: EnforcementPolicy;

  /**
   * Whether ALL severity levels are treated as deploy blockers.
   * When true (default), even INFO-level criteria must be satisfied.
   * This is the core guarantee: every criterion is a deployment gate.
   */
  readonly allCriteriaAreBlockers: boolean;

  /**
   * Maximum age (in days) for manual attestations before re-attestation required.
   * Prevents stale "checkbox" approvals.
   */
  readonly maxAttestationAgeDays: number;

  /**
   * Waiver system: allows time-boxed exceptions with audit trail.
   * A waiver MUST have: criterion ID, justification, approver, expiry date.
   * Expired waivers automatically become deploy blockers again.
   */
  readonly waiverPolicy: {
    readonly enabled: boolean;
    readonly maxWaiverDurationDays: number;
    readonly requiredApproverRole: 'lead' | 'security' | 'legal';
    readonly requiresJustification: boolean;
    readonly requiresRemediationPlan: boolean;
  };

  /**
   * Automated check thresholds.
   * These map to specific automated checks in the quality gate runner.
   */
  readonly thresholds: {
    readonly lighthouse: {
      readonly performance: number;
      readonly accessibility: number;
      readonly bestPractices: number;
      readonly seo: number;
    };
    readonly coverage: {
      readonly unit: number;
      readonly integration: number;
      readonly e2e: number;
    };
    readonly bundle: {
      readonly mainBundleMaxKb: number;
      readonly routeChunkMaxKb: number;
    };
    readonly performance: {
      readonly lcpMs: number;
      readonly inpMs: number;
      readonly cls: number;
      readonly ttfbMs: number;
    };
    readonly security: {
      readonly maxCriticalVulnerabilities: number;
      readonly maxHighVulnerabilities: number;
      readonly maxMediumVulnerabilities: number;
    };
    readonly typescript: {
      readonly strict: boolean;
      readonly noUncheckedIndexedAccess: boolean;
      readonly noAny: boolean;
    };
    readonly accessibility: {
      readonly axeViolations: number;
      readonly lighthouseA11yScore: number;
    };
    readonly queryPerformance: {
      readonly maxQueryMs: number;
      readonly p50ResponseMs: number;
      readonly p95ResponseMs: number;
      readonly p99ResponseMs: number;
    };
  };

  /**
   * Extension manifest: URLs or references to external standards registries
   * that should be merged into the local registry on update.
   * This enables the system to adapt to new industry criteria.
   */
  readonly extensionSources: ReadonlyArray<{
    readonly name: string;
    readonly url: string;
    readonly autoMerge: boolean;
    readonly lastSynced?: string;
  }>;

  /**
   * Notification channels for gate failures.
   */
  readonly notifications: {
    readonly onGateFailure: ReadonlyArray<'github-status' | 'slack' | 'email'>;
    readonly onWaiverExpiry: ReadonlyArray<'github-issue' | 'slack' | 'email'>;
    readonly onNewStandard: ReadonlyArray<'github-issue' | 'slack'>;
  };
}

// ---------------------------------------------------------------------------
// Default Configuration
// ---------------------------------------------------------------------------

export const qualityGateConfig: QualityGateConfig = {
  standardsVersion: '2026.1',
  lastUpdated: '2026-02-26',

  globalPolicy: 'BLOCK_DEPLOY',
  allCriteriaAreBlockers: true,
  maxAttestationAgeDays: 30,

  waiverPolicy: {
    enabled: true,
    maxWaiverDurationDays: 14,
    requiredApproverRole: 'lead',
    requiresJustification: true,
    requiresRemediationPlan: true,
  },

  thresholds: {
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90,
    },
    coverage: {
      unit: 80,
      integration: 70,
      e2e: 60,
    },
    bundle: {
      mainBundleMaxKb: 200,
      routeChunkMaxKb: 50,
    },
    performance: {
      lcpMs: 2500,
      inpMs: 200,
      cls: 0.1,
      ttfbMs: 600,
    },
    security: {
      maxCriticalVulnerabilities: 0,
      maxHighVulnerabilities: 0,
      maxMediumVulnerabilities: 0,
    },
    typescript: {
      strict: true,
      noUncheckedIndexedAccess: true,
      noAny: true,
    },
    accessibility: {
      axeViolations: 0,
      lighthouseA11yScore: 95,
    },
    queryPerformance: {
      maxQueryMs: 100,
      p50ResponseMs: 100,
      p95ResponseMs: 500,
      p99ResponseMs: 1000,
    },
  },

  extensionSources: [
    {
      name: 'WCAG',
      url: 'https://www.w3.org/WAI/standards-guidelines/wcag/',
      autoMerge: false,
    },
    {
      name: 'OWASP Top 10',
      url: 'https://owasp.org/www-project-top-ten/',
      autoMerge: false,
    },
    {
      name: 'Core Web Vitals',
      url: 'https://web.dev/vitals/',
      autoMerge: false,
    },
  ],

  notifications: {
    onGateFailure: ['github-status', 'slack'],
    onWaiverExpiry: ['github-issue', 'slack'],
    onNewStandard: ['github-issue'],
  },
} as const;
