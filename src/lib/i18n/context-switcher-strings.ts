/* ═══════════════════════════════════════════════════════════════
   i18n — Context Switcher Strings
   Single source of truth for all user-facing text in the
   context switcher components.
   ═══════════════════════════════════════════════════════════════ */

export const CONTEXT_SWITCHER_STRINGS = {
    // ─── Org Switcher ────────────────────────────────────────
    org: {
        searchPlaceholder: "Find organization\u2026",
        createLabel: "Create Organization",
        emptyMessage: "No organizations found",
        label: "Organization",
        switchLabel: "Switch organization",
    },

    // ─── Team Switcher ───────────────────────────────────────
    team: {
        searchPlaceholder: "Find team\u2026",
        clearLabel: "All Teams",
        createLabel: "Create Team",
        viewAllLabel: "View All Teams",
        viewAllHref: "/teams",
        emptyMessage: "No teams found",
        label: "Team",
        switchLabel: "Switch team",
    },

    // ─── Client Switcher ─────────────────────────────────────
    client: {
        searchPlaceholder: "Find client\u2026",
        clearLabel: "All Clients",
        createLabel: "Create Client",
        viewAllLabel: "View All Clients",
        viewAllHref: "/companies?type=client",
        emptyMessage: "No clients found",
        label: "Client",
        switchLabel: "Switch client",
    },

    // ─── Project Switcher ────────────────────────────────────
    project: {
        searchPlaceholder: "Find project\u2026",
        clearLabel: "All Projects",
        createLabel: "Create Project",
        viewAllLabel: "View All Projects",
        viewAllHref: "/projects",
        emptyMessage: "No projects found",
        label: "Project",
        switchLabel: "Switch project",
    },

    // ─── Activation Switcher ─────────────────────────────────
    activation: {
        searchPlaceholder: "Find activation\u2026",
        clearLabel: "All Activations",
        createLabel: "Create Activation",
        viewAllLabel: "View All Activations",
        viewAllHref: "/activations",
        emptyMessage: "No activations in this project",
        label: "Activation",
        switchLabel: "Switch activation",
    },

    // ─── Shared ──────────────────────────────────────────────
    shared: {
        close: "Close",
        noResults: "No results for \u201c{query}\u201d",
        loading: "Loading\u2026",
        recentlyUsed: "Recently Used",
    },

    // ─── Command Bar ─────────────────────────────────────────
    commands: {
        switchOrg: "Switch Organization",
        switchTeam: "Switch Team",
        switchProject: "Switch Project",
        switchClient: "Switch Client",
        sectionLabel: "Context",
    },
} as const;
