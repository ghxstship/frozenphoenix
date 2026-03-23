/* ═══════════════════════════════════════════════════════════════
   REPORTS BFF (Backend For Frontend) ENDPOINT
   
   Consolidates 5 independent queries (projects, deals, tasks,
   crew, vendors) into a single server-side request with minimal
   column selects for report generation.
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from "next/server";
import { createClient, serverFromTable } from "@/lib/supabase/server";
import { ApiErrors, generateRequestId } from "@/lib/api-utils";
import { hasPermission } from "@/config/rbac";
import { resolveRoleAndOrg } from "@/lib/api/auth-resolver";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
    const requestId = generateRequestId();
    const log = logger.child({ requestId, method: "GET", route: "/reports" });

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

        if (!hasPermission(role, "reports", "read")) {
            return ApiErrors.forbidden(`Role "${role}" cannot read reports`);
        }

        const [projectsResult, dealsResult, tasksResult, crewResult, vendorsResult] =
            await Promise.all([
                serverFromTable(supabase, "projects")
                    .select("id, name, status, budget_planned, budget_actual, progress")
                    .eq("organization_id", orgId)
                    .is("deleted_at", null)
                    .order("name")
                    .limit(200),

                serverFromTable(supabase, "deals")
                    .select("id, title, stage, value, probability")
                    .eq("organization_id", orgId)
                    .is("deleted_at", null)
                    .limit(200),

                serverFromTable(supabase, "tasks")
                    .select("id, title, status, priority")
                    .eq("organization_id", orgId)
                    .is("deleted_at", null)
                    .limit(500),

                serverFromTable(supabase, "crew_members")
                    .select("id, name, role, department, status")
                    .eq("organization_id", orgId)
                    .limit(500),

                serverFromTable(supabase, "vendors")
                    .select("id, name, status, category")
                    .eq("organization_id", orgId)
                    .is("deleted_at", null)
                    .limit(200),
            ]);

        const errors: string[] = [];
        if (projectsResult.error) errors.push(`projects: ${projectsResult.error.message}`);
        if (dealsResult.error) errors.push(`deals: ${dealsResult.error.message}`);
        if (tasksResult.error) errors.push(`tasks: ${tasksResult.error.message}`);
        if (crewResult.error) errors.push(`crew: ${crewResult.error.message}`);
        if (vendorsResult.error) errors.push(`vendors: ${vendorsResult.error.message}`);

        if (errors.length > 0) {
            log.warn("Reports BFF partial failures", { errors });
        }

        const response = NextResponse.json({
            projects: projectsResult.data ?? [],
            deals: dealsResult.data ?? [],
            tasks: tasksResult.data ?? [],
            crew: crewResult.data ?? [],
            vendors: vendorsResult.data ?? [],
        });

        response.headers.set("X-Request-Id", requestId);
        response.headers.set("Cache-Control", "private, max-age=0, stale-while-revalidate=60");
        return response;
    } catch (err) {
        log.error("Unhandled error in Reports BFF", {
            error: err instanceof Error ? err.message : String(err),
        });
        return ApiErrors.internalError();
    }
}
