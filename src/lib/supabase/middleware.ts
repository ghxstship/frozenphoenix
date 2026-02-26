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
            request.nextUrl.pathname.startsWith("/auth/");

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
        request.nextUrl.pathname.startsWith("/_next/");
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

    // Security headers (OWASP)
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return response;
}
