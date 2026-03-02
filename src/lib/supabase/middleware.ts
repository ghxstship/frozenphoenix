import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";

const PUBLIC_EXACT_PATHS = ["/", "/login", "/signup", "/forgot-password"];
const PUBLIC_PREFIX_PATHS = ["/auth/", "/api/", "/_next/", "/invite/"];

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

    // MFA verification check — redirect to MFA verify if user has enrolled TOTP
    // but the session's AAL is only aal1 (not yet verified for this session).
    // Skip this check for auth routes and API routes to avoid loops.
    if (user && isProtectedPath && !request.nextUrl.pathname.startsWith("/auth/mfa")) {
        try {
            const { data: assuranceData } =
                await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (
                assuranceData &&
                assuranceData.nextLevel === "aal2" &&
                assuranceData.currentLevel === "aal1"
            ) {
                const url = request.nextUrl.clone();
                url.pathname = "/auth/mfa-verify";
                return NextResponse.redirect(url);
            }
        } catch {
            // MFA check failed — allow request through rather than blocking
        }
    }

    // Lifecycle status enforcement — block suspended/banned/deactivated users
    if (user && isProtectedPath) {
        try {
            const { data: userProfile } = await supabase
                .from("user_profiles")
                .select("lifecycle_status")
                .eq("id", user.id)
                .single();

            const blockedStatuses = ["suspended", "banned", "deactivated", "offboarded"];
            if (userProfile && blockedStatuses.includes(userProfile.lifecycle_status)) {
                // Sign the user out and redirect to login with reason
                await supabase.auth.signOut();
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                url.searchParams.set("reason", "account_suspended");
                return NextResponse.redirect(url);
            }
        } catch {
            // user_profiles table may not exist yet — allow through
        }
    }

    // ─── Onboarding redirect guard ──────────────────────────────────
    // New users without an organization are redirected to org-setup on first login.
    // Users with incomplete gate_access steps are redirected to the relevant step.
    // Skip for onboarding pages, API, settings, and auth routes to avoid loops.
    const isOnboardingPath = request.nextUrl.pathname.startsWith("/onboarding");
    const isSettingsPath = request.nextUrl.pathname.startsWith("/settings");
    const shouldCheckOnboarding =
        user &&
        isProtectedPath &&
        !isOnboardingPath &&
        !isSettingsPath &&
        !request.nextUrl.pathname.startsWith("/auth/") &&
        !request.nextUrl.pathname.startsWith("/api/");

    if (shouldCheckOnboarding) {
        try {
            // Check if user has any org membership
            const { data: memberships } = await supabase
                .from("org_memberships")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "active")
                .limit(1);

            const hasNoOrg = !memberships || memberships.length === 0;

            // Check for the default org — if that's the only membership, they still
            // need to set up their own org (exec/pm users)
            if (!hasNoOrg && memberships && memberships.length > 0) {
                const { data: defaultOrgMembership } = await supabase
                    .from("org_memberships")
                    .select("id, role, organizations!inner(slug)")
                    .eq("user_id", user.id)
                    .eq("status", "active");

                const firstMembership = defaultOrgMembership?.[0];
                const orgSlug =
                    firstMembership &&
                    typeof firstMembership.organizations === "object" &&
                    firstMembership.organizations !== null &&
                    "slug" in firstMembership.organizations
                        ? (firstMembership.organizations as { slug: string }).slug
                        : null;

                const onlyDefault = defaultOrgMembership?.length === 1 && orgSlug === "default";

                if (onlyDefault && firstMembership?.role === "exec") {
                    const url = request.nextUrl.clone();
                    url.pathname = "/onboarding/org-setup";
                    return NextResponse.redirect(url);
                }
            } else if (hasNoOrg) {
                const url = request.nextUrl.clone();
                url.pathname = "/onboarding/org-setup";
                return NextResponse.redirect(url);
            }

            // Gate access enforcement — check for incomplete gated steps
            const { data: gatedSteps } = await supabase
                .from("onboarding_step_definitions")
                .select("id, step_key")
                .eq("gate_access", true);

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

                for (const step of gatedSteps) {
                    if (completedIds.has(step.id)) continue;

                    // Skip verify_email gate if email is already confirmed
                    if (step.step_key === "verify_email" && emailVerified) continue;

                    // Redirect to the appropriate step page
                    const gateRoutes: Record<string, string> = {
                        verify_email: "/settings/security",
                        complete_compliance: "/settings/security",
                    };

                    const redirectPath = gateRoutes[step.step_key];
                    if (redirectPath) {
                        const url = request.nextUrl.clone();
                        url.pathname = redirectPath;
                        url.searchParams.set("gate", step.step_key);
                        return NextResponse.redirect(url);
                    }
                }
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
        `connect-src 'self' ${supabaseUrl || ""} wss://${supabaseDomain} https://challenges.cloudflare.com https://accounts.google.com`,
        "img-src 'self' data: blob: https://*.googleusercontent.com https://avatars.githubusercontent.com",
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
