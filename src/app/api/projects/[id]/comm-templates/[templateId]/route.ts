import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { z } from "zod";

const updateTemplateSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(500).optional(),
    body_html: z.string().min(1).optional(),
    body_text: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
});

/**
 * GET /api/projects/[id]/comm-templates/[templateId]
 * Returns a single communication template.
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/projects/[id]/comm-templates/[templateId]",
        rbac: { resource: "projects", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id: projectId, templateId } = await params;

        const { data, error } = await serverFromTable(supabase, "project_comm_templates")
            .select("*")
            .eq("id", templateId)
            .eq("project_id", projectId)
            .is("deleted_at", null)
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Template");
            log.error("[GET /api/projects/[id]/comm-templates/[templateId]]", { error });
            return ApiErrors.internalError("Failed to fetch template");
        }

        return NextResponse.json({ data });
    }
);

/**
 * PATCH /api/projects/[id]/comm-templates/[templateId]
 * Updates a communication template's content or active state.
 * Marks is_default = false when content is edited.
 */
export const PATCH = withApiHandlerParams(
    {
        method: "PATCH",
        route: "/api/projects/[id]/comm-templates/[templateId]",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (request, { supabase, log }, { params }) => {
        const { id: projectId, templateId } = await params;
        const parsed = await parseAndValidate(request, updateTemplateSchema);
        if (!parsed.success) return parsed.response;

        // If content is being edited, mark as no longer default
        const updates: Record<string, unknown> = { ...parsed.data };
        if (parsed.data.subject || parsed.data.body_html || parsed.data.body_text !== undefined) {
            updates.is_default = false;
        }

        const { data, error } = await serverFromTable(supabase, "project_comm_templates")
            .update(updates)
            .eq("id", templateId)
            .eq("project_id", projectId)
            .select()
            .single();

        if (error) {
            if (error.code === "PGRST116") return ApiErrors.notFound("Template");
            log.error("[PATCH /api/projects/[id]/comm-templates/[templateId]]", { error });
            return ApiErrors.internalError("Failed to update template");
        }

        return NextResponse.json({ data });
    }
);
