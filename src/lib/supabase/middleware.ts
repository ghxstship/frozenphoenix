import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";

export async function updateSession(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    });

    // If Supabase is not configured, skip auth entirely.
    // In production without credentials, protect dashboard routes by redirecting
    // to /login, but always allow public paths through to avoid redirect loops.
    if (!supabaseUrl || !supabaseAnonKey) {
        const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
        const isPublic =
            publicPaths.includes(request.nextUrl.pathname) ||
            request.nextUrl.pathname.startsWith("/api/") ||
            request.nextUrl.pathname.startsWith("/_next/") ||
            request.nextUrl.pathname.startsWith("/auth/") ||
            request.nextUrl.pathname.startsWith("/invite/");

        if (process.env.NODE_ENV === "production" && !isPublic) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    let response = supabaseResponse;

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - all dashboard routes require authentication
    // Public routes are explicitly listed; everything else is protected
    const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
    const isPublicPath =
        publicPaths.includes(request.nextUrl.pathname) ||
        request.nextUrl.pathname.startsWith("/auth/") ||
        request.nextUrl.pathname.startsWith("/api/") ||
        request.nextUrl.pathname.startsWith("/_next/") ||
        request.nextUrl.pathname.startsWith("/invite/");
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
    if (
        user &&
        isProtectedPath &&
        !request.nextUrl.pathname.startsWith("/auth/mfa")
    ) {
        try {
            const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
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

    // Security headers (OWASP)
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

    // Content Security Policy
    const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : "";
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
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
