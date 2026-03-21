# EMAIL & NOTIFICATIONS CERTIFICATION — Layer 5

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 5.1 — Email Architecture

### Provider
- **Resend API** — `resend` package in `dependencies`
- Config: `RESEND_API_KEY` + `RESEND_FROM_EMAIL` env vars (server-only)
- Implementation: `src/lib/email/send.ts`

### Email Module (`src/lib/email/`)
| File | Purpose |
|---|---|
| `send.ts` | Core email sending abstraction |
| `templates/` | Branded email templates |

### Transactional Email Types
| Email Type | Status |
|---|---|
| Team invitation | ✅ via invite flow |
| Auth emails (confirmation, reset) | ✅ via Supabase Auth (separate from Resend) |
| Notification emails | ✅ via notification system |

---

## 5.2 — In-App Notifications

### Infrastructure
| Component | Status |
|---|---|
| `notifications` table | ✅ In Supabase schema |
| `notification_preferences` table | ✅ Per-user preferences |
| API: `/api/entities/notifications` | ✅ CRUD via route registry |
| API: `/api/entities/notification-preferences` | ✅ CRUD via route registry |
| UI: `/notifications/[id]` | ✅ Dashboard route |
| Settings: `/settings/notifications` | ✅ With loading state |

### Notification Filtering
- ✅ Filter by `read` status (eq operator)
- ✅ Filter by `type` (eq operator)
- ✅ Filter by `user_id` (eq operator)

---

## 5.3 — Email Deliverability

> [!NOTE]
> DNS-level email configuration (SPF, DKIM, DMARC) requires domain registrar access. Manual action items below.

| Item | Status |
|---|---|
| SPF record | ⬜ Manual — configure for Resend |
| DKIM signing | ⬜ Manual — configure in Resend dashboard |
| DMARC policy | ⬜ Manual — configure DNS TXT record |
| From address verified | ⬜ Manual — verify in Resend |
| Reply-to configured | ⬜ Manual — set in Resend |
