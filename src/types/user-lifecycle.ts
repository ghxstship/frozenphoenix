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

export type OrgMembershipStatus =
    | "invited"
    | "active"
    | "suspended"
    | "expired"
    | "revoked";

export type InvitationStatus =
    | "pending"
    | "accepted"
    | "expired"
    | "revoked";

export type OnboardingStepStatus =
    | "not_started"
    | "in_progress"
    | "completed"
    | "skipped";

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
    avatarUrl?: string;
    phone?: string;
    jobTitle?: string;
    bio?: string;
    timezone: string;
    locale: string;
    dateFormat: string;
    lifecycleStatus: UserLifecycleStatus;
    onboardingCompletedAt?: string;
    lastActiveAt?: string;
    deletedAt?: string;
    anonymizedAt?: string;
    deletionRequestedAt?: string;
    deletionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrgMembership {
    id: string;
    userId: string;
    organizationId: string;
    organizationName?: string;
    role: PermissionLevel;
    status: OrgMembershipStatus;
    isDefaultOrg: boolean;
    invitedBy?: string;
    invitedByName?: string;
    invitedAt?: string;
    joinedAt?: string;
    expiresAt?: string;
    suspendedAt?: string;
    suspendedReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Invitation {
    id: string;
    organizationId: string;
    organizationName?: string;
    email: string;
    role: PermissionLevel;
    token: string;
    status: InvitationStatus;
    invitedBy: string;
    invitedByName?: string;
    personalMessage?: string;
    projectIds: string[];
    expiresAt: string;
    acceptedAt?: string;
    acceptedBy?: string;
    revokedAt?: string;
    revokedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OnboardingStepDefinition {
    id: string;
    role: PermissionLevel | "all";
    stepKey: string;
    title: string;
    description?: string;
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
    stepTitle?: string;
    stepKey?: string;
    status: OnboardingStepStatus;
    completedAt?: string;
    skippedAt?: string;
    metadata?: Record<string, unknown>;
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
    userId?: string;
    userEmail?: string;
    userName?: string;
    email?: string;
    eventType: LoginEventType;
    authMethod?: AuthMethod;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    countryCode?: string;
    city?: string;
    success: boolean;
    failureReason?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface UserSession {
    id: string;
    userId: string;
    sessionTokenHash: string;
    ipAddress?: string;
    userAgent?: string;
    deviceName?: string;
    deviceType?: DeviceType;
    browser?: string;
    os?: string;
    countryCode?: string;
    city?: string;
    isCurrent: boolean;
    lastActiveAt: string;
    expiresAt: string;
    revokedAt?: string;
    createdAt: string;
}

export interface ApiToken {
    id: string;
    userId: string;
    name: string;
    description?: string;
    tokenPrefix: string;
    tokenHash: string;
    scopes: string[];
    permissionLevel: PermissionLevel;
    organizationId?: string;
    status: ApiTokenStatus;
    lastUsedAt?: string;
    lastUsedIp?: string;
    expiresAt?: string;
    revokedAt?: string;
    revokedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TemporaryAccessGrant {
    id: string;
    userId: string;
    userName?: string;
    organizationId: string;
    resourceType: string;
    resourceId?: string;
    permissionLevel: PermissionLevel;
    actions: string[];
    reason: string;
    grantedBy: string;
    grantedByName?: string;
    status: AccessGrantStatus;
    startsAt: string;
    expiresAt: string;
    revokedAt?: string;
    revokedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleChangeLogEntry {
    id: string;
    userId: string;
    userName?: string;
    organizationId?: string;
    organizationName?: string;
    membershipId?: string;
    changeType: RoleChangeType;
    oldValue?: string;
    newValue?: string;
    reason?: string;
    changedBy?: string;
    changedByName?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface UserComplianceAck {
    id: string;
    userId: string;
    policyType: CompliancePolicyType;
    policyVersion: string;
    policyTitle: string;
    documentUrl?: string;
    acknowledgedAt: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

export interface DataRetentionPolicy {
    id: string;
    entityType: string;
    retentionDays: number;
    actionOnExpiry: DataRetentionAction;
    legalBasis?: string;
    description?: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Enhanced Existing Types ───

export interface EnhancedProjectMember {
    id: string;
    projectId: string;
    profileId: string;
    profileName?: string;
    role?: string;
    status: ProjectMemberStatus;
    grantedBy?: string;
    grantedByName?: string;
    grantedAt: string;
    expiresAt?: string;
    revokedAt?: string;
    createdAt: string;
}

export interface EnhancedOrganization {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    ssoDomain?: string;
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
    defaultOrg?: OrgMembership;
}

export interface UserDirectoryEntry {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    jobTitle?: string;
    lifecycleStatus: UserLifecycleStatus;
    role: PermissionLevel;
    organizationName: string;
    lastActiveAt?: string;
    onboardingCompletedAt?: string;
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
    lastActiveAt?: string;
    daysSinceActive: number;
    projectCount: number;
    hasExpiredGrants: boolean;
    riskLevel: "low" | "medium" | "high";
}
