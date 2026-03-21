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

export const useProjects = makeListHook<ProjectWithMembers>("project", "/api/projects", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useProject = makeDetailHook<ProjectWithMembers>("project", "/api/projects");
export const useCreateProject = makeCreateHook<Tables<"projects">>("project", "/api/projects");
export const useUpdateProject = makeUpdateHook<Tables<"projects">>("project", "/api/projects");
export const useDeleteProject = makeDeleteHook("project", "/api/projects");

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════

export const useTasks = makeListHook<TaskWithDeps>("task", "/api/tasks", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useTask = makeDetailHook<TaskWithDeps>("task", "/api/tasks");
export const useCreateTask = makeCreateHook<Tables<"tasks">>("task", "/api/tasks");
export const useUpdateTask = makeUpdateHook<Tables<"tasks">>("task", "/api/tasks");
export const useDeleteTask = makeDeleteHook("task", "/api/tasks");

// ═══════════════════════════════════════════════════════════════
// DEALS
// ═══════════════════════════════════════════════════════════════

export const useDeals = makeListHook<Tables<"deals">>("deal", "/api/deals", {
    sort_by: "created_at",
    sort_order: "desc",
});
export const useDeal = makeDetailHook<Tables<"deals">>("deal", "/api/deals");
export const useCreateDeal = makeCreateHook<Tables<"deals">>("deal", "/api/deals");
export const useUpdateDeal = makeUpdateHook<Tables<"deals">>("deal", "/api/deals");
export const useDeleteDeal = makeDeleteHook("deal", "/api/deals");

// ═══════════════════════════════════════════════════════════════
// LOCATIONS
// ═══════════════════════════════════════════════════════════════

// Performance: 5-min staleTime — locations are reference data that rarely change.
export const useLocations = makeListHook<Tables<"locations">>("location", "/api/locations", {
    sort_by: "name",
    sort_order: "asc",
}, { staleTime: 5 * 60_000 });
export const useLocation = makeDetailHook<Tables<"locations">>("location", "/api/locations", { staleTime: 5 * 60_000 });
export const useCreateLocation = makeCreateHook<Tables<"locations">>("location", "/api/locations");
export const useUpdateLocation = makeUpdateHook<Tables<"locations">>("location", "/api/locations");
export const useDeleteLocation = makeDeleteHook("location", "/api/locations");

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

export const useEvents = makeListHook<EventWithJoins>("event", "/api/events", {
    sort_by: "date",
    sort_order: "asc",
});
export const useEvent = makeDetailHook<EventWithJoins>("event", "/api/events");
export const useCreateEvent = makeCreateHook<Tables<"events">>("event", "/api/events");
export const useUpdateEvent = makeUpdateHook<Tables<"events">>("event", "/api/events");
export const useDeleteEvent = makeDeleteHook("event", "/api/events");

// ═══════════════════════════════════════════════════════════════
// ACTIVATIONS
// ═══════════════════════════════════════════════════════════════

export const useActivations = makeListHook<ActivationWithLocation>(
    "activation",
    "/api/activations",
    { sort_by: "name", sort_order: "asc" }
);
export const useActivation = makeDetailHook<ActivationWithLocation>(
    "activation",
    "/api/activations"
);
export const useCreateActivation = makeCreateHook<Tables<"activations">>(
    "activation",
    "/api/activations"
);
export const useUpdateActivation = makeUpdateHook<Tables<"activations">>(
    "activation",
    "/api/activations"
);
export const useDeleteActivation = makeDeleteHook("activation", "/api/activations");

// ═══════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════

export const useApprovals = makeListHook<ApprovalWithProfile>("approval", "/api/approvals", {
    sort_by: "deadline",
    sort_order: "asc",
});
export const useApproval = makeDetailHook<ApprovalWithProfile>("approval", "/api/approvals");
export const useCreateApproval = makeCreateHook<Tables<"approvals">>("approval", "/api/approvals");
export const useUpdateApproval = makeUpdateHook<Tables<"approvals">>("approval", "/api/approvals");
export const useDeleteApproval = makeDeleteHook("approval", "/api/approvals");

// ═══════════════════════════════════════════════════════════════
// MILESTONES
// ═══════════════════════════════════════════════════════════════

export const useMilestones = makeListHook<MilestoneWithApprovals>("milestone", "/api/milestones", {
    sort_by: "due_date",
    sort_order: "asc",
});
export const useMilestone = makeDetailHook<MilestoneWithApprovals>("milestone", "/api/milestones");
export const useCreateMilestone = makeCreateHook<Tables<"milestones">>(
    "milestone",
    "/api/milestones"
);
export const useUpdateMilestone = makeUpdateHook<Tables<"milestones">>(
    "milestone",
    "/api/milestones"
);
export const useDeleteMilestone = makeDeleteHook("milestone", "/api/milestones");

// ═══════════════════════════════════════════════════════════════
// BUDGETS
// ═══════════════════════════════════════════════════════════════

export const useBudgets = makeListHook<BudgetWithLines>("budget", "/api/budgets", {
    sort_by: "version",
    sort_order: "desc",
});
export const useBudget = makeDetailHook<BudgetWithLines>("budget", "/api/budgets");
export const useCreateBudget = makeCreateHook<Tables<"budgets">>("budget", "/api/budgets");
export const useUpdateBudget = makeUpdateHook<Tables<"budgets">>("budget", "/api/budgets");
export const useDeleteBudget = makeDeleteHook("budget", "/api/budgets");

// ═══════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════

export const useExpenses = makeListHook<ExpenseWithJoins>("expense", "/api/expenses", {
    sort_by: "submitted_at",
    sort_order: "desc",
});
export const useExpense = makeDetailHook<ExpenseWithJoins>("expense", "/api/expenses");
export const useCreateExpense = makeCreateHook<Tables<"expenses">>("expense", "/api/expenses");
export const useUpdateExpense = makeUpdateHook<Tables<"expenses">>("expense", "/api/expenses");
export const useDeleteExpense = makeDeleteHook("expense", "/api/expenses");

// ═══════════════════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════════════════

export const useIncidents = makeListHook<IncidentWithJoins>("incident", "/api/incidents", {
    sort_by: "occurred_at",
    sort_order: "desc",
});
export const useIncident = makeDetailHook<IncidentWithJoins>("incident", "/api/incidents");
export const useCreateIncident = makeCreateHook<Tables<"incidents">>("incident", "/api/incidents");
export const useUpdateIncident = makeUpdateHook<Tables<"incidents">>("incident", "/api/incidents");
export const useDeleteIncident = makeDeleteHook("incident", "/api/incidents");

// ═══════════════════════════════════════════════════════════════
// CALENDAR EVENTS
// ═══════════════════════════════════════════════════════════════

export const useCalendarEvents = makeListHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/calendar-events",
    { sort_by: "start_date", sort_order: "asc" }
);
export const useCalendarEvent = makeDetailHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/calendar-events"
);
export const useCreateCalendarEvent = makeCreateHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/calendar-events"
);
export const useUpdateCalendarEvent = makeUpdateHook<Tables<"calendar_events">>(
    "calendar_event",
    "/api/calendar-events"
);
export const useDeleteCalendarEvent = makeDeleteHook("calendar_event", "/api/calendar-events");

// ═══════════════════════════════════════════════════════════════
// SHIFTS
// ═══════════════════════════════════════════════════════════════

export const useShifts = makeListHook<Tables<"shifts">>("shift", "/api/shifts", {
    sort_by: "date",
    sort_order: "asc",
});
export const useShift = makeDetailHook<Tables<"shifts">>("shift", "/api/shifts");
export const useCreateShift = makeCreateHook<Tables<"shifts">>("shift", "/api/shifts");
export const useUpdateShift = makeUpdateHook<Tables<"shifts">>("shift", "/api/shifts");
export const useDeleteShift = makeDeleteHook("shift", "/api/shifts");

// ═══════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════

export const useIntegrations = makeListHook<Tables<"integrations">>(
    "integration",
    "/api/integrations",
    { sort_by: "name", sort_order: "asc" }
);
export const useIntegration = makeDetailHook<Tables<"integrations">>(
    "integration",
    "/api/integrations"
);
export const useCreateIntegration = makeCreateHook<Tables<"integrations">>(
    "integration",
    "/api/integrations"
);
export const useUpdateIntegration = makeUpdateHook<Tables<"integrations">>(
    "integration",
    "/api/integrations"
);

// ═══════════════════════════════════════════════════════════════
// PROJECT TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const useProjectTemplates = makeListHook<Tables<"project_templates">>(
    "project_template",
    "/api/project-templates",
    { sort_by: "name", sort_order: "asc" }
);
export const useProjectTemplate = makeDetailHook<Tables<"project_templates">>(
    "project_template",
    "/api/project-templates"
);
export const useCreateProjectTemplate = makeCreateHook<Tables<"project_templates">>(
    "project_template",
    "/api/project-templates"
);
export const useUpdateProjectTemplate = makeUpdateHook<Tables<"project_templates">>(
    "project_template",
    "/api/project-templates"
);
export const useDeleteProjectTemplate = makeDeleteHook(
    "project_template",
    "/api/project-templates"
);

// ═══════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════

export const useVendors = makeListHook<Tables<"vendors">>("vendor", "/api/vendors", {
    sort_by: "name",
    sort_order: "asc",
});
export const useVendor = makeDetailHook<Tables<"vendors">>("vendor", "/api/vendors");
export const useCreateVendor = makeCreateHook<Tables<"vendors">>("vendor", "/api/vendors");
export const useUpdateVendor = makeUpdateHook<Tables<"vendors">>("vendor", "/api/vendors");
export const useDeleteVendor = makeDeleteHook("vendor", "/api/vendors");
