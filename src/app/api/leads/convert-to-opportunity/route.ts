import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/leads/convert-to-opportunity
 *
 * I3: Lead → Opportunity Conversion
 * Creates an opportunity pre-filled from lead data and marks the lead as converted.
 *
 * Body: { lead_id: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/leads/convert-to-opportunity",
        mutation: true,
        rbac: { resource: "opportunities", action: "write" },
    },
    async (request, { supabase, user, orgId }) => {
        const body = await request.json();
        const { lead_id } = body;

        if (!lead_id) {
            return ApiErrors.badRequest("lead_id is required");
        }

        const { data: lead, error: leadErr } = await serverFromTable(supabase, "leads")
            .select(
                "id, first_name, last_name, email, company, company_id, phone, source, budget_range, description, converted_to_opportunity_id, assigned_to, organization_id"
            )
            .eq("id", lead_id)
            .eq("organization_id", orgId)
            .single();

        if (leadErr || !lead) {
            return ApiErrors.notFound("Lead");
        }

        if (lead.converted_to_opportunity_id) {
            return ApiErrors.conflict("Lead already converted to an opportunity");
        }

        const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ");

        const { data: opp, error: oppErr } = await serverFromTable(supabase, "opportunities")
            .insert({
                name: `${name} — ${(lead.company as string) || "New Opportunity"}`,
                organization_id: orgId,
                company_id: (lead.company_id as string) ?? "",
                lead_id: lead.id as string,
                stage: "discovery",
                type: "new_business",
                value: 0,
                probability: 10,
                description: (lead.description as string) ?? null,
                assigned_to: (lead.assigned_to as string) ?? user.id,
                created_by: user.id,
            })
            .select("id")
            .single();

        if (oppErr || !opp) {
            return ApiErrors.internalError("Failed to create opportunity");
        }

        await serverFromTable(supabase, "leads")
            .update({
                converted_to_opportunity_id: opp.id,
                converted_at: new Date().toISOString(),
                status: "converted",
            })
            .eq("id", lead_id);

        return NextResponse.json(
            {
                data: {
                    opportunity_id: opp.id,
                    lead_id: lead.id,
                    message: "Lead successfully converted to opportunity",
                },
            },
            { status: 201 }
        );
    }
);
