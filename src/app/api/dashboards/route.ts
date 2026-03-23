/* ═══════════════════════════════════════════════════════════════
   DASHBOARDS BFF (Backend For Frontend) ENDPOINT
   
   Consolidates 6 independent queries (projects, deals, tasks,
   crew, approvals, activities) into a single server-side request.
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, generateRequestId } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import { resolveRoleAndOrg } from "@/lib/api/auth-resolver";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const requestId = generateRequestId();
    const log = logger.child({ requestId, method: "GET", route: "/dashboards" });

    try {
        const supabase = await createClient();
        if (!supabase) return ApiErrors.serviceUnavailable();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return ApiErrors.unauthorized();

        const cachedRole = request.cookies.get("fp-user-role")?.value;
        const cachedOrgId = request.cookies.get("fp-org-id")?.value;
        const { role, orgId } = await resolveRoleAndOrg(supabase, user.id, cachedRole, cachedOrgId);

        if (!hasPermission(role, "dashboards", "read")) {
            return ApiErrors.forbidden(`Role "${role}" cannot read dashboards`);
        }

        const [
            projectsResult,
            dealsResult,
            tasksResult,
            crewResult,
            approvalsResult,
            activitiesResult,
        ] = await Promise.all([
            serverFromTable(supabase, "projects")
                .select("id, name, status, budget_planned, budget_actual, progress")
                .eq("organization_id", orgId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(50),

            serverFromTable(supabase, "deals")
                .select("id, title, stage, value")
                .eq("organization_id", orgId)
                .is("deleted_at", null)
                .limit(100),

            serverFromTable(supabase, "tasks")
                .select("id, title, status, due_date")
                .eq("organization_id", orgId)
                .is("deleted_at", null)
                .limit(200),

            serverFromTable(supabase, "crew_members")
                .select("id, name, status, department")
                .eq("organization_id", orgId)
                .limit(500),

            serverFromTable(supabase, "approvals")
                .select("id, status")
                .eq("organization_id", orgId)
                .is("deleted_at", null)
                .limit(50),

            serverFromTable(supabase, "activities")
                .select("id, title, activity_type, description, created_at")
                .eq("organization_id", orgId)
                .order("created_at", { ascending: false })
                .limit(5),
        ]);

        const errors: string[] = [];
        if (projectsResult.error) errors.push(`projects: ${projectsResult.error.message}`);
        if (dealsResult.error) errors.push(`deals: ${dealsResult.error.message}`);
        if (tasksResult.error) errors.push(`tasks: ${tasksResult.error.message}`);
        if (crewResult.error) errors.push(`crew: ${crewResult.error.message}`);
        if (approvalsResult.error) errors.push(`approvals: ${approvalsResult.error.message}`);
        if (activitiesResult.error) errors.push(`activities: ${activitiesResult.error.message}`);

        if (errors.length > 0) {
            log.warn("Dashboards BFF partial failures", { errors });
        }

        const response = NextResponse.json({
            projects: projectsResult.data ?? [],
            deals: dealsResult.data ?? [],
            tasks: tasksResult.data ?? [],
            crew: crewResult.data ?? [],
            approvals: approvalsResult.data ?? [],
            activities: activitiesResult.data ?? [],
        });

        response.headers.set("X-Request-Id", requestId);
        response.headers.set("Cache-Control", "private, max-age=0, stale-while-revalidate=30");
        return response;
    } catch (err) {
        log.error("Unhandled error in Dashboards BFF", {
            error: err instanceof Error ? err.message : String(err),
        });
        return ApiErrors.internalError();
    }
}
