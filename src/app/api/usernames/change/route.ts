import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { usernameChangeSchema } from "@/lib/validation/schemas";
import {
    checkUsernameAvailable,
    isWithinChangeCooldown,
    USERNAME_CHANGE_COOLDOWN_DAYS,
} from "@/lib/username-utils";

/**
 * PATCH /api/usernames/change
 * Changes the authenticated user's username (rate-limited to once per 30 days).
 * Body: { username: string }
 */
export async function PATCH(request: NextRequest) {
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

    const parsed = await parseAndValidate(request, usernameChangeSchema);
    if (!parsed.success) return parsed.response;

    const { username: newUsername } = parsed.data;

    const admin = createAdminClient();
    if (!admin) {
        return ApiErrors.serviceUnavailable();
    }
    // New tables/columns from migration 038 are not yet in database.types.ts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    // Get current username
    const { data: profile } = await db
        .from("user_profiles")
        .select("username, username_changed_at")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return ApiErrors.notFound("Profile");
    }

    const oldUsername = (profile.username as string) ?? "";

    // Same username check
    if (oldUsername.toLowerCase() === newUsername.toLowerCase()) {
        return ApiErrors.badRequest("New username is the same as current username");
    }

    // Cooldown check
    const cooldown = await isWithinChangeCooldown(db, user.id);
    if (cooldown.blocked) {
        return NextResponse.json(
            {
                error: {
                    code: "COOLDOWN",
                    message: `You can change your username once every ${USERNAME_CHANGE_COOLDOWN_DAYS} days`,
                    nextChangeAt: cooldown.nextChangeAt,
                },
            },
            { status: 429 }
        );
    }

    // Availability check
    const availability = await checkUsernameAvailable(db, newUsername);
    if (!availability.available) {
        return ApiErrors.conflict(availability.reason ?? "Username not available");
    }

    // Update username
    const { error: updateError } = await db
        .from("user_profiles")
        .update({
            username: newUsername,
            username_changed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        if (updateError.code === "23505") {
            return ApiErrors.conflict("This username was just claimed by someone else");
        }
        // eslint-disable-next-line no-console
        console.error("[PATCH /api/usernames/change] update failed:", updateError);
        return ApiErrors.internalError("Failed to change username");
    }

    // Log the change
    await db.from("username_change_log").insert({
        entity_type: "user",
        entity_id: user.id,
        old_value: oldUsername,
        new_value: newUsername,
        changed_by: user.id,
    });

    // Release old username with 30-day cooldown
    if (oldUsername) {
        await db.from("released_usernames").insert({
            username: oldUsername,
            entity_type: "user",
            released_by: user.id,
        });
    }

    return NextResponse.json({
        username: newUsername,
        previousUsername: oldUsername,
        message: "Username changed successfully",
    });
}
