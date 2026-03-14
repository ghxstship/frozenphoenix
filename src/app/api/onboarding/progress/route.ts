import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, parseAndValidate } from "@/lib/api-utils";
import { onboardingProgressSchema } from "@/lib/validation/api-schemas";

export async function GET() {
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

    // Get the user's profile to determine role and name
    let userRole = "pm";
    let profileName: string | null = null;

    const { data: profileData } = await serverFromTable(supabase!, "user_profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

    const { data: membershipData } = await serverFromTable(supabase!, "org_memberships")
        .select("role")
        .eq("user_id", user.id)
        .eq("is_default_org", true)
        .eq("status", "active")
        .single();

    if (membershipData) {
        userRole = membershipData.role || "pm";
    }
    if (profileData) {
        profileName = profileData.display_name;
    }

    // Get step definitions relevant to this user's role
    const { data: steps } = await serverFromTable(supabase!, "onboarding_step_definitions")
        .select("*")
        .or(`role.eq.all,role.eq.${userRole}`)
        .order("sort_order", { ascending: true });

    // Get user's progress
    const { data: progress } = await serverFromTable(supabase!, "user_onboarding_progress")
        .select("*")
        .eq("user_id", user.id);

    const progressMap = new Map(
        (progress || []).map((p: Record<string, unknown>) => [p.step_definition_id, p])
    );

    // Auto-detect completion for built-in steps
    const emailVerified = !!user.email_confirmed_at;
    const profileComplete = !!(profileName && profileName.trim().length > 0);

    const autoCompleteMap: Record<string, boolean> = {
        verify_email: emailVerified,
        complete_profile: profileComplete,
    };

    const enrichedSteps = (steps || []).map((step: Record<string, unknown>) => {
        const manuallyCompleted =
            progressMap.has(step.id) &&
            (progressMap.get(step.id) as Record<string, unknown>)?.status === "completed";
        const autoCompleted = autoCompleteMap[step.step_key as string] ?? false;
        const completed = manuallyCompleted || autoCompleted;

        return {
            ...step,
            progress: progressMap.get(step.id) || null,
            completed,
        };
    });

    // Persist auto-completed steps so they stay completed
    const autoCompletePersistPromises = enrichedSteps
        .filter((s: Record<string, unknown>) => {
            const key = s.step_key as string;
            return autoCompleteMap[key] && !progressMap.has(s.id as string);
        })
        .map((s: Record<string, unknown>) =>
            serverFromTable(supabase!, "user_onboarding_progress").upsert(
                {
                    user_id: user.id,
                    step_definition_id: s.id as string,
                    status: "completed" as const,
                    completed_at: new Date().toISOString(),
                },
                { onConflict: "user_id,step_definition_id" }
            )
        );

    // Fire-and-forget — don't block the response
    if (autoCompletePersistPromises.length > 0) {
        Promise.allSettled(autoCompletePersistPromises);
    }

    const totalRequired = enrichedSteps.filter(
        (s: Record<string, unknown>) => s.is_required
    ).length;
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
        return ApiErrors.serviceUnavailable();
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return ApiErrors.unauthorized();
    }

    const validated = await parseAndValidate(request, onboardingProgressSchema);
    if (!validated.success) return validated.response;

    const { step_definition_id, status: stepStatus } = validated.data;

    const { data, error } = await serverFromTable(supabase!, "user_onboarding_progress")
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
        return ApiErrors.internalError("Failed to update progress");
    }

    return NextResponse.json({ progress: data });
}
