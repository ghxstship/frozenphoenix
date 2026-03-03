import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { usernameCheckSchema } from "@/lib/validation/schemas";
import { checkUsernameAvailable, generateUsernameSuggestions } from "@/lib/username-utils";

/**
 * GET /api/usernames/check?q=desired_username
 * Returns availability status + suggested alternatives if taken.
 */
export async function GET(request: NextRequest) {
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

    const q = request.nextUrl.searchParams.get("q");
    if (!q) {
        return ApiErrors.badRequest("Query parameter 'q' is required");
    }

    // Validate format
    const parsed = usernameCheckSchema.safeParse({ username: q });
    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message ?? "Invalid username format";
        return NextResponse.json(
            { available: false, reason: firstError, suggestions: [] },
            { status: 200 }
        );
    }

    const desired = parsed.data.username;

    const admin = createAdminClient();
    if (!admin) {
        return ApiErrors.serviceUnavailable();
    }

    const result = await checkUsernameAvailable(admin, desired);

    // Generate suggestions if not available
    let suggestions: string[] = [];
    if (!result.available) {
        suggestions = await generateUsernameSuggestions(admin, desired);
    }

    return NextResponse.json({
        available: result.available,
        reason: result.reason,
        suggestions,
    });
}
