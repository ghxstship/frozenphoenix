"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { AccessibilityProvider } from "@/components/accessibility";
import { CommandBar } from "@/components/command-bar";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AccessibilityProvider>
                    {children}
                    <CommandBar />
                </AccessibilityProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
