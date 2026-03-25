"use client";

/* ═══════════════════════════════════════════════════════════════
   SUSTAINABILITY HOOKS — Carbon, Waste & Green Score Tracking

   Hooks for sustainability metrics: carbon footprint estimation,
   waste management metrics, and aggregate sustainability scoring.
   ═══════════════════════════════════════════════════════════════ */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

// ─── Types ───────────────────────────────────────────────────

export interface CarbonEstimate {
    category: string;
    label: string;
    kgCO2: number;
    percentage: number;
}

export interface WasteMetrics {
    totalWasteKg: number;
    recycledKg: number;
    compostedKg: number;
    landfillKg: number;
    diversionRate: number;
}

export interface SustainabilityScore {
    overall: number;
    carbon: number;
    waste: number;
    energy: number;
    water: number;
    grade: "A" | "B" | "C" | "D" | "F";
}

// ─── Carbon Estimation ──────────────────────────────────────

/** Default emission factors (kgCO2 per unit) */
const EMISSION_FACTORS = {
    flight_domestic_km: 0.255,
    flight_international_km: 0.195,
    vehicle_km: 0.21,
    hotel_night: 31.1,
    venue_sqm_day: 0.5,
    generator_kwh: 0.9,
    catering_meal: 2.5,
};

/**
 * Estimate total carbon footprint from project data.
 * Pure function, exported for testing.
 */
export function estimateCarbonFootprint(inputs: Record<string, number>): CarbonEstimate[] {
    const estimates: CarbonEstimate[] = [];
    let total = 0;

    const categories: { key: string; factor: number; label: string }[] = [
        {
            key: "flight_domestic_km",
            factor: EMISSION_FACTORS.flight_domestic_km,
            label: "Domestic Flights",
        },
        {
            key: "flight_international_km",
            factor: EMISSION_FACTORS.flight_international_km,
            label: "International Flights",
        },
        { key: "vehicle_km", factor: EMISSION_FACTORS.vehicle_km, label: "Ground Transport" },
        { key: "hotel_nights", factor: EMISSION_FACTORS.hotel_night, label: "Accommodation" },
        { key: "venue_sqm_days", factor: EMISSION_FACTORS.venue_sqm_day, label: "Venue" },
        { key: "generator_kwh", factor: EMISSION_FACTORS.generator_kwh, label: "Power Generation" },
        { key: "catering_meals", factor: EMISSION_FACTORS.catering_meal, label: "Catering" },
    ];

    for (const cat of categories) {
        const qty = inputs[cat.key] ?? 0;
        const kgCO2 = Math.round(qty * cat.factor * 10) / 10;
        total += kgCO2;
        estimates.push({ category: cat.key, label: cat.label, kgCO2, percentage: 0 });
    }

    // Compute percentages
    for (const est of estimates) {
        est.percentage = total > 0 ? Math.round((est.kgCO2 / total) * 100) : 0;
    }

    return estimates.filter((e) => e.kgCO2 > 0);
}

/**
 * Compute sustainability score (0-100) from metrics.
 * Pure function, exported for testing.
 */
export function computeSustainabilityScore(
    carbonKg: number,
    wasteMetrics: WasteMetrics
): SustainabilityScore {
    // Carbon score: lower is better, baseline 10000 kgCO2 per event
    const carbonScore = Math.max(0, Math.min(100, Math.round(100 - (carbonKg / 10000) * 100)));

    // Waste score: diversion rate directly maps to score
    const wasteScore = Math.round(wasteMetrics.diversionRate * 100);

    // Energy score: placeholder (would need power monitoring data)
    const energyScore = 65;

    // Water score: placeholder
    const waterScore = 70;

    const overall = Math.round(
        carbonScore * 0.35 + wasteScore * 0.3 + energyScore * 0.2 + waterScore * 0.15
    );

    const grade: SustainabilityScore["grade"] =
        overall >= 90 ? "A" : overall >= 75 ? "B" : overall >= 60 ? "C" : overall >= 40 ? "D" : "F";

    return {
        overall,
        carbon: carbonScore,
        waste: wasteScore,
        energy: energyScore,
        water: waterScore,
        grade,
    };
}

// ─── Hooks ───────────────────────────────────────────────────

export function useCarbonFootprint(projectId?: string | undefined) {
    return useQuery({
        queryKey: ["carbon_footprint", projectId],
        queryFn: async () => {
            const res = await apiFetch<{ inputs: Record<string, number> }>(
                `/api/sustainability/carbon${projectId ? `?project_id=${projectId}` : ""}`
            );
            return estimateCarbonFootprint(res.inputs ?? {});
        },
        enabled: true,
    });
}

export function useWasteMetrics(eventId?: string | undefined) {
    return useQuery({
        queryKey: ["waste_metrics", eventId],
        queryFn: async () => {
            const res = await apiFetch<WasteMetrics>(
                `/api/sustainability/waste${eventId ? `?event_id=${eventId}` : ""}`
            );
            return res;
        },
        enabled: true,
    });
}

export function useSustainabilityScore(projectId?: string | undefined) {
    const { data: carbon } = useCarbonFootprint(projectId);
    const { data: waste } = useWasteMetrics();

    return useQuery({
        queryKey: ["sustainability_score", projectId, carbon, waste],
        queryFn: () => {
            const totalCarbon = (carbon ?? []).reduce((s, e) => s + e.kgCO2, 0);
            const wasteData: WasteMetrics = waste ?? {
                totalWasteKg: 0,
                recycledKg: 0,
                compostedKg: 0,
                landfillKg: 0,
                diversionRate: 0,
            };
            return computeSustainabilityScore(totalCarbon, wasteData);
        },
        enabled: true,
    });
}
