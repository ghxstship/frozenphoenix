import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { usernameCheckSchema } from "@/lib/validation/schemas";
import {
    checkUsernameAvailable,
    generateUsernameSuggestions,
} from "@/lib/formatters/username-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * GET /api/usernames/check?q=desired_username
 * Returns availability status + suggested alternatives if taken.
 */
export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/usernames/check",
        rbac: { resource: "usernames", action: "read" },
    },
    async (request, _ctx) => {
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
);
