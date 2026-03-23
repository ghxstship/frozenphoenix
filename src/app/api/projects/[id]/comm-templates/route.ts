import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { COMM_TEMPLATE_DEFINITIONS } from "@/config/comm-template-config";

/**
 * GET /api/projects/[id]/comm-templates
 * Returns all communication templates for a project.
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/projects/[id]/comm-templates",
        rbac: { resource: "projects", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        const { data, error } = await serverFromTable(supabase, "project_comm_templates")
            .select(
                "id, project_id, template_key, name, description, subject, body_html, body_text, available_variables, is_active, is_default, created_at"
            )
            .eq("project_id", id)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            log.error("[GET /api/projects/[id]/comm-templates]", { error });
            return ApiErrors.internalError("Failed to fetch templates");
        }

        return NextResponse.json({ data });
    }
);

/**
 * POST /api/projects/[id]/comm-templates
 * Auto-generates all default communication templates for a project.
 * Idempotent: skips templates that already exist (unique on project_id + template_key).
 */
export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/projects/[id]/comm-templates",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (_request, { supabase, orgId, log }, { params }) => {
        const { id: projectId } = await params;

        // Verify project exists and belongs to this org
        const { data: project, error: projError } = await serverFromTable(supabase, "projects")
            .select("id, name, client, start_date, end_date")
            .eq("id", projectId)
            .single();

        if (projError || !project) return ApiErrors.notFound("Project");

        const proj = project as Record<string, unknown>;

        // Build template records from the SSOT definitions
        const records = COMM_TEMPLATE_DEFINITIONS.map((def) => ({
            project_id: projectId,
            organization_id: orgId,
            template_key: def.key,
            name: def.name,
            description: def.description,
            subject: def.defaultSubject
                .replace("{{project_name}}", String(proj.name ?? ""))
                .replace("{{client_name}}", String(proj.client ?? "")),
            body_html: def.defaultBodyHtml,
            body_text: null,
            available_variables: def.variables,
            is_active: false,
            is_default: true,
        }));

        const { data, error } = await serverFromTable(supabase, "project_comm_templates")
            .upsert(records as Record<string, unknown>[], {
                onConflict: "project_id,template_key",
                ignoreDuplicates: true,
            })
            .select("id, template_key, name, is_active, is_default, created_at");

        if (error) {
            log.error("[POST /api/projects/[id]/comm-templates]", { error });
            return ApiErrors.internalError("Failed to generate templates");
        }

        return NextResponse.json({ data, generated: data?.length ?? 0 }, { status: 201 });
    }
);
