import { NextResponse } from "next/server";
import { serverFromTable } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/api-utils";
import { withApiHandler } from "@/lib/api/with-api-handler";

/**
 * POST /api/projects/clone-from-template
 *
 * Gap #1: Project template clone-with-structure
 * Clones a template project's tasks, milestones, and team structure into a new project.
 *
 * Body: { template_id: string, name: string, start_date: string, end_date: string }
 */
export const POST = withApiHandler(
    {
        method: "POST",
        route: "/api/projects/clone-from-template",
        mutation: true,
        rbac: { resource: "projects", action: "write" },
    },
    async (request, { supabase, user, orgId }) => {
        const body = await request.json();
        const { template_id, name, start_date, end_date } = body;

        if (!template_id || !name) {
            return ApiErrors.badRequest("template_id and name are required");
        }

        // Fetch template project
        const { data: template, error: tplErr } = await serverFromTable(supabase, "projects")
            .select("*")
            .eq("id", template_id)
            .single();

        if (tplErr || !template) {
            return ApiErrors.notFound("Template");
        }

        // Create new project from template
        const { data: project, error: projErr } = await serverFromTable(supabase, "projects")
            .insert({
                name,
                organization_id: orgId,
                company_id: (template as Record<string, unknown>).company_id ?? null,
                status: "draft",
                current_phase: "pre_production",
                start_date: start_date ?? new Date().toISOString().split("T")[0],
                end_date:
                    end_date ?? new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
                budget_planned:
                    ((template as Record<string, unknown>).budget_planned as number) ?? 0,
                manager_id: user.id,
                timezone:
                    ((template as Record<string, unknown>).timezone as string) ??
                    "America/New_York",
            })
            .select("id")
            .single();

        if (projErr || !project) {
            return ApiErrors.internalError("Failed to create project");
        }

        const projectId = (project as Record<string, unknown>).id as string;

        // Clone tasks from template
        const { data: templateTasks } = await serverFromTable(supabase, "tasks")
            .select("title, description, status, priority, phase, estimated_hours, due_date")
            .eq("project_id", template_id);

        if (templateTasks && (templateTasks as unknown[]).length > 0) {
            const clonedTasks = (templateTasks as Array<Record<string, unknown>>).map((t) => ({
                title: t.title,
                description: t.description,
                status: "backlog",
                priority: t.priority ?? "medium",
                phase: t.phase,
                estimated_hours: t.estimated_hours,
                project_id: projectId,
                organization_id: orgId,
            }));
            await serverFromTable(supabase, "tasks").insert(clonedTasks);
        }

        // Clone milestones from template
        const { data: templateMilestones } = await serverFromTable(supabase, "milestones")
            .select("name, description, target_date, phase")
            .eq("project_id", template_id);

        if (templateMilestones && (templateMilestones as unknown[]).length > 0) {
            const clonedMilestones = (templateMilestones as Array<Record<string, unknown>>).map(
                (m) => ({
                    name: m.name,
                    description: m.description,
                    status: "pending",
                    phase: m.phase,
                    project_id: projectId,
                    organization_id: orgId,
                })
            );
            await serverFromTable(supabase, "milestones").insert(clonedMilestones);
        }

        // Clone project members from template
        const { data: templateMembers } = await serverFromTable(supabase, "project_members")
            .select("user_id, role")
            .eq("project_id", template_id);

        if (templateMembers && (templateMembers as unknown[]).length > 0) {
            const clonedMembers = (templateMembers as Array<Record<string, unknown>>).map((m) => ({
                user_id: m.user_id,
                role: m.role,
                project_id: projectId,
                organization_id: orgId,
            }));
            await serverFromTable(supabase, "project_members").insert(clonedMembers);
        }

        return NextResponse.json(
            {
                data: {
                    project_id: projectId,
                    cloned_from: template_id,
                    tasks_cloned: (templateTasks as unknown[] | null)?.length ?? 0,
                    milestones_cloned: (templateMilestones as unknown[] | null)?.length ?? 0,
                    members_cloned: (templateMembers as unknown[] | null)?.length ?? 0,
                },
            },
            { status: 201 }
        );
    }
);
