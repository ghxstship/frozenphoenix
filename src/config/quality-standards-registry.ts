/**
 * Quality Standards Registry — Criterion Data
 *
 * All ~200+ criteria from prompt-audit.md §1–§16.
 * Every entry is a deploy blocker. Extensible by appending new entries.
 *
 * @version 2026.1
 */

import type { QualityCriterion } from './quality-standards';
import { c, engA, leadA, secA, a11yA, legalA, qaA } from './quality-standards';

// ═══════════════════════════════════════════════════════════════════════════
// §1 — DATABASE & SCHEMA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════

const s1: QualityCriterion[] = [
  // §1.1 — 3NF
  c('§1-1-01',1,1,'No multi-value columns','No arrays stored as strings, CSV in fields','database','CRITICAL','semi-automated',{at:engA,tg:['3nf','1nf']}),
  c('§1-1-02',1,1,'No repeating groups','No field-name-indexed columns (phone1,phone2)','database','HIGH','semi-automated',{at:engA,tg:['3nf','1nf']}),
  c('§1-1-03',1,1,'Composite key 2NF check','All composite key tables verified for partial dependency','database','CRITICAL','manual',{at:leadA,tg:['3nf','2nf']}),
  c('§1-1-04',1,1,'No transitive dependencies','All transitive deps identified and decomposed','database','CRITICAL','manual',{at:leadA,tg:['3nf']}),
  c('§1-1-05',1,1,'Denormalized fields documented','Documented with justification + sync strategy','database','HIGH','manual',{at:leadA,tg:['3nf','docs']}),
  c('§1-1-06',1,1,'JSONB schema validators','All JSONB cols have Zod, JSON Schema, or CHECK constraint','database','HIGH','semi-automated',{at:engA,tg:['3nf','validation']}),
  c('§1-1-07',1,1,'Junction table indexes','Both FK columns indexed on all junction tables','database','HIGH','semi-automated',{at:engA,tg:['3nf','perf']}),
  c('§1-1-08',1,1,'FK cascade policies','All FKs have ON DELETE/ON UPDATE policies','database','CRITICAL','semi-automated',{at:engA,tg:['3nf','integrity']}),
  c('§1-1-09',1,1,'Enum reference tables','Enums as reference tables or DB-native enums, not magic strings','database','MEDIUM','semi-automated',{at:engA,tg:['3nf']}),
  c('§1-1-10',1,1,'Audit columns present','created_at, updated_at, created_by, updated_by on mutable tables','database','HIGH','semi-automated',{at:engA,tg:['3nf','audit']}),
  c('§1-1-11',1,1,'Soft-delete pattern','deleted_at / is_active on all entity tables','database','HIGH','semi-automated',{at:engA,tg:['3nf','data-protection']}),
  // §1.2 — SSOT
  c('§1-2-01',1,2,'Entity-to-table mapping','Each domain entity → exactly one authoritative table','database','CRITICAL','manual',{at:leadA,tg:['ssot']}),
  c('§1-2-02',1,2,'No duplicate business logic','No duplication across triggers, app code, stored procs','database','CRITICAL','manual',{at:leadA,tg:['ssot']}),
  c('§1-2-03',1,2,'Config single-source','Config values in ONE location','database','HIGH','semi-automated',{at:engA,tg:['ssot','config']}),
  c('§1-2-04',1,2,'Feature flags centralized','Single table or service for feature flags','database','HIGH','manual',{at:leadA,tg:['ssot','feature-flags']}),
  c('§1-2-05',1,2,'Auth RBAC single authority','One authority; cached claims revalidated','database','CRITICAL','manual',{at:secA,tg:['ssot','security','rbac']}),
  c('§1-2-06',1,2,'API types from schema','Response shapes derived from DB schema types','database','HIGH','semi-automated',{at:engA,tg:['ssot','types']}),
  // §1.3 — Migrations
  c('§1-3-01',1,3,'Versioned migrations','All schema changes in versioned sequential files','database','CRITICAL','automated',{ac:'ls supabase/migrations/*.sql | sort -c',tg:['migrations']}),
  c('§1-3-02',1,3,'Idempotent reversible migrations','Migrations are idempotent and reversible','database','HIGH','manual',{at:engA,tg:['migrations']}),
  c('§1-3-03',1,3,'No raw SQL outside migrations','No schema changes outside migration system','database','CRITICAL','semi-automated',{at:engA,tg:['migrations']}),
  c('§1-3-04',1,3,'Seed data separated','Seed data separated from migrations','database','MEDIUM','manual',{at:engA,tg:['migrations']}),
  c('§1-3-05',1,3,'Migration CI gate','Migrations run against empty DB and production snapshot','database','HIGH','automated',{ac:'supabase db reset',tg:['migrations','ci']}),
  c('§1-3-06',1,3,'Non-breaking column additions','Nullable or with defaults','database','HIGH','semi-automated',{at:engA,tg:['migrations']}),
  c('§1-3-07',1,3,'Index strategy documented','Composite indexes justified, covering indexes for hot queries','database','MEDIUM','manual',{at:leadA,tg:['migrations','perf','docs']}),
  c('§1-3-08',1,3,'No N+1 query patterns','Eager loading configured for known relation traversals','database','HIGH','semi-automated',{at:engA,tg:['perf','queries']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §2 — COMPONENT-DRIVEN UI ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════

const s2: QualityCriterion[] = [
  // §2.1 — Atomic Design
  c('§2-1-01',2,1,'Page ≤ 150 lines','Extract organisms if page exceeds 150 lines','components','HIGH','automated',{ac:'scripts/check-file-lengths.ts --pages 150',tg:['atomic']}),
  c('§2-1-02',2,1,'Organism ≤ 300 lines','Extract molecules if organism exceeds 300 lines','components','HIGH','automated',{ac:'scripts/check-file-lengths.ts --organisms 300',tg:['atomic']}),
  c('§2-1-03',2,1,'Atoms are stateless','Purely presentational (props → JSX)','components','HIGH','semi-automated',{at:engA,tg:['atomic']}),
  c('§2-1-04',2,1,'Molecules compose atoms only','No direct API calls in molecules','components','MEDIUM','manual',{at:engA,tg:['atomic']}),
  c('§2-1-05',2,1,'Organisms delegate data-fetching','Local UI state OK, data-fetching via hooks/stores','components','HIGH','manual',{at:engA,tg:['atomic']}),
  c('§2-1-06',2,1,'Templates are layout-only','Layout slots only, no content awareness','components','MEDIUM','manual',{at:engA,tg:['atomic']}),
  c('§2-1-07',2,1,'Pages are compositions','Templates + organisms + route data — zero business logic','components','HIGH','manual',{at:engA,tg:['atomic']}),
  c('§2-1-08',2,1,'No inline styles','All styling via design system tokens','components','HIGH','automated',{ac:'grep -rn "style={{" src/',tg:['styling','tokens']}),
  c('§2-1-09',2,1,'No hardcoded visual values','No hardcoded colors/spacing/typography','components','HIGH','semi-automated',{at:engA,tg:['styling','tokens','white-label']}),
  c('§2-1-10',2,1,'Named exports only','displayName or named export, no anonymous defaults','components','MEDIUM','automated',{ac:'scripts/check-named-exports.ts',tg:['code-quality']}),
  c('§2-1-11',2,1,'Co-located tests','Tests and styles co-located with components','components','MEDIUM','semi-automated',{at:engA,tg:['testing']}),
  // §2.2 — Component API
  c('§2-2-01',2,2,'Typed props','TypeScript interfaces, no any/object','components','HIGH','automated',{ac:'npx tsc --noEmit',tg:['types']}),
  c('§2-2-02',2,2,'Explicit required/optional','No implicit defaults via undefined checks','components','MEDIUM','semi-automated',{at:engA,tg:['types']}),
  c('§2-2-03',2,2,'Discriminated unions','For complex prop shapes','components','MEDIUM','manual',{at:engA,tg:['types']}),
  c('§2-2-04',2,2,'Consistent callback naming','onAction, onActionComplete, onActionError','components','LOW','semi-automated',{at:engA,tg:['api-design']}),
  c('§2-2-05',2,2,'Loading/error/empty states','All components handle all three explicitly','components','HIGH','semi-automated',{at:engA,tg:['ux','resilience']}),
  c('§2-2-06',2,2,'Ref forwarding','Where DOM access needed downstream','components','LOW','manual',{at:engA,tg:['api-design']}),
  c('§2-2-07',2,2,'No deep prop drilling','Max 2 levels — use context/composition/state','components','HIGH','semi-automated',{at:engA,tg:['architecture']}),
  // §2.3 — State Management
  c('§2-3-01',2,3,'Single global state tool','Zustand only','components','HIGH','manual',{at:leadA,tg:['state']}),
  c('§2-3-02',2,3,'Server state via TanStack Query','Never in global store','components','HIGH','semi-automated',{at:engA,tg:['state']}),
  c('§2-3-03',2,3,'Form state via React Hook Form','Never in global store','components','HIGH','semi-automated',{at:engA,tg:['state','forms']}),
  c('§2-3-04',2,3,'URL state in URL params','Pagination, filters, sort in URL','components','MEDIUM','semi-automated',{at:engA,tg:['state','url']}),
  c('§2-3-05',2,3,'No state duplication','Derived values computed, not stored','components','HIGH','semi-automated',{at:engA,tg:['state','ssot']}),
  c('§2-3-06',2,3,'Optimistic updates','For all user-facing mutations','components','MEDIUM','manual',{at:engA,tg:['ux','state']}),
  c('§2-3-07',2,3,'Cache invalidation documented','Per entity strategy','components','HIGH','manual',{at:leadA,tg:['state','docs']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §3 — WHITE-LABEL READINESS
// ═══════════════════════════════════════════════════════════════════════════

const s3: QualityCriterion[] = [
  c('§3-1-01',3,1,'Theme-driven visuals','All visual properties from theme config','white-label','HIGH','semi-automated',{at:engA,tg:['theming']}),
  c('§3-1-02',3,1,'Complete token coverage','Colors, typography, spacing, radii, shadows, breakpoints','white-label','HIGH','manual',{at:engA,tg:['theming','tokens']}),
  c('§3-1-03',3,1,'Runtime theme injection','No build-time baking of brand assets','white-label','CRITICAL','manual',{at:leadA,tg:['theming','multi-tenant']}),
  c('§3-1-04',3,1,'CSS custom property transport','CSS vars as token transport','white-label','HIGH','semi-automated',{at:engA,tg:['theming']}),
  c('§3-1-05',3,1,'Dark mode as variant','Not a separate codebase','white-label','MEDIUM','manual',{at:engA,tg:['theming']}),
  c('§3-1-06',3,1,'Zero hardcoded brand refs','Component library is theme-agnostic','white-label','CRITICAL','semi-automated',{ac:'scripts/check-brand-leakage.ts',at:engA,tg:['theming','brand']}),
  c('§3-1-07',3,1,'Dynamic brand assets','Logo/favicon from tenant config','white-label','HIGH','semi-automated',{at:engA,tg:['theming','brand']}),
  c('§3-1-08',3,1,'Email/PDF use tokens','Same theme tokens in emails and PDFs','white-label','MEDIUM','manual',{at:engA,tg:['theming']}),
  c('§3-1-09',3,1,'White-label config schema','Documented with all overridable props','white-label','HIGH','manual',{at:leadA,tg:['docs']}),
  c('§3-2-01',3,2,'Tenant ID configurable','Subdomain, path, or header — configurable','white-label','CRITICAL','manual',{at:leadA,tg:['multi-tenant']}),
  c('§3-2-02',3,2,'SSR tenant resolution','Resolvable at edge before first paint','white-label','HIGH','manual',{at:engA,tg:['multi-tenant','ssr']}),
  c('§3-2-03',3,2,'Data isolation (RLS)','Row-level security documented','white-label','CRITICAL','manual',{at:secA,tg:['multi-tenant','security']}),
  c('§3-2-04',3,2,'Cost attribution per tenant','Shared infra costs attributed','white-label','LOW','manual',{at:leadA,tg:['multi-tenant','ops']}),
  c('§3-2-05',3,2,'Tenant feature flags','Per-tenant feature toggles','white-label','HIGH','manual',{at:engA,tg:['multi-tenant','feature-flags']}),
  c('§3-2-06',3,2,'No cross-tenant leakage','No leakage in logs, caches, errors, indexes','white-label','CRITICAL','manual',{at:secA,tg:['multi-tenant','security']}),
  c('§3-2-07',3,2,'Admin super-tenant','Cross-tenant visibility with audit log','white-label','HIGH','manual',{at:secA,tg:['multi-tenant','admin']}),
  c('§3-3-01',3,3,'No hardcoded strings','All strings in locale files','white-label','HIGH','semi-automated',{ac:'scripts/check-hardcoded-strings.ts',at:engA,tg:['i18n','copy']}),
  c('§3-3-02',3,3,'Tenant copy overrides','Tenant locale files merge over defaults','white-label','MEDIUM','manual',{at:engA,tg:['multi-tenant','i18n']}),
  c('§3-3-03',3,3,'Configurable legal copy','ToS/Privacy Policy tenant-configurable','white-label','HIGH','manual',{at:legalA,tg:['multi-tenant','legal']}),
  c('§3-3-04',3,3,'Branded transactional emails','Tenant branding and copy','white-label','MEDIUM','manual',{at:engA,tg:['multi-tenant','email']}),
  c('§3-3-05',3,3,'Configurable notification copy','Per-tenant notifications','white-label','MEDIUM','manual',{at:engA,tg:['multi-tenant']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §4 — i18n & L10n
// ═══════════════════════════════════════════════════════════════════════════

const s4: QualityCriterion[] = [
  c('§4-1-01',4,1,'i18n framework consistent','Used consistently across entire app','i18n','HIGH','semi-automated',{at:engA,tg:['i18n']}),
  c('§4-1-02',4,1,'Translation keys only','Zero raw strings in JSX','i18n','HIGH','semi-automated',{ac:'scripts/check-hardcoded-strings.ts',tg:['i18n']}),
  c('§4-1-03',4,1,'Interpolation for dynamic values','No string concatenation','i18n','MEDIUM','manual',{at:engA,tg:['i18n']}),
  c('§4-1-04',4,1,'Pluralization rules','Per locale, not just English singular/plural','i18n','MEDIUM','manual',{at:engA,tg:['i18n','l10n']}),
  c('§4-1-05',4,1,'Gender-aware translations','Where applicable','i18n','LOW','manual',{at:engA,tg:['i18n','l10n']}),
  c('§4-1-06',4,1,'Namespaced keys','Context/namespace separation','i18n','MEDIUM','manual',{at:engA,tg:['i18n']}),
  c('§4-1-07',4,1,'Consistent file format','JSON/YAML consistent','i18n','MEDIUM','manual',{at:engA,tg:['i18n']}),
  c('§4-1-08',4,1,'Fallback chain','tenant → base → default → key ID','i18n','HIGH','manual',{at:engA,tg:['i18n']}),
  c('§4-1-09',4,1,'Translation CI lint','No missing keys, no unused keys','i18n','HIGH','automated',{ac:'scripts/lint-translations.ts',tg:['i18n','ci']}),
  c('§4-1-10',4,1,'ICU MessageFormat','For complex messages','i18n','MEDIUM','manual',{at:engA,tg:['i18n']}),
  c('§4-2-01',4,2,'Intl.DateTimeFormat','Never manual date formatting','i18n','HIGH','semi-automated',{tg:['l10n']}),
  c('§4-2-02',4,2,'Intl.NumberFormat','Respects locale grouping/decimals','i18n','HIGH','semi-automated',{tg:['l10n']}),
  c('§4-2-03',4,2,'Locale-aware currency','Locale rules with explicit currency code','i18n','HIGH','manual',{at:engA,tg:['l10n']}),
  c('§4-2-04',4,2,'Locale-aware units','Percentage, unit, measurement','i18n','MEDIUM','manual',{at:engA,tg:['l10n']}),
  c('§4-2-05',4,2,'Phone number formatting','libphonenumber or equivalent','i18n','MEDIUM','manual',{at:engA,tg:['l10n']}),
  c('§4-2-06',4,2,'Country-adaptive addresses','Adapts to country conventions','i18n','LOW','manual',{at:engA,tg:['l10n']}),
  c('§4-2-07',4,2,'Configurable name order','given-family vs family-given','i18n','LOW','manual',{at:engA,tg:['l10n']}),
  c('§4-2-08',4,2,'Calendar system support','Gregorian, Hijri, etc.','i18n','LOW','manual',{at:engA,tg:['l10n']}),
  c('§4-2-09',4,2,'UTC storage, local display','Timestamps stored UTC, displayed in user TZ','i18n','CRITICAL','semi-automated',{at:engA,tg:['l10n','data']}),
  c('§4-2-10',4,2,'Relative time formatting','Intl.RelativeTimeFormat','i18n','MEDIUM','semi-automated',{tg:['l10n']}),
  c('§4-3-01',4,3,'Locale-driven direction','No hardcoded LTR','i18n','HIGH','semi-automated',{at:engA,tg:['rtl']}),
  c('§4-3-02',4,3,'CSS logical properties','margin-inline-start, not margin-left','i18n','HIGH','semi-automated',{ac:'scripts/check-logical-properties.ts',tg:['rtl']}),
  c('§4-3-03',4,3,'Flex/Grid auto-flip','Flips with dir=rtl','i18n','MEDIUM','manual',{at:engA,tg:['rtl']}),
  c('§4-3-04',4,3,'Directional icons flip','Arrows/progress flip in RTL','i18n','MEDIUM','manual',{at:engA,tg:['rtl']}),
  c('§4-3-05',4,3,'Logical text alignment','start/end, not left/right','i18n','HIGH','semi-automated',{ac:'scripts/check-text-alignment.ts',tg:['rtl']}),
  c('§4-3-06',4,3,'No RTL-breaking positioning','No absolute positioning that breaks','i18n','MEDIUM','manual',{at:engA,tg:['rtl']}),
  c('§4-3-07',4,3,'Bidi text handling','Proper Unicode markers','i18n','LOW','manual',{at:engA,tg:['rtl']}),
  c('§4-3-08',4,3,'RTL visual regression CI','Screenshots in CI','i18n','HIGH','automated',{ac:'playwright --project=rtl',tg:['rtl','ci','testing']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §5 — ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════

const s5: QualityCriterion[] = [
  c('§5-1-01',5,1,'Single h1, logical headings','One h1, no skipped levels','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 1.3.1',tg:['a11y','semantics']}),
  c('§5-1-02',5,1,'Landmark regions','main, nav, header, footer, aside, section','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 1.3.1',tg:['a11y','semantics']}),
  c('§5-1-03',5,1,'Native HTML preferred','Native interactive elements where possible','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 4.1.2',tg:['a11y']}),
  c('§5-1-04',5,1,'ARIA on custom elements','Appropriate roles, states, properties','accessibility','CRITICAL','semi-automated',{ac:'axe-core',at:a11yA,er:'WCAG 2.2 SC 4.1.2',tg:['a11y','aria']}),
  c('§5-1-05',5,1,'ARIA supplements, not replaces','Supplement only','accessibility','HIGH','manual',{at:a11yA,er:'WCAG 2.2 SC 4.1.2',tg:['a11y','aria']}),
  c('§5-1-06',5,1,'Skip navigation link','Present and functional','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 2.4.1',tg:['a11y','nav']}),
  c('§5-1-07',5,1,'Dynamic page title','Updates on route change','accessibility','MEDIUM','automated',{ac:'playwright',er:'WCAG 2.2 SC 2.4.2',tg:['a11y']}),
  c('§5-1-08',5,1,'Language attribute set','On html and different-language content','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 3.1.1',tg:['a11y','i18n']}),
  c('§5-2-01',5,2,'Keyboard-operable','All elements reachable via keyboard','accessibility','CRITICAL','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 2.1.1',tg:['a11y','keyboard']}),
  c('§5-2-02',5,2,'Logical focus order','No tabindex > 0','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 2.4.3',tg:['a11y','keyboard']}),
  c('§5-2-03',5,2,'Focus trapping in modals','Modals, drawers, dialogs','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 2.1.2',tg:['a11y','keyboard']}),
  c('§5-2-04',5,2,'Focus restoration','On modal/dialog close','accessibility','HIGH','semi-automated',{at:a11yA,tg:['a11y','keyboard']}),
  c('§5-2-05',5,2,'Visible focus indicators','Never outline:none without replacement','accessibility','CRITICAL','automated',{ac:'axe-core',er:'WCAG 2.2 SC 2.4.7',tg:['a11y','keyboard']}),
  c('§5-2-06',5,2,'Shortcuts documented','Non-conflicting with screen readers','accessibility','MEDIUM','manual',{at:a11yA,tg:['a11y','keyboard','docs']}),
  c('§5-2-07',5,2,'Roving tabindex','For composite widgets','accessibility','MEDIUM','manual',{at:a11yA,er:'WCAG 2.2 SC 2.1.1',tg:['a11y','keyboard']}),
  c('§5-2-08',5,2,'Escape closes overlays','Consistent behavior','accessibility','HIGH','semi-automated',{at:a11yA,tg:['a11y','keyboard']}),
  c('§5-3-01',5,3,'Color contrast AA','4.5:1 normal, 3:1 large, 3:1 UI','accessibility','CRITICAL','automated',{ac:'axe-core',er:'WCAG 2.2 SC 1.4.3',tg:['a11y','visual']}),
  c('§5-3-02',5,3,'Not color-only info','Paired with text, icon, or pattern','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 1.4.1',tg:['a11y','visual']}),
  c('§5-3-03',5,3,'Image alt text','Meaningful alt or alt="" for decorative','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 1.1.1',tg:['a11y','visual']}),
  c('§5-3-04',5,3,'Form labels','All inputs have associated label elements','accessibility','CRITICAL','automated',{ac:'axe-core',er:'WCAG 2.2 SC 1.3.1',tg:['a11y','forms']}),
  c('§5-3-05',5,3,'Descriptive error messages','Field-associated, announced','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 3.3.1',tg:['a11y','forms']}),
  c('§5-3-06',5,3,'Loading states announced','aria-live or role=status','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 4.1.3',tg:['a11y']}),
  c('§5-3-07',5,3,'prefers-reduced-motion','Animations respect preference','accessibility','HIGH','semi-automated',{er:'WCAG 2.2 SC 2.3.3',tg:['a11y','motion']}),
  c('§5-3-08',5,3,'Text resizable 200%','No content/functionality loss','accessibility','HIGH','manual',{at:a11yA,er:'WCAG 2.2 SC 1.4.4',tg:['a11y','visual']}),
  c('§5-3-09',5,3,'Touch targets 44px','Minimum 44x44px on mobile','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 2.5.8',tg:['a11y','mobile']}),
  c('§5-4-01',5,4,'aria-live for dynamic content','Changes announced','accessibility','HIGH','semi-automated',{at:a11yA,er:'WCAG 2.2 SC 4.1.3',tg:['a11y','screen-reader']}),
  c('§5-4-02',5,4,'Error summary pattern','Errors summarized and linked','accessibility','MEDIUM','semi-automated',{at:a11yA,tg:['a11y','forms']}),
  c('§5-4-03',5,4,'Accessible data tables','Proper th scope, caption, headers','accessibility','HIGH','automated',{ac:'axe-core',er:'WCAG 2.2 SC 1.3.1',tg:['a11y','tables']}),
  c('§5-4-04',5,4,'Complex widget instructions','Screen reader instructions','accessibility','MEDIUM','manual',{at:a11yA,tg:['a11y','screen-reader']}),
  c('§5-4-05',5,4,'Accessible SVG icons','role=img + title/aria-label','accessibility','HIGH','automated',{ac:'axe-core',tg:['a11y','icons']}),
  c('§5-4-06',5,4,'Automated a11y CI','axe-core in CI, score ≥ 95','accessibility','CRITICAL','automated',{ac:'playwright --project=a11y',th:{metric:'axe-score',min:95},tg:['a11y','ci']}),
  c('§5-4-07',5,4,'Manual screen reader testing','VoiceOver, NVDA, JAWS documented','accessibility','HIGH','manual',{at:a11yA,tg:['a11y','screen-reader','docs']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §6 — MOBILE RESPONSIVENESS
// ═══════════════════════════════════════════════════════════════════════════

const s6: QualityCriterion[] = [
  c('§6-1-01',6,1,'Mobile-first CSS','Base mobile, min-width enhanced','mobile','HIGH','semi-automated',{at:engA,tg:['responsive']}),
  c('§6-1-02',6,1,'Breakpoints in tokens','Defined in design tokens','mobile','HIGH','automated',{ac:'scripts/check-design-tokens.ts',tg:['responsive','tokens']}),
  c('§6-1-03',6,1,'No horizontal scroll 320-2560','Viewport range','mobile','HIGH','semi-automated',{at:qaA,tg:['responsive']}),
  c('§6-1-04',6,1,'Content without zoom','Accessible on mobile without zoom','mobile','HIGH','manual',{at:qaA,tg:['responsive','a11y']}),
  c('§6-1-05',6,1,'Touch targets ≥ 44px','With adequate spacing','mobile','HIGH','semi-automated',{at:qaA,er:'WCAG 2.2 SC 2.5.8',tg:['responsive','a11y']}),
  c('§6-1-06',6,1,'No hover-only interactions','Tap/click equivalents','mobile','HIGH','semi-automated',{at:qaA,tg:['responsive']}),
  c('§6-1-07',6,1,'No fixed-width containers','Responsive widths only','mobile','HIGH','semi-automated',{tg:['responsive']}),
  c('§6-1-08',6,1,'Viewport meta tag','width=device-width, initial-scale=1','mobile','CRITICAL','automated',{ac:'lighthouse',tg:['responsive']}),
  c('§6-1-09',6,1,'Container queries','Component-level responsiveness','mobile','LOW','manual',{at:engA,tg:['responsive']}),
  c('§6-2-01',6,2,'Mobile nav pattern','Collapses below md','mobile','HIGH','semi-automated',{at:qaA,tg:['responsive','nav']}),
  c('§6-2-02',6,2,'Bottom navigation','Primary actions thumb-zone','mobile','MEDIUM','manual',{at:engA,tg:['responsive','nav']}),
  c('§6-2-03',6,2,'Sidebar to drawer','Overlay/drawer on mobile','mobile','HIGH','semi-automated',{at:qaA,tg:['responsive','nav']}),
  c('§6-2-04',6,2,'Responsive data tables','Card layout or sticky column scroll','mobile','HIGH','semi-automated',{at:qaA,tg:['responsive','tables']}),
  c('§6-2-05',6,2,'Multi-column stacking','Appropriate stacking','mobile','HIGH','semi-automated',{at:qaA,tg:['responsive']}),
  c('§6-2-06',6,2,'Adaptive modals','Full-screen or bottom-sheet','mobile','MEDIUM','manual',{at:engA,tg:['responsive']}),
  c('§6-2-07',6,2,'Single-column forms','On mobile','mobile','MEDIUM','manual',{at:qaA,tg:['responsive','forms']}),
  c('§6-2-08',6,2,'Sticky elements minimal','Don\'t consume excessive viewport','mobile','MEDIUM','manual',{at:qaA,tg:['responsive']}),
  c('§6-3-01',6,3,'Responsive images','srcset/sizes or picture','mobile','HIGH','semi-automated',{tg:['responsive','perf']}),
  c('§6-3-02',6,3,'Critical CSS inlined','Above-the-fold','mobile','HIGH','automated',{ac:'lighthouse',tg:['perf']}),
  c('§6-3-03',6,3,'Font display swap','No invisible text','mobile','HIGH','automated',{ac:'lighthouse',tg:['perf','fonts']}),
  c('§6-3-04',6,3,'Lazy loading below fold','Images and heavy components','mobile','HIGH','semi-automated',{tg:['perf']}),
  c('§6-3-05',6,3,'Optimized touch handling','No 300ms delay, passive listeners','mobile','MEDIUM','manual',{at:engA,tg:['perf']}),
  c('§6-3-06',6,3,'Virtual scrolling','Lists > 50 items','mobile','MEDIUM','manual',{at:engA,tg:['perf']}),
  c('§6-3-07',6,3,'Service worker caching','Offline/poor-connectivity','mobile','MEDIUM','manual',{at:engA,tg:['perf','pwa']}),
  c('§6-3-08',6,3,'Lighthouse mobile ≥ 90','All four categories','mobile','HIGH','automated',{ac:'lighthouse --preset=mobile',th:{metric:'lighthouse-mobile',min:90},tg:['perf','ci']}),
  c('§6-4-01',6,4,'Safe area insets','Notched devices','mobile','MEDIUM','manual',{at:engA,tg:['responsive','device']}),
  c('§6-4-02',6,4,'PWA manifest','Icons, theme-color, standalone','mobile','HIGH','automated',{ac:'lighthouse',tg:['pwa']}),
  c('§6-4-03',6,4,'iOS meta tags','apple-mobile-web-app-capable etc.','mobile','MEDIUM','manual',{at:engA,tg:['device']}),
  c('§6-4-04',6,4,'Correct input types','tel, email, inputmode','mobile','HIGH','semi-automated',{at:engA,tg:['forms','ux']}),
  c('§6-4-05',6,4,'Autofill/autocomplete','Correctly configured','mobile','MEDIUM','semi-automated',{at:engA,tg:['forms','ux']}),
  c('§6-4-06',6,4,'No pinch-to-zoom breakage','No viewport manipulation','mobile','HIGH','automated',{ac:'lighthouse',er:'WCAG 2.2 SC 1.4.4',tg:['a11y','responsive']}),
  c('§6-4-07',6,4,'Orientation handling','Graceful changes','mobile','MEDIUM','manual',{at:qaA,tg:['responsive']}),
  c('§6-4-08',6,4,'Keyboard doesn\'t obscure input','Active field visible','mobile','HIGH','manual',{at:qaA,tg:['forms','ux']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §7 — SECURITY HARDENING
// ═══════════════════════════════════════════════════════════════════════════

const s7: QualityCriterion[] = [
  c('§7-1-01',7,1,'Industry-standard auth','OAuth 2.0 + PKCE or OIDC','security','CRITICAL','manual',{at:secA,er:'OWASP A07',tg:['auth']}),
  c('§7-1-02',7,1,'Strong password hashing','bcrypt ≥ 12, scrypt, or Argon2','security','CRITICAL','manual',{at:secA,tg:['auth']}),
  c('§7-1-03',7,1,'Short-lived JWTs','≤ 15 min access, httpOnly refresh','security','CRITICAL','manual',{at:secA,tg:['auth','tokens']}),
  c('§7-1-04',7,1,'Server-side sessions','For sensitive apps','security','HIGH','manual',{at:secA,tg:['auth','sessions']}),
  c('§7-1-05',7,1,'API-layer RBAC','Not just UI hiding','security','CRITICAL','semi-automated',{at:secA,tg:['auth','rbac']}),
  c('§7-1-06',7,1,'Per-request permission checks','Every API request','security','CRITICAL','semi-automated',{at:secA,tg:['auth','rbac']}),
  c('§7-1-07',7,1,'Auth rate limiting','Login, register, reset','security','HIGH','semi-automated',{at:secA,er:'OWASP A07',tg:['auth','rate-limiting']}),
  c('§7-1-08',7,1,'Account lockout','Progressive backoff','security','HIGH','manual',{at:secA,tg:['auth']}),
  c('§7-1-09',7,1,'MFA support','TOTP, WebAuthn, SMS','security','HIGH','manual',{at:secA,tg:['auth','mfa']}),
  c('§7-1-10',7,1,'Logout invalidation','Session + client tokens','security','HIGH','semi-automated',{at:secA,tg:['auth']}),
  c('§7-2-01',7,2,'Server-side validation','Client is UX only','security','CRITICAL','semi-automated',{at:secA,er:'OWASP A03',tg:['validation']}),
  c('§7-2-02',7,2,'Shared validation schemas','Zod shared client/server','security','HIGH','semi-automated',{at:engA,tg:['validation']}),
  c('§7-2-03',7,2,'SQL injection prevention','Parameterized queries only','security','CRITICAL','semi-automated',{at:secA,er:'OWASP A03',tg:['sql','injection']}),
  c('§7-2-04',7,2,'XSS prevention','Output encoding + CSP','security','CRITICAL','semi-automated',{at:secA,er:'OWASP A03',tg:['xss']}),
  c('§7-2-05',7,2,'CSRF protection','Anti-CSRF or SameSite cookies','security','CRITICAL','semi-automated',{at:secA,er:'OWASP A01',tg:['csrf']}),
  c('§7-2-06',7,2,'Path traversal prevention','Sanitized file paths','security','HIGH','semi-automated',{at:secA,tg:['injection']}),
  c('§7-2-07',7,2,'SSRF prevention','URL allowlist','security','HIGH','manual',{at:secA,tg:['ssrf']}),
  c('§7-2-08',7,2,'File upload validation','Magic bytes, size limits, virus scan','security','HIGH','manual',{at:secA,tg:['uploads']}),
  c('§7-2-09',7,2,'Safe deserialization','Schema validation required','security','HIGH','semi-automated',{at:secA,tg:['validation']}),
  c('§7-2-10',7,2,'GraphQL protection','Depth limit, complexity, no introspection','security','HIGH','semi-automated',{at:secA,tg:['graphql']}),
  c('§7-3-01',7,3,'HTTPS + HSTS','includeSubDomains, preload','security','CRITICAL','automated',{ac:'scripts/check-security-headers.ts',tg:['headers']}),
  c('§7-3-02',7,3,'Security headers','CSP, X-Content-Type, X-Frame, Referrer-Policy','security','CRITICAL','automated',{ac:'scripts/check-security-headers.ts',tg:['headers']}),
  c('§7-3-03',7,3,'Restrictive CORS','Explicit origin allowlist','security','HIGH','semi-automated',{at:secA,tg:['cors']}),
  c('§7-3-04',7,3,'Secrets in vault/env only','Never in source or client','security','CRITICAL','automated',{ac:'scripts/check-secrets-leak.ts',tg:['secrets']}),
  c('§7-3-05',7,3,'Secret rotation','On schedule and departures','security','HIGH','manual',{at:secA,tg:['secrets']}),
  c('§7-3-06',7,3,'Encrypted DB connections','TLS, rotated credentials','security','HIGH','manual',{at:secA,tg:['database']}),
  c('§7-3-07',7,3,'Least privilege','All service accounts and IAM','security','HIGH','manual',{at:secA,tg:['iam']}),
  c('§7-3-08',7,3,'Container scanning','Trivy/Snyk','security','HIGH','automated',{ac:'trivy image scan',tg:['containers','ci']}),
  c('§7-3-09',7,3,'Dependency audit','npm audit, no known CVEs','security','CRITICAL','automated',{ac:'npm audit --audit-level=high',tg:['deps','ci']}),
  c('§7-3-10',7,3,'Generic production errors','No stack traces or internal paths','security','HIGH','semi-automated',{at:secA,tg:['error-handling']}),
  c('§7-4-01',7,4,'PII encrypted at rest','AES-256 or equivalent','security','CRITICAL','manual',{at:secA,er:'GDPR Art. 32',tg:['privacy','encryption']}),
  c('§7-4-02',7,4,'PII masked in logs','Redacted or tokenized','security','CRITICAL','semi-automated',{at:secA,tg:['privacy','logging']}),
  c('§7-4-03',7,4,'Data retention policies','Auto-purge enforced','security','HIGH','manual',{at:legalA,er:'GDPR Art. 5',tg:['privacy']}),
  c('§7-4-04',7,4,'Data portability','User data export','security','HIGH','manual',{at:legalA,er:'GDPR Art. 20',tg:['privacy','gdpr']}),
  c('§7-4-05',7,4,'Right to erasure','Cascading deletion','security','HIGH','manual',{at:legalA,er:'GDPR Art. 17',tg:['privacy','gdpr']}),
  c('§7-4-06',7,4,'Cookie consent','Granular category controls','security','HIGH','manual',{at:legalA,tg:['privacy','consent']}),
  c('§7-4-07',7,4,'Privacy policy linked','Versioned ToS/Privacy','security','HIGH','manual',{at:legalA,tg:['legal']}),
  c('§7-4-08',7,4,'Third-party sharing documented','Documented and consented','security','HIGH','manual',{at:legalA,tg:['privacy']}),
  c('§7-4-09',7,4,'Audit log for sensitive data','Who accessed what, when','security','HIGH','manual',{at:secA,tg:['audit','privacy']}),
  c('§7-4-10',7,4,'Data classification labels','public/internal/confidential/restricted','security','MEDIUM','manual',{at:secA,tg:['data-governance']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §8 — COMPLIANCE & LEGAL
// ═══════════════════════════════════════════════════════════════════════════

const s8: QualityCriterion[] = [
  c('§8-1-01',8,1,'GDPR compliance','Verified if serving EU users','compliance','CRITICAL','manual',{at:legalA,er:'GDPR',tg:['gdpr','regulation']}),
  c('§8-1-02',8,1,'CCPA/CPRA compliance','Verified for California users','compliance','HIGH','manual',{at:legalA,er:'CCPA',tg:['ccpa','regulation']}),
  c('§8-1-03',8,1,'ADA/Section 508','US government/public-sector','compliance','HIGH','manual',{at:legalA,er:'Section 508',tg:['ada','regulation']}),
  c('§8-1-04',8,1,'SOC 2 Type II','Controls mapped for enterprise data','compliance','HIGH','manual',{at:secA,er:'SOC 2',tg:['soc2','regulation']}),
  c('§8-1-05',8,1,'PCI DSS compliance','Payment card data','compliance','CRITICAL','manual',{at:secA,er:'PCI DSS',tg:['pci','regulation']}),
  c('§8-1-06',8,1,'HIPAA compliance','Health data','compliance','CRITICAL','manual',{at:legalA,er:'HIPAA',tg:['hipaa','regulation']}),
  c('§8-1-07',8,1,'COPPA compliance','Age verification for minors','compliance','HIGH','manual',{at:legalA,er:'COPPA',tg:['coppa','regulation']}),
  c('§8-1-08',8,1,'Export control','International deployment compliance','compliance','MEDIUM','manual',{at:legalA,tg:['regulation']}),
  c('§8-2-01',8,2,'ToS versioned','Timestamped acceptance logged','compliance','HIGH','manual',{at:legalA,tg:['legal']}),
  c('§8-2-02',8,2,'Privacy Policy versioned','Covers all collection','compliance','HIGH','manual',{at:legalA,tg:['legal']}),
  c('§8-2-03',8,2,'Cookie Policy','Granular consent','compliance','HIGH','manual',{at:legalA,tg:['legal','consent']}),
  c('§8-2-04',8,2,'DPA template','For enterprise clients','compliance','MEDIUM','manual',{at:legalA,tg:['legal']}),
  c('§8-2-05',8,2,'Acceptable Use Policy','UGC platforms','compliance','MEDIUM','manual',{at:legalA,tg:['legal']}),
  c('§8-2-06',8,2,'Subprocessor list','Maintained and disclosed','compliance','HIGH','manual',{at:legalA,tg:['legal','gdpr']}),
  c('§8-2-07',8,2,'Breach notification','72-hour GDPR window documented','compliance','HIGH','manual',{at:secA,er:'GDPR Art. 33',tg:['security','legal']}),
  c('§8-2-08',8,2,'Data residency documented','Which data in which regions','compliance','HIGH','manual',{at:legalA,tg:['legal','data-governance']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §9 — API DESIGN
// ═══════════════════════════════════════════════════════════════════════════

const s9: QualityCriterion[] = [
  c('§9-1-01',9,1,'Consistent resource naming','Plural nouns, kebab-case','api','HIGH','semi-automated',{ac:'scripts/check-api-routes.ts',tg:['rest']}),
  c('§9-1-02',9,1,'Correct HTTP methods','GET/POST/PUT/PATCH/DELETE','api','HIGH','semi-automated',{at:engA,tg:['rest']}),
  c('§9-1-03',9,1,'Meaningful status codes','Consistent across endpoints','api','HIGH','semi-automated',{at:engA,tg:['rest']}),
  c('§9-1-04',9,1,'Consistent pagination','Cursor or offset based','api','HIGH','manual',{at:engA,tg:['rest','perf']}),
  c('§9-1-05',9,1,'Filtering and sorting','Via query params, documented','api','MEDIUM','manual',{at:engA,tg:['rest']}),
  c('§9-1-06',9,1,'API versioning strategy','/v1/ or header or content negotiation','api','HIGH','manual',{at:leadA,tg:['rest','versioning']}),
  c('§9-1-07',9,1,'Bulk operations','Where volume warrants','api','MEDIUM','manual',{at:engA,tg:['rest']}),
  c('§9-1-08',9,1,'HATEOAS / resource linking','For discoverability','api','LOW','manual',{at:engA,tg:['rest']}),
  c('§9-2-01',9,2,'OpenAPI 3.1 spec','Auto-generated, maintained','api','HIGH','automated',{ac:'scripts/validate-openapi.ts',tg:['docs']}),
  c('§9-2-02',9,2,'Endpoint documentation','Method, path, params, body, response, errors','api','HIGH','semi-automated',{at:engA,tg:['docs']}),
  c('§9-2-03',9,2,'API changelog','Breaking change callouts','api','HIGH','manual',{at:leadA,tg:['docs']}),
  c('§9-2-04',9,2,'Auto-generated SDK','From OpenAPI spec','api','MEDIUM','manual',{at:engA,tg:['docs','dx']}),
  c('§9-2-05',9,2,'Postman collection','Versioned','api','MEDIUM','manual',{at:engA,tg:['docs','dx']}),
  c('§9-2-06',9,2,'Rate limit docs','Limits per tier, retry-after','api','HIGH','manual',{at:engA,tg:['docs','rate-limiting']}),
  c('§9-2-07',9,2,'Webhook catalog','Payload schemas, retry policy','api','MEDIUM','manual',{at:engA,tg:['docs','webhooks']}),
  c('§9-3-01',9,3,'Consistent error envelope','{ error: { code, message, details, requestId } }','api','HIGH','semi-automated',{at:engA,tg:['error-handling']}),
  c('§9-3-02',9,3,'Machine-readable error codes','AUTH_TOKEN_EXPIRED etc.','api','HIGH','manual',{at:engA,tg:['error-handling']}),
  c('§9-3-03',9,3,'Field-level validation errors','{ field, message, rule }','api','HIGH','semi-automated',{at:engA,tg:['error-handling','validation']}),
  c('§9-3-04',9,3,'No sensitive data in errors','No SQL/stack traces in production','api','CRITICAL','semi-automated',{at:secA,tg:['error-handling','security']}),
  c('§9-3-05',9,3,'Request ID on every response','Correlation ID for traceability','api','HIGH','semi-automated',{at:engA,tg:['observability']}),
  c('§9-3-06',9,3,'Retry guidance','Retry-After header, backoff hint','api','MEDIUM','manual',{at:engA,tg:['error-handling','resilience']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §10 — PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════

const s10: QualityCriterion[] = [
  c('§10-1-01',10,1,'Lighthouse ≥ 90','Performance score mobile + desktop','performance','HIGH','automated',{ac:'lighthouse',th:{metric:'lighthouse-perf',min:90},tg:['web-vitals','ci']}),
  c('§10-1-02',10,1,'LCP < 2.5s','Largest Contentful Paint','performance','HIGH','automated',{ac:'lighthouse',th:{metric:'lcp',max:2500,unit:'ms'},er:'Core Web Vitals',tg:['web-vitals']}),
  c('§10-1-03',10,1,'INP < 200ms','Interaction to Next Paint','performance','HIGH','automated',{ac:'lighthouse',th:{metric:'inp',max:200,unit:'ms'},er:'Core Web Vitals',tg:['web-vitals']}),
  c('§10-1-04',10,1,'CLS < 0.1','Cumulative Layout Shift','performance','HIGH','automated',{ac:'lighthouse',th:{metric:'cls',max:0.1},er:'Core Web Vitals',tg:['web-vitals']}),
  c('§10-1-05',10,1,'TTFB < 600ms','Time to First Byte','performance','HIGH','automated',{ac:'lighthouse',th:{metric:'ttfb',max:600,unit:'ms'},tg:['web-vitals']}),
  c('§10-1-06',10,1,'Bundle size budget','Main < 200KB gz, routes < 50KB','performance','HIGH','automated',{ac:'scripts/check-bundle-size.ts',th:{metric:'bundle-main',max:200,unit:'KB'},tg:['bundle']}),
  c('§10-1-07',10,1,'Tree-shaking verified','No unused exports in prod','performance','HIGH','automated',{tg:['bundle']}),
  c('§10-1-08',10,1,'Route code splitting','Route boundaries + heavy components','performance','HIGH','semi-automated',{at:engA,tg:['bundle']}),
  c('§10-1-09',10,1,'Image optimization','WebP/AVIF, responsive, lazy','performance','HIGH','automated',{ac:'lighthouse',tg:['images']}),
  c('§10-1-10',10,1,'Font optimization','Subset, preload, swap','performance','HIGH','automated',{ac:'lighthouse',tg:['fonts']}),
  c('§10-1-11',10,1,'Critical CSS inlined','Non-critical deferred','performance','HIGH','automated',{ac:'lighthouse',tg:['css']}),
  c('§10-1-12',10,1,'No render-blocking','No blocking resources in head','performance','HIGH','automated',{ac:'lighthouse',tg:['loading']}),
  c('§10-1-13',10,1,'Preconnect/dns-prefetch','For third-party origins','performance','MEDIUM','semi-automated',{tg:['loading']}),
  c('§10-1-14',10,1,'CDN with cache headers','Immutable for hashed assets','performance','HIGH','semi-automated',{at:engA,tg:['caching']}),
  c('§10-2-01',10,2,'No slow queries','No query > 100ms normal load','performance','HIGH','semi-automated',{at:engA,th:{metric:'max-query-ms',max:100,unit:'ms'},tg:['database']}),
  c('§10-2-02',10,2,'N+1 detection','DataLoader or batch strategy','performance','HIGH','semi-automated',{at:engA,tg:['database']}),
  c('§10-2-03',10,2,'Connection pooling','Right-sized','performance','HIGH','manual',{at:engA,tg:['database']}),
  c('§10-2-04',10,2,'Hot-path caching','Redis/Memcached with TTL','performance','MEDIUM','manual',{at:engA,tg:['caching']}),
  c('§10-2-05',10,2,'Background jobs','For ops > 500ms','performance','HIGH','manual',{at:engA,tg:['async']}),
  c('§10-2-06',10,2,'API response budget','p50<100ms, p95<500ms, p99<1s','performance','HIGH','continuous',{th:{metric:'p95-response',max:500,unit:'ms'},tg:['monitoring']}),
  c('§10-2-07',10,2,'Pagination enforced','No unbounded queries','performance','HIGH','semi-automated',{at:engA,tg:['database']}),
  c('§10-2-08',10,2,'Streaming large payloads','Streaming responses','performance','MEDIUM','manual',{at:engA,tg:['api']}),
  c('§10-2-09',10,2,'DB-level pagination','LIMIT/OFFSET or cursor at DB','performance','HIGH','semi-automated',{at:engA,tg:['database']}),
  c('§10-2-10',10,2,'Explain plan reviewed','Indexes verified for hot queries','performance','HIGH','manual',{at:leadA,tg:['database']}),
  c('§10-3-01',10,3,'Structured JSON logging','timestamp, level, service, requestId','performance','HIGH','semi-automated',{at:engA,tg:['observability']}),
  c('§10-3-02',10,3,'Correct log levels','ERROR/WARN/INFO/DEBUG','performance','MEDIUM','manual',{at:engA,tg:['observability']}),
  c('§10-3-03',10,3,'No PII in logs','Masked or tokenized','performance','CRITICAL','semi-automated',{at:secA,tg:['observability','privacy']}),
  c('§10-3-04',10,3,'Distributed tracing','Trace ID propagated','performance','HIGH','manual',{at:engA,tg:['observability']}),
  c('§10-3-05',10,3,'RED metrics','Request rate, error rate, latency','performance','HIGH','manual',{at:engA,tg:['observability','monitoring']}),
  c('§10-3-06',10,3,'Alerting configured','Spike/degradation/exhaustion alerts','performance','HIGH','manual',{at:leadA,tg:['monitoring']}),
  c('§10-3-07',10,3,'Health check endpoints','/health, /health/ready, /health/live','performance','HIGH','automated',{ac:'curl /api/health',tg:['ops']}),
  c('§10-3-08',10,3,'Uptime monitoring','SLA tracking','performance','HIGH','continuous',{tg:['monitoring']}),
  c('§10-3-09',10,3,'Error tracking','Sentry/Bugsnag with source maps','performance','HIGH','manual',{at:engA,tg:['monitoring']}),
  c('§10-3-10',10,3,'Performance monitoring','RUM and synthetic','performance','HIGH','continuous',{tg:['monitoring']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §11 — TESTING
// ═══════════════════════════════════════════════════════════════════════════

const s11: QualityCriterion[] = [
  c('§11-1-01',11,1,'Unit coverage ≥ 80%','Business logic coverage','testing','HIGH','automated',{ac:'vitest --coverage',th:{metric:'unit-coverage',min:80,unit:'%'},tg:['unit-tests']}),
  c('§11-1-02',11,1,'Integration tests all endpoints','Happy path + error cases','testing','HIGH','automated',{ac:'vitest --project=integration',tg:['integration-tests']}),
  c('§11-1-03',11,1,'E2E critical flows','Auth, checkout, CRUD','testing','HIGH','automated',{ac:'playwright test',tg:['e2e-tests']}),
  c('§11-1-04',11,1,'Component tests','Organisms + complex molecules','testing','HIGH','automated',{ac:'vitest --project=components',tg:['component-tests']}),
  c('§11-1-05',11,1,'Visual regression tests','Template layouts','testing','HIGH','automated',{ac:'playwright --project=visual',tg:['visual-tests']}),
  c('§11-1-06',11,1,'Contract tests','Frontend ↔ Backend','testing','HIGH','automated',{tg:['contract-tests']}),
  c('§11-1-07',11,1,'Load/stress tests','User-facing endpoints, capacity baseline','testing','HIGH','semi-automated',{at:engA,tg:['load-tests']}),
  c('§11-1-08',11,1,'A11y tests in CI','axe-core integration','testing','CRITICAL','automated',{ac:'playwright --project=a11y',tg:['a11y','ci']}),
  c('§11-2-01',11,2,'AAA pattern','Arrange, Act, Assert','testing','MEDIUM','manual',{at:engA,tg:['test-quality']}),
  c('§11-2-02',11,2,'No test interdependencies','Each test isolated','testing','HIGH','automated',{tg:['test-quality']}),
  c('§11-2-03',11,2,'Test factories/fixtures','No hardcoded magic values','testing','MEDIUM','manual',{at:engA,tg:['test-quality']}),
  c('§11-2-04',11,2,'Minimal mocking','Prefer integration over mocking','testing','MEDIUM','manual',{at:engA,tg:['test-quality']}),
  c('§11-2-05',11,2,'Zero flaky tolerance','Fixed or quarantined immediately','testing','HIGH','automated',{tg:['test-quality','ci']}),
  c('§11-2-06',11,2,'CI fails on regressions','Test, coverage, lint, type, a11y failures','testing','CRITICAL','automated',{ac:'CI pipeline',tg:['ci']}),
  c('§11-2-07',11,2,'Tests on every PR','And main branch push','testing','HIGH','automated',{ac:'CI pipeline',tg:['ci']}),
  c('§11-2-08',11,2,'Snapshot tests reviewed','Not rubber-stamped','testing','MEDIUM','manual',{at:engA,tg:['test-quality']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §12 — CODE QUALITY & DX
// ═══════════════════════════════════════════════════════════════════════════

const s12: QualityCriterion[] = [
  c('§12-1-01',12,1,'ESLint strict','Recommended + @typescript-eslint/strict','code-quality','HIGH','automated',{ac:'eslint .',tg:['linting']}),
  c('§12-1-02',12,1,'Prettier configured','Project-wide .prettierrc','code-quality','MEDIUM','automated',{ac:'prettier --check .',tg:['formatting']}),
  c('§12-1-03',12,1,'Stylelint configured','CSS/SCSS linting','code-quality','MEDIUM','automated',{ac:'stylelint',tg:['formatting']}),
  c('§12-1-04',12,1,'Import ordering','External → internal → relative → styles → types','code-quality','MEDIUM','automated',{ac:'eslint --rule import/order',tg:['linting']}),
  c('§12-1-05',12,1,'No eslint-disable without justification','Comment required','code-quality','MEDIUM','semi-automated',{at:engA,tg:['linting']}),
  c('§12-1-06',12,1,'Husky + lint-staged','Pre-commit: lint, format, type-check','code-quality','HIGH','automated',{ac:'husky',tg:['ci','dx']}),
  c('§12-1-07',12,1,'.editorconfig committed','Cross-IDE consistency','code-quality','LOW','automated',{tg:['dx']}),
  c('§12-2-01',12,2,'strict: true','All strict flags enabled','code-quality','CRITICAL','automated',{ac:'npx tsc --noEmit',tg:['typescript']}),
  c('§12-2-02',12,2,'noUncheckedIndexedAccess','Enabled','code-quality','HIGH','automated',{ac:'npx tsc --noEmit',tg:['typescript']}),
  c('§12-2-03',12,2,'No any types','Use unknown + narrow','code-quality','HIGH','automated',{ac:'scripts/check-any-types.ts',tg:['typescript']}),
  c('§12-2-04',12,2,'No type assertions without justification','Prefer type guards','code-quality','MEDIUM','semi-automated',{at:engA,tg:['typescript']}),
  c('§12-2-05',12,2,'Correct utility types','Partial, Required, Pick, Omit, Record','code-quality','MEDIUM','manual',{at:engA,tg:['typescript']}),
  c('§12-2-06',12,2,'Discriminated unions','Not type:string + conditionals','code-quality','MEDIUM','manual',{at:engA,tg:['typescript']}),
  c('§12-2-07',12,2,'Branded types for IDs','UserId/OrderId distinct from string','code-quality','MEDIUM','manual',{at:engA,tg:['typescript']}),
  c('§12-2-08',12,2,'API types auto-generated','From OpenAPI or Prisma schema','code-quality','HIGH','semi-automated',{at:engA,tg:['typescript','types']}),
  c('§12-2-09',12,2,'No implicit any','In parameters or return types','code-quality','HIGH','automated',{ac:'npx tsc --noEmit',tg:['typescript']}),
  c('§12-3-01',12,3,'Clear layer separation','UI → Service → Data','code-quality','HIGH','manual',{at:leadA,tg:['architecture']}),
  c('§12-3-02',12,3,'Dependency injection','No hard-coupled instantiation','code-quality','MEDIUM','manual',{at:leadA,tg:['architecture']}),
  c('§12-3-03',12,3,'Repository pattern','Business logic never writes raw queries','code-quality','HIGH','manual',{at:leadA,tg:['architecture']}),
  c('§12-3-04',12,3,'Service/use-case pattern','Controllers are thin','code-quality','HIGH','manual',{at:leadA,tg:['architecture']}),
  c('§12-3-05',12,3,'Custom error classes','With codes, not thrown strings','code-quality','HIGH','semi-automated',{at:engA,tg:['error-handling']}),
  c('§12-3-06',12,3,'No circular dependencies','Verified by madge in CI','code-quality','HIGH','automated',{ac:'npx madge --circular src/',tg:['architecture','ci']}),
  c('§12-3-07',12,3,'Barrel exports consistent','Not excessive','code-quality','MEDIUM','manual',{at:engA,tg:['architecture']}),
  c('§12-3-08',12,3,'Feature-based directory','Not layer-based','code-quality','MEDIUM','manual',{at:leadA,tg:['architecture']}),
  c('§12-4-01',12,4,'README complete','Setup, architecture, deploy, env vars','code-quality','HIGH','manual',{at:leadA,tg:['docs']}),
  c('§12-4-02',12,4,'CONTRIBUTING.md','Branch strategy, PR process, standards','code-quality','MEDIUM','manual',{at:leadA,tg:['docs']}),
  c('§12-4-03',12,4,'CHANGELOG.md','Semantic versioning, conventional commits','code-quality','HIGH','manual',{at:leadA,tg:['docs']}),
  c('§12-4-04',12,4,'ADRs','Architecture Decision Records','code-quality','HIGH','manual',{at:leadA,tg:['docs']}),
  c('§12-4-05',12,4,'API docs auto-generated','Deployed','code-quality','HIGH','automated',{tg:['docs']}),
  c('§12-4-06',12,4,'Storybook for components','All shared UI components','code-quality','HIGH','manual',{at:engA,tg:['docs','dx']}),
  c('§12-4-07',12,4,'Runbook','Incident response + ops tasks','code-quality','HIGH','manual',{at:leadA,tg:['docs','ops']}),
  c('§12-4-08',12,4,'Env var documentation','Types, defaults, descriptions','code-quality','HIGH','manual',{at:engA,tg:['docs']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §13 — CI/CD & DEPLOYMENT
// ═══════════════════════════════════════════════════════════════════════════

const s13: QualityCriterion[] = [
  c('§13-1-01',13,1,'Pipeline stages','lint → type-check → test → build → security → deploy','ci-cd','CRITICAL','automated',{ac:'CI pipeline',tg:['ci']}),
  c('§13-1-02',13,1,'Reproducible build','Same commit → same artifact','ci-cd','HIGH','automated',{tg:['ci']}),
  c('§13-1-03',13,1,'Environment parity','Staging mirrors production','ci-cd','HIGH','manual',{at:leadA,tg:['ops']}),
  c('§13-1-04',13,1,'Blue/green or canary','No big-bang deployments','ci-cd','HIGH','manual',{at:leadA,tg:['deploy']}),
  c('§13-1-05',13,1,'Rollback < 5 min','Documented and tested','ci-cd','HIGH','manual',{at:leadA,tg:['deploy']}),
  c('§13-1-06',13,1,'Migration before deploy','Separate step','ci-cd','HIGH','automated',{tg:['deploy','migrations']}),
  c('§13-1-07',13,1,'Feature flags decouple deploy','Deploy ≠ release','ci-cd','HIGH','manual',{at:leadA,tg:['deploy','feature-flags']}),
  c('§13-1-08',13,1,'Production approval gate','Manual or automated quality gate','ci-cd','CRITICAL','automated',{ac:'quality-gate',tg:['deploy']}),
  c('§13-1-09',13,1,'Artifact versioning','Git SHA + semver','ci-cd','HIGH','automated',{tg:['deploy']}),
  c('§13-1-10',13,1,'Post-deploy smoke tests','Automatic','ci-cd','HIGH','automated',{ac:'scripts/smoke-test.ts',tg:['deploy','testing']}),
  c('§13-2-01',13,2,'Typed env vars','Validated at startup, fail-fast','ci-cd','HIGH','automated',{ac:'scripts/validate-env.ts',tg:['config']}),
  c('§13-2-02',13,2,'No env-specific branches','Use configuration only','ci-cd','HIGH','semi-automated',{at:engA,tg:['config']}),
  c('§13-2-03',13,2,'Secrets management','Vault or managed service in prod','ci-cd','CRITICAL','manual',{at:secA,tg:['secrets']}),
  c('§13-2-04',13,2,'Env var documentation','Every var documented','ci-cd','HIGH','manual',{at:engA,tg:['docs','config']}),
  c('§13-2-05',13,2,'Infrastructure as code','Terraform/Pulumi/CDK','ci-cd','HIGH','manual',{at:leadA,tg:['ops','iac']}),
  c('§13-2-06',13,2,'PR preview deployments','Vercel/Netlify or custom','ci-cd','HIGH','automated',{ac:'CI pipeline',tg:['deploy','dx']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §14 — CROSS-CUTTING CONCERNS
// ═══════════════════════════════════════════════════════════════════════════

const s14: QualityCriterion[] = [
  c('§14-1-01',14,1,'SSR/SSG for public pages','Server-rendered or static','cross-cutting','HIGH','semi-automated',{at:engA,tg:['seo']}),
  c('§14-1-02',14,1,'Meta tags complete','title, description, og:*, twitter:*','cross-cutting','HIGH','automated',{ac:'lighthouse',tg:['seo']}),
  c('§14-1-03',14,1,'Canonical URLs + hreflang','For multi-language','cross-cutting','HIGH','automated',{ac:'lighthouse',tg:['seo','i18n']}),
  c('§14-1-04',14,1,'Structured data','JSON-LD for relevant types','cross-cutting','MEDIUM','semi-automated',{tg:['seo']}),
  c('§14-1-05',14,1,'Sitemap.xml','Generated and submitted','cross-cutting','HIGH','automated',{tg:['seo']}),
  c('§14-1-06',14,1,'robots.txt','Correctly configured','cross-cutting','MEDIUM','automated',{tg:['seo']}),
  c('§14-1-07',14,1,'Core Web Vitals pass','In Google Search Console','cross-cutting','HIGH','continuous',{er:'Core Web Vitals',tg:['seo','perf']}),
  c('§14-1-08',14,1,'No JS-dependent indexed content','For search pages','cross-cutting','HIGH','semi-automated',{at:engA,tg:['seo']}),
  c('§14-2-01',14,2,'Error boundaries','Route, feature, widget levels','cross-cutting','HIGH','semi-automated',{at:engA,tg:['resilience']}),
  c('§14-2-02',14,2,'Graceful degradation','Widget failure ≠ page crash','cross-cutting','HIGH','semi-automated',{at:engA,tg:['resilience']}),
  c('§14-2-03',14,2,'Retry with backoff','Exponential backoff on transient failures','cross-cutting','HIGH','semi-automated',{at:engA,tg:['resilience']}),
  c('§14-2-04',14,2,'Circuit breaker','On external services','cross-cutting','HIGH','manual',{at:engA,tg:['resilience']}),
  c('§14-2-05',14,2,'Timeout on all HTTP','No infinite hangs','cross-cutting','HIGH','semi-automated',{at:engA,tg:['resilience']}),
  c('§14-2-06',14,2,'Fallback UI for async','loading → data | error | empty','cross-cutting','HIGH','semi-automated',{at:engA,tg:['ux','resilience']}),
  c('§14-2-07',14,2,'Offline detection','Graceful offline mode','cross-cutting','MEDIUM','manual',{at:engA,tg:['pwa','resilience']}),
  c('§14-3-01',14,3,'Analytics naming convention','entity_action pattern','cross-cutting','MEDIUM','manual',{at:engA,tg:['analytics']}),
  c('§14-3-02',14,3,'Typed event properties','Documented','cross-cutting','MEDIUM','manual',{at:engA,tg:['analytics']}),
  c('§14-3-03',14,3,'Analytics consent respected','No tracking before consent','cross-cutting','HIGH','semi-automated',{at:legalA,tg:['analytics','privacy']}),
  c('§14-3-04',14,3,'Analytics abstraction','Swap providers without code changes','cross-cutting','MEDIUM','manual',{at:engA,tg:['analytics']}),
  c('§14-3-05',14,3,'Server-side event tracking','Critical business events','cross-cutting','HIGH','manual',{at:engA,tg:['analytics']}),
  c('§14-3-06',14,3,'Funnel tracking','Key conversion flows','cross-cutting','MEDIUM','manual',{at:engA,tg:['analytics']}),
  c('§14-3-07',14,3,'A/B testing infra','Integrated with feature flags','cross-cutting','MEDIUM','manual',{at:engA,tg:['analytics','feature-flags']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// §15 — CASING NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

const s15: QualityCriterion[] = [
  c('§15-1-01',15,1,'No CSS capitalize/uppercase in pages','Page files must not use CSS text-transform (capitalize, uppercase) to derive display labels — use SSOT labels or OverlineText component','components','HIGH','automated',{ac:'grep -rn "className=\\"[^\\"]*capitalize\\|className=\\"[^\\"]*uppercase" src/app --include="*.tsx" | grep -v overline-text | wc -l | xargs test 0 -eq',tg:['casing','ssot','css']}),
  c('§15-1-02',15,1,'No inline runtime casing transforms','No .toUpperCase(), .charAt(0).toUpperCase()+.slice(1), or regex Title Case on domain labels — use SSOT label maps','components','HIGH','automated',{ac:'grep -rn "\\.toUpperCase()\\|\\.charAt(0)\\.toUpperCase()" src/app --include="*.tsx" | grep -v "// casing-ok" | wc -l | xargs test 0 -eq',tg:['casing','ssot','transforms']}),
  c('§15-1-03',15,1,'SSOT label coverage','All domain enum values rendered in UI must resolve through config label maps (domain-config, production-config, ui-variants) — no raw snake_case/camelCase keys displayed','components','MEDIUM','semi-automated',{at:engA,tg:['casing','ssot','labels']}),
];

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATION & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const allCriteria: ReadonlyArray<QualityCriterion> = [
  ...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...s7,
  ...s8, ...s9, ...s10, ...s11, ...s12, ...s13, ...s14, ...s15,
] as const;

export const criteriaBySection: ReadonlyMap<number, ReadonlyArray<QualityCriterion>> = new Map([
  [1, s1], [2, s2], [3, s3], [4, s4], [5, s5], [6, s6], [7, s7],
  [8, s8], [9, s9], [10, s10], [11, s11], [12, s12], [13, s13], [14, s14], [15, s15],
]);

export const criteriaByCategory: ReadonlyMap<string, ReadonlyArray<QualityCriterion>> = (() => {
  const map = new Map<string, QualityCriterion[]>();
  for (const criterion of allCriteria) {
    const existing = map.get(criterion.category) ?? [];
    existing.push(criterion);
    map.set(criterion.category, existing);
  }
  return map as ReadonlyMap<string, ReadonlyArray<QualityCriterion>>;
})();
