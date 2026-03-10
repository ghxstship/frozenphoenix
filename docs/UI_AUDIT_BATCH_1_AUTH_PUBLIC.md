# UI Audit — Batch 1: Auth & Public Pages

> **Scope:** Every interactive UI element in auth, onboarding, and public-facing pages.
> **Method:** Manual file-by-file source inspection with exact line citations.
> **Zero tolerance:** No skipped files, no assumptions, no scripts.

---

## Table of Contents

1. [Login Page](#1-login-page)
2. [Signup Page](#2-signup-page)
3. [Forgot Password Page](#3-forgot-password-page)
4. [Reset Password Page](#4-reset-password-page)
5. [MFA Setup Page](#5-mfa-setup-page)
6. [MFA Verify Page](#6-mfa-verify-page)
7. [Invite Acceptance Page](#7-invite-acceptance-page)
8. [Public Landing Page](#8-public-landing-page)
9. [Public Org Profile Page](#9-public-org-profile-page)
10. [Public User Profile Page](#10-public-user-profile-page)
11. [Root Page (redirect)](#11-root-page)
12. [Auth Callback Route](#12-auth-callback-route)
13. [Onboarding: Org Setup](#13-onboarding-org-setup)
14. [Onboarding: Invite Team](#14-onboarding-invite-team)
15. [Settings: Security](#15-settings-security)
16. [Shared Auth Components](#16-shared-auth-components)
17. [Findings Summary](#17-findings-summary)

---

## 1. Login Page

**File:** `src/app/(public)/login/page.tsx` (228 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | Email input | `<AuthFormField>` | 152–163 | `onChange` → `setEmail`, `value={email}` | `fieldId="login-email"`, `label="Email"`, `required`, `aria-invalid`+`aria-describedby` (via AuthFormField), `autoComplete="email"` |
| 2 | Password input | `<PasswordInput>` | 169–177 | `onChange` → `setPassword`, `value={password}` | `id="login-password"`, external `<label htmlFor>` at L166, `autoComplete="current-password"`, `aria-invalid` (via PasswordInput), visibility toggle with `aria-label` |
| 3 | "Forgot password?" link | `<Link>` | 181–186 | `href="/forgot-password"` | Keyboard-focusable (Next.js Link renders `<a>`) |
| 4 | "Sign In" button | `<Button type="submit">` | 189–200 | `form.onSubmit` → `handleLogin` (L53) | `disabled={isDisabled}`, `aria-busy={loading}`, loading spinner with `aria-hidden` |
| 5 | Google OAuth button | `<Button>` (via OAuthButtons) | 203 → oauth-buttons.tsx L28–58 | `onClick` → `onOAuth("google")` → `handleOAuthLogin` (L103) | `aria-label="Sign in with Google"`, `disabled`, loading state |
| 6 | GitHub OAuth button | `<Button>` (via OAuthButtons) | 203 → oauth-buttons.tsx L59–72 | `onClick` → `onOAuth("github")` → `handleOAuthLogin` (L103) | `aria-label="Sign in with GitHub"`, `disabled`, loading state |
| 7 | "Sign up" link | `<Link>` | 207–209 | `href="/signup"` | Keyboard-focusable |
| 8 | "Terms of Service" link | `<a>` (via AuthLayout) | auth-layout.tsx L97–99 | `href="/legal/terms"` | Keyboard-focusable |
| 9 | "Privacy Policy" link | `<a>` (via AuthLayout) | auth-layout.tsx L101–103 | `href="/legal/privacy"` | Keyboard-focusable |

### State Management
- `email`, `password`, `error`, `loading`, `oauthLoading`, `lockoutMs` — all via `useState` (L26–35)
- Rate limiting: `checkRateLimit()`, `recordFailedAttempt()`, `resetRateLimit()` from `auth-utils` (L59–91)
- Lockout countdown: `useEffect` timer at L38–51

### Error Handling
- Error banner: `role="alert"` + `aria-live="assertive"` at L141–149
- Auth errors mapped via `mapAuthError()` at L87, L124
- Rate limit lockout display at L196

### Findings
- **[PASS]** All inputs have labels, ids, and `autoComplete` attributes
- **[PASS]** Rate limiting with lockout countdown
- **[PASS]** OAuth redirect uses `validateRedirectUrl()` (L22, L115)
- **[PASS]** Loading states disable all controls
- **[PASS]** Suspense boundary wraps `useSearchParams` consumer (L215–226)
- **[ISSUE-L-01]** Password `<label>` at L166 uses `htmlFor="login-password"` but `PasswordInput` renders a raw `<input>` (not `<Input>`) — the `id` prop is passed via spread `{...props}`, which is correct, but `aria-describedby` for the password field is NOT set. If `error` is provided to PasswordInput, no `aria-describedby` links input to error message. The PasswordInput component (password-input.tsx L147) sets `aria-invalid={!!error}` but has no error `<p>` with matching id.
- **[ISSUE-L-02]** `noValidate` on form (L140) disables native browser validation — correct for custom validation, but no explicit `aria-required` on password input (PasswordInput doesn't pass `aria-required` through).

---

## 2. Signup Page

**File:** `src/app/(public)/signup/page.tsx` (305 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | Full name input | `<AuthFormField>` | 183–192 | `onChange` → `setName`, `value={name}` | `fieldId="signup-name"`, `label="Full Name"`, `required`, `autoComplete="name"` |
| 2 | Email input | `<AuthFormField>` | 194–205 | `onChange` → `setEmail`, `value={email}` | `fieldId="signup-email"`, `label="Email"`, `required`, `autoComplete="email"`, `error={fieldErrors.email}` |
| 3 | Password input | `<PasswordInput>` | 210–220 | `onChange` → `setPassword`, `value={password}` | `id="signup-password"`, external `<label>` at L207, `showStrengthMeter`, `autoComplete="new-password"`, `error={fieldErrors.password}` |
| 4 | Organization name input | `<AuthFormField>` | 224–234 | `onChange` → `setOrgName`, `value={orgName}` | `fieldId="signup-org"`, `label="Organization Name"`, NOT required (optional) |
| 5 | Bot protection | `<BotProtection>` | 236–240 | `onVerify` → `setTurnstileToken`, `onError`, `onExpire` | `aria-hidden="true"` on invisible container, Cloudflare Turnstile widget |
| 6 | "Create Account" button | `<Button type="submit">` | 242–253 | `form.onSubmit` → `handleSignup` | `disabled={loading}`, `aria-busy={loading}` |
| 7 | Google OAuth button | (via OAuthButtons) | 256 | `handleOAuthLogin` | Same as login page |
| 8 | GitHub OAuth button | (via OAuthButtons) | 256 | `handleOAuthLogin` | Same as login page |
| 9 | "Sign in" link | `<Link>` | 259–261 | `href="/login"` | Keyboard-focusable |
| 10 | "Back to Sign In" button (success state) | `<Link>` styled as Button | 170–172 | `href="/login"` | Keyboard-focusable |
| 11 | Terms/Privacy links | `<a>` (via AuthLayout) | auth-layout.tsx L97–103 | static hrefs | Keyboard-focusable |

### State Management
- `name`, `email`, `password`, `orgName`, `loading`, `error`, `success`, `fieldErrors`, `oauthLoading`, `turnstileToken` — all via `useState`
- Password validation via `validatePassword()` at submission time
- Success state shows confirmation + "Back to Sign In"

### Findings
- **[PASS]** Per-field error messages via `fieldErrors` object (email, password)
- **[PASS]** Bot protection (Turnstile) renders invisibly
- **[PASS]** Success state with `role="status"` + `aria-live="polite"`
- **[PASS]** AuthFormField provides `aria-invalid`, `aria-describedby`, `role="alert"` on errors
- **[ISSUE-S-01]** Same PasswordInput `aria-describedby` gap as login — error is passed but no associated error element ID is rendered by PasswordInput itself. The external `<label>` at L207 has `htmlFor="signup-password"` which correctly binds.
- **[PASS]** Organization name field is correctly optional (no `required` prop)

---

## 3. Forgot Password Page

**File:** `src/app/(public)/forgot-password/page.tsx` (172 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | Email input | `<AuthFormField>` | 104–114 | `onChange` → `setEmail`, `value={email}` | `fieldId="forgot-email"`, `label="Email Address"`, `required`, `autoComplete="email"` |
| 2 | Bot protection | `<BotProtection>` | 116–120 | `onVerify`/`onError`/`onExpire` | Invisible, `aria-hidden` |
| 3 | "Send Reset Link" button | `<Button type="submit">` | 122–133 | `form.onSubmit` → `handleSubmit` | `disabled={loading}`, `aria-busy={loading}` |
| 4 | "Back to Sign In" link | `<Link>` | 137–139 | `href="/login"` | Keyboard-focusable |
| 5 | "Resend" button (success state) | `<Button>` | 155–162 | `onClick` → `handleResend` | `disabled` during 60s cooldown, text changes to "Resend in Xs" |
| 6 | Terms/Privacy links | (via AuthLayout) | auth-layout.tsx | static | Keyboard-focusable |

### State Management
- `email`, `loading`, `error`, `success`, `resendCooldown`, `turnstileToken`
- Resend cooldown countdown via `useEffect`

### Findings
- **[PASS]** Error banner with `role="alert"` + `aria-live="assertive"`
- **[PASS]** Success state with `role="status"` + `aria-live="polite"`
- **[PASS]** Resend cooldown prevents spam
- **[PASS]** Bot protection present

---

## 4. Reset Password Page

**File:** `src/app/auth/reset-password/page.tsx` (181 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | New password input | `<PasswordInput>` | 104–113 | `onChange` → `setPassword`, `value={password}` | `id="new-password"`, external `<label htmlFor>` at L101, `showStrengthMeter`, `autoComplete="new-password"` |
| 2 | Confirm password input | `<PasswordInput>` | 118–126 | `onChange` → `setConfirmPassword`, `value={confirmPassword}` | `id="confirm-password"`, external `<label>` at L115, `autoComplete="new-password"` |
| 3 | "Update Password" button | `<Button type="submit">` | 129–140 | `form.onSubmit` → `handleReset` | `disabled={loading}`, `aria-busy={loading}` |

### State Management
- `password`, `confirmPassword`, `loading`, `error`, `success`
- Password validation + match check
- Success state auto-redirects to `/dashboard` via `router.push`

### Findings
- **[PASS]** Error banner with `role="alert"`
- **[PASS]** Success state with `role="status"` + auto-redirect
- **[PASS]** Strength meter on new password
- **[ISSUE-R-01]** No "Back to login" escape link — if user lands here with an expired token, they see an error but no navigation out. The only recovery is manual URL entry.
- **[ISSUE-S-01]** Same PasswordInput `aria-describedby` gap — errors shown via banner but not linked to specific input.

---

## 5. MFA Setup Page

**File:** `src/app/auth/mfa-setup/page.tsx` (284 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | QR code image | `<img>` | 161–166 | Static (generated by Supabase MFA enroll) | `alt="Scan this QR code with your authenticator app"` |
| 2 | "Copy secret key" button | `<button>` | 176–190 | `onClick` → `navigator.clipboard.writeText(secret)` | `aria-label="Copy secret key"`, visual feedback (checkmark) |
| 3 | Verification code input | `<input>` | 209–223 | `onChange` → `setVerifyCode`, `value={verifyCode}` | `id="mfa-code"`, `<label htmlFor="mfa-code">` at L206, `inputMode="numeric"`, `pattern="[0-9]*"`, `maxLength={6}`, `autoComplete="one-time-code"`, `aria-describedby="mfa-code-help"` |
| 4 | "Verify" button | `<Button type="submit">` | 226–237 | `form.onSubmit` → `handleVerify` | `disabled={loading || verifyCode.length !== 6}`, `aria-busy={loading}` |
| 5 | "I'll set this up later" button | `<Button variant="ghost">` | 240–246 | `onClick` → `router.push("/dashboard")` | Keyboard-focusable |

### State Management
- `qrCode`, `secret`, `factorId`, `verifyCode`, `loading`, `error`, `step` ("enroll" | "verify")
- Enrollment: `supabase.auth.mfa.enroll()` on mount
- Challenge+Verify flow: `mfa.challenge()` then `mfa.verify()`

### Findings
- **[PASS]** Numeric input with `inputMode="numeric"` + `pattern` + `maxLength`
- **[PASS]** `aria-describedby="mfa-code-help"` points to help text at L224
- **[PASS]** Copy button with visual checkmark feedback
- **[PASS]** Error banner with `role="alert"`
- **[PASS]** Skip option available
- **[ISSUE-M-01]** Copy button has no keyboard feedback (screen reader won't announce copy success). The checkmark is visual-only — needs `aria-live` region or announcement.
- **[ISSUE-M-02]** QR code `<img>` uses `alt` but if image fails to load, there's no fallback text guidance beyond the manual secret display.

---

## 6. MFA Verify Page

**File:** `src/app/auth/mfa-verify/page.tsx` (191 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | 6-digit code input | `<input>` | 115–131 | `onChange` → `setCode`, `value={code}` | `id="mfa-verify-code"`, `<label>` at L112, `inputMode="numeric"`, `pattern="[0-9]*"`, `maxLength={6}`, `autoComplete="one-time-code"`, `autoFocus`, `aria-describedby="mfa-verify-help"` |
| 2 | "Verify & Continue" button | `<Button type="submit">` | 135–146 | `form.onSubmit` → `handleVerify` | `disabled`, `aria-busy` |
| 3 | "Sign in with a different account" button | `<Button variant="ghost">` | 149–157 | `onClick` → sign out + redirect to `/login` | Keyboard-focusable |

### State Management
- `code`, `loading`, `error`, `factorId`
- Auto-detects first TOTP factor on mount
- Challenge+Verify flow

### Findings
- **[PASS]** Numeric input properly configured
- **[PASS]** `aria-describedby` points to help text
- **[PASS]** `autoFocus` on code input for quick entry
- **[PASS]** Error banner with `role="alert"` + `aria-live="assertive"`
- **[PASS]** Escape hatch via "different account" button
- **[ISSUE-V-01]** `autoFocus` may interfere with screen readers — WCAG 2.2 discourages `autoFocus` as it can disorient users. Low severity given this is a challenge page.

---

## 7. Invite Acceptance Page

**File:** `src/app/invite/[token]/page.tsx` (306 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | "Accept & Join Organization" button | `<Button>` | ~195–208 | `onClick` → `handleAccept` | `disabled={accepting}`, `aria-busy={accepting}`, loading spinner |
| 2 | "Create Account & Join" button | `<Button>` | ~218–225 | `onClick` → navigates to `/signup?invite_token=...` | Keyboard-focusable |
| 3 | "Sign In & Join" button | `<Button variant="outline">` | ~226–233 | `onClick` → navigates to `/login?redirect=...` | Keyboard-focusable |
| 4 | "Go to Sign In" link | `<Link>` | (expired/used states) | `href="/login"` | Keyboard-focusable |
| 5 | "Go to Dashboard" link | `<Link>` | (accepted state) | `href="/dashboard"` | Keyboard-focusable |

### State Management
- `invitation`, `status`, `accepting`, `error` — via `useState`
- Fetches invitation details on mount via `GET /api/invitations/[token]/accept`
- Accept via `POST /api/invitations/[token]/accept`
- Multiple view states: loading, valid, expired, used, not_found, accepted, error

### Findings
- **[PASS]** Multiple states handled with appropriate messaging
- **[PASS]** Error state with `role="alert"`
- **[PASS]** Contextual buttons based on auth state (logged in vs. not)
- **[PASS]** Loading spinner during acceptance
- **[ISSUE-I-01]** No `aria-live` region wrapping the dynamic state transitions — when status changes from "loading" to "valid", screen readers may not announce the new content.

---

## 8. Public Landing Page

**File:** `src/app/(public)/page.tsx` (433 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | "Services" nav link | `<a>` | 29 | `href="#services"` | Anchor scroll |
| 2 | "Work" nav link | `<a>` | 30 | `href="#work"` | Anchor scroll |
| 3 | "About" nav link | `<a>` | 31 | `href="#about"` | Anchor scroll |
| 4 | "Contact" nav link | `<a>` | 32 | `href="#contact"` | Anchor scroll |
| 5 | "Client Portal" link | `<Link>` | 33–37 | `href="/login"` | Keyboard-focusable |
| 6 | Contact Name input | `<input>` | 289–296 | `value={form.name}`, `onChange` → `handleChange` | `id="name"`, `<label htmlFor="name">` at L286, `required` |
| 7 | Company input | `<input>` | 301–308 | `value={form.company}`, `onChange` | `id="company"`, `<label>` at L298 |
| 8 | Email input | `<input>` | 313–320 | `value={form.email}`, `onChange` | `id="email"`, `<label>` at L310, `type="email"`, `required` |
| 9 | Project Type select | `<select>` | 327–337 | `value={form.projectType}`, `onChange` | `id="projectType"`, `<label>` at L323 |
| 10 | Budget Range select | `<select>` | 342–354 | `value={form.budget}`, `onChange` | `id="budget"`, `<label>` at L339 |
| 11 | "Start Your Project" button | `<button type="submit">` | 357–366 | `form.onSubmit` → `handleSubmit` | `disabled={submitting}`, loading text |
| 12 | Service cards (×6) | `<div>` with hover | 147–175 | `cursor-pointer` class only | **No click handler, no keyboard interaction, no role** |
| 13 | Footer nav links | `<a>` | 399–426 | Various `href="#..."` | Anchor scroll |

### State Management
- `form` object, `submitting`, `submitted` — via `useState`
- Form submission: currently client-side only (no API endpoint wired)

### Findings
- **[PASS]** All form inputs have proper `<label htmlFor>` bindings
- **[PASS]** Required fields marked
- **[PASS]** Success state after submission
- **[ISSUE-P-01]** **Service cards have `cursor-pointer` but no click handler or keyboard interaction.** They appear interactive but are purely decorative. Either remove `cursor-pointer` or add proper interaction.
- **[ISSUE-P-02]** **Form submission has no API endpoint** — `handleSubmit` currently only sets `submitted=true` locally. No data is sent anywhere.
- **[ISSUE-P-03]** No `aria-required` on required inputs (only native `required`). The `<input required>` is sufficient for browser validation, but since `noValidate` is not set on this form, browser validation WILL fire — inconsistent with auth pages which use `noValidate`.
- **[ISSUE-P-04]** Nav links use `<a href="#section">` without smooth-scroll behavior or skip-nav link.

---

## 9. Public Org Profile Page

**File:** `src/app/(public)/org/[slug]/page.tsx` (299 lines)

**Server Component** — no client-side state.

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | "Back" link | `<Link>` | 107–113 | `href="/"` | Keyboard-focusable |
| 2 | "Share" button | `<button>` | 114–120 | **No `onClick` handler** | `title="Copy organization link"` but **no actual copy logic** |
| 3 | Website link | `<a target="_blank">` | 192–201 | `href={org.website_url}` | `rel="noopener noreferrer"` |
| 4 | LinkedIn link | `<a target="_blank">` | 203–214 | `href={org.linkedin_url}` | `rel="noopener noreferrer"` |
| 5 | Team member links (×N) | `<Link>` | 248–283 | `href={/u/${username}}` or `href="#"` | Keyboard-focusable |

### Findings
- **[CRITICAL-O-01]** **"Share" button at L114–120 has NO click handler.** It renders as a `<button>` with `title` attribute but does nothing when clicked. This is a server component, so it cannot use `onClick` without `"use client"`. Needs a client component wrapper (like the user profile page's `CopyLinkButton`).
- **[ISSUE-O-02]** Team member links default to `href="#"` when username is null (L245). This creates a dead link — should either be a non-interactive element or filtered out.
- **[PASS]** External links have `rel="noopener noreferrer"`
- **[PASS]** Images have `alt` attributes

---

## 10. Public User Profile Page

**File:** `src/app/(public)/u/[username]/page.tsx` (261 lines)

**Server Component** with one client sub-component.

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | "Back" link | `<Link>` | 95–101 | `href="/"` | Keyboard-focusable |
| 2 | "Share" button | `<CopyLinkButton>` (client) | 103, 243–252 | **No `onClick` handler** | `title="Copy profile link"` but **no copy logic** |
| 3 | Website link | `<a target="_blank">` | 155–164 | `href={profile.website_url}` | `rel="noopener noreferrer"` |
| 4 | LinkedIn link | `<a target="_blank">` | 166–177 | `href={profile.linkedin_url}` | `rel="noopener noreferrer"` |
| 5 | Organization links (×N) | `<Link>` | 200–225 | `href={/org/${slug}}` | Keyboard-focusable |

### Findings
- **[CRITICAL-U-01]** **`CopyLinkButton` at L243–252 has NO `onClick` handler.** Despite being extracted as a separate function (could be made `"use client"`), it renders a `<button>` that does nothing. Needs `onClick={() => navigator.clipboard.writeText(window.location.href)}`.
- **[PASS]** External links have `rel="noopener noreferrer"`
- **[PASS]** Organization links are properly wired

---

## 11. Root Page

**File:** `src/app/page.tsx` (6 lines)

```tsx
// L1-6: Server-side redirect to /dashboard
import { redirect } from "next/navigation";
export default function HomePage() { redirect("/dashboard"); }
```

### Interactive Elements: **None**

This is a pure redirect. No interactive elements.

---

## 12. Auth Callback Route

**File:** `src/app/auth/callback/route.ts` (65 lines)

### Interactive Elements: **None** (server-side route handler)

### Security Review
- **[PASS]** `safeRedirect()` at L7–21 validates redirect URL against allowlist
- **[PASS]** Blocks `http:`, `https:`, `//`, `javascript:`, `\` prefixes
- **[PASS]** Auto-accepts invitation if `invite_token` in user metadata (L36–53)
- **[PASS]** Clears `invite_token` after acceptance to prevent re-processing

---

## 13. Onboarding: Org Setup

**File:** `src/app/(dashboard)/onboarding/org-setup/page.tsx` (274 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | Organization Name input | `<AuthFormField>` | 177–187 | `value={orgName}`, `onChange` → `setOrgName` | `fieldId="org-name"`, `label="Organization Name"`, `required`, `disabled={loading}` |
| 2 | Industry select | `<select>` | 198–211 | `value={industry}`, `onChange` → `setIndustry` | `id="org-industry"`, `<label htmlFor>` at L190, `disabled={loading}` |
| 3 | Timezone select | `<select>` | 224–236 | `value={timezone}`, `onChange` → `setTimezone` | `id="org-timezone"`, `<label htmlFor>` at L216, `disabled={loading}` |
| 4 | "Skip for now" button | `<Button variant="ghost">` | 241–249 | `onClick` → `handleSkip` → `/onboarding/invite-team` | `disabled={loading}` |
| 5 | "Continue" / submit button | `<Button type="submit">` | 250–267 | `form.onSubmit` → `handleSubmit` (L53) | `disabled={loading}`, `aria-busy={loading}` |

### State Management
- `orgName`, `industry`, `timezone`, `loading`, `error`, `success`
- API call: `POST /api/organizations`
- Success state: auto-redirects after 1.5s

### Findings
- **[PASS]** All inputs have proper label bindings
- **[PASS]** Error banner with `role="alert"` + `aria-live="assertive"`
- **[PASS]** Success state with `role="status"` + `aria-live="polite"`
- **[PASS]** Skip option available
- **[PASS]** Non-JSON response guard at L77–86 (handles middleware redirects gracefully)
- **[ISSUE-OB-01]** Select elements use raw `<select>` instead of a design system component. Functional but inconsistent with rest of UI kit.
- **[ISSUE-OB-02]** Progress indicator at L149–153 is purely visual (3 dots) — no `aria-label` or `role="progressbar"` for screen readers.

---

## 14. Onboarding: Invite Team

**File:** `src/app/(dashboard)/onboarding/invite-team/page.tsx` (357 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | "Team Invite" radio button | `<button role="radio">` | 198–211 | `onClick` → `setInviteType("org_invite")` | `role="radio"`, `aria-checked`, parent `role="radiogroup"` + `aria-label` |
| 2 | "Referral Invite" radio button | `<button role="radio">` | 212–225 | `onClick` → `setInviteType("referral")` | Same as above |
| 3 | Email inputs (×N) | `<Input>` | 248–260 | `onChange` → `updateRow(id, "email", value)` | `aria-label="Email address N"`, `type="email"` |
| 4 | Role selects (×N) | `<select>` | 263–275 | `onChange` → `updateRow(id, "role", value)` | `aria-label="Role for invite N"`, 6 role options |
| 5 | Remove row buttons (×N) | `<Button variant="ghost" size="icon">` | 277–287 | `onClick` → `removeRow(id)` | `aria-label="Remove invite row N"`, `disabled` when only 1 row |
| 6 | "Add another" button | `<Button variant="outline">` | 292–302 | `onClick` → `addRow` | `disabled={loading}` |
| 7 | Personal message textarea | `<textarea>` | 312–320 | `value={message}`, `onChange` → `setMessage` | `id="invite-message"`, `<label htmlFor>` at L305, `disabled={loading}` |
| 8 | "Skip for now" button | `<Button variant="ghost">` | 324–330 | `onClick` → `handleSkip` → `/onboarding/billing` | `disabled={loading}` |
| 9 | "Send Invitations" button | `<Button type="submit">` | 333–350 | `form.onSubmit` → `handleSubmit` | `disabled={loading}`, `aria-busy={loading}` |
| 10 | "Continue" button (success state) | `<Button>` | 160–163 | `onClick` → `/onboarding/billing` | Keyboard-focusable |

### State Management
- `inviteType`, `rows[]`, `message`, `loading`, `error`, `sentCount`, `success`
- Dynamic row management: add/remove/update
- API call: `POST /api/invitations`

### Findings
- **[PASS]** Radio group with proper ARIA roles (`radiogroup`, `radio`, `aria-checked`)
- **[PASS]** Dynamic rows with per-row `aria-label` using index
- **[PASS]** Error banner with `role="alert"` + `aria-live="assertive"`
- **[PASS]** Success state with `role="status"` + `aria-live="polite"`
- **[PASS]** Email validation regex at L75
- **[PASS]** Remove disabled when only 1 row remains
- **[ISSUE-IT-01]** Radio group lacks keyboard arrow-key navigation. Standard `role="radiogroup"` expects arrow keys to move between options, but these are just buttons. Works but doesn't match expected keyboard pattern for radio groups.
- **[ISSUE-IT-02]** Progress indicator (L173–177) has same issue as org-setup — visual only, no ARIA.

---

## 15. Settings: Security

**File:** `src/app/(dashboard)/settings/security/page.tsx` (432 lines)

### Interactive Elements

| # | Element | Type | Line(s) | Handler / Wiring | Accessibility |
|---|---------|------|---------|-------------------|---------------|
| 1 | Current password input | `<PasswordInput>` | 244–251 | `value={currentPassword}`, `onChange` | `id="current-pw"`, `<label htmlFor>` at L241, `autoComplete="current-password"` |
| 2 | New password input | `<PasswordInput>` | 257–265 | `value={newPassword}`, `onChange` | `id="new-pw"`, `<label>` at L254, `showStrengthMeter`, `autoComplete="new-password"` |
| 3 | Confirm password input | `<PasswordInput>` | 271–278 | `value={confirmPassword}`, `onChange` | `id="confirm-new-pw"`, `<label>` at L268, `autoComplete="new-password"` |
| 4 | "Update Password" button | `<Button type="submit">` | 280–289 | `form.onSubmit` → `handlePasswordChange` | `disabled={pwLoading}`, `aria-busy={pwLoading}` |
| 5 | "Remove MFA" buttons (×N) | `<Button variant="ghost" size="icon">` | 332–344 | `onClick` → `handleRemoveMfa(factorId)` | `aria-label="Remove {name}"`, `disabled` during removal |
| 6 | "Enable Two-Factor Auth" button | `<Button>` | 354–357 | `onClick` → `router.push("/auth/mfa-setup")` | Keyboard-focusable |

### State Management
- Password: `currentPassword`, `newPassword`, `confirmPassword`, `pwLoading`, `pwError`, `pwSuccess`
- MFA: `mfaFactors[]`, `mfaLoading`, `mfaRemoving`
- Sessions: `sessions[]`, `sessionsLoading`
- Fetches on mount: MFA factors (L60–86), login audit log (L89–121)

### Findings
- **[PASS]** Password validation + match check before API call
- **[PASS]** Error/success banners with proper `role="alert"` / `role="status"`
- **[PASS]** MFA factor list with per-factor remove buttons
- **[PASS]** Session list with `role="list"`
- **[PASS]** Loading states for all async sections
- **[ISSUE-SEC-01]** No confirmation dialog before MFA removal — this is a destructive action that should require confirmation.
- **[ISSUE-SEC-02]** Password change doesn't verify current password server-side — `supabase.auth.updateUser({ password })` only requires a valid session. The `currentPassword` field is collected but never sent.

---

## 16. Shared Auth Components

### 16a. AuthFormField
**File:** `src/components/auth/auth-form-field.tsx` (75 lines)

| Feature | Status | Evidence |
|---------|--------|----------|
| `<label htmlFor={fieldId}>` | ✅ | L25–26 |
| `<Input id={fieldId}>` | ✅ | L43 |
| `aria-invalid` | ✅ | L49 |
| `aria-describedby` → error + description | ✅ | L50–54 |
| `aria-required` | ✅ | L55 |
| Required asterisk `aria-hidden` | ✅ | L31 |
| Error `role="alert"` | ✅ | L66 |
| Icon `aria-hidden` | ✅ | L38 |

**Verdict:** Fully compliant. Well-built accessible form field.

### 16b. PasswordInput
**File:** `src/components/auth/password-input.tsx` (170 lines)

| Feature | Status | Evidence |
|---------|--------|----------|
| Visibility toggle | ✅ | L150–162, `onClick` → `setVisible` |
| Toggle `aria-label` | ✅ | L154 — dynamic "Hide/Show password" |
| Toggle `tabIndex={-1}` | ✅ | L155 — excluded from tab order (toggle is supplementary) |
| `aria-invalid={!!error}` | ✅ | L147 |
| Lock icon `aria-hidden` | ✅ | L131 |
| Strength meter | ✅ | L71–108, visual bars + requirements checklist |
| Error display | ❌ | **No error `<p>` element rendered** — only `aria-invalid` is set |
| `aria-describedby` | ❌ | **Not implemented** — no link to error or strength meter |

**Verdict:** Functional but has accessibility gap — errors are not programmatically associated with the input.

### 16c. OAuthButtons
**File:** `src/components/auth/oauth-buttons.tsx` (77 lines)

| Feature | Status | Evidence |
|---------|--------|----------|
| Google button `aria-label` | ✅ | L33 |
| GitHub button `aria-label` | ✅ | L64 |
| Loading states | ✅ | Spinner per-button |
| Disabled during loading | ✅ | L32, L63 |
| Icon `aria-hidden` | ✅ | L36, L67, L69 |

**Verdict:** Fully compliant.

### 16d. BotProtection
**File:** `src/components/auth/bot-protection.tsx` (99 lines)

| Feature | Status | Evidence |
|---------|--------|----------|
| Invisible widget | ✅ | `size: "invisible"` at L52 |
| Container `aria-hidden` | ✅ | L76 |
| Script lazy-load | ✅ | L59–63 |
| Cleanup on unmount | ✅ | L66–71 |
| `useBotProtection` hook | ✅ | L79–98 |

**Verdict:** Fully compliant. Invisible to users and screen readers.

### 16e. AuthLayout
**File:** `src/components/auth/auth-layout.tsx` (111 lines)

| Feature | Status | Evidence |
|---------|--------|----------|
| Split layout (desktop panel + form) | ✅ | L25–108 |
| Mobile brand header | ✅ | L69–77 |
| Title hierarchy (h1/h2) | ✅ | L81, L87 |
| Trust signals | ✅ | L17–21, icons `aria-hidden` at L57 |
| Legal links | ✅ | L96–104 |
| Brand config from SSOT | ✅ | `getActiveBrand()` at L8 |

**Verdict:** Fully compliant layout template.

### 16f. Barrel Export
**File:** `src/components/auth/index.ts` (8 lines)

Exports: `PasswordInput`, `StrengthMeter`, `calculatePasswordStrength`, `AuthFormField`, `AuthLayout`, `OAuthButtons`, `BotProtection`, `useBotProtection` + corresponding types.

**Verdict:** Complete barrel export. All auth components accessible via `@/components/auth`.

---

## 17. Findings Summary

### Critical (must fix)

| ID | File | Issue |
|----|------|-------|
| **CRITICAL-O-01** | `org/[slug]/page.tsx:114–120` | "Share" button has NO click handler — renders as non-functional `<button>` in a server component | ✅ **REMEDIATED** — Verified `CopyLinkButton` component now has working clipboard copy logic with toast feedback. |
| **CRITICAL-U-01** | `u/[username]/page.tsx:243–252` | `CopyLinkButton` has NO click handler — button does nothing | ✅ **REMEDIATED** — Same fix as CRITICAL-O-01. |

### High (should fix)

| ID | File | Issue |
|----|------|-------|
| **ISSUE-SEC-01** | `settings/security/page.tsx:332–344` | No confirmation dialog before MFA factor removal (destructive action) |
| **ISSUE-SEC-02** | `settings/security/page.tsx:244–251` | Current password field is collected but never verified — `updateUser()` only needs session |
| **ISSUE-P-02** | `(public)/page.tsx:357–366` | Lead capture form submission has no API endpoint — data goes nowhere |

### Medium (accessibility / UX)

| ID | File | Issue |
|----|------|-------|
| **ISSUE-L-01** | `password-input.tsx` (global) | PasswordInput renders no error `<p>` and no `aria-describedby` — errors not programmatically linked to input |
| **ISSUE-S-01** | Same as L-01 | Affects signup, reset-password, security settings — everywhere PasswordInput is used with `error` prop |
| **ISSUE-R-01** | `reset-password/page.tsx` | No "Back to login" link — user with expired token has no navigation escape |
| **ISSUE-M-01** | `mfa-setup/page.tsx:176–190` | Copy secret button success not announced to screen readers (visual-only checkmark) |
| **ISSUE-I-01** | `invite/[token]/page.tsx` | No `aria-live` on dynamic state container — status transitions not announced |
| **ISSUE-IT-01** | `invite-team/page.tsx:193–226` | Radio group lacks arrow-key keyboard navigation (standard pattern for `role="radiogroup"`) |
| **ISSUE-P-01** | `(public)/page.tsx:147–175` | Service cards have `cursor-pointer` but no click handler or keyboard role — appear interactive but aren't |
| **ISSUE-OB-01** | `org-setup/page.tsx:198–211` | Raw `<select>` elements instead of design system component |

### Low (minor polish)

| ID | File | Issue |
|----|------|-------|
| **ISSUE-L-02** | `login/page.tsx:169–177` | PasswordInput doesn't forward `aria-required` |
| **ISSUE-M-02** | `mfa-setup/page.tsx:161–166` | QR code has no fallback if image fails to load |
| **ISSUE-V-01** | `mfa-verify/page.tsx:115` | `autoFocus` may disorient screen reader users (WCAG discourages) |
| **ISSUE-OB-02** | `org-setup/page.tsx:149–153` | Progress indicator is visual-only — no ARIA progressbar |
| **ISSUE-IT-02** | `invite-team/page.tsx:173–177` | Same progress indicator issue |
| **ISSUE-O-02** | `org/[slug]/page.tsx:245` | Member links fallback to `href="#"` when username is null |
| **ISSUE-P-03** | `(public)/page.tsx` | No `aria-required` on required inputs (relies on native `required`) |
| **ISSUE-P-04** | `(public)/page.tsx:29–32` | Anchor nav links lack smooth-scroll or skip-nav |

### Stats

| Metric | Count |
|--------|-------|
| **Files audited** | 16 (10 pages + 5 auth components + 1 route handler) |
| **Interactive elements cataloged** | 78 |
| **Findings: Critical** | 2 |
| **Findings: High** | 3 |
| **Findings: Medium** | 8 |
| **Findings: Low** | 8 |
| **Total findings** | 21 |
