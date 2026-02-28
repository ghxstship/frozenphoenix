"use client";

/**
 * Universal dual-path data hook: fetches from Supabase when configured,
 * falls back to mock data otherwise. Provides loading/error states.
 *
 * Usage:
 *   const { data, isLoading } = useSupabaseOrMock(
 *     "deals",                    // queryKey
 *     () => supabaseFetchFn(),    // Supabase fetch (only called if configured)
 *     MOCK_DEALS                  // fallback mock data
 *   );
 */

import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "./client";

export { isSupabaseConfigured };

interface UseSupabaseOrMockOptions {
    enabled?: boolean;
}

/**
 * Generic hook: tries Supabase first, falls back to mock data.
 * When Supabase is not configured, returns mock data immediately with isLoading=false.
 */
export function useSupabaseOrMock<T>(
    queryKey: string | string[],
    supabaseFetcher: () => Promise<T>,
    mockData: T,
    options?: UseSupabaseOrMockOptions,
) {
    const key = Array.isArray(queryKey) ? queryKey : [queryKey];
    const enabled = options?.enabled !== false;

    const query = useQuery<T>({
        queryKey: key,
        queryFn: async () => {
            if (!isSupabaseConfigured) return mockData;
            try {
                return await supabaseFetcher();
            } catch {
                // Supabase query failed — fall back to mock silently in dev
                if (process.env.NODE_ENV === "development") {
                    console.warn(`[useSupabaseOrMock] "${key.join("/")}" failed, using mock data`);
                }
                return mockData;
            }
        },
        enabled,
        // If Supabase isn't configured, seed cache with mock data immediately
        ...(isSupabaseConfigured ? {} : { initialData: mockData }),
    });

    return {
        data: query.data ?? mockData,
        isLoading: isSupabaseConfigured ? query.isLoading : false,
        error: query.error,
        isError: query.isError,
        refetch: query.refetch,
        isFetching: query.isFetching,
    };
}
