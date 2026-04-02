/**
 * POST /api/invite-codes/generate
 *
 * HARBOR-MASTER §6.4 — Generate invite codes (single or bulk).
 * Format: {ORG_SLUG}-{SCOPE}{YY}-{RANDOM_4} per §3.1.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { z } from "zod";
import { randomBytes } from "crypto";

const generateSchema = z.object({
    organization_id: z.string().uuid(),
    project_id: z.string().uuid().optional(),
    role_id: z.string().uuid(),
    count: z.number().int().min(1).max(500),
    max_uses: z.number().int().positive().optional(),
    expires_at: z.string().datetime().optional(),
    requires_approval: z.boolean().optional().default(false),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invite-codes/generate",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = generateSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const {
            organization_id,
            project_id,
            role_id,
            count,
            max_uses,
            expires_at,
            requires_approval,
        } = parsed.data;

        // ── 1. Caller must have can_generate_invite_codes permission ────────
        const canGenerate = await resolveCanGenerateCodes(supabase, user.id, organization_id);
        if (!canGenerate) {
            return ApiErrors.forbidden(
                "Your role does not have permission to generate invite codes"
            );
        }

        // ── 2. Bulk requires can_bulk_invite ───────────────────────────────
        if (count > 1) {
            const canBulk = await resolveCanBulkInvite(supabase, user.id, organization_id);
            if (!canBulk) {
                return ApiErrors.forbidden(
                    "Your role does not have permission to bulk-generate invite codes"
                );
            }
        }

        // ── 3. Org invite_code_enabled must be true ────────────────────────
        const { data: org } = await serverFromTable(supabase, "organizations")
            .select("slug, invite_code_enabled")
            .eq("id", organization_id)
            .single();

        if (!org) return ApiErrors.notFound("Organization");
        if (org.invite_code_enabled === false) {
            return ApiErrors.forbidden("Invite codes are disabled for this organization");
        }

        // ── 4. Project invite_code_enabled (if project-scoped) ────────────
        let projectSlug: string | null = null;
        if (project_id) {
            const { data: project } = await serverFromTable(supabase, "projects")
                .select("slug, invite_code_enabled")
                .eq("id", project_id)
                .single();

            if (!project) return ApiErrors.notFound("Project");
            if (project.invite_code_enabled === false) {
                return ApiErrors.forbidden("Invite codes are disabled for this project");
            }
            projectSlug = project.slug ?? null;
        }

        // ── 5. Role hierarchy ceiling ──────────────────────────────────────
        const { data: targetRole } = await serverFromTable(supabase, "roles")
            .select("hierarchy_level, name")
            .eq("id", role_id)
            .single();

        if (!targetRole) return ApiErrors.badRequest("Invalid role_id");

        const callerLevel = await resolveCallerHierarchyLevel(supabase, user.id, organization_id);
        if (targetRole.hierarchy_level !== null && targetRole.hierarchy_level < callerLevel) {
            return ApiErrors.forbidden(
                `Cannot generate a code for role "${targetRole.name}" — it outranks your role`
            );
        }

        // ── 6. Generate unique code strings ───────────────────────────────
        const orgSlug = org.slug
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 12);
        const year = new Date().getFullYear().toString().slice(-2);
        const scope = project_id ? `PRJ${year}` : `ORG${year}`;
        const projectPart = projectSlug
            ? `-${projectSlug
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 6)}`
            : "";

        const codes: string[] = [];
        const attempts = count * 5; // headroom for collision retries
        let generated = 0;
        for (let i = 0; i < attempts && generated < count; i++) {
            const rand = randomBytes(2).toString("hex").toUpperCase();
            const candidate = `${orgSlug}-${scope}${projectPart}-${rand}`;
            if (!codes.includes(candidate)) {
                codes.push(candidate);
                generated++;
            }
        }

        // ── 7. Batch insert ───────────────────────────────────────────────
        const rows = codes.map((code) => ({
            code,
            organization_id,
            project_id: project_id ?? null,
            role_id,
            created_by: user.id,
            max_uses: max_uses ?? null,
            current_uses: 0,
            is_active: true,
            requires_approval: requires_approval ?? false,
            expires_at: expires_at ?? null,
        }));

        const { data: inserted, error: insertError } = await serverFromTable(
            supabase,
            "invite_codes"
        )
            .insert(rows)
            .select("id, code");

        if (insertError || !inserted) {
            return ApiErrors.internalError("Failed to generate invite codes");
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://atlvs.one";
        const result = inserted.map((ic: { id: string; code: string }) => ({
            id: ic.id,
            code: ic.code,
            url: `${appUrl}/join?code=${encodeURIComponent(ic.code)}`,
        }));

        return NextResponse.json({ codes: result }, { status: 201 });
    }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveCanGenerateCodes(
    supabase: Parameters<typeof serverFromTable>[0],
    userId: string,
    orgId: string
): Promise<boolean> {
    const { data } = await serverFromTable(supabase, "org_memberships")
        .select("role, roles(can_generate_invite_codes)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return false;
    const r = data.roles as unknown as { can_generate_invite_codes: boolean } | null;
    if (r) return r.can_generate_invite_codes;
    return ["exec", "director", "pm"].includes(data.role ?? "");
}

async function resolveCanBulkInvite(
    supabase: Parameters<typeof serverFromTable>[0],
    userId: string,
    orgId: string
): Promise<boolean> {
    const { data } = await serverFromTable(supabase, "org_memberships")
        .select("role, roles(can_bulk_invite)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return false;
    const r = data.roles as unknown as { can_bulk_invite: boolean } | null;
    if (r) return r.can_bulk_invite;
    return ["exec", "director"].includes(data.role ?? "");
}

async function resolveCallerHierarchyLevel(
    supabase: Parameters<typeof serverFromTable>[0],
    userId: string,
    orgId: string
): Promise<number> {
    const { data } = await serverFromTable(supabase, "org_memberships")
        .select("role, roles(hierarchy_level)")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .eq("status", "active")
        .maybeSingle();

    if (!data) return 99;
    const r = data.roles as unknown as { hierarchy_level: number | null } | null;
    if (r?.hierarchy_level != null) return r.hierarchy_level;
    const map: Record<string, number> = {
        exec: 1,
        director: 2,
        pm: 3,
        member: 4,
        client: 5,
        collaborator: 6,
    };
    return map[data.role ?? ""] ?? 99;
}
