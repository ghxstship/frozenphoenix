import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/deals/convert-to-project
 *
 * I2: Deal → Project Conversion
 * Creates a project from a closed-won deal, links them, and updates the deal.
 *
 * Body: { deal_id: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/deals/convert-to-project",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (request, { supabase, user, orgId }) => {
        const body = await request.json();
        const { deal_id } = body;

        if (!deal_id) {
            return ApiErrors.badRequest("deal_id is required");
        }

        // Fetch the deal
        const { data: deal, error: dealErr } = await serverFromTable(supabase, "deals")
            .select(
                "id, title, company, company_id, contact_name, value, stage, converted_project_id, organization_id"
            )
            .eq("id", deal_id)
            .eq("organization_id", orgId)
            .single();

        if (dealErr || !deal) {
            return ApiErrors.notFound("Deal");
        }

        if (deal.converted_project_id) {
            return ApiErrors.conflict("Deal already converted to a project");
        }

        // Create project from deal data
        const now = new Date();
        const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days

        const { data: project, error: projectErr } = await serverFromTable(supabase, "projects")
            .insert({
                name: deal.title as string,
                organization_id: orgId,
                company_id: (deal.company_id as string) ?? null,
                deal_id: deal.id as string,
                status: "draft",
                current_phase: "pre_production",
                start_date: now.toISOString().split("T")[0],
                end_date: endDate.toISOString().split("T")[0],
                budget_planned: (deal.value as number) ?? 0,
                contracted_value: (deal.value as number) ?? 0,
                manager_id: user.id,
                timezone: "America/New_York",
            })
            .select("id")
            .single();

        if (projectErr || !project) {
            return ApiErrors.internalError("Failed to create project");
        }

        // Update deal with converted project reference
        await serverFromTable(supabase, "deals")
            .update({
                converted_project_id: project.id,
                converted_at: now.toISOString(),
                stage: "closed_won",
            })
            .eq("id", deal_id);

        return NextResponse.json(
            {
                data: {
                    project_id: project.id,
                    deal_id: deal.id,
                    message: "Deal successfully converted to project",
                },
            },
            { status: 201 }
        );
    }
);
