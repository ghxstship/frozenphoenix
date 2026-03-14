import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { organizationCreateSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";

export async function GET() {
    const supabase = await createClient();
    if (!supabase) return ApiErrors.serviceUnavailable();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ApiErrors.unauthorized();

    const { data, error } = await serverFromTable(supabase, "organizations")
        .select("*")
        .order("name");

    if (error) {
        logger.error("[GET /api/organizations] failed", { error: error.message });
        return ApiErrors.internalError("Failed to fetch organizations");
    }

    return NextResponse.json({
        data,
        pagination: { page: 1, per_page: data.length, total: data.length, total_pages: 1 },
    });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

    // Auth check — session-aware client verifies the user
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    // Validate request body with Zod
    const parsed = await parseAndValidate(request, organizationCreateSchema);
    if (!parsed.success) return parsed.response;

    const { name, slug, industry, timezone, currency } = parsed.data;
    const orgSlug =
        slug ||
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    // Use the service-role admin client for the bootstrap operation.
    // The anon-key client can't SELECT the org after INSERT because the
    // RLS SELECT policy requires an existing membership — classic
    // chicken-and-egg. The admin client bypasses RLS entirely.
    const admin = createAdminClient();
    if (!admin) {
        logger.error("[POST /api/organizations] SUPABASE_SERVICE_ROLE_KEY not configured");
        return ApiErrors.serviceUnavailable();
    }

    // 1. Insert organization
    const { data: org, error: orgError } = await serverFromTable(admin!, "organizations")
        .insert({
            name: name.trim(),
            slug: orgSlug,
            ...(industry && { industry }),
            ...(timezone && { default_timezone: timezone }),
            ...(currency && { default_currency: currency }),
        })
        .select("*")
        .single();

    if (orgError) {
        if (orgError.code === "23505") {
            return ApiErrors.conflict("An organization with this name already exists");
        }
        logger.error("[POST /api/organizations] org insert failed", { error: orgError });
        return ApiErrors.internalError("Failed to create organization");
    }

    // 2. Ensure user_profiles row exists (FK target for org_memberships).
    //    The handle_new_user trigger should have created this, but if it
    //    failed silently the row may be missing — guard against that.
    await serverFromTable(admin!, "user_profiles").upsert(
        {
            id: user.id,
            email: user.email ?? "",
            display_name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
            lifecycle_status: "onboarding",
        },
        { onConflict: "id" }
    );

    // 3. Create exec membership for the creator
    const { error: memberError } = await serverFromTable(admin!, "org_memberships").upsert(
        {
            user_id: user.id,
            organization_id: org.id,
            role: "exec",
            status: "active",
            is_default_org: true,
        },
        { onConflict: "user_id,organization_id" }
    );

    if (memberError) {
        logger.error("[POST /api/organizations] membership upsert failed", { error: memberError });
        return ApiErrors.internalError("Organization created but membership failed");
    }

    // 4. Update the user's profile org_id to the new org
    await serverFromTable(admin!, "profiles").update({ organization_id: org.id }).eq("id", user.id);

    return NextResponse.json({ organization: org }, { status: 201 });
}
