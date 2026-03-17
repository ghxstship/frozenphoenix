"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { SettingsProvider } from "@/lib/settings/settings-provider";
import { AccessibilityProvider } from "@/components/accessibility";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatusProvider } from "@/components/network-status";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

// Performance: Dynamic imports for overlay components that aren't needed at initial render.
// CommandBar only opens on Cmd+K; CookieConsent shows once per visitor.
const CommandBar = dynamic(() => import("@/components/command-bar").then((m) => m.CommandBar), {
    ssr: false,
});
const CookieConsent = dynamic(
    () => import("@/components/cookie-consent").then((m) => m.CookieConsent),
    { ssr: false }
);

/**
 * FIND-029: QueryClient staleTime trade-off documentation.
 *
 * Global staleTime: 60s — balances freshness vs. network cost.
 * refetchOnWindowFocus: false — prevents jarring refetches on tab switch.
 *
 * Trade-offs:
 * - 60s staleTime means data can be up to 1 minute stale after mutation.
 * - For real-time feeds (activity, notifications), use per-query overrides:
 *     useQuery({ queryKey: [...], staleTime: 5_000 })
 * - For rarely-changing config (brands, permissions), increase:
 *     useQuery({ queryKey: [...], staleTime: 5 * 60_000 })
 * - Mutations should invalidate related queries via queryClient.invalidateQueries()
 *   to ensure immediate freshness after writes.
 *
 * Per-query override example:
 *   const { data } = useQuery({
 *     queryKey: ["notifications"],
 *     queryFn: fetchNotifications,
 *     staleTime: 5_000,          // 5s for near-real-time
 *     refetchInterval: 30_000,   // Poll every 30s
 *   });
 */
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                // M-006: Exponential backoff with jitter for failed queries
                retry: 3,
                retryDelay: (attemptIndex) =>
                    Math.min(1000 * 2 ** attemptIndex, 30_000) + Math.random() * 500,
            },
            mutations: {
                retry: 1,
                retryDelay: 1000,
            },
        },
    });
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(makeQueryClient);

    return (
        <ErrorBoundary level="app">
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <SettingsProvider>
                        <ThemeProvider>
                            <AccessibilityProvider>
                                <NetworkStatusProvider>
                                    <ToastProvider>
                                        <ConfirmDialogProvider>
                                            {children}
                                            <CommandBar />
                                            <React.Suspense fallback={null}>
                                                <CookieConsent />
                                            </React.Suspense>
                                        </ConfirmDialogProvider>
                                    </ToastProvider>
                                </NetworkStatusProvider>
                            </AccessibilityProvider>
                        </ThemeProvider>
                    </SettingsProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
