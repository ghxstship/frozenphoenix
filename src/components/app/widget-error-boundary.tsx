/* ═══════════════════════════════════════════════════════════════
   WIDGET ERROR BOUNDARY — M-005 Feature-Level Error Isolation
   ═══════════════════════════════════════════════════════════════
   
   Wraps individual dashboard widgets/sections so a single
   failing component doesn't take down the entire page.
   
   Usage:
     <WidgetErrorBoundary name="RevenueChart">
       <RevenueChart />
     </WidgetErrorBoundary>
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import { ErrorBoundary } from "@/components/app/error-boundary";

interface WidgetErrorBoundaryProps {
    children: React.ReactNode;
    name?: string | undefined;
}

export function WidgetErrorBoundary({ children, name }: WidgetErrorBoundaryProps) {
    return (
        <ErrorBoundary
            level="section"
            onError={(error) => {
                if (name) {
                    // Tag logged errors with widget name for easier triage
                    (error as Error & { widget?: string }).widget = name;
                }
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

WidgetErrorBoundary.displayName = "WidgetErrorBoundary";
