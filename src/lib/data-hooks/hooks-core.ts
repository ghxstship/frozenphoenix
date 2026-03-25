"use client";

/**
 * Core entity hooks: projects, tasks, deals, locations, events, activations,
 * approvals, milestones, calendar_events, shifts, notifications, integrations.
 *
 * ALL hooks use factory pattern. Query keys match entityConfig.entityName.
 */

import type { Tables } from "@/types/generated/database.types";
import {
    makeCreateHook,
    makeDeleteHook,
    makeDetailHook,
    makeListHook,
    makeUpdateHook,
} from "./hook-factories";
import type {
    ActivationWithLocation,
    ApprovalWithProfile,
    BudgetWithLines,
    EventWithJoins,
    ExpenseWithJoins,
    IncidentWithJoins,
    MilestoneWithApprovals,
    ProjectWithMembers,
    TaskWithDeps,
} from "./hook-types";

// ═══════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════

export const useProjects = makeListHook<ProjectWithMembers>("project", "/api/entities/projects", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useProject = makeDetailHook<ProjectWithMembers>("project", "/api/entities/projects");
export const useCreateProject = makeCreateHook<Tables<"projects">>(
    "project",
    "/api/entities/projects"
);
export const useUpdateProject = makeUpdateHook<Tables<"projects">>(
    "project",
    "/api/entities/projects"
);
export const useDeleteProject = makeDeleteHook("project", "/api/entities/projects");

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════

export const useTasks = makeListHook<TaskWithDeps>("task", "/api/entities/tasks", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useTask = makeDetailHook<TaskWithDeps>("task", "/api/entities/tasks");
export const useCreateTask = makeCreateHook<Tables<"tasks">>("task", "/api/entities/tasks");
export const useUpdateTask = makeUpdateHook<Tables<"tasks">>("task", "/api/entities/tasks");
export const useDeleteTask = makeDeleteHook("task", "/api/entities/tasks");

// ═══════════════════════════════════════════════════════════════
// DEALS
// ═══════════════════════════════════════════════════════════════

export const useDeals = makeListHook<Tables<"deals">>(
    "deal",
    "/api/entities/deals",
    { sort_by: "created_at", sort_order: "desc" },
    { staleTime: 5 * 60_000, gcTime: 10 * 60_000 }
);
export const useDeal = makeDetailHook<Tables<"deals">>("deal", "/api/entities/deals");
export const useCreateDeal = makeCreateHook<Tables<"deals">>("deal", "/api/entities/deals");
export const useUpdateDeal = makeUpdateHook<Tables<"deals">>("deal", "/api/entities/deals");
export const useDeleteDeal = makeDeleteHook("deal", "/api/entities/deals");

// ═══════════════════════════════════════════════════════════════
// LOCATIONS
// ═══════════════════════════════════════════════════════════════

// Performance: 5-min staleTime — locations are reference data that rarely change.
export const useLocations = makeListHook<Tables<"locations">>(
    "location",
    "/api/entities/locations",
    {
        sort_by: "name",
        sort_order: "asc",
    },
    { staleTime: 5 * 60_000 }
);
export const useLocation = makeDetailHook<Tables<"locations">>(
    "location",
    "/api/entities/locations",
    {
        staleTime: 5 * 60_000,
    }
);
export const useCreateLocation = makeCreateHook<Tables<"locations">>(
    "location",
    "/api/entities/locations"
);
export const useUpdateLocation = makeUpdateHook<Tables<"locations">>(
    "location",
    "/api/entities/locations"
);
export const useDeleteLocation = makeDeleteHook("location", "/api/entities/locations");

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

export const useEvents = makeListHook<EventWithJoins>("event", "/api/entities/events", {
    sort_by: "date",
    sort_order: "asc",
});
export const useEvent = makeDetailHook<EventWithJoins>("event", "/api/entities/events");
export const useCreateEvent = makeCreateHook<Tables<"events">>("event", "/api/entities/events");
export const useUpdateEvent = makeUpdateHook<Tables<"events">>("event", "/api/entities/events");
export const useDeleteEvent = makeDeleteHook("event", "/api/entities/events");

// ═══════════════════════════════════════════════════════════════
// ACTIVATIONS
// ═══════════════════════════════════════════════════════════════

export const useActivations = makeListHook<ActivationWithLocation>(
    "activation",
    "/api/entities/activations",
    { sort_by: "name", sort_order: "asc" }
);
export const useActivation = makeDetailHook<ActivationWithLocation>(
    "activation",
    "/api/entities/activations"
);
export const useCreateActivation = makeCreateHook<Tables<"activations">>(
    "activation",
    "/api/entities/activations"
);
export const useUpdateActivation = makeUpdateHook<Tables<"activations">>(
    "activation",
    "/api/entities/activations"
);
export const useDeleteActivation = makeDeleteHook("activation", "/api/entities/activations");

// ═══════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useApprovals = makeListHook<ApprovalWithProfile>(
    "approval",
    "/api/entities/approvals",
    {
        sort_by: "deadline",
        sort_order: "asc",
    }
);
export const useApproval = makeDetailHook<ApprovalWithProfile>(
    "approval",
    "/api/entities/approvals"
);
export const useCreateApproval = makeCreateHook<Tables<"approvals">>(
    "approval",
    "/api/entities/approvals"
);
export const useUpdateApproval = makeUpdateHook<Tables<"approvals">>(
    "approval",
    "/api/entities/approvals"
);
export const useDeleteApproval = makeDeleteHook("approval", "/api/entities/approvals");

// ═══════════════════════════════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════════════════════════════

export const useMilestones = makeListHook<MilestoneWithApprovals>(
    "milestone",
    "/api/entities/milestones",
    {
        sort_by: "due_date",
        sort_order: "asc",
    }
);
export const useMilestone = makeDetailHook<MilestoneWithApprovals>(
    "milestone",
    "/api/entities/milestones"
);
export const useCreateMilestone = makeCreateHook<Tables<"milestones">>(
    "milestone",
    "/api/entities/milestones"
);
export const useUpdateMilestone = makeUpdateHook<Tables<"milestones">>(
    "milestone",
    "/api/entities/milestones"
);
export const useDeleteMilestone = makeDeleteHook("milestone", "/api/entities/milestones");

// ═══════════════════════════════════════════════════════════════
// BUDGETS
// ═══════════════════════════════════════════════════════════════

export const useBudgets = makeListHook<BudgetWithLines>("budget", "/api/entities/budgets", {
    sort_by: "version",
    sort_order: "desc",
});
export const useBudget = makeDetailHook<BudgetWithLines>("budget", "/api/entities/budgets");
export const useCreateBudget = makeCreateHook<Tables<"budgets">>("budget", "/api/entities/budgets");
export const useUpdateBudget = makeUpdateHook<Tables<"budgets">>("budget", "/api/entities/budgets");
export const useDeleteBudget = makeDeleteHook("budget", "/api/entities/budgets");

// ═══════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════

export const useExpenses = makeListHook<ExpenseWithJoins>("expense", "/api/entities/expenses", {
    sort_by: "submitted_at",
    sort_order: "desc",
});
export const useExpense = makeDetailHook<ExpenseWithJoins>("expense", "/api/entities/expenses");
export const useCreateExpense = makeCreateHook<Tables<"expenses">>(
    "expense",
    "/api/entities/expenses"
);
export const useUpdateExpense = makeUpdateHook<Tables<"expenses">>(
    "expense",
    "/api/entities/expenses"
);
export const useDeleteExpense = makeDeleteHook("expense", "/api/entities/expenses");

// ═══════════════════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════════════════

export const useIncidents = makeListHook<IncidentWithJoins>("incident", "/api/entities/incidents", {
    sort_by: "occurred_at",
    sort_order: "desc",
});
export const useIncident = makeDetailHook<IncidentWithJoins>("incident", "/api/entities/incidents");
export const useCreateIncident = makeCreateHook<Tables<"incidents">>(
    "incident",
    "/api/entities/incidents"
);
export const useUpdateIncident = makeUpdateHook<Tables<"incidents">>(
    "incident",
    "/api/entities/incidents"
);
export const useDeleteIncident = makeDeleteHook("incident", "/api/entities/incidents");

// ═══════════════════════════════════════════════════════════════
// CALENDAR EVENTS
// ═══════════════════════════════════════════════════════════════

export const useCalendarEvents = makeListHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/entities/calendar-events",
    { sort_by: "start_date", sort_order: "asc" }
);
export const useCalendarEvent = makeDetailHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/entities/calendar-events"
);
export const useCreateCalendarEvent = makeCreateHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/entities/calendar-events"
);
export const useUpdateCalendarEvent = makeUpdateHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/entities/calendar-events"
);
export const useDeleteCalendarEvent = makeDeleteHook(
    "calendar_event",
    "/api/entities/calendar-events"
);

// ═══════════════════════════════════════════════════════════════
// SHIFTS
// ═══════════════════════════════════════════════════════════════

export const useShifts = makeListHook<Tables<"shifts">>("shift", "/api/entities/shifts", {
    sort_by: "date",
    sort_order: "asc",
});
export const useShift = makeDetailHook<Tables<"shifts">>("shift", "/api/entities/shifts");
export const useCreateShift = makeCreateHook<Tables<"shifts">>("shift", "/api/entities/shifts");
export const useUpdateShift = makeUpdateHook<Tables<"shifts">>("shift", "/api/entities/shifts");
export const useDeleteShift = makeDeleteHook("shift", "/api/entities/shifts");

// ═══════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════

export const useIntegrations = makeListHook<Tables<"integrations">>(
    "integration",
    "/api/entities/integrations",
    { sort_by: "name", sort_order: "asc" }
);
export const useIntegration = makeDetailHook<Tables<"integrations">>(
    "integration",
    "/api/entities/integrations"
);
export const useCreateIntegration = makeCreateHook<Tables<"integrations">>(
    "integration",
    "/api/entities/integrations"
);
export const useUpdateIntegration = makeUpdateHook<Tables<"integrations">>(
    "integration",
    "/api/entities/integrations"
);

// ═══════════════════════════════════════════════════════════════
// PROJECT TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useProjectTemplates = makeListHook<Tables<"project_templates">>(
    "project_template",
    "/api/entities/project-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useProjectTemplate = makeDetailHook<Tables<"project_templates">>(
    "project_template",
    "/api/entities/project-templates"
);
export const useCreateProjectTemplate = makeCreateHook<Tables<"project_templates">>(
    "project_template",
    "/api/entities/project-templates"
);
export const useUpdateProjectTemplate = makeUpdateHook<Tables<"project_templates">>(
    "project_template",
    "/api/entities/project-templates"
);
export const useDeleteProjectTemplate = makeDeleteHook(
    "project_template",
    "/api/entities/project-templates"
);

// ═══════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════

export const useVendors = makeListHook<Tables<"vendors">>("vendor", "/api/entities/vendors", {
    sort_by: "name",
    sort_order: "asc",
});
export const useVendor = makeDetailHook<Tables<"vendors">>("vendor", "/api/entities/vendors");
export const useCreateVendor = makeCreateHook<Tables<"vendors">>("vendor", "/api/entities/vendors");
export const useUpdateVendor = makeUpdateHook<Tables<"vendors">>("vendor", "/api/entities/vendors");
export const useDeleteVendor = makeDeleteHook("vendor", "/api/entities/vendors");
