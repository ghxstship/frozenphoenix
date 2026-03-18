import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
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
            return NextResponse.json(
                { error: { message: "lead_id is required" } },
                { status: 400 }
            );
        }

        const { data: lead, error: leadErr } = await serverFromTable(supabase, "leads")
            .select(
                "id, first_name, last_name, email, company, company_id, phone, source, budget_range, description, converted_to_opportunity_id, assigned_to, organization_id"
            )
            .eq("id", lead_id)
            .eq("organization_id", orgId)
            .single();

        if (leadErr || !lead) {
            return NextResponse.json({ error: { message: "Lead not found" } }, { status: 404 });
        }

        if (lead.converted_to_opportunity_id) {
            return NextResponse.json(
                { error: { message: "Lead already converted to an opportunity" } },
                { status: 409 }
            );
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
            return NextResponse.json(
                { error: { message: "Failed to create opportunity", details: oppErr?.message } },
                { status: 500 }
            );
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
