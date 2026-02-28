import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, industry, timezone, currency } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json({ error: "Organization name is required (min 2 chars)" }, { status: 400 });
    }

    const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
            return NextResponse.json({ error: "An organization with this name already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    // Create membership for the creator as exec
    const { error: memberError } = await fromTable(supabase, "org_memberships")
        .upsert(
            {
                user_id: user.id,
                organization_id: org.id,
                role: "exec",
                status: "active",
                is_default: true,
            },
            { onConflict: "user_id,organization_id" }
        );

    if (memberError) {
        return NextResponse.json({ error: "Organization created but membership failed" }, { status: 500 });
    }

    // Update the user's profile org_id to the new org
    await supabase
        .from("profiles")
        .update({ organization_id: org.id })
        .eq("id", user.id);

    return NextResponse.json({ organization: org }, { status: 201 });
}
