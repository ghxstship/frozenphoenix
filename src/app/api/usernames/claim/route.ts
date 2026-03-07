import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { usernameClaimSchema } from "@/lib/validation/schemas";
import { checkUsernameAvailable } from "@/lib/username-utils";

/**
 * POST /api/usernames/claim
 * Claims a username for the authenticated user (first-time only).
 * Body: { username: string }
 */
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

    const parsed = await parseAndValidate(request, usernameClaimSchema);
    if (!parsed.success) return parsed.response;

    const { username } = parsed.data;

    const admin = createAdminClient();
    if (!admin) {
        return ApiErrors.serviceUnavailable();
    }
    // Check if user already has a username
    const { data: profile } = await serverFromTable(admin!, "user_profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    if (profile?.username) {
        return ApiErrors.conflict(
            "You already have a username. Use PATCH /api/usernames to change it."
        );
    }

    // Check availability
    const availability = await checkUsernameAvailable(admin!, username);
    if (!availability.available) {
        return ApiErrors.conflict(availability.reason ?? "Username not available");
    }

    // Claim it
    const { error: updateError } = await serverFromTable(admin!, "user_profiles")
        .update({
            username,
            username_changed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        // Unique constraint race condition
        if (updateError.code === "23505") {
            return ApiErrors.conflict("This username was just claimed by someone else");
        }
        logger.error("[POST /api/usernames/claim] update failed", { error: updateError });
        return ApiErrors.internalError("Failed to claim username");
    }

    // Log the claim in the change log
    await serverFromTable(admin!, "username_change_log").insert({
        entity_type: "user",
        entity_id: user.id,
        old_value: "",
        new_value: username,
        changed_by: user.id,
    });

    return NextResponse.json(
        { username, message: "Username claimed successfully" },
        { status: 201 }
    );
}
