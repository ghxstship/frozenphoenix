import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export async function updateSession(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    });

    // If Supabase is not configured, allow all routes ONLY in development
    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NODE_ENV === "production") {
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
    const publicPaths = ["/", "/login", "/signup"];
    const isPublicPath =
        publicPaths.includes(request.nextUrl.pathname) ||
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
    const authPaths = ["/login", "/signup"];
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
