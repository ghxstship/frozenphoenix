import { describe, expect, it } from "vitest";
import { computeCompleteness, DATA_COMPLETENESS_RULES } from "@/lib/data-hooks/hooks-feature-gaps";
import type { DataCompletenessRule } from "@/lib/data-hooks/hooks-feature-gaps";

// ═══════════════════════════════════════════════════════════════
// DATA COMPLETENESS (GAP-CRW-01)
// ═══════════════════════════════════════════════════════════════

describe("DATA_COMPLETENESS_RULES", () => {
    it("covers at least crew, vendors, contacts, assets", () => {
        const types = DATA_COMPLETENESS_RULES.map((r) => r.entityType);
        expect(types).toContain("crew");
        expect(types).toContain("vendors");
        expect(types).toContain("contacts");
        expect(types).toContain("assets");
    });

    it("each rule has at least 3 required fields", () => {
        for (const rule of DATA_COMPLETENESS_RULES) {
            expect(
                rule.requiredFields.length,
                `${rule.entityType} should have ≥3 fields`
            ).toBeGreaterThanOrEqual(3);
        }
    });

    it("every field has a non-empty label and positive weight", () => {
        for (const rule of DATA_COMPLETENESS_RULES) {
            for (const f of rule.requiredFields) {
                expect(f.label.length, `${rule.entityType}.${f.field} label`).toBeGreaterThan(0);
                expect(f.weight, `${rule.entityType}.${f.field} weight`).toBeGreaterThan(0);
            }
        }
    });
});

describe("computeCompleteness", () => {
    const testRule: DataCompletenessRule = {
        entityType: "test",
        table: "test_table",
        requiredFields: [
            { field: "name", label: "Name", weight: 3 },
            { field: "email", label: "Email", weight: 3 },
            { field: "phone", label: "Phone", weight: 2 },
            { field: "note", label: "Note", weight: 1 },
        ],
    };

    it("returns 100% for a fully-filled record", () => {
        const record = { id: "1", name: "Jane", email: "j@x.com", phone: "555", note: "hi" };
        const result = computeCompleteness(record, testRule);
        expect(result.completenessPercent).toBe(100);
        expect(result.missingFields).toHaveLength(0);
        expect(result.filledCount).toBe(4);
        expect(result.totalCount).toBe(4);
    });

    it("returns 0% for a record with no required fields filled", () => {
        const record = { id: "2", name: "", email: null, phone: undefined, note: "" };
        const result = computeCompleteness(record, testRule);
        expect(result.completenessPercent).toBe(0);
        expect(result.missingFields).toHaveLength(4);
        expect(result.filledCount).toBe(0);
    });

    it("correctly identifies missing field names", () => {
        const record = { id: "3", name: "Jane", email: null, phone: "555", note: "" };
        const result = computeCompleteness(record, testRule);
        const missingLabels = result.missingFields.map((f) => f.label);
        expect(missingLabels).toContain("Email");
        expect(missingLabels).toContain("Note");
        expect(missingLabels).not.toContain("Name");
        expect(missingLabels).not.toContain("Phone");
    });

    it("handles null vs undefined vs empty string consistently as empty", () => {
        const record = { id: "4", name: null, email: undefined, phone: "", note: 0 };
        const result = computeCompleteness(record, testRule);
        // All treated as empty
        expect(result.filledCount).toBe(0);
        expect(result.completenessPercent).toBe(0);
    });

    it("weighted scoring produces different results than uniform scoring", () => {
        // Only high-weight fields filled (name + email = weight 6)
        const highWeight = computeCompleteness(
            { id: "5", name: "X", email: "x@x.com", phone: null, note: null },
            testRule
        );
        // Only low-weight fields filled (phone + note = weight 3)
        const lowWeight = computeCompleteness(
            { id: "6", name: null, email: null, phone: "555", note: "hi" },
            testRule
        );
        // Both have 2/4 fields filled, but weighted scores differ
        expect(highWeight.filledCount).toBe(2);
        expect(lowWeight.filledCount).toBe(2);
        expect(highWeight.completenessPercent).toBeGreaterThan(lowWeight.completenessPercent);
    });

    it("uses record name or title for display name", () => {
        expect(computeCompleteness({ id: "a", name: "Jane" }, testRule).name).toBe("Jane");
        expect(computeCompleteness({ id: "b", title: "Acme" }, testRule).name).toBe("Acme");
        expect(computeCompleteness({ id: "c" }, testRule).name).toBe("Unnamed");
    });
});
