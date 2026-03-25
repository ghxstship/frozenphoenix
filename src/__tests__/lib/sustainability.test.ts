import { describe, expect, it } from "vitest";
import {
    computeSustainabilityScore,
    estimateCarbonFootprint,
} from "@/lib/data-hooks/hooks-sustainability";
import type { WasteMetrics } from "@/lib/data-hooks/hooks-sustainability";

// ─── estimateCarbonFootprint ─────────────────────────────────

describe("estimateCarbonFootprint", () => {
    it("computes correct kgCO2 for flight domestic", () => {
        const result = estimateCarbonFootprint({ flight_domestic_km: 1000 });
        // 1000 × 0.255 = 255
        expect(result).toHaveLength(1);
        expect(result[0]!.label).toBe("Domestic Flights");
        expect(result[0]!.kgCO2).toBe(255);
        expect(result[0]!.percentage).toBe(100);
    });

    it("computes percentages across multiple categories", () => {
        const result = estimateCarbonFootprint({
            flight_domestic_km: 1000,
            vehicle_km: 500,
        });
        expect(result).toHaveLength(2);
        const total = result.reduce((s, r) => s + r.kgCO2, 0);
        const pctSum = result.reduce((s, r) => s + r.percentage, 0);
        expect(total).toBeGreaterThan(0);
        expect(pctSum).toBeLessThanOrEqual(101); // rounding tolerance
        expect(pctSum).toBeGreaterThanOrEqual(99);
    });

    it("filters out zero-emission categories", () => {
        const result = estimateCarbonFootprint({ flight_domestic_km: 0, vehicle_km: 100 });
        expect(result).toHaveLength(1);
        expect(result[0]!.label).toBe("Ground Transport");
    });

    it("returns empty array for empty inputs", () => {
        const result = estimateCarbonFootprint({});
        expect(result).toHaveLength(0);
    });

    it("handles catering meals correctly", () => {
        const result = estimateCarbonFootprint({ catering_meals: 100 });
        // 100 × 2.5 = 250
        expect(result[0]!.kgCO2).toBe(250);
    });
});

// ─── computeSustainabilityScore ──────────────────────────────

describe("computeSustainabilityScore", () => {
    const goodWaste: WasteMetrics = {
        totalWasteKg: 1000,
        recycledKg: 700,
        compostedKg: 200,
        landfillKg: 100,
        diversionRate: 0.9,
    };

    const poorWaste: WasteMetrics = {
        totalWasteKg: 1000,
        recycledKg: 100,
        compostedKg: 50,
        landfillKg: 850,
        diversionRate: 0.15,
    };

    it("returns grade B or better for low carbon + high diversion", () => {
        const score = computeSustainabilityScore(500, goodWaste);
        expect(["A", "B"]).toContain(score.grade);
        expect(score.overall).toBeGreaterThanOrEqual(80);
    });

    it("returns low grade for high carbon + poor waste", () => {
        const score = computeSustainabilityScore(15000, poorWaste);
        expect(["D", "F"]).toContain(score.grade);
        expect(score.overall).toBeLessThan(50);
    });

    it("returns carbon score of 100 for zero emissions", () => {
        const score = computeSustainabilityScore(0, goodWaste);
        expect(score.carbon).toBe(100);
    });

    it("clamps carbon score at 0 for extreme emissions", () => {
        const score = computeSustainabilityScore(20000, goodWaste);
        expect(score.carbon).toBe(0);
    });

    it("waste score maps directly from diversion rate", () => {
        const score = computeSustainabilityScore(5000, goodWaste);
        expect(score.waste).toBe(90); // 0.9 × 100
    });

    it("overall is weighted correctly", () => {
        const score = computeSustainabilityScore(5000, goodWaste);
        // carbon: 50, waste: 90, energy: 65, water: 70
        // 50*0.35 + 90*0.3 + 65*0.2 + 70*0.15 = 17.5 + 27 + 13 + 10.5 = 68
        expect(score.overall).toBe(68);
    });
});
