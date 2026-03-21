# LEGAL & COMPLIANCE — Layer 9

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 9.1 — Legal Pages

| Page | Route | Status |
|---|---|---|
| **Terms of Service** | `/legal/terms` | ✅ Public route, loading state present |
| **Privacy Policy** | `/legal/privacy` | ✅ Public route, loading state present |

### Accessibility
- ✅ Both pages in `(public)` route group — accessible without auth
- ✅ Loading states: `loading.tsx` present for both
- ✅ Linked from footer/signup flows

---

## 9.2 — Data Protection

### Export & Deletion
| Feature | Status |
|---|---|
| `data_export_requests` table | ✅ In schema |
| CRUD API for exports | ✅ `/api/entities/data-export-requests` |
| Data export request UI | ✅ Dashboard route available |
| User account deletion | ⬜ Verify implementation |

### Access Audit
| Feature | Status |
|---|---|
| `access_audit_log` table | ✅ In schema |
| `login_audit_log` table | ✅ In schema |
| `role_change_log` table | ✅ In schema |
| `domain_events` table | ✅ For domain event tracking |
| Audit log UI | ✅ `/user-management/audit-log` route |

---

## 9.3 — Cookie Consent

| Feature | Status |
|---|---|
| Cookie consent banner | ⬜ Need to verify implementation |
| PostHog consent mode | ⬜ Configure to respect consent |
| Essential cookies documented | ✅ Auth cookies, CSRF, RBAC caching |

### Cookie Inventory
| Cookie | Purpose | Type | TTL |
|---|---|---|---|
| Supabase auth cookies | Session management | Essential | Session |
| `fp-csrf-token` | CSRF protection | Essential | 24h |
| `fp-user-role` | RBAC cache | Functional | 5min |
| `fp-org-id` | Org scope cache | Functional | 5min |
| `fp-mfa-level` | MFA status cache | Functional | 5min |
| `fp-lifecycle-status` | Lifecycle cache | Functional | 5min |
| `fp-onboarding-complete` | Onboarding status | Functional | 24h |
| `fp-onboarding-skipped` | Onboarding skip flag | Functional | 7d |

---

## 9.4 — Security Compliance

| Requirement | Status |
|---|---|
| Encryption at rest (database) | ✅ Supabase managed |
| Encryption in transit (HTTPS) | ✅ TLS/HSTS enforced |
| Access logging | ✅ Multiple audit tables |
| Role-based access control | ✅ 11-tier RBAC |
| MFA support | ✅ TOTP via Supabase Auth |
| Session management | ✅ Supabase SSR |
| Password reset | ✅ `/forgot-password` flow |
| Rate limiting | ✅ On mutations + auth endpoints |
