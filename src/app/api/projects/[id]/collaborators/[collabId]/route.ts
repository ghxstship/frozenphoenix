import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { z } from "zod";

const updateCollaboratorSchema = z.object({
    engagement_type: z
        .enum(["vendor", "subcontractor", "artist", "freelancer", "supplier"])
        .optional(),
    scope_summary: z.string().optional(),
    notes: z.string().optional(),
    status: z
        .enum([
            "invited",
            "accepted",
            "onboarding",
            "active",
            "completed",
            "suspended",
            "terminated",
        ])
        .optional(),
});

/**
 * GET /api/projects/[id]/collaborators/[collabId]
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/projects/[id]/collaborators/[collabId]",
        rbac: { resource: "projects", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id: projectId, collabId } = await params;

        const { data, error } = await serverFromTable(supabase, "project_collaborators")
            .select(
                `
                *,
                vendors:vendor_id(id, name, contact_name, email, phone, specialty),
                collaborator_requirements(id, requirement_type, label, status, deadline, is_blocking, entity_type, entity_id, submitted_at, approved_at, rejection_reason, sort_order)
            `
            )
            .eq("id", collabId)
            .eq("project_id", projectId)
            .is("deleted_at", null)
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Collaborator");
            log.error("[GET /api/projects/[id]/collaborators/[collabId]]", { error });
            return ApiErrors.internalError("Failed to fetch collaborator");
        }

        return NextResponse.json({ data });
    }
);

/**
 * PATCH /api/projects/[id]/collaborators/[collabId]
 * Update collaborator metadata, status, or category statuses.
 */
export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/projects/[id]/collaborators/[collabId]",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id: projectId, collabId } = await params;
        const parsed = await parseAndValidate(request, updateCollaboratorSchema);
        if (!parsed.success) return parsed.response;

        const { data, error } = await serverFromTable(supabase, "project_collaborators")
            .update(parsed.data as Record<string, unknown>)
            .eq("id", collabId)
            .eq("project_id", projectId)
            .select("id, status, engagement_type, scope_summary, updated_at")
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Collaborator");
            log.error("[PATCH /api/projects/[id]/collaborators/[collabId]]", { error });
            return ApiErrors.internalError("Failed to update collaborator");
        }

        return NextResponse.json({ data });
    }
);
