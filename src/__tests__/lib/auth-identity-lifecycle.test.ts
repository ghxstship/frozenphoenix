import { describe, expect, it } from "vitest";
import { invitationCreateSchema, organizationCreateSchema } from "@/lib/validation/schemas";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("Organization Validation", () => {
    it("accepts valid org", () => {
        const r = organizationCreateSchema.safeParse({ name: "GHXSTSHIP Industries" });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.role).toBe("pm");
    });
    it("rejects short name", () => {
        expect(organizationCreateSchema.safeParse({ name: "A" }).success).toBe(false);
    });
    it("rejects invalid slug", () => {
        expect(
            organizationCreateSchema.safeParse({ name: "X Y", slug: "INVALID SLUG!" }).success
        ).toBe(false);
    });
    it("accepts valid slug", () => {
        const r = organizationCreateSchema.safeParse({ name: "Valid Org", slug: "valid-slug-123" });
        if (!r.success) {
            expect(r.error.issues.map((i) => i.message)).toEqual([]);
        }
        expect(r.success).toBe(true);
    });
    it("rejects invalid currency length", () => {
        expect(organizationCreateSchema.safeParse({ name: "X", currency: "US" }).success).toBe(
            false
        );
    });
    it("accepts all valid self-assigned roles", () => {
        for (const role of ["exec", "director", "pm", "member"]) {
            const r = organizationCreateSchema.safeParse({ name: "Valid Org", role });
            if (!r.success) {
                expect(r.error.issues.map((i) => i.message)).toEqual([]);
            }
            expect(r.success).toBe(true);
        }
    });
});

describe("Invitation Validation", () => {
    it("accepts valid invitation", () => {
        const r = invitationCreateSchema.safeParse({
            invitees: [{ email: "test@example.com", role: "pm" }],
            organization_id: UUID,
        });
        expect(r.success).toBe(true);
    });
    it("rejects empty invitees", () => {
        expect(
            invitationCreateSchema.safeParse({ invitees: [], organization_id: UUID }).success
        ).toBe(false);
    });
    it("rejects invalid email", () => {
        expect(
            invitationCreateSchema.safeParse({
                invitees: [{ email: "bad" }],
                organization_id: UUID,
            }).success
        ).toBe(false);
    });
    it("rejects missing org_id for org_invite", () => {
        expect(invitationCreateSchema.safeParse({ invitees: [{ email: "x@x.com" }] }).success).toBe(
            false
        );
    });
    it("defaults role to member", () => {
        const r = invitationCreateSchema.safeParse({
            invitees: [{ email: "x@x.com" }],
            organization_id: UUID,
        });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.invitees[0]!.role).toBe("member");
    });
    it("accepts all 6 RBAC roles", () => {
        for (const role of ["exec", "director", "pm", "member", "client", "collaborator"]) {
            const r = invitationCreateSchema.safeParse({
                invitees: [{ email: "x@x.com", role }],
                organization_id: UUID,
            });
            expect(r.success).toBe(true);
        }
    });
    it("supports up to 50 invitees", () => {
        const invitees = Array.from({ length: 50 }, (_, i) => ({
            email: `user${i}@x.com`,
            role: "member" as const,
        }));
        expect(invitationCreateSchema.safeParse({ invitees, organization_id: UUID }).success).toBe(
            true
        );
    });
    it("rejects more than 50 invitees", () => {
        const invitees = Array.from({ length: 51 }, (_, i) => ({ email: `user${i}@x.com` }));
        expect(invitationCreateSchema.safeParse({ invitees, organization_id: UUID }).success).toBe(
            false
        );
    });
});
