/**
 * POST /api/invite-codes/distribute
 *
 * HARBOR-MASTER §6.5 — Distribute invite codes via email, CSV, or QR.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { randomBytes } from "crypto";
import { z } from "zod";

const distributeSchema = z.object({
    invite_code_ids: z.array(z.string().uuid()).min(1).max(500),
    method: z.enum(["email", "csv", "qr"]),
    recipients: z.array(z.string().email()).max(500).optional(),
    generate_unique_per_recipient: z.boolean().optional().default(false),
});

interface InviteCodeRow {
    id: string;
    code: string;
    organization_id: string;
    project_id: string | null;
    role_id: string;
    is_active: boolean;
    expires_at: string | null;
    max_uses: number | null;
    current_uses: number;
    requires_approval: boolean;
    organizations: unknown;
    roles: unknown;
}

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/invite-codes/distribute",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = distributeSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const { invite_code_ids, method, recipients, generate_unique_per_recipient } = parsed.data;

        // ── 1. Fetch the invite codes (verify ownership) ───────────────────
        const { data: codes } = await serverFromTable(supabase, "invite_codes")
            .select(
                "id, code, organization_id, project_id, role_id, is_active, " +
                    "expires_at, max_uses, current_uses, requires_approval, " +
                    "organizations(name, slug), roles(name)"
            )
            .in("id", invite_code_ids)
            .eq("is_active", true);

        if (!codes || codes.length === 0) {
            return ApiErrors.notFound("No active invite codes found");
        }

        // Verify caller has can_generate_invite_codes in all relevant orgs
        const typedCodes = codes as InviteCodeRow[];
        const orgIds = [...new Set(typedCodes.map((c) => c.organization_id))];
        for (const orgId of orgIds) {
            const canGenerate = await resolveCanGenerateCodes(supabase, user.id, orgId);
            if (!canGenerate) {
                return ApiErrors.forbidden(
                    "You do not have permission to distribute codes in this organization"
                );
            }
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://atlvs.one";

        // ── 2. Email distribution ──────────────────────────────────────────
        if (method === "email") {
            if (!recipients || recipients.length === 0) {
                return ApiErrors.badRequest("recipients array is required for email distribution");
            }

            // If 1:1 unique codes per recipient, generate new codes for each recipient
            if (generate_unique_per_recipient && typedCodes.length > 0) {
                const baseCode = typedCodes[0] as InviteCodeRow;
                // Bulk-generate unique codes for each recipient
                const uniqueCodeRows = recipients.map((_email) => {
                    const rand = randomBytes(2).toString("hex").toUpperCase();
                    const orgSlug =
                        (baseCode.organizations as unknown as { slug?: string } | null)?.slug
                            ?.toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 12) ?? "ORG";
                    const year = new Date().getFullYear().toString().slice(-2);
                    const scope = baseCode.project_id ? `PRJ${year}` : `ORG${year}`;
                    return {
                        code: `${orgSlug}-${scope}-${rand}`,
                        organization_id: baseCode.organization_id,
                        project_id: baseCode.project_id,
                        role_id: baseCode.role_id,
                        created_by: user.id,
                        max_uses: 1, // single-use per recipient
                        current_uses: 0,
                        is_active: true,
                        requires_approval: baseCode.requires_approval,
                        expires_at: baseCode.expires_at,
                    };
                });

                const { data: newCodes, error: insertError } = await serverFromTable(
                    supabase,
                    "invite_codes"
                )
                    .insert(uniqueCodeRows)
                    .select("id, code");

                if (insertError || !newCodes) {
                    return ApiErrors.internalError("Failed to generate per-recipient codes");
                }

                // Send emails (non-blocking)
                void Promise.allSettled(
                    recipients.map(async (email, idx) => {
                        const c = (newCodes as Array<{ id: string; code: string }>)[idx];
                        if (!c) return;
                        try {
                            await fetch(`${appUrl}/api/invitations/send-email`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    to: email,
                                    token: null,
                                    code: c.code,
                                    codeUrl: `${appUrl}/join?code=${encodeURIComponent(c.code)}`,
                                    inviteType: "invite_code",
                                    appUrl,
                                }),
                            });
                        } catch {
                            // Non-blocking
                        }
                    })
                );

                return NextResponse.json({
                    distributed: (newCodes as unknown[]).length,
                    method: "email",
                    unique_per_recipient: true,
                });
            }

            // Round-robin existing codes across recipients
            const emailsSent = recipients.length;
            void Promise.allSettled(
                recipients.map(async (email, idx) => {
                    const c = typedCodes[idx % typedCodes.length];
                    if (!c) return;
                    try {
                        await fetch(`${appUrl}/api/invitations/send-email`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                to: email,
                                token: null,
                                code: c.code,
                                codeUrl: `${appUrl}/join?code=${encodeURIComponent(c.code)}`,
                                inviteType: "invite_code",
                                appUrl,
                            }),
                        });
                    } catch {
                        // Non-blocking
                    }
                })
            );

            return NextResponse.json({ distributed: emailsSent, method: "email" });
        }

        // ── 3. CSV export ──────────────────────────────────────────────────
        if (method === "csv") {
            const csvRows = [
                "code,scope,role,max_uses,expires_at,url",
                ...typedCodes.map((c) => {
                    const org = c.organizations as unknown as { name?: string } | null;
                    const role = c.roles as unknown as { name?: string } | null;
                    const _scope = c.project_id ? "project" : "organization";
                    const url = `${appUrl}/join?code=${encodeURIComponent(c.code)}`;
                    return [
                        c.code,
                        org?.name ?? c.organization_id,
                        role?.name ?? c.role_id,
                        c.max_uses ?? "unlimited",
                        c.expires_at ?? "none",
                        url,
                    ]
                        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                        .join(",");
                }),
            ].join("\n");

            return new NextResponse(csvRows, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="invite-codes-${Date.now()}.csv"`,
                },
            });
        }

        // ── 4. QR code — return URLs for frontend QR generation ────────────
        if (method === "qr") {
            const qrData = typedCodes.map((c) => ({
                id: c.id,
                code: c.code,
                url: `${appUrl}/join?code=${encodeURIComponent(c.code)}`,
            }));

            return NextResponse.json({ qr_codes: qrData, method: "qr" });
        }

        return ApiErrors.badRequest("Unknown distribution method");
    }
);

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
