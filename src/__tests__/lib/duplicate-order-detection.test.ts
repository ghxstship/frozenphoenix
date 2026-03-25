import { describe, expect, it } from "vitest";
import { computeOrderSimilarity } from "@/lib/data-hooks/hooks-feature-gaps";

// ═══════════════════════════════════════════════════════════════
// DUPLICATE ORDER DETECTION (GAP-PRC-01)
// ═══════════════════════════════════════════════════════════════

describe("computeOrderSimilarity", () => {
    it("exact vendor + amount match returns high similarity", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v1", total_amount: 5000 }
        );
        expect(result.similarity).toBe(80); // 40 vendor + 40 amount
        expect(result.reasons).toContain("Same vendor");
        expect(result.reasons).toContain("Exact amount match");
    });

    it("different vendor returns low similarity", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v2", total_amount: 5000 }
        );
        // No vendor match (0), but amount match (40) = 40
        expect(result.similarity).toBe(40);
        expect(result.reasons).not.toContain("Same vendor");
    });

    it("same vendor, different amount outside tolerance returns no amount match", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 1000 },
            { vendor_id: "v1", total_amount: 5000 }
        );
        // Vendor match (40), amount diff > 10% (0) = 40
        expect(result.similarity).toBe(40);
        expect(result.reasons).not.toContain("Exact amount match");
    });

    it("same vendor, amount within 10% tolerance returns match", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v1", total_amount: 5300 } // 6% difference
        );
        expect(result.similarity).toBeGreaterThan(50); // 40 vendor + partial amount
        expect(result.reasons).toContain("Same vendor");
    });

    it("amount at exact 10% boundary still matches", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 1000 },
            { vendor_id: "v1", total_amount: 1100 } // exactly 10%
        );
        // Should still qualify as within tolerance
        expect(result.similarity).toBeGreaterThanOrEqual(40); // at least vendor match
    });

    it("description overlap boosts similarity", () => {
        const withDesc = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000, description: "audio equipment rental" },
            {
                vendor_id: "v1",
                total_amount: 5000,
                description: "audio equipment rental for event",
            }
        );
        const withoutDesc = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v1", total_amount: 5000 }
        );
        expect(withDesc.similarity).toBeGreaterThan(withoutDesc.similarity);
        expect(withDesc.reasons).toContain("Similar description");
    });

    it("no description overlap doesn't trigger description reason", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000, description: "alpha beta gamma" },
            { vendor_id: "v1", total_amount: 5000, description: "delta epsilon zeta" }
        );
        expect(result.reasons).not.toContain("Similar description");
    });

    it("missing description on either side doesn't crash", () => {
        expect(() =>
            computeOrderSimilarity(
                { vendorId: "v1", amount: 5000 },
                { vendor_id: "v1", total_amount: 5000, description: "something" }
            )
        ).not.toThrow();

        expect(() =>
            computeOrderSimilarity(
                { vendorId: "v1", amount: 5000, description: "something" },
                { vendor_id: "v1", total_amount: 5000, description: null }
            )
        ).not.toThrow();
    });

    it("completely different orders return low similarity", () => {
        const result = computeOrderSimilarity(
            { vendorId: "v1", amount: 100 },
            { vendor_id: "v2", total_amount: 50000 }
        );
        expect(result.similarity).toBeLessThan(50); // Below threshold
    });

    it("multiple matches are scoreable for ranking", () => {
        const exact = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v1", total_amount: 5000 }
        );
        const partial = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v1", total_amount: 5200 }
        );
        const different = computeOrderSimilarity(
            { vendorId: "v1", amount: 5000 },
            { vendor_id: "v2", total_amount: 3000 }
        );

        expect(exact.similarity).toBeGreaterThan(partial.similarity);
        expect(partial.similarity).toBeGreaterThan(different.similarity);
    });
});
