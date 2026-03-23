/* ═══════════════════════════════════════════════════════════════
   Workspace Context — Type Definitions
   Teams, team members, and switcher item shapes.
   ═══════════════════════════════════════════════════════════════ */

// ─── Team ────────────────────────────────────────────────────
export interface Team {
    id: string;
    organization_id: string;
    name: string;
    slug: string;
    description: string | null;
    avatar_url: string | null;
    is_default: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Team Member ─────────────────────────────────────────────
export type TeamMemberRole = "lead" | "member";

export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role: TeamMemberRole;
    joined_at: string;
    user_profiles?: {
        id: string;
        name: string;
        avatar_url: string | null;
    } | null;
}

// ─── Switcher Item (lightweight shape for popover lists) ─────
export interface SwitcherItem {
    id: string;
    name: string;
    slug?: string | undefined;
    logo_url?: string | null | undefined;
    avatar_url?: string | null | undefined;
    status?: string | undefined;
    is_default?: boolean | undefined;
}

// ─── Entity Types for breadcrumb context detection ───────────
export type SwitcherEntityType = "org" | "team" | "client" | "project" | "activation";

export interface EntityContext {
    type: SwitcherEntityType;
    id: string;
}

// ─── Workspace Context Store Shape ───────────────────────────
export interface WorkspaceContextState {
    activeTeamId: string | null;
    activeClientId: string | null;
    activeProjectId: string | null;
    activeActivationId: string | null;

    setActiveTeam: (id: string | null) => void;
    setActiveClient: (id: string | null) => void;
    setActiveProject: (id: string | null) => void;
    setActiveActivation: (id: string | null) => void;
    clearAll: () => void;
}
