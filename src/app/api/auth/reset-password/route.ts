import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json(
                { error: "Authentication service unavailable" },
                { status: 503 }
            );
        }

        const origin = request.headers.get("origin") ?? "";

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/reset-password`,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            message: "If an account exists with this email, a password reset link has been sent.",
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
