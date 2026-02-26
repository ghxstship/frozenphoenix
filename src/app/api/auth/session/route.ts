import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json(
                { user: null, session: null },
                { status: 200 }
            );
        }

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { user: null, session: null },
                { status: 200 }
            );
        }

        // Fetch profile data
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name ?? profile?.name ?? null,
                avatar_url: user.user_metadata?.avatar_url ?? profile?.avatar_url ?? null,
                role: profile?.role ?? null,
            },
            session: { authenticated: true },
        });
    } catch {
        return NextResponse.json(
            { user: null, session: null, error: "Internal server error" },
            { status: 500 }
        );
    }
}
