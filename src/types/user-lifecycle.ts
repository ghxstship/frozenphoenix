/* ═══════════════════════════════════════════════════════════════
   USER LIFECYCLE & IDENTITY MANAGEMENT — Type Definitions
   Migration 015
   ═══════════════════════════════════════════════════════════════ */

import type { PermissionLevel } from "./index";

// ─── Enums ───

export type UserLifecycleStatus =
    | "pending_verification"
    | "onboarding"
    | "active"
    | "suspended"
    | "deactivated"
    | "pending_deletion"
    | "anonymized";

export type OrgMembershipStatus = "invited" | "active" | "suspended" | "expired" | "revoked";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type OnboardingStepStatus = "not_started" | "in_progress" | "completed" | "skipped";

export type LoginEventType =
    | "login_success"
    | "login_failure"
    | "logout"
    | "token_refresh"
    | "password_reset_request"
    | "password_reset_complete"
    | "mfa_challenge"
    | "mfa_success"
    | "mfa_failure"
    | "api_token_auth"
    | "session_revoked"
    | "account_locked";

export type AuthMethod =
    | "password"
    | "magic_link"
    | "oauth_google"
    | "oauth_github"
    | "oauth_azure"
    | "saml"
    | "api_token"
    | "session_refresh";

export type ApiTokenStatus = "active" | "expired" | "revoked";

export type AccessGrantStatus = "active" | "expired" | "revoked";

export type CompliancePolicyType =
    | "terms_of_service"
    | "privacy_policy"
    | "acceptable_use"
    | "nda"
    | "data_processing"
    | "cookie_policy"
    | "sop"
    | "custom";

export type DataRetentionAction = "anonymize" | "purge" | "archive" | "retain";

export type PreferenceCategory =
    | "display"
    | "notifications"
    | "accessibility"
    | "privacy"
    | "integrations";

export type DeviceType = "desktop" | "mobile" | "tablet" | "api" | "unknown";

export type RoleChangeType =
    | "role_granted"
    | "role_changed"
    | "role_revoked"
    | "membership_created"
    | "membership_suspended"
    | "membership_expired"
    | "membership_revoked"
    | "project_access_granted"
    | "project_access_revoked"
    | "temp_grant_created"
    | "temp_grant_revoked"
    | "account_suspended"
    | "account_deactivated"
    | "account_reactivated"
    | "account_deletion_requested"
    | "account_anonymized";

export type ProjectMemberStatus = "active" | "suspended" | "expired" | "revoked";

// ─── Entities ───

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | undefined;
    phone?: string | undefined;
    jobTitle?: string | undefined;
    bio?: string | undefined;
    timezone: string;
    locale: string;
    dateFormat: string;
    lifecycleStatus: UserLifecycleStatus;
    onboardingCompletedAt?: string | undefined;
    lastActiveAt?: string | undefined;
    deletedAt?: string | undefined;
    anonymizedAt?: string | undefined;
    deletionRequestedAt?: string | undefined;
    deletionReason?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface OrgMembership {
    id: string;
    userId: string;
    organizationId: string;
    organizationName?: string | undefined;
    role: PermissionLevel;
    status: OrgMembershipStatus;
    isDefaultOrg: boolean;
    invitedBy?: string | undefined;
    invitedByName?: string | undefined;
    invitedAt?: string | undefined;
    joinedAt?: string | undefined;
    expiresAt?: string | undefined;
    suspendedAt?: string | undefined;
    suspendedReason?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface Invitation {
    id: string;
    organizationId: string;
    organizationName?: string | undefined;
    email: string;
    role: PermissionLevel;
    token: string;
    status: InvitationStatus;
    invitedBy: string;
    invitedByName?: string | undefined;
    personalMessage?: string | undefined;
    projectIds: string[];
    expiresAt: string;
    acceptedAt?: string | undefined;
    acceptedBy?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardingStepDefinition {
    id: string;
    role: PermissionLevel | "all";
    stepKey: string;
    title: string;
    description?: string | undefined;
    sortOrder: number;
    isRequired: boolean;
    isActive: boolean;
    gateAccess: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserOnboardingProgress {
    id: string;
    userId: string;
    stepDefinitionId: string;
    stepTitle?: string | undefined;
    stepKey?: string | undefined;
    status: OnboardingStepStatus;
    completedAt?: string | undefined;
    skippedAt?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface UserPreference {
    id: string;
    userId: string;
    category: PreferenceCategory;
    key: string;
    value: unknown;
    updatedAt: string;
}

export interface LoginAuditEntry {
    id: string;
    userId?: string | undefined;
    userEmail?: string | undefined;
    userName?: string | undefined;
    email?: string | undefined;
    eventType: LoginEventType;
    authMethod?: AuthMethod | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    deviceFingerprint?: string | undefined;
    countryCode?: string | undefined;
    city?: string | undefined;
    success: boolean;
    failureReason?: string | undefined;
    sessionId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    createdAt: string;
}

export interface UserSession {
    id: string;
    userId: string;
    sessionTokenHash: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    deviceName?: string | undefined;
    deviceType?: DeviceType | undefined;
    browser?: string | undefined;
    os?: string | undefined;
    countryCode?: string | undefined;
    city?: string | undefined;
    isCurrent: boolean;
    lastActiveAt: string;
    expiresAt: string;
    revokedAt?: string | undefined;
    createdAt: string;
}

export interface ApiToken {
    id: string;
    userId: string;
    name: string;
    description?: string | undefined;
    tokenPrefix: string;
    tokenHash: string;
    scopes: string[];
    permissionLevel: PermissionLevel;
    organizationId?: string | undefined;
    status: ApiTokenStatus;
    lastUsedAt?: string | undefined;
    lastUsedIp?: string | undefined;
    expiresAt?: string | undefined;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface TemporaryAccessGrant {
    id: string;
    userId: string;
    userName?: string | undefined;
    organizationId: string;
    resourceType: string;
    resourceId?: string | undefined;
    permissionLevel: PermissionLevel;
    actions: string[];
    reason: string;
    grantedBy: string;
    grantedByName?: string | undefined;
    status: AccessGrantStatus;
    startsAt: string;
    expiresAt: string;
    revokedAt?: string | undefined;
    revokedBy?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

export interface RoleChangeLogEntry {
    id: string;
    userId: string;
    userName?: string | undefined;
    organizationId?: string | undefined;
    organizationName?: string | undefined;
    membershipId?: string | undefined;
    changeType: RoleChangeType;
    oldValue?: string | undefined;
    newValue?: string | undefined;
    reason?: string | undefined;
    changedBy?: string | undefined;
    changedByName?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    createdAt: string;
}

export interface UserComplianceAck {
    id: string;
    userId: string;
    policyType: CompliancePolicyType;
    policyVersion: string;
    policyTitle: string;
    documentUrl?: string | undefined;
    acknowledgedAt: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    createdAt: string;
}

export interface DataRetentionPolicy {
    id: string;
    entityType: string;
    retentionDays: number;
    actionOnExpiry: DataRetentionAction;
    legalBasis?: string | undefined;
    description?: string | undefined;
    isActive: boolean;
    createdBy?: string | undefined;
    createdAt: string;
    updatedAt: string;
}

// ─── Enhanced Existing Types ───

export interface EnhancedProjectMember {
    id: string;
    projectId: string;
    profileId: string;
    profileName?: string | undefined;
    role?: string | undefined;
    status: ProjectMemberStatus;
    grantedBy?: string | undefined;
    grantedByName?: string | undefined;
    grantedAt: string;
    expiresAt?: string | undefined;
    revokedAt?: string | undefined;
    createdAt: string;
}

export interface EnhancedOrganization {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | undefined;
    ssoDomain?: string | undefined;
    requireMfa: boolean;
    defaultRole: PermissionLevel;
    maxSessionsPerUser: number;
    sessionTimeoutHours: number;
    invitationExpiryDays: number;
    enforceSso: boolean;
    allowedEmailDomains: string[];
    settings: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// ─── Composite / View Types ───

export interface UserWithMemberships extends UserProfile {
    memberships: OrgMembership[];
    defaultOrg?: OrgMembership | undefined;
}

export interface UserDirectoryEntry {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string | undefined;
    jobTitle?: string | undefined;
    lifecycleStatus: UserLifecycleStatus;
    role: PermissionLevel;
    organizationName: string;
    lastActiveAt?: string | undefined;
    onboardingCompletedAt?: string | undefined;
    createdAt: string;
}

export interface AccessReviewEntry {
    userId: string;
    userName: string;
    email: string;
    organizationName: string;
    role: PermissionLevel;
    membershipStatus: OrgMembershipStatus;
    joinedAt: string;
    lastActiveAt?: string | undefined;
    daysSinceActive: number;
    projectCount: number;
    hasExpiredGrants: boolean;
    riskLevel: "low" | "medium" | "high";
}
