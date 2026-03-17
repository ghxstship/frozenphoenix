import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { resetPasswordSchema, validate } from "@/lib/validation/schemas";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/reset-password",
        authRoute: true,
        skipAuth: true,
    },
    async (request) => {
        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            return ApiErrors.badRequest("Invalid JSON body");
        }

        const result = validate(resetPasswordSchema, rawBody);
        if (!result.success) {
            return ApiErrors.validationError(result.errors);
        }

        const { email } = result.data;

        const supabase = await createClient();
        if (!supabase) {
            return ApiErrors.serviceUnavailable("Authentication service unavailable");
        }

        const origin = request.headers.get("origin") ?? "";

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/reset-password`,
        });

        if (error) {
            // Do not leak Supabase error details — fall through to generic success
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            message: "If an account exists with this email, a password reset link has been sent.",
        });
    }
);
