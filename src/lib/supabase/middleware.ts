import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";

// ─── Performance: Static constants hoisted out of request path ──────
const PUBLIC_EXACT_PATHS = new Set(["/", "/login", "/signup", "/forgot-password"]);
const PUBLIC_PREFIX_PATHS = [
    "/auth/",
    "/api/",
    "/_next/",
    "/invite/",
    "/u/",
    "/org/",
    "/legal/",
    "/portal/",
    "/sign/",
];
const AUTH_REDIRECT_PATHS = new Set(["/login", "/signup", "/forgot-password"]);
const BLOCKED_STATUSES = new Set(["suspended", "banned", "deactivated", "offboarded"]);
const COOKIE_TTL_SHORT = 300; // 5 minutes
const COOKIE_TTL_DAY = 86400; // 24 hours
const IS_PROD = process.env.NODE_ENV === "production";
const IS_DEV = process.env.NODE_ENV === "development";

// Pre-compute CSP once at module load (static per deployment)
const supabaseDomain = supabaseUrl
    ? (() => {
          try {
              return new URL(supabaseUrl).hostname;
          } catch {
              return "";
          }
      })()
    : "";
const CSP_DIRECTIVES = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://cdn.jsdelivr.net`,
    "style-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${supabaseUrl || ""} wss://${supabaseDomain} https://challenges.cloudflare.com https://accounts.google.com https://plc.directory https://bsky.social`,
    "img-src 'self' data: blob: https://*.googleusercontent.com https://cdn.bsky.app",
    "font-src 'self'",
    "frame-src https://challenges.cloudflare.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS: [string, string][] = [
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
    ["X-DNS-Prefetch-Control", "on"],
    ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
    ["Content-Security-Policy", CSP_DIRECTIVES],
];

function isPublicRoute(pathname: string): boolean {
    return (
        PUBLIC_EXACT_PATHS.has(pathname) ||
        PUBLIC_PREFIX_PATHS.some((prefix) => pathname.startsWith(prefix))
    );
}

function setCacheCookie(response: NextResponse, name: string, value: string, maxAge: number): void {
    response.cookies.set(name, value, {
        httpOnly: false, // Client JS must clear these on org-switch and MFA verify
        secure: IS_PROD,
        sameSite: "lax",
        path: "/",
        maxAge,
    });
}

export async function updateSession(request: NextRequest) {
    const supabaseResponse = NextResponse.next({ request });

    // If Supabase is not configured, skip auth entirely.
    if (!supabaseUrl || !supabaseAnonKey) {
        if (IS_PROD && !isPublicRoute(request.nextUrl.pathname)) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    let response = supabaseResponse;

    // Helper: creates a redirect response that carries over any session cookies
    // that Supabase's setAll callback wrote to `response`. Without this, token
    // refresh cookies are lost on redirect responses and the client ends up
    // with a stale/expired session.
    function redirectWithCookies(url: URL): NextResponse {
        const redirect = NextResponse.redirect(url);
        for (const cookie of response.cookies.getAll()) {
            redirect.cookies.set(cookie.name, cookie.value, {
                // Preserve the original cookie options by re-setting
                // with the same attributes the Supabase SSR adapter used.
                path: "/",
                httpOnly: true,
                secure: IS_PROD,
                sameSite: "lax",
            });
        }
        return redirect;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresh session if expired — this is the only mandatory network call
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isPublicPath = isPublicRoute(pathname);
    const isProtectedPath = !isPublicPath;

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return redirectWithCookies(url);
    }

    if (AUTH_REDIRECT_PATHS.has(pathname) && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return redirectWithCookies(url);
    }

    // ─── Performance: Cookie-first checks ─────────────────────────
    // Read cached values from short-lived cookies set on previous navigations.
    // When ALL cookies are fresh, we skip ALL DB queries — middleware becomes <5ms.
    if (user && isProtectedPath) {
        const cachedRole = request.cookies.get("fp-user-role")?.value;
        const cachedOrgId = request.cookies.get("fp-org-id")?.value;
        const cachedLifecycle = request.cookies.get("fp-lifecycle-status")?.value;
        const cachedMfa = request.cookies.get("fp-mfa-level")?.value;
        const onboardingComplete = request.cookies.get("fp-onboarding-complete")?.value === "1";
        const onboardingSkipped = request.cookies.get("fp-onboarding-skipped")?.value === "1";

        const allCookiesFresh = !!(cachedRole && cachedOrgId && cachedLifecycle && cachedMfa);

        if (allCookiesFresh) {
            // Fast path: enforce from cached values, zero DB queries
            if (BLOCKED_STATUSES.has(cachedLifecycle!)) {
                await supabase.auth.signOut();
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                url.searchParams.set("reason", "account_suspended");
                return redirectWithCookies(url);
            }

            if (cachedMfa === "needs_aal2" && !pathname.startsWith("/auth/mfa")) {
                const url = request.nextUrl.clone();
                url.pathname = "/auth/mfa-verify";
                return redirectWithCookies(url);
            }

            // Onboarding already checked (cookie present or skipped) — skip entirely
        } else {
            // Slow path: one parallelized batch of ALL checks (MFA + lifecycle + role/orgId + onboarding)
            const isMfaPage = pathname.startsWith("/auth/mfa");
            const isOnboardingPath = pathname.startsWith("/onboarding");
            const isSettingsPath = pathname.startsWith("/settings");
            const needsOnboardingCheck =
                !isOnboardingPath &&
                !isSettingsPath &&
                !onboardingSkipped &&
                !onboardingComplete &&
                !pathname.startsWith("/auth/") &&
                !pathname.startsWith("/api/");

            // Build all promises in a single batch — no sequential waterfalls
            const checkMfa = !isMfaPage
                ? supabase.auth.mfa
                      .getAuthenticatorAssuranceLevel()
                      .then(({ data }) => ({ type: "mfa" as const, data }))
                      .catch(() => ({ type: "mfa" as const, data: null }))
                : Promise.resolve({ type: "mfa" as const, data: null });

            const checkLifecycle = Promise.resolve(
                supabase.from("user_profiles").select("lifecycle_status").eq("id", user.id).single()
            )
                .then(({ data }) => ({ type: "lifecycle" as const, data }))
                .catch(() => ({ type: "lifecycle" as const, data: null }));

            // Single query for role + orgId (was 2 separate queries before)
            const checkRoleAndOrg = Promise.resolve(
                supabase
                    .from("org_memberships")
                    .select("role, organization_id")
                    .eq("user_id", user.id)
                    .eq("is_default_org", true)
                    .single()
            )
                .then(({ data }) => ({ type: "role_org" as const, data }))
                .catch(() => ({ type: "role_org" as const, data: null }));

            // Onboarding checks merged into same batch (was a separate sequential block)
            const checkOnboardingMemberships = needsOnboardingCheck
                ? Promise.resolve(
                      supabase
                          .from("org_memberships")
                          .select("id, role, organizations!inner(slug)")
                          .eq("user_id", user.id)
                          .eq("status", "active")
                  )
                      .then(({ data }) => ({ type: "onboard_memberships" as const, data }))
                      .catch(() => ({ type: "onboard_memberships" as const, data: null }))
                : Promise.resolve({ type: "onboard_memberships" as const, data: null });

            const checkGatedSteps = needsOnboardingCheck
                ? Promise.resolve(
                      supabase
                          .from("onboarding_step_definitions")
                          .select("id, step_key")
                          .eq("gate_access", true)
                  )
                      .then(({ data }) => ({ type: "gated_steps" as const, data }))
                      .catch(() => ({ type: "gated_steps" as const, data: null }))
                : Promise.resolve({ type: "gated_steps" as const, data: null });

            const [
                mfaResult,
                lifecycleResult,
                roleOrgResult,
                onboardMemberships,
                gatedStepsResult,
            ] = await Promise.all([
                checkMfa,
                checkLifecycle,
                checkRoleAndOrg,
                checkOnboardingMemberships,
                checkGatedSteps,
            ]);

            // ─── Enforce MFA ───
            if (
                mfaResult.data &&
                "nextLevel" in mfaResult.data &&
                mfaResult.data.nextLevel === "aal2" &&
                mfaResult.data.currentLevel === "aal1"
            ) {
                // Cache for fast path on subsequent requests
                setCacheCookie(response, "fp-mfa-level", "needs_aal2", COOKIE_TTL_SHORT);
                const url = request.nextUrl.clone();
                url.pathname = "/auth/mfa-verify";
                return redirectWithCookies(url);
            }
            // Cache MFA as OK
            setCacheCookie(response, "fp-mfa-level", "ok", COOKIE_TTL_SHORT);

            // ─── Enforce lifecycle ───
            const lifecycleStatus = lifecycleResult.data?.lifecycle_status ?? "active";
            setCacheCookie(response, "fp-lifecycle-status", lifecycleStatus, COOKIE_TTL_SHORT);

            if (BLOCKED_STATUSES.has(lifecycleStatus)) {
                await supabase.auth.signOut();
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                url.searchParams.set("reason", "account_suspended");
                return redirectWithCookies(url);
            }

            // ─── Cache role + orgId ───
            const resolvedRole = (roleOrgResult.data?.role as string) ?? "member";
            const resolvedOrgId = (roleOrgResult.data?.organization_id as string) || "";
            setCacheCookie(response, "fp-user-role", resolvedRole, COOKIE_TTL_SHORT);
            // Only cache org ID when we actually have one. An empty string
            // passes the truthy check in allCookiesFresh on the next request,
            // causing the fast path to fire with no org context.
            if (resolvedOrgId) {
                setCacheCookie(response, "fp-org-id", resolvedOrgId, COOKIE_TTL_SHORT);
            }

            // ─── Onboarding enforcement (data already fetched in parallel) ───
            if (needsOnboardingCheck) {
                try {
                    const orgMemberships = onboardMemberships.data as Array<{
                        id: string;
                        role: string;
                        organizations: { slug: string } | null;
                    }> | null;
                    const hasNoOrg = !orgMemberships || orgMemberships.length === 0;

                    if (hasNoOrg) {
                        const url = request.nextUrl.clone();
                        url.pathname = "/onboarding/org-setup";
                        return redirectWithCookies(url);
                    }

                    const firstMembership = orgMemberships[0];
                    const orgSlug =
                        firstMembership &&
                        typeof firstMembership.organizations === "object" &&
                        firstMembership.organizations !== null &&
                        "slug" in firstMembership.organizations
                            ? (firstMembership.organizations as { slug: string }).slug
                            : null;

                    const onlyDefault = orgMemberships.length === 1 && orgSlug === "default";

                    if (onlyDefault) {
                        const url = request.nextUrl.clone();
                        url.pathname = "/onboarding/org-setup";
                        return redirectWithCookies(url);
                    }

                    // Gate access enforcement
                    const gatedSteps = gatedStepsResult.data as Array<{
                        id: string;
                        step_key: string;
                    }> | null;

                    if (gatedSteps && gatedSteps.length > 0) {
                        // This is the only remaining sequential query — only runs when
                        // gated steps exist AND onboarding not cached. Typically once per user.
                        const { data: completedProgress } = await supabase
                            .from("user_onboarding_progress")
                            .select("step_definition_id")
                            .eq("user_id", user.id)
                            .eq("status", "completed")
                            .in(
                                "step_definition_id",
                                gatedSteps.map((s) => s.id)
                            );

                        const completedIds = new Set(
                            (completedProgress || []).map(
                                (p: { step_definition_id: string }) => p.step_definition_id
                            )
                        );

                        const emailVerified = !!user.email_confirmed_at;
                        let allGatesComplete = true;

                        for (const step of gatedSteps) {
                            if (completedIds.has(step.id)) continue;
                            if (step.step_key === "verify_email" && emailVerified) continue;

                            allGatesComplete = false;

                            const gateRoutes: Record<string, string> = {
                                verify_email: "/settings/security",
                            };

                            const redirectPath = gateRoutes[step.step_key];
                            if (redirectPath) {
                                const url = request.nextUrl.clone();
                                url.pathname = redirectPath;
                                url.searchParams.set("gate", step.step_key);
                                return redirectWithCookies(url);
                            }
                        }

                        if (allGatesComplete) {
                            setCacheCookie(response, "fp-onboarding-complete", "1", COOKIE_TTL_DAY);
                        }
                    } else {
                        setCacheCookie(response, "fp-onboarding-complete", "1", COOKIE_TTL_DAY);
                    }
                } catch {
                    // Onboarding check failed — allow through rather than blocking
                }
            }
        }
    }

    // ─── CSRF: set double-submit cookie for authenticated users ───
    if (user && !request.cookies.get(CSRF_COOKIE_NAME)?.value) {
        response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
            httpOnly: false, // JS must read this to send as header
            secure: IS_PROD,
            sameSite: "lax",
            path: "/",
            maxAge: COOKIE_TTL_DAY,
        });
    }

    // ─── Security headers (applied once from pre-computed array) ───
    for (const [key, value] of SECURITY_HEADERS) {
        response.headers.set(key, value);
    }

    // Prevent search engine indexing of API routes and auth pages
    if (
        request.nextUrl.pathname.startsWith("/api/") ||
        request.nextUrl.pathname.startsWith("/auth/")
    ) {
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }

    return response;
}
