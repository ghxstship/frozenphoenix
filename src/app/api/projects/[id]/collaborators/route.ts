import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { z } from "zod";
import { createHash, randomUUID } from "crypto";

const requirementSchema = z.object({
    requirement_type: z.enum([
        "contract",
        "coi",
        "w9",
        "nda",
        "advance_manifest",
        "crew_roster",
        "insurance_auto",
        "insurance_gl",
        "workers_comp",
        "background_check",
        "custom",
    ]),
    label: z.string().min(1),
    description: z.string().optional(),
    deadline: z.string().optional(),
    is_blocking: z.boolean().default(true),
    custom_instructions: z.string().optional(),
});

const createCollaboratorSchema = z.object({
    vendor_id: z.string().uuid("Invalid vendor ID"),
    engagement_type: z
        .enum(["vendor", "subcontractor", "artist", "freelancer", "supplier"])
        .default("vendor"),
    scope_summary: z.string().optional(),
    notes: z.string().optional(),
    requirements: z.array(requirementSchema).min(0).default([]),
});

/**
 * GET /api/projects/[id]/collaborators
 * Returns all collaborators for a project with vendor details + requirement summary.
 */
export const GET = withApiHandlerParams(
    {
        method: "GET",
        route: "/api/projects/[id]/collaborators",
        rbac: { resource: "projects", action: "read" },
    },
    async (_request, { supabase, log }, { params }) => {
        const { id } = await params;

        const { data, error } = await serverFromTable(supabase, "project_collaborators")
            .select(
                `
                *,
                vendors:vendor_id(id, name, contact_name, email, phone, specialty),
                collaborator_requirements(id, requirement_type, label, status, deadline, is_blocking, entity_type, entity_id, submitted_at, approved_at, sort_order)
            `
            )
            .eq("project_id", id)
            .is("deleted_at", null)
            .order("invited_at", { ascending: false });

        if (error) {
            log.error("[GET /api/projects/[id]/collaborators]", { error });
            return ApiErrors.internalError("Failed to fetch collaborators");
        }

        return NextResponse.json({ data });
    }
);

/**
 * POST /api/projects/[id]/collaborators
 * Invite a collaborator to a project.
 *
 * Creates:
 *   1. project_collaborators record
 *   2. portal_access_token (scoped, time-limited — no org_memberships)
 *   3. collaborator_requirements rows for each requested item
 *
 * Does NOT create org_memberships. Collaborators authenticate via portal token.
 */
export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/projects/[id]/collaborators",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (request, { supabase, user, orgId, log }, { params }) => {
        const { id: projectId } = await params;
        const parsed = await parseAndValidate(request, createCollaboratorSchema);
        if (!parsed.success) return parsed.response;

        // Verify project exists
        const { data: project, error: projError } = await serverFromTable(supabase, "projects")
            .select("id, name")
            .eq("id", projectId)
            .single();

        if (projError || !project) return ApiErrors.notFound("Project");

        // Verify vendor exists
        const { data: vendor, error: vendorError } = await serverFromTable(supabase, "vendors")
            .select("id, name, email, contact_name")
            .eq("id", parsed.data.vendor_id)
            .single();

        if (vendorError || !vendor) return ApiErrors.notFound("Vendor");

        // 1. Create project_collaborators record
        const { data: collaborator, error: collabError } = await serverFromTable(
            supabase,
            "project_collaborators"
        )
            .insert({
                project_id: projectId,
                vendor_id: parsed.data.vendor_id,
                organization_id: orgId,
                invited_by: user.id,
                engagement_type: parsed.data.engagement_type,
                scope_summary: parsed.data.scope_summary ?? null,
                notes: parsed.data.notes ?? null,
                status: "invited",
            } as Record<string, unknown>)
            .select()
            .single();

        if (collabError) {
            log.error("[POST collaborators] insert failed", { error: collabError });
            return ApiErrors.internalError("Failed to create collaborator record");
        }

        const collabId = (collaborator as Record<string, unknown>).id as string;

        // 2. Create portal_access_token (scoped, NOT an org_membership)
        const portalToken = randomUUID();
        const tokenHash = createHash("sha256").update(portalToken).digest("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90); // 90-day portal access

        const { error: tokenError } = await serverFromTable(
            supabase,
            "portal_access_tokens"
        ).insert({
            organization_id: orgId,
            project_id: projectId,
            vendor_id: parsed.data.vendor_id,
            collaborator_id: collabId,
            token: portalToken,
            token_hash: tokenHash,
            permissions: ["read", "submit", "sign"],
            is_active: true,
            expires_at: expiresAt.toISOString(),
            created_by: user.id,
        } as Record<string, unknown>);

        if (tokenError) {
            log.error("[POST collaborators] token insert failed", { error: tokenError });
            // Non-fatal — collaborator record exists, token can be retried
        }

        // 3. Create collaborator_requirements rows
        if (parsed.data.requirements.length > 0) {
            const reqRows = parsed.data.requirements.map((req, idx) => ({
                project_collaborator_id: collabId,
                project_id: projectId,
                organization_id: orgId,
                requirement_type: req.requirement_type,
                label: req.label,
                description: req.description ?? null,
                deadline: req.deadline ?? null,
                is_blocking: req.is_blocking,
                custom_instructions: req.custom_instructions ?? null,
                status: "requested",
                sort_order: idx,
            }));

            const { error: reqError } = await serverFromTable(
                supabase,
                "collaborator_requirements"
            ).insert(reqRows as Record<string, unknown>[]);

            if (reqError) {
                log.error("[POST collaborators] requirements insert failed", { error: reqError });
            }
        }

        // Re-fetch with joins for response
        const { data: full } = await serverFromTable(supabase, "project_collaborators")
            .select(
                `
                *,
                vendors:vendor_id(id, name, contact_name, email),
                collaborator_requirements(id, requirement_type, label, status, deadline, is_blocking, sort_order)
            `
            )
            .eq("id", collabId)
            .single();

        return NextResponse.json(
            {
                data: full,
                portal_token: portalToken,
                portal_url: `/portal/${portalToken}`,
            },
            { status: 201 }
        );
    }
);
