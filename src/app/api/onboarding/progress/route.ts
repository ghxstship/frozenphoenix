import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (sb: SupabaseClient, table: string) => (sb as any).from(table);

export async function GET() {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile to determine role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userRole = profile?.role || "pm";

    // Get step definitions relevant to this user's role
    const { data: steps } = await fromTable(supabase, "onboarding_step_definitions")
        .select("*")
        .or(`role.eq.all,role.eq.${userRole}`)
        .order("sort_order", { ascending: true });

    // Get user's progress
    const { data: progress } = await fromTable(supabase, "user_onboarding_progress")
        .select("*")
        .eq("user_id", user.id);

    const progressMap = new Map(
        (progress || []).map((p: Record<string, unknown>) => [p.step_definition_id, p])
    );

    const enrichedSteps = (steps || []).map((step: Record<string, unknown>) => ({
        ...step,
        progress: progressMap.get(step.id) || null,
        completed: progressMap.has(step.id) &&
            (progressMap.get(step.id) as Record<string, unknown>)?.status === "completed",
    }));

    const totalRequired = enrichedSteps.filter((s: Record<string, unknown>) => s.is_required).length;
    const completedRequired = enrichedSteps.filter(
        (s: Record<string, unknown>) => s.is_required && s.completed
    ).length;

    return NextResponse.json({
        steps: enrichedSteps,
        summary: {
            total: enrichedSteps.length,
            completed: enrichedSteps.filter((s: Record<string, unknown>) => s.completed).length,
            totalRequired,
            completedRequired,
            isComplete: completedRequired >= totalRequired,
        },
    });
}

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
    const { step_definition_id, status } = body;

    if (!step_definition_id) {
        return NextResponse.json({ error: "step_definition_id is required" }, { status: 400 });
    }

    const validStatuses = ["not_started", "in_progress", "completed", "skipped"];
    const stepStatus = validStatuses.includes(status) ? status : "completed";

    const { data, error } = await fromTable(supabase, "user_onboarding_progress")
        .upsert(
            {
                user_id: user.id,
                step_definition_id,
                status: stepStatus,
                completed_at: stepStatus === "completed" ? new Date().toISOString() : null,
            },
            { onConflict: "user_id,step_definition_id" }
        )
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }

    return NextResponse.json({ progress: data });
}
