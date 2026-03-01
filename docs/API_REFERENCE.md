# API Reference — FIND-027 OpenAPI Documentation

## Overview

All API routes are under `/api/` and return JSON responses using the standard error envelope defined in `src/lib/api-utils.ts`.

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": { "email": ["Valid email required"] },
    "requestId": "req_abc123"
  }
}
```

### Authentication

All protected routes require a valid Supabase session cookie. The middleware (`src/lib/supabase/middleware.ts`) handles session refresh and redirects unauthenticated users.

---

## Auth Routes

### POST /api/auth/log-event
Log an authentication event to the audit trail.

**Request Body** (validated by `logEventSchema`):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| event_type | enum | Yes | One of: login, logout, signup, password_reset, password_change, mfa_enroll, mfa_verify, mfa_unenroll, invite_accepted, org_created, org_switched, profile_updated, failed_login |
| metadata | object | No | Additional event context |

**Response**: `201 Created` with `{ success: true }`

### POST /api/auth/reset-password
Initiate a password reset email.

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |

**Response**: `200 OK` or `400/503` error

### POST /api/auth/validate-password
Validate password strength without creating an account.

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| password | string | Yes |

**Response**: `200 OK` with `{ valid, score, feedback }`

### GET /api/auth/session
Get the current authenticated user's session and profile.

**Response**: `200 OK` with `{ user, profile }`

---

## Organization Routes

### POST /api/organizations
Create a new organization.

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| handle | string | Yes |
| industry | string | No |
| timezone | string | No |

**Response**: `201 Created` with `{ organization, membership }`

### PATCH /api/organizations/[id]/security
Update organization security settings.

**Request Body** (validated by `orgSecurityPatchSchema`):
| Field | Type | Required |
|-------|------|----------|
| require_mfa | boolean | No |
| enforce_sso | boolean | No |
| sso_domain | string | No |
| allowed_email_domains | string[] | No |
| session_timeout_hours | number | No |
| max_sessions_per_user | number | No |
| invitation_expiry_days | number | No |
| default_role | enum | No |

At least one field must be provided.

**Response**: `200 OK` with updated settings

---

## Invitation Routes

### POST /api/invitations
Create bulk invitations for an organization.

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| invitations | array | Yes |
| invitations[].email | string | Yes |
| invitations[].role | string | Yes |
| invitations[].personal_message | string | No |

**Response**: `201 Created` with `{ invitations }` (tokens stripped)

### GET /api/invitations/[token]/accept
Get invitation details by token.

**Response**: `200 OK` with `{ invitation, organization }`

### POST /api/invitations/[token]/accept
Accept an invitation.

**Response**: `200 OK` with `{ membership }`

### POST /api/invitations/send-email
Internal endpoint to deliver invitation emails via Resend or Supabase Auth.

**Request Body** (validated by `sendEmailSchema`):
| Field | Type | Required |
|-------|------|----------|
| to | string (email) | Yes |
| token | string | Yes |
| role | string | Yes |
| orgName | string | Yes |
| personalMessage | string | No |
| appUrl | string (URL) | Yes |

---

## Onboarding Routes

### GET /api/onboarding/progress
Get onboarding step definitions and user progress.

**Response**: `200 OK` with `{ steps, progress }`

### POST /api/onboarding/progress
Mark an onboarding step as complete.

**Request Body** (validated by `onboardingProgressSchema`):
| Field | Type | Required | Default |
|-------|------|----------|---------|
| step_definition_id | string | Yes | — |
| status | enum | No | "completed" |

**Response**: `200 OK` with `{ progress }`

---

## Settings Routes

### GET /api/settings/drift-detection
Run drift detection against settings change requests.

### POST /api/settings/change-requests
Create a settings change request.

### POST /api/settings/change-requests/[id]/review
Approve or reject a settings change request.

---

## Field Management Routes

### GET /api/fields/access
Get field-level access permissions for the current user.

### GET /api/fields/bundles
Get field bundles for the current organization.

### GET /api/fields/usage
Get field usage analytics.

---

## Utility Routes

### GET /api/health
Health check endpoint.

**Response**: `200 OK` with `{ status: "ok", timestamp }`
