/**
 * HARBOR MASTER — TypeScript Types
 * Canonical type definitions for the membership lifecycle system.
 * Generated from the schema defined in migration 116_harbor_master.sql.
 */

// ─── Role (with HARBOR-MASTER capability fields) ─────────────────────────────

export interface HarborRole {
    id: string;
    organization_id: string;
    name: string;
    slug: string;
    hierarchy_level: number;
    scope: "organization" | "project" | "both";
    can_invite: boolean;
    can_approve_requests: boolean;
    can_generate_invite_codes: boolean;
    can_bulk_invite: boolean;
    is_system: boolean;
    status: string;
    created_at: string;
}

// ─── Invite Code ─────────────────────────────────────────────────────────────

export interface InviteCode {
    id: string;
    code: string;
    organization_id: string;
    project_id: string | null;
    role_id: string;
    created_by: string;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    requires_approval: boolean;
    expires_at: string | null;
    created_at: string;
    // Joined relations
    role?: Pick<HarborRole, "id" | "name" | "slug" | "hierarchy_level">;
    organization?: { id: string; name: string; slug: string };
    project?: { id: string; name: string; slug: string } | null;
}

// ─── Invite Code Redemption ───────────────────────────────────────────────────

export interface InviteCodeRedemption {
    id: string;
    invite_code_id: string;
    user_id: string;
    redeemed_at: string;
    resulted_in_membership_id: string | null;
}

// ─── Join Request ─────────────────────────────────────────────────────────────

export interface JoinRequest {
    id: string;
    user_id: string;
    organization_id: string;
    project_id: string | null;
    status: "pending" | "approved" | "denied";
    requested_at: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    deny_reason: string | null;
    // Joined relations
    user_profiles?: {
        id: string;
        display_name: string;
        email: string;
        avatar_url: string | null;
    };
    organization?: { id: string; name: string; slug: string };
    project?: { id: string; name: string; slug: string } | null;
}

// ─── Membership (HARBOR-MASTER extended) ─────────────────────────────────────

export type JoinedVia =
    | "direct_invite"
    | "invite_code"
    | "domain_match"
    | "manual_add"
    | "join_request";

export interface HarborMembership {
    id: string;
    user_id: string;
    organization_id: string;
    project_id: string | null;
    role: string;
    role_id: string | null;
    status: "invited" | "active" | "suspended" | "expired" | "revoked" | "pending_approval";
    joined_via: JoinedVia | null;
    invited_by: string | null;
    approved_by: string | null;
    is_default_org: boolean;
    joined_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── API Payload Interfaces ───────────────────────────────────────────────────

/** POST /api/invitations/send — §6.1 */
export interface SendInvitationPayload {
    organization_id: string;
    project_id?: string;
    invited_email: string;
    role_id: string;
    message?: string;
}

/** POST /api/invitations/[token]/accept — §6.2 */
export interface AcceptInvitationPayload {
    token: string;
}

/** POST /api/invite-codes/redeem — §6.3 */
export interface RedeemCodePayload {
    code: string;
}

/** POST /api/invite-codes/generate — §6.4 */
export interface GenerateCodesPayload {
    organization_id: string;
    project_id?: string;
    role_id: string;
    count: number;
    max_uses?: number;
    expires_at?: string;
    requires_approval?: boolean;
}

/** POST /api/invite-codes/distribute — §6.5 */
export interface DistributeCodesPayload {
    invite_code_ids: string[];
    method: "email" | "csv" | "qr";
    recipients?: string[];
    generate_unique_per_recipient?: boolean;
}

/** POST /api/join-requests — Flow D */
export interface CreateJoinRequestPayload {
    organization_id: string;
    project_id?: string;
}

/** POST /api/join-requests/review — §6.6 */
export interface ReviewRequestPayload {
    join_request_id: string;
    action: "approve" | "deny";
    deny_reason?: string;
    role_id?: string;
}

// ─── Generated invite code format ────────────────────────────────────────────

export interface GeneratedCode {
    id: string;
    code: string;
    url: string;
}
