import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/estimates/convert-to-proposal
 *
 * I4: Estimate → Proposal Chain
 * Creates a proposal pre-filled from an accepted estimate and marks the estimate as converted.
 *
 * Body: { estimate_id: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/estimates/convert-to-proposal",
        mutation: true,
        rbac: { resource: "proposals", action: "write" },
    },
    async (request, { supabase, user, orgId }) => {
        const body = await request.json();
        const { estimate_id } = body;

        if (!estimate_id) {
            return NextResponse.json(
                { error: { message: "estimate_id is required" } },
                { status: 400 }
            );
        }

        const { data: estimate, error: estErr } = await serverFromTable(supabase, "estimates")
            .select(
                "id, title, description, company_id, contact_id, deal_id, subtotal, total, tax_amount, tax_percent, discount_amount, discount_percent, currency, proposed_start_date, proposed_end_date, line_items, status, converted_sow_id, organization_id"
            )
            .eq("id", estimate_id)
            .eq("organization_id", orgId)
            .single();

        if (estErr || !estimate) {
            return NextResponse.json({ error: { message: "Estimate not found" } }, { status: 404 });
        }

        if (estimate.converted_sow_id) {
            return NextResponse.json(
                { error: { message: "Estimate already converted" } },
                { status: 409 }
            );
        }

        const { data: proposal, error: propErr } = await serverFromTable(supabase, "proposals")
            .insert({
                title: `Proposal: ${estimate.title as string}`,
                organization_id: orgId,
                company_id: (estimate.company_id as string) ?? null,
                contact_id: (estimate.contact_id as string) ?? null,
                deal_id: (estimate.deal_id as string) ?? null,
                status: "draft",
                subtotal: (estimate.subtotal as number) ?? 0,
                total: (estimate.total as number) ?? 0,
                tax_amount: (estimate.tax_amount as number) ?? null,
                tax_percent: (estimate.tax_percent as number) ?? null,
                discount_amount: (estimate.discount_amount as number) ?? null,
                discount_percent: (estimate.discount_percent as number) ?? null,
                currency: (estimate.currency as string) ?? null,
                proposed_start_date: (estimate.proposed_start_date as string) ?? null,
                proposed_end_date: (estimate.proposed_end_date as string) ?? null,
                scope_of_work: (estimate.description as string) ?? null,
                number: `PROP-${Date.now().toString(36).toUpperCase()}`,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (propErr || !proposal) {
            return NextResponse.json(
                { error: { message: "Failed to create proposal", details: propErr?.message } },
                { status: 500 }
            );
        }

        // Mark estimate as converted
        await serverFromTable(supabase, "estimates")
            .update({ status: "converted" })
            .eq("id", estimate_id);

        return NextResponse.json(
            {
                data: {
                    proposal_id: proposal.id,
                    estimate_id: estimate.id,
                    message: "Estimate successfully converted to proposal",
                },
            },
            { status: 201 }
        );
    }
);
