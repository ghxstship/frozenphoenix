import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { z } from "zod";
import { logger } from "@/lib/logger";

const createTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    advance_type: z.string().optional(),
    template_data: z.record(z.string(), z.unknown()),
    is_global: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const orgId = req.nextUrl.searchParams.get("org_id");

    let query = serverFromTable(supabase!, "advance_templates")
        .select("*").is("deleted_at", null).order("name");

    if (orgId) {
        query = query.or(`organization_id.eq.${orgId},is_global.eq.true`);
    }

    const { data, error } = await query;
    if (error) {
        logger.error("[GET /api/advancing/templates]", { error });
        return ApiErrors.internalError("Failed to fetch templates");
    }

    return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const parsed = await parseAndValidate(req, createTemplateSchema);
    if (!parsed.success) return parsed.response;

    const { data, error } = await serverFromTable(supabase!, "advance_templates")
        .insert({
            ...parsed.data,
            created_by: user.id,
        } as Record<string, unknown>)
        .select()
        .single();

    if (error) {
        logger.error("[POST /api/advancing/templates]", { error });
        return ApiErrors.internalError("Failed to create template");
    }

    return NextResponse.json({ data }, { status: 201 });
}
