import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { organizationCreateSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return ApiErrors.serviceUnavailable();
    }

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

    // Create organization via a Postgres function that returns the new ID.
    // We cannot use .insert().select().single() because the SELECT RLS
    // policy requires the user to already be a member, which they aren't yet.
    // The DB function runs as SECURITY DEFINER and handles the full
    // bootstrap: insert org → create exec membership → update profile.
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
        "create_org_and_membership" as never,
        {
            p_name: name.trim(),
            p_slug: orgSlug,
            p_industry: industry || null,
            p_timezone: timezone || "America/New_York",
            p_currency: currency || "USD",
            p_user_id: user.id,
        } as never
    );

    if (rpcError) {
        if (rpcError.code === "23505") {
            return ApiErrors.conflict("An organization with this name already exists");
        }
        // eslint-disable-next-line no-console
        console.error("[POST /api/organizations] rpc failed:", rpcError);
        return ApiErrors.internalError("Failed to create organization");
    }

    const orgId = (rpcResult as { id: string } | null)?.id;
    if (!orgId) {
        return ApiErrors.internalError("Organization created but ID not returned");
    }

    // Read the full org (user is now a member, SELECT policy passes)
    const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();

    return NextResponse.json(
        { organization: org ?? { id: orgId, name: name.trim(), slug: orgSlug } },
        { status: 201 }
    );
}
