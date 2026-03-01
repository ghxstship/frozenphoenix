import { describe, it, expect } from "vitest";
import { validate, invitationCreateSchema, organizationCreateSchema, dealCreateSchema, taskCreateSchema } from "@/lib/validation/schemas";

describe("validate helper", () => {
    it("returns success with valid data", () => {
        const result = validate(dealCreateSchema, {
            title: "Test Deal",
            company_name: "Acme Corp",
            value: 10000,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.title).toBe("Test Deal");
        }
    });

    it("returns errors with invalid data", () => {
        const result = validate(dealCreateSchema, {
            title: "",
            company_name: "",
            value: -1,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(Object.keys(result.errors).length).toBeGreaterThan(0);
        }
    });
});

describe("invitationCreateSchema", () => {
    it("validates valid invitation with per-invitee roles", () => {
        const result = invitationCreateSchema.safeParse({
            invitees: [{ email: "test@example.com", role: "pm" }],
            organization_id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
    });

    it("rejects empty invitees array", () => {
        const result = invitationCreateSchema.safeParse({
            invitees: [],
            organization_id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid email in invitees", () => {
        const result = invitationCreateSchema.safeParse({
            invitees: [{ email: "not-an-email", role: "pm" }],
            organization_id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid organization_id", () => {
        const result = invitationCreateSchema.safeParse({
            invitees: [{ email: "test@example.com", role: "pm" }],
            organization_id: "not-a-uuid",
        });
        expect(result.success).toBe(false);
    });

    it("defaults invitee role to pm", () => {
        const result = invitationCreateSchema.safeParse({
            invitees: [{ email: "test@example.com" }],
            organization_id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.invitees[0]!.role).toBe("pm");
        }
    });

    it("supports multiple invitees with different roles", () => {
        const result = invitationCreateSchema.safeParse({
            invitees: [
                { email: "pm@example.com", role: "pm" },
                { email: "client@example.com", role: "client" },
                { email: "vendor@example.com", role: "vendor" },
            ],
            organization_id: "550e8400-e29b-41d4-a716-446655440000",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.invitees).toHaveLength(3);
            expect(result.data.invitees[1]!.role).toBe("client");
        }
    });
});

describe("organizationCreateSchema", () => {
    it("validates valid organization", () => {
        const result = organizationCreateSchema.safeParse({
            name: "Acme Corp",
            slug: "acme-corp",
        });
        expect(result.success).toBe(true);
    });

    it("rejects short name", () => {
        const result = organizationCreateSchema.safeParse({
            name: "A",
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid slug format", () => {
        const result = organizationCreateSchema.safeParse({
            name: "Acme Corp",
            slug: "INVALID SLUG!",
        });
        expect(result.success).toBe(false);
    });

    it("rejects invalid currency length", () => {
        const result = organizationCreateSchema.safeParse({
            name: "Acme Corp",
            currency: "US",
        });
        expect(result.success).toBe(false);
    });
});

describe("taskCreateSchema", () => {
    it("validates minimal task", () => {
        const result = taskCreateSchema.safeParse({
            title: "Fix the bug",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe("todo");
            expect(result.data.priority).toBe("medium");
        }
    });

    it("rejects empty title", () => {
        const result = taskCreateSchema.safeParse({
            title: "",
        });
        expect(result.success).toBe(false);
    });
});
