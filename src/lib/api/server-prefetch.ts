/* ═══════════════════════════════════════════════════════════════
   SERVER PREFETCH — Server-side data fetching for list/detail pages
   
   Performance: Enables Server Component pages to fetch data during SSR,
   eliminating the client-side JS→hydrate→fetch→render waterfall.
   
   Data arrives WITH the HTML instead of after a round-trip.
   
   Usage (Server Component page):
     import { prefetchList } from "@/lib/api/server-prefetch";
     import { DealsPageClient } from "./client";
     
     export default async function DealsPage() {
       const { data, isError } = await prefetchList("/api/deals");
       return <DealsPageClient initialData={data} initialError={isError} />;
     }
   ═══════════════════════════════════════════════════════════════ */

import { cookies, headers } from "next/headers";

interface PrefetchResult<T> {
    data: T[];
    isError: boolean;
}

/**
 * Server-side list data fetcher. Forwards auth cookies to the API route
 * so RBAC enforcement works identically to client-side requests.
 */
export async function prefetchList<T = Record<string, unknown>>(
    apiPath: string,
    params?: Record<string, string>
): Promise<PrefetchResult<T>> {
    try {
        // Build the full URL for the internal API call
        const headerStore = await headers();
        const host = headerStore.get("host") ?? "localhost:3000";
        const protocol = headerStore.get("x-forwarded-proto") ?? "http";
        const baseUrl = `${protocol}://${host}`;

        const url = new URL(apiPath, baseUrl);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                url.searchParams.set(key, value);
            }
        }

        // Forward cookies for auth (Supabase session + cached role/orgId)
        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const res = await fetch(url.toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            // Don't cache in fetch cache — React Query handles client-side caching
            cache: "no-store",
        });

        if (!res.ok) {
            return { data: [] as T[], isError: true };
        }

        const body = await res.json();
        return { data: (body.data ?? []) as T[], isError: false };
    } catch {
        return { data: [] as T[], isError: false };
    }
}

/**
 * Server-side single record fetcher.
 */
export async function prefetchDetail<T = Record<string, unknown>>(
    apiPath: string,
    id: string
): Promise<{ data: T | null; isError: boolean }> {
    try {
        const headerStore = await headers();
        const host = headerStore.get("host") ?? "localhost:3000";
        const protocol = headerStore.get("x-forwarded-proto") ?? "http";
        const baseUrl = `${protocol}://${host}`;

        const url = new URL(`${apiPath}/${id}`, baseUrl);

        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const res = await fetch(url.toString(), {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return { data: null, isError: true };
        }

        const body = await res.json();
        return { data: (body.data ?? null) as T | null, isError: false };
    } catch {
        return { data: null, isError: false };
    }
}
