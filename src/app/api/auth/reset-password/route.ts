import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/auth/reset-password",
        authRoute: true,
        skipAuth: true,
    },
    async (request) => {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return ApiErrors.validationError({ email: ["Email is required"] });
        }

        const supabase = await createClient();
        if (!supabase) {
            return ApiErrors.serviceUnavailable("Authentication service unavailable");
        }

        const origin = request.headers.get("origin") ?? "";

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/reset-password`,
        });

        if (error) {
            return ApiErrors.badRequest(error.message);
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            message: "If an account exists with this email, a password reset link has been sent.",
        });
    }
);
