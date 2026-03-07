/**
 * Quality Gate Config Tests (WS-16)
 *
 * Validates the quality gate configuration structure, threshold values,
 * and policy enforcement settings.
 */

import { describe, expect, it } from "vitest";
import { qualityGateConfig } from "@/../quality-gate.config";
import type { QualityGateConfig } from "@/../quality-gate.config";

describe("Quality Gate Configuration", () => {
    it("has valid standards version format", () => {
        expect(qualityGateConfig.standardsVersion).toMatch(/^\d+\.\d+$/);
    });

    it("has valid lastUpdated ISO date", () => {
        expect(new Date(qualityGateConfig.lastUpdated).toISOString()).toBeTruthy();
    });

    it("globalPolicy is BLOCK_DEPLOY", () => {
        expect(qualityGateConfig.globalPolicy).toBe("BLOCK_DEPLOY");
    });

    it("all criteria are deploy blockers", () => {
        expect(qualityGateConfig.allCriteriaAreBlockers).toBe(true);
    });

    describe("Thresholds", () => {
        it("Lighthouse thresholds are reasonable (≥ 80)", () => {
            const { lighthouse } = qualityGateConfig.thresholds;
            expect(lighthouse.performance).toBeGreaterThanOrEqual(80);
            expect(lighthouse.accessibility).toBeGreaterThanOrEqual(80);
            expect(lighthouse.bestPractices).toBeGreaterThanOrEqual(80);
            expect(lighthouse.seo).toBeGreaterThanOrEqual(80);
        });

        it("accessibility score requires ≥ 95", () => {
            expect(qualityGateConfig.thresholds.lighthouse.accessibility).toBeGreaterThanOrEqual(
                95
            );
            expect(
                qualityGateConfig.thresholds.accessibility.lighthouseA11yScore
            ).toBeGreaterThanOrEqual(95);
        });

        it("zero tolerance for critical/high vulnerabilities", () => {
            const { security } = qualityGateConfig.thresholds;
            expect(security.maxCriticalVulnerabilities).toBe(0);
            expect(security.maxHighVulnerabilities).toBe(0);
        });

        it("TypeScript strict mode enabled", () => {
            expect(qualityGateConfig.thresholds.typescript.strict).toBe(true);
        });

        it("Core Web Vitals thresholds set", () => {
            const { performance } = qualityGateConfig.thresholds;
            expect(performance.lcpMs).toBeLessThanOrEqual(2500);
            expect(performance.inpMs).toBeLessThanOrEqual(200);
            expect(performance.cls).toBeLessThanOrEqual(0.1);
            expect(performance.ttfbMs).toBeLessThanOrEqual(800);
        });

        it("test coverage thresholds are meaningful", () => {
            const { coverage } = qualityGateConfig.thresholds;
            expect(coverage.unit).toBeGreaterThanOrEqual(70);
            expect(coverage.integration).toBeGreaterThanOrEqual(50);
            expect(coverage.e2e).toBeGreaterThanOrEqual(40);
        });

        it("zero tolerance for axe a11y violations", () => {
            expect(qualityGateConfig.thresholds.accessibility.axeViolations).toBe(0);
        });
    });

    describe("Waiver Policy", () => {
        it("waivers are enabled", () => {
            expect(qualityGateConfig.waiverPolicy.enabled).toBe(true);
        });

        it("waivers have maximum duration", () => {
            expect(qualityGateConfig.waiverPolicy.maxWaiverDurationDays).toBeGreaterThan(0);
            expect(qualityGateConfig.waiverPolicy.maxWaiverDurationDays).toBeLessThanOrEqual(30);
        });

        it("waivers require justification and remediation plan", () => {
            expect(qualityGateConfig.waiverPolicy.requiresJustification).toBe(true);
            expect(qualityGateConfig.waiverPolicy.requiresRemediationPlan).toBe(true);
        });
    });

    describe("Extension Sources", () => {
        it("includes WCAG reference", () => {
            const wcag = qualityGateConfig.extensionSources.find((s) => s.name === "WCAG");
            expect(wcag).toBeDefined();
        });

        it("includes OWASP reference", () => {
            const owasp = qualityGateConfig.extensionSources.find((s) => s.name === "OWASP Top 10");
            expect(owasp).toBeDefined();
        });

        it("includes Core Web Vitals reference", () => {
            const cwv = qualityGateConfig.extensionSources.find(
                (s) => s.name === "Core Web Vitals"
            );
            expect(cwv).toBeDefined();
        });
    });

    describe("Notifications", () => {
        it("gate failures notify via github-status", () => {
            expect(qualityGateConfig.notifications.onGateFailure).toContain("github-status");
        });

        it("waiver expiry creates github issues", () => {
            expect(qualityGateConfig.notifications.onWaiverExpiry).toContain("github-issue");
        });
    });

    describe("Type Safety", () => {
        it("config satisfies QualityGateConfig type", () => {
            // This is a compile-time check; if it compiles, it passes
            const _config: QualityGateConfig = qualityGateConfig;
            expect(_config).toBeDefined();
        });
    });
});
