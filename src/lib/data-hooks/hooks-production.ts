"use client";

/**
 * Production entity hooks: production_tasks, production_milestones, production_checklists,
 * production_sops, production_expenses, production_time_entries, production_runs,
 * production_verticals, technical_specs, work_packages, boms, qc_gates, scenarios,
 * schedule_entries, project_assignments.
 */

import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";

// ═══════════════════════════════════════════════════════════════
// PRODUCTION TASKS
// ═══════════════════════════════════════════════════════════════

export const useProductionTasks = makeListHook<Tables<"production_tasks">>(
    "production_task",
    "/api/entities/production-tasks",
    { sort_by: "due_date", sort_order: "asc" }
);
export const useProductionTask = makeDetailHook<Tables<"production_tasks">>(
    "production_task",
    "/api/entities/production-tasks"
);
export const useCreateProductionTask = makeCreateHook<Tables<"production_tasks">>(
    "production_task",
    "/api/entities/production-tasks"
);
export const useUpdateProductionTask = makeUpdateHook<Tables<"production_tasks">>(
    "production_task",
    "/api/entities/production-tasks"
);
export const useDeleteProductionTask = makeDeleteHook(
    "production_task",
    "/api/entities/production-tasks"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION MILESTONES
// ═══════════════════════════════════════════════════════════════

export const useProductionMilestones = makeListHook<Tables<"production_milestones">>(
    "production_milestone",
    "/api/entities/production-milestones",
    { sort_by: "due_date", sort_order: "asc" }
);
export const useProductionMilestone = makeDetailHook<Tables<"production_milestones">>(
    "production_milestone",
    "/api/entities/production-milestones"
);
export const useCreateProductionMilestone = makeCreateHook<Tables<"production_milestones">>(
    "production_milestone",
    "/api/entities/production-milestones"
);
export const useUpdateProductionMilestone = makeUpdateHook<Tables<"production_milestones">>(
    "production_milestone",
    "/api/entities/production-milestones"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION CHECKLISTS
// ═══════════════════════════════════════════════════════════════

export const useProductionChecklists = makeListHook<Tables<"production_checklists">>(
    "production_checklist",
    "/api/entities/production-checklists",
    { sort_by: "due_date", sort_order: "asc" }
);
export const useProductionChecklist = makeDetailHook<Tables<"production_checklists">>(
    "production_checklist",
    "/api/entities/production-checklists"
);
export const useCreateProductionChecklist = makeCreateHook<Tables<"production_checklists">>(
    "production_checklist",
    "/api/entities/production-checklists"
);
export const useUpdateProductionChecklist = makeUpdateHook<Tables<"production_checklists">>(
    "production_checklist",
    "/api/entities/production-checklists"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION SOPS
// ═══════════════════════════════════════════════════════════════

export const useProductionSOPs = makeListHook<Tables<"production_sops">>(
    "production_sop",
    "/api/entities/production-sops",
    { sort_by: "number", sort_order: "asc" }
);
export const useProductionSOP = makeDetailHook<Tables<"production_sops">>(
    "production_sop",
    "/api/entities/production-sops"
);
export const useCreateProductionSOP = makeCreateHook<Tables<"production_sops">>(
    "production_sop",
    "/api/entities/production-sops"
);
export const useUpdateProductionSOP = makeUpdateHook<Tables<"production_sops">>(
    "production_sop",
    "/api/entities/production-sops"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION EXPENSES
// ═══════════════════════════════════════════════════════════════

export const useProductionExpenses = makeListHook<Tables<"production_expenses">>(
    "production_expense",
    "/api/entities/production-expenses",
    { sort_by: "expense_date", sort_order: "desc" }
);
export const useProductionExpense = makeDetailHook<Tables<"production_expenses">>(
    "production_expense",
    "/api/entities/production-expenses"
);
export const useCreateProductionExpense = makeCreateHook<Tables<"production_expenses">>(
    "production_expense",
    "/api/entities/production-expenses"
);
export const useUpdateProductionExpense = makeUpdateHook<Tables<"production_expenses">>(
    "production_expense",
    "/api/entities/production-expenses"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION TIME ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useProductionTimeEntries = makeListHook<Tables<"production_time_entries">>(
    "production_time_entry",
    "/api/entities/production-time-entries",
    { sort_by: "date", sort_order: "desc" }
);
export const useProductionTimeEntry = makeDetailHook<Tables<"production_time_entries">>(
    "production_time_entry",
    "/api/entities/production-time-entries"
);
export const useCreateProductionTimeEntry = makeCreateHook<Tables<"production_time_entries">>(
    "production_time_entry",
    "/api/entities/production-time-entries"
);
export const useUpdateProductionTimeEntry = makeUpdateHook<Tables<"production_time_entries">>(
    "production_time_entry",
    "/api/entities/production-time-entries"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION RUNS
// ═══════════════════════════════════════════════════════════════

export const useProductionRuns = makeListHook<Tables<"production_runs">>(
    "production_run",
    "/api/entities/production-runs",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useProductionRun = makeDetailHook<Tables<"production_runs">>(
    "production_run",
    "/api/entities/production-runs"
);
export const useCreateProductionRun = makeCreateHook<Tables<"production_runs">>(
    "production_run",
    "/api/entities/production-runs"
);
export const useUpdateProductionRun = makeUpdateHook<Tables<"production_runs">>(
    "production_run",
    "/api/entities/production-runs"
);
export const useDeleteProductionRun = makeDeleteHook(
    "production_run",
    "/api/entities/production-runs"
);

// ═══════════════════════════════════════════════════════════════
// PRODUCTION VERTICALS
// ═══════════════════════════════════════════════════════════════

export const useProductionVerticals = makeListHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/entities/production-verticals",
    { sort_by: "name", sort_order: "asc" }
);
export const useProductionVertical = makeDetailHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/entities/production-verticals"
);
export const useCreateProductionVertical = makeCreateHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/entities/production-verticals"
);
export const useUpdateProductionVertical = makeUpdateHook<Tables<"production_verticals">>(
    "production_vertical",
    "/api/entities/production-verticals"
);

// ═══════════════════════════════════════════════════════════════
// TECHNICAL SPECS
// ═══════════════════════════════════════════════════════════════

export const useTechnicalSpecs = makeListHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/entities/technical-specs",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useTechnicalSpec = makeDetailHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/entities/technical-specs"
);
export const useCreateTechnicalSpec = makeCreateHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/entities/technical-specs"
);
export const useUpdateTechnicalSpec = makeUpdateHook<Tables<"technical_specs">>(
    "technical_spec",
    "/api/entities/technical-specs"
);

// ═══════════════════════════════════════════════════════════════
// WORK PACKAGES
// ═══════════════════════════════════════════════════════════════

export const useWorkPackages = makeListHook<Tables<"work_packages">>(
    "work_package",
    "/api/entities/work-packages",
    { sort_by: "created_at", sort_order: "desc" }
);
export const useWorkPackage = makeDetailHook<Tables<"work_packages">>(
    "work_package",
    "/api/entities/work-packages"
);
export const useCreateWorkPackage = makeCreateHook<Tables<"work_packages">>(
    "work_package",
    "/api/entities/work-packages"
);
export const useUpdateWorkPackage = makeUpdateHook<Tables<"work_packages">>(
    "work_package",
    "/api/entities/work-packages"
);
export const useDeleteWorkPackage = makeDeleteHook("work_package", "/api/entities/work-packages");

// ═══════════════════════════════════════════════════════════════
// BOMS (Bill of Materials)
// ═══════════════════════════════════════════════════════════════

export const useBoms = makeListHook<Tables<"boms">>("bom", "/api/entities/boms", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useBom = makeDetailHook<Tables<"boms">>("bom", "/api/entities/boms");
export const useCreateBom = makeCreateHook<Tables<"boms">>("bom", "/api/entities/boms");
export const useUpdateBom = makeUpdateHook<Tables<"boms">>("bom", "/api/entities/boms");
export const useDeleteBom = makeDeleteHook("bom", "/api/entities/boms");

// ═══════════════════════════════════════════════════════════════
// QC GATES
// ═══════════════════════════════════════════════════════════════

export const useQcGates = makeListHook<Tables<"qc_gates">>("qc_gate", "/api/entities/qc-gates", {
    sort_by: "gate_order",
    sort_order: "asc",
});
export const useQcGate = makeDetailHook<Tables<"qc_gates">>("qc_gate", "/api/entities/qc-gates");
export const useCreateQcGate = makeCreateHook<Tables<"qc_gates">>(
    "qc_gate",
    "/api/entities/qc-gates"
);
export const useUpdateQcGate = makeUpdateHook<Tables<"qc_gates">>(
    "qc_gate",
    "/api/entities/qc-gates"
);

// ═══════════════════════════════════════════════════════════════
// SCENARIOS
// ═══════════════════════════════════════════════════════════════

export const useScenarios = makeListHook<Tables<"scenarios">>(
    "scenario",
    "/api/entities/scenarios",
    {
        sort_by: "updated_at",
        sort_order: "desc",
    }
);
export const useScenario = makeDetailHook<Tables<"scenarios">>(
    "scenario",
    "/api/entities/scenarios"
);
export const useCreateScenario = makeCreateHook<Tables<"scenarios">>(
    "scenario",
    "/api/entities/scenarios"
);
export const useUpdateScenario = makeUpdateHook<Tables<"scenarios">>(
    "scenario",
    "/api/entities/scenarios"
);
export const useDeleteScenario = makeDeleteHook("scenario", "/api/entities/scenarios");

// ═══════════════════════════════════════════════════════════════
// SCHEDULE ENTRIES
// ═══════════════════════════════════════════════════════════════

export const useScheduleEntries = makeListHook<Tables<"schedule_entries">>(
    "schedule_entry",
    "/api/entities/schedule-entries",
    { sort_by: "start_datetime", sort_order: "asc" }
);
export const useScheduleEntry = makeDetailHook<Tables<"schedule_entries">>(
    "schedule_entry",
    "/api/entities/schedule-entries"
);
export const useCreateScheduleEntry = makeCreateHook<Tables<"schedule_entries">>(
    "schedule_entry",
    "/api/entities/schedule-entries"
);
export const useUpdateScheduleEntry = makeUpdateHook<Tables<"schedule_entries">>(
    "schedule_entry",
    "/api/entities/schedule-entries"
);
export const useDeleteScheduleEntry = makeDeleteHook(
    "schedule_entry",
    "/api/entities/schedule-entries"
);

// ═══════════════════════════════════════════════════════════════
// PROJECT ASSIGNMENTS
// ═══════════════════════════════════════════════════════════════

export const useProjectAssignments = makeListHook<Tables<"project_assignments">>(
    "project_assignment",
    "/api/entities/project-assignments",
    { sort_by: "start_date", sort_order: "desc" }
);
export const useProjectAssignment = makeDetailHook<Tables<"project_assignments">>(
    "project_assignment",
    "/api/entities/project-assignments"
);
export const useCreateProjectAssignment = makeCreateHook<Tables<"project_assignments">>(
    "project_assignment",
    "/api/entities/project-assignments",
    ["crew_member"]
);
export const useUpdateProjectAssignment = makeUpdateHook<Tables<"project_assignments">>(
    "project_assignment",
    "/api/entities/project-assignments"
);
export const useDeleteProjectAssignment = makeDeleteHook(
    "project_assignment",
    "/api/entities/project-assignments"
);
