/**
 * POST /api/join-requests
 *
 * HARBOR-MASTER Flow D — Manual Join Request.
 * Any authenticated user can request to join an org or project.
 */

import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { z } from "zod";

const createSchema = z.object({
    organization_id: z.string().uuid(),
    project_id: z.string().uuid().optional(),
});

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/join-requests",
        mutation: true,
    },
    async (request, { supabase, user }) => {
        const body: unknown = await request.json();
        const parsed = createSchema.safeParse(body);
        if (!parsed.success) {
            return ApiErrors.badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
        }
        const { organization_id, project_id } = parsed.data;

        // ── 1. Check no existing active membership ─────────────────────────
        const memberQuery = serverFromTable(supabase, "org_memberships")
            .select("id, status")
            .eq("user_id", user.id)
            .eq("organization_id", organization_id);

        const { data: existingMembership } = project_id
            ? await memberQuery.eq("project_id", project_id).maybeSingle()
            : await memberQuery.is("project_id", null).maybeSingle();

        if (existingMembership?.status === "active") {
            return ApiErrors.conflict("You are already a member of this organization");
        }

        // ── 2. Check no existing pending request ───────────────────────────
        const requestQuery = serverFromTable(supabase, "join_requests")
            .select("id, status")
            .eq("user_id", user.id)
            .eq("organization_id", organization_id)
            .eq("status", "pending");

        const { data: existingRequest } = project_id
            ? await requestQuery.eq("project_id", project_id).maybeSingle()
            : await requestQuery.is("project_id", null).maybeSingle();

        if (existingRequest) {
            return ApiErrors.conflict(
                "You already have a pending request to join this organization"
            );
        }

        // ── 3. Create join request ─────────────────────────────────────────
        const { data: joinRequest, error: insertError } = await serverFromTable(
            supabase,
            "join_requests"
        )
            .insert({
                user_id: user.id,
                organization_id,
                project_id: project_id ?? null,
                status: "pending",
            })
            .select("id, status, requested_at")
            .single();

        if (insertError || !joinRequest) {
            return ApiErrors.internalError("Failed to create join request");
        }

        return NextResponse.json(
            {
                join_request_id: joinRequest.id,
                status: joinRequest.status,
                requested_at: joinRequest.requested_at,
                message:
                    "Your join request has been submitted. The organization admin will review it.",
            },
            { status: 201 }
        );
    }
);

/**
 * GET /api/join-requests
 * Returns the caller's own join requests.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/join-requests",
    },
    async (request, { supabase, user }) => {
        const url = new URL(request.url);
        const orgId = url.searchParams.get("organization_id");

        let query = serverFromTable(supabase, "join_requests")
            .select(
                "id, organization_id, project_id, status, requested_at, reviewed_at, deny_reason, " +
                    "organizations(id, name, slug), projects(id, name)"
            )
            .eq("user_id", user.id)
            .order("requested_at", { ascending: false });

        if (orgId) query = query.eq("organization_id", orgId);

        const { data, error } = await query;
        if (error) return ApiErrors.internalError("Failed to fetch join requests");

        return NextResponse.json({ join_requests: data ?? [] });
    }
);
