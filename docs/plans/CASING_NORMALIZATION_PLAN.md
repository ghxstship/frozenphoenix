# Text Casing Normalization Plan

## Executive Summary

This document presents a comprehensive audit of text casing patterns across the FrozenPhoenix (Playbook) codebase and defines a normalization strategy to enforce consistent, enterprise-grade typography standards.

**Current state:** The codebase exhibits **five distinct casing anti-patterns** that degrade perceived product quality:

1. **Inline runtime transforms** — 20+ pages use ad-hoc `.toUpperCase()`, `.charAt(0).toUpperCase() + .slice(1)`, `replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())`, and CSS `capitalize`/`uppercase` to derive display labels at render time rather than consuming pre-defined labels from SSOT configs.
2. **Raw enum key rendering** — Status badges in `assets/page.tsx` render `v.replace("_", " ")` and `asset.condition.replace("_", " ")` instead of using `ASSET_CONDITION_CONFIG[v].label`. Vehicle statuses in the same file use the same pattern. Crew cards render `member.status` raw.
3. **CSS text-transform leakage** — `DataTable` header cells apply `uppercase tracking-wider` via Tailwind (`text-xs font-semibold text-muted-foreground uppercase tracking-wider`), making source-cased labels appear as ALL CAPS. Login page uses `text-xs uppercase` for the "Or continue with" separator. Proposal detail uses `uppercase tracking-wider` for section headings. Briefs and campaigns use `uppercase tracking-wide` for sub-section labels ("KPIs", "Retrospective", "KPI Progress", "Certifications").
4. **Inconsistent label casing in SSOT configs** — `domain-config.ts`, `production-config.ts`, and `ui-variants.ts` are predominantly Title Case but contain occasional Sentence case entries (e.g., "Pending approval" vs "Pending Approval", "In progress" vs "In Progress"). Fallback functions (`getStatusLabel`, `getPriorityLabel`, `getConditionLabel`) auto-generate Title Case from snake_case keys, masking missing explicit labels.
5. **Hardcoded inline labels** — Many pages contain hardcoded strings for page titles, button labels, empty states, and helper text rather than consuming from a centralized content registry.

**Risk level: Medium-High.** While the application is functionally correct, casing inconsistencies undermine brand authority, accessibility (screen readers announce ALL CAPS letter-by-letter unless `aria-label` overrides), and i18n readiness (runtime casing transforms break in Turkish, German, and other locale-sensitive languages).

**Proposed standard:** A two-tier casing system — **Title Case** for navigation, page titles, section headers, status/priority tags, and table headers; **Sentence case** for buttons, form labels, helper text, body copy, empty states, error messages, and descriptions — aligned with enterprise SaaS conventions (Salesforce, Atlassian, Linear).

---

## 1. Current State Risk Analysis

### 1.1 Inventory of Casing Patterns Found

| Pattern | Location(s) | Count | Risk |
|---------|-------------|-------|------|
| **Inline `.toUpperCase()`** | vault, gl-accounts, vendor-risk, access-reviews, procurement, live-ops/financials | 8 | High — locale-unsafe, bypasses SSOT |
| **Inline `.charAt(0).toUpperCase() + .slice(1)`** | briefs, audit-log, access-reviews, time-off | 5 | High — ad-hoc Title Case generation |
| **`replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())`** | ui-variants.ts fallbacks, field-renderers StatusField, readiness, roles | 6 | High — regex-based Title Case at render |
| **CSS `uppercase` class** | data-table headers, login separator, proposals/[id], briefs, campaigns, brand-guidelines, crew ("Certifications") | 10+ | Medium — visual-only but screen-reader hostile |
| **CSS `capitalize` class** | reports (status/stage bars), incidents (filter buttons), events (filter buttons) | 4+ | Medium — inconsistent with explicit labels |
| **Raw enum key rendering** | assets (condition, vehicle status), crew cards (member.status) | 5 | High — no human-readable label |
| **Title Case labels in SSOT** | navigation.ts, domain-config.ts, production-config.ts, ui-variants.ts | ~300 | Correct (target state) |
| **Sentence case labels in SSOT** | Scattered entries in domain-config.ts | ~15 | Medium — inconsistent with majority |
| **Hardcoded button labels** | All 48+ pages: "New Deal", "Add Asset", "New Task", "New Project", etc. | 48+ | Low (acceptable for now, blocks i18n later) |
| **Hardcoded empty state text** | deals, contracts, campaigns, data-table | 10+ | Low — Sentence case, mostly consistent |

### 1.2 Severity Assessment

- **P0 (Accessibility/i18n blocker):** CSS `uppercase` on data-table headers causes screen readers to spell out letters. Inline `.toUpperCase()` breaks Turkish İ/i dotted handling. **8 files affected.**
- **P1 (Brand inconsistency):** Raw enum keys rendered as user-facing labels (e.g., `"available"` instead of `"Available"`, `"in_transit"` rendered as `"in transit"` lowercase). **5 files affected.**
- **P2 (SSOT violation):** Inline casing transforms bypass the canonical label system, creating drift when labels are updated in config. **20+ files affected.**
- **P3 (Future i18n blocker):** Hardcoded English strings in 48+ pages prevent future localization. **Deferred — not a casing issue per se.**

---

## 2. Casing Standard Specification

### 2.1 Rules by Component Type

| Component Type | Casing Rule | Example | Rationale |
|---|---|---|---|
| **Page Titles** (`PageHeader title`) | Title Case | "Contract Management", "Crew & Labor Command" | Industry standard for primary navigation landmarks; establishes hierarchy |
| **Page Descriptions** (`PageHeader description`) | Sentence case | "Track and manage your sales pipeline" | Conversational, scans easily; subordinate to title |
| **Section Headers** (`CardTitle`, `h2`–`h3`) | Title Case | "Active Productions", "Vehicle Fleet", "Overdue Approvals" | Distinguishes sections from body content |
| **Sub-section Labels** (small caps pattern) | ALL CAPS (via token, not CSS) | "CERTIFICATIONS", "KPI PROGRESS", "RETROSPECTIVE" | Intentional design pattern for metadata labels; must use `aria-label` with Sentence case |
| **Navigation Items** | Title Case | "Sales & CRM", "Assets & Logistics" | Matches OS/browser navigation conventions |
| **Buttons — Primary Actions** | Sentence case | "New deal", "Add asset", "Send reset link" | Google Material, Atlassian, Apple HIG all recommend Sentence case for buttons |
| **Buttons — Filter/Toggle** | Sentence case first word + SSOT label | "All", "Active", label from config | Filter buttons should display the SSOT label directly |
| **Form Labels** | Sentence case | "Email", "Password", "Contract number" | WCAG best practice; avoids visual noise |
| **Form Placeholder Text** | Sentence case | "Search deals...", "you@company.com" | Subordinate helper text |
| **Status/Priority Badges** | Title Case | "In Progress", "Pending Review", "High" | Short labels benefit from Title Case scanning |
| **Table Headers** | Title Case (source) | "Project", "Status", "Due Date", "Material Cost" | Source labels are Title Case; CSS `uppercase` removed |
| **Table Empty States** | Sentence case | "No results found", "No data available" | Conversational error recovery |
| **Page Empty States** | Sentence case headline + Sentence case body | "No deals found" / "Try adjusting your search or filters" | Already consistent; formalize as rule |
| **Error Messages** | Sentence case | "Authentication service unavailable", "An unexpected error occurred" | Already consistent; formalize as rule |
| **Toast Notifications** | Sentence case | (Not yet implemented — define standard now) | Consistent with error messages |
| **Activity Feed Actions** | Sentence case (lowercase in context) | "created", "updated", "status changed" | Already correctly lowercase in activity-feed.tsx |
| **Metric Labels** (small stats) | Sentence case | "Channels", "Assets", "Approved", "KPIs" | Single-word labels are inherently consistent |
| **Warning/Alert Banners** | Sentence case | "Cannot be assigned — expired credentials" | Already consistent |
| **Legal/System Text** | Sentence case | "By signing in, you agree to our Terms of Service..." | Standard legal copy convention |
| **Branded Terms** | Preserve brand casing | "Playbook", "ATLVS", "COMPVSS" | Never transform programmatically |

### 2.2 Canonical Definition

**Title Case:** Capitalize the first letter of every major word. Do not capitalize articles (a, an, the), conjunctions (and, but, or, nor), or prepositions of ≤4 letters (in, on, at, to, for, with) unless they begin the string.

**Sentence case:** Capitalize only the first letter of the string and proper nouns.

**ALL CAPS (sub-section labels only):** Store as Sentence case or Title Case in source; render via design token `text-variant="overline"` that applies visual transform with appropriate `aria-label`.

---

## 3. Implementation Strategy

### 3.1 Phase 1 — SSOT Label Normalization (P0, Low Risk)

**Scope:** Normalize all `label` values in `domain-config.ts`, `production-config.ts`, and `ui-variants.ts` to Title Case.

**Files:**
- `src/config/domain-config.ts` — Audit all `_MAP` objects; normalize ~15 inconsistent labels
- `src/config/production-config.ts` — Audit all `_CONFIG` objects
- `src/config/ui-variants.ts` — Audit `STATUS_LABELS`, `PRIORITY_LABELS`, `CONDITION_LABELS`

**Verification regex (detect non-Title-Case labels):**
```regex
label:\s*["']([a-z][^"']*|[A-Z][a-z]+\s[a-z][^"']*)["']
```

**Breaking change risk:** Zero — labels are display-only strings.

### 3.2 Phase 2 — Eliminate Raw Enum Rendering (P1, Medium Risk)

**Scope:** Replace all inline `value.replace("_", " ")` patterns with explicit SSOT label lookups.

**Target files:**
- `src/app/(dashboard)/assets/page.tsx` — Lines 68, 94, 142, 286, 301 (condition and vehicle status badges)
- `src/app/(dashboard)/crew/page.tsx` — Line 268 (member.status raw rendering)
- Any other page using `v.replace("_", " ")` for user-facing labels

**Pattern to find:**
```regex
\{[a-zA-Z_]+\.replace\(["']_["'],\s*["'] ["']\)\}
```

**Fix:** Import the appropriate `_MAP` config and render `CONFIG[value].label`.

**Breaking change risk:** Low — purely display change, but must verify all enum values have corresponding labels.

### 3.3 Phase 3 — Eliminate Inline Casing Transforms (P0/P2, Medium Risk)

**Scope:** Remove all ad-hoc `.toUpperCase()`, `.charAt(0).toUpperCase()`, and regex-based Title Case transforms from page components.

**Sub-tasks:**

#### 3.3a — Replace ad-hoc `.toUpperCase()` calls
| File | Line | Current | Fix |
|---|---|---|---|
| `vault/page.tsx` | 79 | `doc.accessLevel.toUpperCase()` | Add `ACCESS_LEVEL_LABELS` to config |
| `gl-accounts/page.tsx` | 96 | `a.capex_opex.toUpperCase()` | Add `CAPEX_OPEX_LABELS` to config |
| `vendor-risk/page.tsx` | 88 | `s.risk_level.toUpperCase()` | Add `RISK_LEVEL_LABELS` to config |
| `access-reviews/page.tsx` | 157 | `review.riskLevel.toUpperCase()` | Use `RISK_LEVEL_LABELS` |
| `live-ops/financials/page.tsx` | 49 | `snapshot.otAlertLevel.toUpperCase()` | Add `ALERT_LEVEL_LABELS` to config |
| `procurement/page.tsx` | 200 | `po.id.toUpperCase()` | Acceptable — ID formatting, not a label |

#### 3.3b — Replace `.charAt(0).toUpperCase() + .slice(1)` patterns
| File | Line | Current | Fix |
|---|---|---|---|
| `briefs/page.tsx` | 151 | Brief type select option | Add type labels to SSOT config |
| `audit-log/page.tsx` | 165 | Event filter button | Add event type labels to SSOT config |
| `access-reviews/page.tsx` | 113 | Risk filter button | Use `RISK_LEVEL_LABELS` |
| `time-off/page.tsx` | 148 | Leave type display | Add leave type labels to config |

#### 3.3c — Replace fallback Title Case generators
| File | Line | Current | Fix |
|---|---|---|---|
| `ui-variants.ts` | 903, 910, 917 | `getStatusLabel`/`getPriorityLabel`/`getConditionLabel` fallbacks | Log warning in dev when fallback is hit; ensure all values have explicit labels |
| `field-renderers.tsx` | 94 | `StatusField` fallback | Same approach — consume `labelMap` exclusively |
| `readiness/page.tsx` | 69 | Filter button labels | Add explicit status labels |
| `roles/page.tsx` | 108 | Resource name display | Add `RESOURCE_LABELS` to RBAC config |

**Breaking change risk:** Medium — requires adding new label maps to config files; must ensure coverage for all enum values.

### 3.4 Phase 4 — Remove CSS `uppercase`/`capitalize` from Components (P0, Low Risk)

**Scope:** Remove CSS text-transform classes and replace with properly-cased source strings or design-token-controlled typography.

**Target changes:**

| File | Line | Current Class | Fix |
|---|---|---|---|
| `data-table.tsx` | 228 | `uppercase tracking-wider` | Remove `uppercase tracking-wider`; headers already Title Case in source |
| `login/page.tsx` | 165 | `text-xs uppercase` | Remove `uppercase`; change string to "Or continue with" (already Sentence case) — acceptable as-is with uppercase for visual dividers |
| `proposals/[id]/page.tsx` | 431, 441, 477 | `uppercase tracking-wider` | Create `<OverlineText>` component |
| `briefs/page.tsx` | 250, 264 | `uppercase tracking-wide` | Use `<OverlineText>` component |
| `campaigns/page.tsx` | 239 | `uppercase tracking-wide` | Use `<OverlineText>` component |
| `crew/page.tsx` | 278 | `uppercase tracking-wide` | Use `<OverlineText>` component |
| `brand-guidelines/page.tsx` | 223 | `uppercase tracking-wide` | Use `<OverlineText>` component |
| `reports/page.tsx` | 205, 233 | `capitalize` | Replace with SSOT label lookup |
| `incidents/page.tsx` | 119 | `capitalize` | Replace with SSOT label lookup |
| `events/page.tsx` | 131 | `capitalize` | Replace with SSOT label lookup |

**New component required:**
```tsx
// src/components/ui/overline-text.tsx
export function OverlineText({ children, as: Tag = "p", className }: {
  children: React.ReactNode;
  as?: "p" | "span" | "h3" | "h4";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "text-[10px] font-semibold tracking-wide text-muted-foreground",
        className
      )}
      // Stored as Title/Sentence case; visual transform via letter-spacing only
      // NO text-transform: uppercase
    >
      {children}
    </Tag>
  );
}
```

If the design intent requires visual ALL CAPS for overline labels, the `<OverlineText>` component should:
1. Accept `visualCaps?: boolean` prop
2. Apply `text-transform: uppercase` only when `visualCaps` is true
3. Always set `aria-label` to the original-case string to prevent screen-reader letter-spelling

**Breaking change risk:** Low — visual-only; may require snapshot test updates.

### 3.5 Phase 5 — Button Label Normalization (P3, Low Risk)

**Scope:** Normalize all hardcoded button labels to Sentence case.

**Current state:** Buttons are predominantly Sentence case already ("New Deal", "Add Asset", "New Task"). The standard recommends pure Sentence case: "New deal", "Add asset", "New task".

**Decision point:** This is a subjective design choice. Title Case buttons are common in enterprise SaaS. If the team prefers Title Case for primary action buttons, document this as an **intentional exception** to the Sentence case rule.

**Recommendation:** Keep buttons as Sentence case but with the object noun capitalized when it's a proper domain concept (e.g., "New Deal" is acceptable because "Deal" is a domain entity name). Document this as the **"Domain noun exception"**.

---

## 4. Enforcement Mechanisms

### 4.1 ESLint Custom Rule: `no-inline-casing-transform`

```
Rule: Disallow .toUpperCase(), .toLowerCase(), and regex-based casing transforms
      in JSX expression containers within component render functions.

Exceptions:
  - Search/filter logic (string comparison)
  - getInitials() utility
  - ID/code formatting (e.g., PO-{id.toUpperCase()})

Severity: warn (Phase 1), error (Phase 2+)
```

**Implementation approach:** Create `eslint-plugin-playbook` with a custom rule that detects `CallExpression` nodes for `toUpperCase`/`toLowerCase` inside `JSXExpressionContainer` ancestors.

### 4.2 ESLint Custom Rule: `no-css-text-transform`

```
Rule: Disallow className strings containing "uppercase" or "capitalize"
      in component files, except when used within the OverlineText component.

Severity: warn (Phase 1), error (Phase 2+)
```

### 4.3 Pre-Commit Hook

Add to `.husky/pre-commit`:
```bash
# Casing transform guard
grep -rn "\.toUpperCase()\|\.toLowerCase()\|text-transform" \
  --include="*.tsx" --include="*.ts" \
  src/app src/components \
  | grep -v "// casing-exempt" \
  | grep -v "search\|filter\|compare\|getInitials\|slugify" \
  && echo "ERROR: Inline casing transform detected. Use SSOT labels." && exit 1
```

### 4.4 CI Quality Gate Integration

Add to `src/config/quality-standards-registry.ts`:

```typescript
{
  id: "ui-casing-001",
  section: "§UI Typography",
  title: "No inline casing transforms in UI components",
  checkType: "automated",
  automatedCheck: "grep -rn '.toUpperCase()\\|.toLowerCase()' --include='*.tsx' src/app src/components | grep -v casing-exempt | wc -l | xargs test 0 -eq",
  severity: "error",
  tags: ["casing", "i18n", "a11y"],
},
{
  id: "ui-casing-002",
  section: "§UI Typography",
  title: "No CSS text-transform in component classNames",
  checkType: "automated",
  automatedCheck: "grep -rn 'uppercase\\|capitalize' --include='*.tsx' src/app src/components | grep -v OverlineText | grep -v casing-exempt | wc -l | xargs test 0 -eq",
  severity: "warning",
  tags: ["casing", "a11y"],
},
{
  id: "ui-casing-003",
  section: "§UI Typography",
  title: "All status/priority enum values have explicit SSOT labels",
  checkType: "semi-automated",
  automatedCheck: "npx ts-node scripts/verify-label-coverage.ts",
  severity: "error",
  tags: ["casing", "ssot"],
}
```

### 4.5 Label Coverage Verification Script

Create `scripts/verify-label-coverage.ts` that:
1. Imports all `_MAP` configs from `domain-config.ts`, `production-config.ts`, `ui-variants.ts`
2. Imports all TypeScript union types from `types/index.ts`
3. Verifies every enum value has a corresponding `.label` entry
4. Exits non-zero if any value lacks an explicit label (preventing reliance on fallback transforms)

---

## 5. Atomic Design System Alignment

### 5.1 Typography Component Hierarchy

| Component | Purpose | Casing Enforcement |
|---|---|---|
| `<PageHeader title>` | Page-level H1 | Title Case (validated by lint) |
| `<CardTitle>` | Section H2–H3 | Title Case (validated by lint) |
| `<OverlineText>` | Metadata sub-labels | Visual ALL CAPS via component; source Sentence case |
| `<Badge>` | Status/priority tags | Consumes SSOT `.label` — Title Case |
| `<Button>` | Actions | Sentence case (domain noun exception) |
| `<label>` | Form fields | Sentence case |
| `<StatusField>` | Data-table status cells | Consumes SSOT `labelMap` — Title Case |
| `<PriorityField>` | Priority indicators | Consumes internal `priorityConfig` — Title Case |

### 5.2 Inline Transformation Prohibition

**Rule:** No component may apply casing transformation at render time. All text displayed to users must come from one of:
1. An SSOT config `label` property
2. A hardcoded string literal in the correct case
3. A centralized content dictionary (future i18n phase)

**Exemptions:**
- `getInitials()` in `lib/utils.ts` — programmatic abbreviation, not a label
- Search/filter comparison logic — not user-facing
- ID formatting (e.g., PO codes) — marked with `// casing-exempt`

### 5.3 Typography Token Enforcement

Extend `src/config/design-tokens.ts` with a `TEXT_VARIANTS` token:

```typescript
export const TEXT_VARIANTS = {
  overline: {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const, // Applied via component, not CSS class
    ariaStrategy: "original-case", // Signals that aria-label must use source case
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "normal",
    textTransform: "none" as const,
  },
  caption: {
    fontSize: "12px",
    fontWeight: 400,
    letterSpacing: "normal",
    textTransform: "none" as const,
  },
} as const;
```

### 5.4 Centralized Content Dictionary (Future)

For full i18n readiness, introduce a string registry:

```
src/
  content/
    en.ts          ← Default English strings
    index.ts       ← Export current locale
```

**Not recommended for Phase 1.** The current hardcoded-string approach is acceptable for a single-language product. When i18n becomes a requirement, migrate all UI strings to this registry using `next-intl` or equivalent.

---

## 6. Rollout Plan

### Phase 1: Foundation (Week 1) — Zero-Risk
- [x] Normalize all SSOT config labels to Title Case
- [x] Create `<OverlineText>` component
- [x] Add `TEXT_VARIANTS` to design tokens
- [x] Add quality gate criteria to registry (§15-1-01, §15-1-02, §15-1-03)
- **Test:** TypeScript compile, ESLint clean, visual diff via Storybook/manual review

### Phase 2: Critical Fixes (Week 2) — Low-Risk
- [x] Replace all raw enum rendering with SSOT label lookups
- [x] Remove CSS `uppercase` from `DataTable` headers
- [x] Add `aria-label` overrides where CSS `uppercase` is intentionally retained (via `OverlineText` component)
- **Test:** Screen reader pass on table views, visual regression

### Phase 3: Transform Elimination (Week 3–4) — Medium-Risk
- [x] Add new label maps to config for vault, gl-accounts, vendor-risk, etc.
- [x] Replace all `.toUpperCase()` calls with SSOT lookups
- [x] Replace all `.charAt(0).toUpperCase()` patterns
- [x] Replace CSS `capitalize` with SSOT labels (27 instances across 22 files)
- [x] Migrate all `uppercase tracking-wide` instances to `<OverlineText>` (18+ files)
- **Test:** Full page-by-page visual audit, snapshot test updates

### Phase 4: Enforcement (Week 5) — Zero-Risk
- [ ] Implement ESLint custom rules
- [ ] Add pre-commit hook
- [x] Enable CI quality gate criteria (§15-1-01 through §15-1-03 in quality-standards-registry.ts)
- [ ] Create `scripts/verify-label-coverage.ts`
- **Test:** CI pipeline green with new gates

### Phase 5: Documentation & Governance (Week 5) — Zero-Risk
- [x] Add casing rules to component library documentation (this document)
- [x] Update `QUALITY_STANDARDS.md` with new criteria
- [ ] Create PR review checklist item for casing compliance

---

## 7. Edge Case Matrix

| Edge Case | Strategy | Example |
|---|---|---|
| **Dynamic user names** | Pass through unmodified | "Julian Clarkson" — never transform |
| **Dynamic org/company names** | Pass through unmodified | "Nike", "TechStart Inc" — never transform |
| **Acronyms** | Store as uppercase in SSOT label | "NDA", "SOW", "MSA", "GPS", "AV" |
| **Branded terminology** | Store exact brand casing in SSOT | "Playbook", "ATLVS", "COMPVSS" — never transform programmatically |
| **Mixed-case branded terms** | Store as-is in SSOT label | "GitHub" (not "Github"), "iPhone" |
| **Auto-generated system content** | Apply Sentence case at generation time, before storage | Notification: "Budget approval required for Nike Q3 activation" |
| **API-sourced data** | Display as-is for proper nouns (names, titles); apply SSOT label for enum values | Deal title: as-is; Deal stage: `DEAL_STAGE_MAP[stage].label` |
| **Admin-configurable labels** | Store as entered by admin; validate casing in admin UI (soft warning, not block) | Custom status: "Needs Client Sign-Off" — admin's casing is respected |
| **Pluralization** | Handle at content layer, never via string manipulation in render | "1 item" vs "3 items" — conditional string, not transform |
| **Compound status labels** | Pre-define in SSOT, never concatenate | "Pending Review" not `"Pending" + " " + "Review"` |
| **ID/code formatting** | Allow `.toUpperCase()` with `// casing-exempt` comment | `PO-{id.toUpperCase()}` is acceptable |
| **Locale-sensitive characters** | Never use `.toUpperCase()` for display; use `Intl.Collator` for sorting | Turkish "i" → "İ" (not "I") — `.toUpperCase()` is wrong |

---

## 8. Long-Term Governance Model

### 8.1 Review Gate
Every PR that adds user-facing text must pass:
1. **Automated:** ESLint `no-inline-casing-transform` and `no-css-text-transform` rules
2. **Automated:** Label coverage verification (all new enum values have SSOT labels)
3. **Manual:** Reviewer confirms casing matches the standard in §2.1

### 8.2 Quarterly Audit
Run `scripts/verify-label-coverage.ts` and grep-based scans quarterly to detect drift.

### 8.3 Design System Documentation
Casing rules live in the component library docs (Storybook or equivalent) alongside typography tokens. Every text-rendering component's documentation includes its casing rule.

### 8.4 Onboarding
New engineers receive a casing cheat sheet derived from §2.1. The key rule to internalize:

> **Never transform casing at render time. Consume labels from config. If a label doesn't exist, add it to the SSOT config — don't generate it inline.**

### 8.5 i18n Migration Path
When localization is required:
1. Extract all SSOT label strings into `content/en.ts` using `next-intl` keys
2. Casing rules become **per-locale** (some languages have no concept of Title Case)
3. The `<OverlineText>` component's `visualCaps` prop respects locale (disabled for scripts without case distinction)
4. All fallback Title Case generators are replaced with locale-aware formatters

---

## 9. QA Validation Checklist

- [x] All `_MAP`/`_CONFIG` label values are Title Case
- [x] No raw enum keys rendered as user-facing text
- [x] No `.toUpperCase()` in JSX render paths (except `// casing-ok`)
- [x] No `.charAt(0).toUpperCase() + .slice(1)` in render paths
- [x] No `replace(/_/g, " ").replace(/\b\w/g, ...)` in render paths
- [x] No CSS `uppercase` class in page files (structural UI elements exempt)
- [x] No CSS `capitalize` class in component files
- [x] `DataTable` headers render in Title Case without CSS transform
- [x] Screen reader announces table headers as words, not letters
- [x] All status badges display SSOT label, not raw enum value
- [x] All filter buttons display SSOT label, not transformed key
- [ ] Empty states use Sentence case headline + Sentence case body
- [ ] Error messages use Sentence case
- [x] Page titles use Title Case via `PageHeader`
- [x] Section headers use Title Case via `CardTitle`
- [x] `<OverlineText>` uses `aria-label` with source-case string when `visualCaps` is true

---

## 10. Snapshot Test Update Strategy

### Impact Assessment
- **Phase 1 (SSOT labels):** ~15 label changes → affects any snapshot rendering those badges
- **Phase 2 (raw enum fix):** ~5 files → limited snapshot impact
- **Phase 3 (transform elimination):** ~20 files → broad snapshot impact
- **Phase 4 (CSS removal):** Visual-only → Storybook/visual regression tests affected

### Strategy
1. **Before each phase:** Run `npx jest --updateSnapshot` after changes, review diff
2. **Visual regression:** If Chromatic/Percy is configured, review visual diffs per phase
3. **Batch updates:** Each phase is a single PR with snapshot updates included — never split snapshot updates across PRs
4. **Rollback plan:** Each phase is independently revertable via `git revert` on the phase PR

---

*Document generated from comprehensive codebase audit. All file references and line numbers are accurate as of the audit date. Re-run the audit grep patterns before implementation to account for any concurrent changes.*
