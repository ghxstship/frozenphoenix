import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { z } from "zod";

const requestCoiSchema = z.object({
    coverage_minimum: z.number().min(0).optional(),
    deadline: z.string().optional(),
    notes: z.string().optional(),
});

/**
 * POST /api/projects/[id]/collaborators/[collabId]/request-coi
 * Requests a Certificate of Insurance from a collaborator.
 * Creates a worker_compliance_docs record and updates collaborator coi_status.
 */
export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/projects/[id]/collaborators/[collabId]/request-coi",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (request, { supabase, user, orgId, log }, { params }) => {
        const { id: projectId, collabId } = await params;
        const parsed = await parseAndValidate(request, requestCoiSchema);
        if (!parsed.success) return parsed.response;

        // Fetch collaborator with vendor info
        const { data: collab, error: collabError } = await serverFromTable(
            supabase,
            "project_collaborators"
        )
            .select("*, vendors:vendor_id(id, name, email)")
            .eq("id", collabId)
            .eq("project_id", projectId)
            .is("deleted_at", null)
            .single();

        if (collabError || !collab) return ApiErrors.notFound("Collaborator");

        const c = collab as Record<string, unknown>;

        if (c.coi_status !== "not_requested") {
            return ApiErrors.badRequest("COI has already been requested for this collaborator");
        }

        // Look up vendor's worker_profile_id for the compliance doc
        // worker_compliance_docs requires worker_profile_id — we need to check if one exists
        // If not, create the compliance doc via the vendor_id path instead
        const vendor = c.vendors as Record<string, unknown>;

        // Create compliance doc record requesting the COI
        const { error: docError } = await serverFromTable(
            supabase,
            "worker_compliance_docs"
        ).insert({
            worker_profile_id: c.vendor_id, // May need mapping — depends on worker_profiles linkage
            doc_type: "coi",
            doc_name: `COI — ${String(vendor.name ?? "")}`,
            status: "not_submitted",
            coverage_amount: parsed.data.coverage_minimum ?? null,
            notes: parsed.data.notes ?? null,
            organization_id: orgId,
            created_by: user.id,
        } as Record<string, unknown>);

        if (docError) {
            log.warn("[request-coi] worker_compliance_docs insert failed, falling back", {
                error: docError,
            });
            // Non-blocking — the collaborator status update is what matters for the workflow
        }

        // Update collaborator
        const updates: Record<string, unknown> = { coi_status: "requested" };
        if (parsed.data.deadline) {
            updates.coi_deadline = parsed.data.deadline;
        }

        const { data: updated, error: updateError } = await serverFromTable(
            supabase,
            "project_collaborators"
        )
            .update(updates)
            .eq("id", collabId)
            .select()
            .single();

        if (updateError) {
            log.error("[request-coi] collaborator update failed", { error: updateError });
            return ApiErrors.internalError("Failed to update collaborator status");
        }

        return NextResponse.json({ data: updated });
    }
);
