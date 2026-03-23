import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { withApiHandlerParams } from "@/lib/api/with-api-handler";
import { z } from "zod";

const issueContractSchema = z.object({
    contract_id: z.string().uuid("Invalid contract ID").optional(),
    title: z.string().min(1).max(300).optional(),
    contract_type: z
        .enum(["vendor", "subcontractor", "nda", "msa", "sow", "amendment"])
        .default("vendor"),
    value: z.number().min(0).optional(),
    effective_date: z.string().optional(),
    expiration_date: z.string().optional(),
    description: z.string().optional(),
});

/**
 * POST /api/projects/[id]/collaborators/[collabId]/issue-contract
 * Issues a contract to a collaborator and creates an e-signature request.
 * Either links an existing contract_id or creates a new contract.
 */
export const POST = withApiHandlerParams(
    {
        method: "POST",
        route: "/api/projects/[id]/collaborators/[collabId]/issue-contract",
        mutation: true,
        rbac: { resource: "contracts", action: "write" },
    },
    async (request, { supabase, user, orgId, log }, { params }) => {
        const { id: projectId, collabId } = await params;
        const parsed = await parseAndValidate(request, issueContractSchema);
        if (!parsed.success) return parsed.response;

        // Fetch collaborator with vendor info
        const { data: collab, error: collabError } = await serverFromTable(
            supabase,
            "project_collaborators"
        )
            .select("*, vendors:vendor_id(id, name, email, contact_name)")
            .eq("id", collabId)
            .eq("project_id", projectId)
            .is("deleted_at", null)
            .single();

        if (collabError || !collab) return ApiErrors.notFound("Collaborator");

        const c = collab as Record<string, unknown>;
        const vendor = c.vendors as Record<string, unknown>;

        if (c.contract_status !== "not_issued") {
            return ApiErrors.badRequest("Contract has already been issued to this collaborator");
        }

        let contractId = parsed.data.contract_id;

        // Create new contract if no existing contract_id provided
        if (!contractId) {
            const contractNumber = `C-${Date.now().toString(36).toUpperCase()}`;
            const { data: contract, error: contractError } = await serverFromTable(
                supabase,
                "contracts"
            )
                .insert({
                    project_id: projectId,
                    vendor_id: c.vendor_id,
                    number: contractNumber,
                    title:
                        parsed.data.title ??
                        `${String(vendor.name)} — ${String(c.engagement_type)} Agreement`,
                    type: parsed.data.contract_type,
                    counterparty_name: String(vendor.name ?? ""),
                    description: parsed.data.description ?? null,
                    value: parsed.data.value ?? null,
                    effective_date:
                        parsed.data.effective_date ?? new Date().toISOString().split("T")[0],
                    expiration_date: parsed.data.expiration_date ?? null,
                    status: "pending_signature",
                    organization_id: orgId,
                    created_by: user.id,
                } as Record<string, unknown>)
                .select("id, number, title, type, status, created_at")
                .single();

            if (contractError) {
                log.error("[issue-contract] contract insert failed", { error: contractError });
                return ApiErrors.internalError("Failed to create contract");
            }
            contractId = (contract as Record<string, unknown>).id as string;
        }

        // Create e-signature request
        const accessToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        const { error: sigError } = await serverFromTable(supabase, "e_signatures").insert({
            entity_type: "contract",
            entity_id: contractId,
            signer_name: String(vendor.contact_name ?? vendor.name ?? ""),
            signer_email: String(vendor.email ?? ""),
            signer_role: String(c.engagement_type ?? "vendor"),
            status: "pending",
            access_token: accessToken,
            expires_at: expiresAt.toISOString(),
            organization_id: orgId,
        } as Record<string, unknown>);

        if (sigError) {
            log.error("[issue-contract] e_signature insert failed", { error: sigError });
            return ApiErrors.internalError("Failed to create signature request");
        }

        // Update collaborator status
        const { data: updated, error: updateError } = await serverFromTable(
            supabase,
            "project_collaborators"
        )
            .update({
                contract_status: "issued",
                contract_id: contractId,
            } as Record<string, unknown>)
            .eq("id", collabId)
            .select("id, contract_status, contract_id, updated_at")
            .single();

        if (updateError) {
            log.error("[issue-contract] collaborator update failed", { error: updateError });
            return ApiErrors.internalError("Failed to update collaborator status");
        }

        return NextResponse.json(
            {
                data: updated,
                contract_id: contractId,
                signing_token: accessToken,
            },
            { status: 201 }
        );
    }
);
