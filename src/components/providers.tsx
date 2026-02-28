"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { SettingsProvider } from "@/lib/settings/settings-provider";
import { AccessibilityProvider } from "@/components/accessibility";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandBar } from "@/components/command-bar";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatusProvider } from "@/components/network-status";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
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
