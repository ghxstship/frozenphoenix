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

    // Create organization
    const { data: org, error: orgError } = await supabase
        .from("organizations")
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
        return ApiErrors.internalError("Failed to create organization");
    }

    // Create membership for the creator as exec
    const { error: memberError } = await supabase.from("org_memberships").upsert(
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
        return ApiErrors.internalError("Organization created but membership failed");
    }

    // Update the user's profile org_id to the new org
    await supabase.from("profiles").update({ organization_id: org.id }).eq("id", user.id);

    return NextResponse.json({ organization: org }, { status: 201 });
}
