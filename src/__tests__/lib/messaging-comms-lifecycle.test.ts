import { describe, expect, it } from "vitest";
import { commentCreateSchema } from "@/lib/validation/schemas";
import { catalogSearchSchema } from "@/lib/validation/advancing-schemas";

describe("Comment/Message Validation", () => {
    it("accepts valid comment", () => {
        const r = commentCreateSchema.safeParse({
            entity_type: "project",
            entity_id: "550e8400-e29b-41d4-a716-446655440000",
            content: "Looks good!",
        });
        expect(r.success).toBe(true);
    });
    it("rejects empty content", () => {
        expect(
            commentCreateSchema.safeParse({
                entity_type: "project",
                entity_id: "550e8400-e29b-41d4-a716-446655440000",
                content: "",
            }).success
        ).toBe(false);
    });
    it("rejects content over 5000 chars", () => {
        expect(
            commentCreateSchema.safeParse({
                entity_type: "X",
                entity_id: "550e8400-e29b-41d4-a716-446655440000",
                content: "x".repeat(5001),
            }).success
        ).toBe(false);
    });
    it("rejects empty entity_type", () => {
        expect(
            commentCreateSchema.safeParse({
                entity_type: "",
                entity_id: "550e8400-e29b-41d4-a716-446655440000",
                content: "X",
            }).success
        ).toBe(false);
    });
    it("rejects non-UUID entity_id", () => {
        expect(
            commentCreateSchema.safeParse({ entity_type: "X", entity_id: "bad", content: "X" })
                .success
        ).toBe(false);
    });
});

describe("Search Validation (Shared)", () => {
    it("accepts valid search", () => {
        const r = catalogSearchSchema.safeParse({ q: "barricade" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.limit).toBe(50);
    });
    it("rejects single char", () => {
        expect(catalogSearchSchema.safeParse({ q: "a" }).success).toBe(false);
    });
    it("rejects limit > 100", () => {
        expect(catalogSearchSchema.safeParse({ q: "test", limit: 200 }).success).toBe(false);
    });
    it("accepts custom limit", () => {
        const r = catalogSearchSchema.safeParse({ q: "test", limit: 25 });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.limit).toBe(25);
    });
});
