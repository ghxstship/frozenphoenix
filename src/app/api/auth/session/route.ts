import { NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(
    {
        method: "GET",
        route: "/api/auth/session",
        skipAuth: true,
    },
    async (_request, { log }) => {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ user: null, session: null }, { status: 200 });
        }

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ user: null, session: null }, { status: 200 });
        }

        // Fetch profile data
        const { data: profile } = await serverFromTable(supabase, "user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // Get role from org_memberships
        const { data: membership } = await serverFromTable(supabase, "org_memberships")
            .select("role")
            .eq("user_id", user.id)
            .eq("is_default_org", true)
            .eq("status", "active")
            .single();

        void log;

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name ?? profile?.display_name ?? null,
                avatar_url: user.user_metadata?.avatar_url ?? profile?.avatar_url ?? null,
                role: membership?.role ?? null,
            },
            session: { authenticated: true },
        });
    }
);
