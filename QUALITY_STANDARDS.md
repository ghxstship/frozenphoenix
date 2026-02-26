# Quality Standards — Deployment Gate System

**Version:** 2026.1
**Last Updated:** 2026-02-26

---

## Overview

Every quality criterion in this project is a **deployment blocker**. No code ships to production unless all criteria are satisfied — either by automated checks, human attestations, or time-boxed waivers with audit trails.

This system is designed to:

1. **Enforce** — Block deployment on any failing criterion
2. **Adapt** — Accept new criteria as industry standards evolve
3. **Audit** — Maintain full traceability of what was checked, by whom, and when

---

## Architecture

```
quality-gate.config.ts                  ← Master config: thresholds, policies, extensions
src/config/quality-standards.ts         ← Types + helpers for criteria
src/config/quality-standards-registry.ts ← All 200+ criteria as typed, versioned records
scripts/quality-gate.ts                 ← Runner: evaluates checks, generates reports
.github/workflows/quality-gate.yml      ← CI: blocks merge/deploy on failure
.quality-gate/waivers.json              ← Active time-boxed waivers (with audit trail)
.quality-gate/attestations.json         ← Human attestation records
.quality-gate/report.json               ← Latest gate report (auto-generated)
```

---

## How It Works

### Every Criterion Is a Deploy Blocker

The `allCriteriaAreBlockers: true` flag in `quality-gate.config.ts` ensures that **all** criteria — regardless of original severity (CRITICAL, HIGH, MEDIUM, LOW, INFO) — block deployment until satisfied.

### Three Verification Methods

| Check Type | Verification | Example |
|---|---|---|
| **automated** | Runs in CI — pass/fail determined by tooling | TypeScript compilation, ESLint, npm audit |
| **semi-automated** | Tooling output + human attestation | axe-core scan reviewed by accessibility lead |
| **manual** | Human attestation with evidence | GDPR compliance review by legal |
| **continuous** | Post-deploy monitoring confirmation | Uptime SLA tracking, RUM metrics |

### Waiver System

When a criterion **cannot** be immediately satisfied (e.g., a new WCAG requirement needs design work), a waiver allows deployment to proceed temporarily:

- **Max duration:** 14 days (configurable)
- **Required:** Justification, approver (lead/security/legal role), remediation plan
- **Auto-expires:** Expired waivers automatically become blockers again
- **Audit trail:** All waivers are version-controlled in `.quality-gate/waivers.json`

#### Creating a Waiver

Add an entry to `.quality-gate/waivers.json`:

```json
{
  "criterionId": "§5-3-01",
  "justification": "New brand colors need contrast audit — design team scheduled for Sprint 42",
  "approver": "jane.doe",
  "approverRole": "lead",
  "grantedAt": "2026-02-26T00:00:00Z",
  "expiresAt": "2026-03-12T00:00:00Z",
  "remediationPlan": "Design team to provide AA-compliant palette by March 8, engineering implements by March 12"
}
```

### Attestation System

For manual and semi-automated checks, qualified team members attest that criteria are met:

```json
{
  "criterionId": "§7-1-01",
  "attestedBy": "john.smith",
  "role": "security",
  "attestedAt": "2026-02-25T14:30:00Z",
  "evidence": "Supabase uses PKCE flow for all OAuth providers. Verified in auth config.",
  "expiresAt": "2026-03-27T14:30:00Z"
}
```

Attestations expire after **30 days** (configurable per role) to prevent stale approvals.

---

## Running the Quality Gate

### Locally

```bash
# Full gate check (all criteria)
npm run quality-gate

# Automated checks only (fastest)
npm run quality-gate:automated

# Generate report without blocking
npm run quality-gate:report

# Check specific section (e.g., §7 Security)
npm run quality-gate:section -- 7

# Pre-deploy hook (runs automatically before deploy)
npm run predeploy
```

### In CI

The GitHub Actions workflow (`.github/workflows/quality-gate.yml`) runs on every PR to `main`, `staging`, and `production`:

```
lint-typecheck → security → build → test → migrations → quality-gate
```

The final `quality-gate` job evaluates all upstream jobs. **If any stage fails, the PR cannot be merged.**

---

## Adding New Criteria

As industry standards evolve (WCAG 3.0, new OWASP Top 10, etc.), add new entries to `src/config/quality-standards-registry.ts`:

```typescript
// Example: Adding a new WCAG 3.0 criterion
c('§5-3-10', 5, 3,
  'WCAG 3.0 Bronze contrast',
  'APCA contrast algorithm meets Bronze level',
  'accessibility', 'HIGH', 'automated',
  {
    ac: 'scripts/check-apca-contrast.ts',
    er: 'WCAG 3.0 Bronze',
    tg: ['a11y', 'visual', 'wcag3'],
  }
),
```

### Steps to Add New Criteria

1. **Add the criterion** to the appropriate section array in `quality-standards-registry.ts`
2. **Implement the check** (automated script, attestation requirement, or both)
3. **Update thresholds** in `quality-gate.config.ts` if the criterion has numeric targets
4. **Add CI step** in `.github/workflows/quality-gate.yml` if it needs a dedicated pipeline stage
5. **Document** the new criterion in this file's appendix

### Version Tracking

Every criterion has `addedInVersion` and `lastUpdatedVersion` fields. When adding criteria from a new standard:

```typescript
// Use a new version identifier
const V2: StandardsVersion = '2026.2';

c('§5-3-10', 5, 3, 'WCAG 3.0 Bronze contrast', '...', 'accessibility', 'HIGH', 'automated', {
  // ... opts
});
// Override addedInVersion manually if needed
```

---

## Criteria Summary

| Section | Category | Count | Topics |
|---|---|---|---|
| §1 | Database & Schema | 25 | 3NF, SSOT, migrations |
| §2 | Component Architecture | 25 | Atomic design, state management |
| §3 | White-Label | 21 | Theming, tenant isolation, copy |
| §4 | i18n & L10n | 28 | Translation, formatting, RTL |
| §5 | Accessibility | 31 | WCAG 2.2, keyboard, screen reader |
| §6 | Mobile Responsiveness | 33 | Responsive, performance, device |
| §7 | Security | 40 | Auth, validation, infrastructure, privacy |
| §8 | Compliance & Legal | 16 | GDPR, CCPA, SOC 2, legal docs |
| §9 | API Design | 21 | REST, documentation, errors |
| §10 | Performance | 34 | Frontend, backend, observability |
| §11 | Testing | 16 | Test pyramid, standards |
| §12 | Code Quality | 32 | Linting, TypeScript, architecture, docs |
| §13 | CI/CD | 16 | Pipeline, environments |
| §14 | Cross-Cutting | 22 | SEO, resilience, analytics |

**Total: ~360 criteria — all deployment blockers.**

---

## Extension Sources

The config tracks external standards for periodic review:

| Standard | URL | Auto-Merge |
|---|---|---|
| WCAG | https://www.w3.org/WAI/standards-guidelines/wcag/ | No |
| OWASP Top 10 | https://owasp.org/www-project-top-ten/ | No |
| Core Web Vitals | https://web.dev/vitals/ | No |

When these standards update, the team reviews changes and adds new criteria to the registry.

---

## Notification Channels

| Event | Channels |
|---|---|
| Gate failure | GitHub Status, Slack |
| Waiver expiry | GitHub Issue, Slack |
| New standard added | GitHub Issue |

---

## Philosophy

> "The quality of our deployment is the quality of our weakest criterion."

This system exists because:

- **Passive checklists decay.** Machine-enforced gates do not.
- **Severity tiers create ambiguity.** When everything blocks, there is no debate about priority.
- **Standards evolve.** The registry is versioned and extensible by design.
- **Accountability matters.** Waivers expire, attestations have names and dates.
- **Speed comes from confidence.** Teams ship faster when they trust the gate.
