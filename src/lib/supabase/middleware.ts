import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";

const PUBLIC_EXACT_PATHS = ["/", "/login", "/signup", "/forgot-password"];
const PUBLIC_PREFIX_PATHS = ["/auth/", "/api/", "/_next/", "/invite/", "/u/", "/org/", "/legal/"];

function isPublicRoute(pathname: string): boolean {
    return (
        PUBLIC_EXACT_PATHS.includes(pathname) ||
        PUBLIC_PREFIX_PATHS.some((prefix) => pathname.startsWith(prefix))
    );
}

export async function updateSession(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    });

    // If Supabase is not configured, skip auth entirely.
    // In production without credentials, protect dashboard routes by redirecting
    // to /login, but always allow public paths through to avoid redirect loops.
    if (!supabaseUrl || !supabaseAnonKey) {
        const isPublic = isPublicRoute(request.nextUrl.pathname);

        if (process.env.NODE_ENV === "production" && !isPublic) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    let response = supabaseResponse;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - all dashboard routes require authentication
    // Public routes are explicitly listed; everything else is protected
    const isPublicPath = isPublicRoute(request.nextUrl.pathname);
    const isProtectedPath = !isPublicPath;

    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    const authPaths = ["/login", "/signup", "/forgot-password"];
    const isAuthPath = authPaths.includes(request.nextUrl.pathname);

    if (isAuthPath && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // ─── Parallel: MFA + Lifecycle + Role resolution ─────────────
    // Run these checks concurrently instead of sequentially to cut
    // ~200-400ms off every protected-route navigation.
    if (user && isProtectedPath) {
        const checkMfa = !request.nextUrl.pathname.startsWith("/auth/mfa")
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

        const checkRole = Promise.resolve(
            supabase
                .from("org_memberships")
                .select("role")
                .eq("user_id", user.id)
                .eq("is_default_org", true)
                .single()
        )
            .then(({ data }) => ({ type: "role" as const, data }))
            .catch(() => ({ type: "role" as const, data: null }));

        const [mfaResult, lifecycleResult, roleResult] = await Promise.all([
            checkMfa,
            checkLifecycle,
            checkRole,
        ]);

        // MFA enforcement
        if (
            mfaResult.data &&
            "nextLevel" in mfaResult.data &&
            mfaResult.data.nextLevel === "aal2" &&
            mfaResult.data.currentLevel === "aal1"
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/auth/mfa-verify";
            return NextResponse.redirect(url);
        }

        // Lifecycle enforcement
        const blockedStatuses = ["suspended", "banned", "deactivated", "offboarded"];
        if (
            lifecycleResult.data &&
            blockedStatuses.includes(lifecycleResult.data.lifecycle_status)
        ) {
            await supabase.auth.signOut();
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("reason", "account_suspended");
            return NextResponse.redirect(url);
        }

        // Cache user role in a cookie so API routes can skip the DB query
        const resolvedRole = (roleResult.data?.role as string) ?? "member";
        response.cookies.set("fp-user-role", resolvedRole, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 300, // 5 minutes — short-lived to stay fresh
        });
    }

    // ─── Onboarding redirect guard ──────────────────────────────────
    // New users without an organization are redirected to org-setup on first login.
    // Users with incomplete gate_access steps are redirected to the relevant step.
    // Skip for onboarding pages, API, settings, and auth routes to avoid loops.
    const isOnboardingPath = request.nextUrl.pathname.startsWith("/onboarding");
    const isSettingsPath = request.nextUrl.pathname.startsWith("/settings");
    const onboardingSkipped = request.cookies.get("fp-onboarding-skipped")?.value === "1";
    const onboardingComplete = request.cookies.get("fp-onboarding-complete")?.value === "1";
    const shouldCheckOnboarding =
        user &&
        isProtectedPath &&
        !isOnboardingPath &&
        !isSettingsPath &&
        !onboardingSkipped &&
        !onboardingComplete &&
        !request.nextUrl.pathname.startsWith("/auth/") &&
        !request.nextUrl.pathname.startsWith("/api/");

    if (shouldCheckOnboarding) {
        try {
            // Parallel: fetch org memberships (with slug) + gated steps in one round
            const [membershipsResult, gatedStepsResult] = await Promise.all([
                supabase
                    .from("org_memberships")
                    .select("id, role, organizations!inner(slug)")
                    .eq("user_id", user.id)
                    .eq("status", "active"),
                supabase
                    .from("onboarding_step_definitions")
                    .select("id, step_key")
                    .eq("gate_access", true),
            ]);

            const orgMemberships = membershipsResult.data;
            const hasNoOrg = !orgMemberships || orgMemberships.length === 0;

            if (hasNoOrg) {
                const url = request.nextUrl.clone();
                url.pathname = "/onboarding/org-setup";
                return NextResponse.redirect(url);
            }

            // Check for the default org — if that's the only membership, they still
            // need to set up their own org (exec/pm users)
            const firstMembership = orgMemberships[0];
            const orgSlug =
                firstMembership &&
                typeof firstMembership.organizations === "object" &&
                firstMembership.organizations !== null &&
                "slug" in firstMembership.organizations
                    ? (firstMembership.organizations as { slug: string }).slug
                    : null;

            const onlyDefault = orgMemberships.length === 1 && orgSlug === "default";

            if (onlyDefault && firstMembership?.role === "exec") {
                const url = request.nextUrl.clone();
                url.pathname = "/onboarding/org-setup";
                return NextResponse.redirect(url);
            }

            // Gate access enforcement — check for incomplete gated steps
            const gatedSteps = gatedStepsResult.data;

            if (gatedSteps && gatedSteps.length > 0) {
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

                // Auto-resolve verify_email if the email is confirmed
                const emailVerified = !!user.email_confirmed_at;
                let allGatesComplete = true;

                for (const step of gatedSteps) {
                    if (completedIds.has(step.id)) continue;

                    // Skip verify_email gate if email is already confirmed
                    if (step.step_key === "verify_email" && emailVerified) continue;

                    allGatesComplete = false;

                    // Redirect to the appropriate step page
                    const gateRoutes: Record<string, string> = {
                        verify_email: "/settings/security",
                    };

                    const redirectPath = gateRoutes[step.step_key];
                    if (redirectPath) {
                        const url = request.nextUrl.clone();
                        url.pathname = redirectPath;
                        url.searchParams.set("gate", step.step_key);
                        return NextResponse.redirect(url);
                    }
                }

                // If all gates passed, cache completion to skip checks on future navigations
                if (allGatesComplete) {
                    response.cookies.set("fp-onboarding-complete", "1", {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: 86400, // 24 hours
                    });
                }
            } else {
                // No gated steps defined — cache completion
                response.cookies.set("fp-onboarding-complete", "1", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 86400,
                });
            }
        } catch {
            // Onboarding check failed — allow through rather than blocking
        }
    }

    // Security headers (OWASP)
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
    );

    // Content Security Policy
    // C-003: unsafe-eval only permitted in development for hot-reload / React DevTools
    const isDev = process.env.NODE_ENV === "development";
    const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : "";
    const cspDirectives = [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
        "style-src 'self' 'unsafe-inline'",
        `connect-src 'self' ${supabaseUrl || ""} wss://${supabaseDomain} https://challenges.cloudflare.com https://accounts.google.com https://plc.directory https://bsky.social`,
        "img-src 'self' data: blob: https://*.googleusercontent.com https://cdn.bsky.app",
        "font-src 'self'",
        "frame-src https://challenges.cloudflare.com https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ];
    response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

    return response;
}
