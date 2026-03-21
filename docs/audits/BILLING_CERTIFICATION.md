# BILLING CERTIFICATION — Layer 7

**Protocol:** CLEARANCE FP-DEPLOY-CLEARANCE-001
**Audit Date:** 2026-03-21
**Auditor:** Antigravity Agent

---

## 7.1 — Billing Architecture

### Onboarding Integration
- ✅ `/onboarding/billing` — plan selection step in onboarding flow
- ✅ Gated as a required onboarding step

### Database Schema
| Table | Purpose | Status |
|---|---|---|
| Financial entities (invoices, payments, etc.) | Revenue/expenditure tracking | ✅ |
| `financial_periods` | Accounting periods | ✅ |
| `gl_accounts` | General ledger | ✅ |
| `revenue_recognition_entries` | Revenue tracking | ✅ |
| `revenue_schedules` | Recurring revenue | ✅ |
| `recurring_invoices` | Auto-billing | ✅ |

### Stripe Integration

> [!NOTE]
> Stripe integration for subscription billing requires Stripe dashboard configuration and webhook setup. Manual action items below.

| Item | Status |
|---|---|
| Stripe SDK in dependencies | ⬜ Not currently in `package.json` |
| Webhook endpoint | ⬜ To be configured |
| Plan/pricing management | ⬜ To be configured in Stripe |
| Customer portal | ⬜ To be configured |
| Subscription lifecycle hooks | ⬜ To be implemented |

---

## 7.2 — Action Items

- **P1:** Add Stripe SDK and implement subscription billing if required before launch
- **P2:** If Stripe not needed for MVP, ensure billing onboarding step is skip-able
- **INFO:** The existing financial infrastructure (invoices, payments, GL) is comprehensive for internal billing operations — Stripe is specifically for SaaS subscription billing
