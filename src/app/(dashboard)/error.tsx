"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("DashboardError", {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
        });
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="flex flex-col items-center justify-center text-center gap-4 max-w-md">
                <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        An unexpected error occurred. Please try again or return to the dashboard.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Try Again
                    </Button>
                    <Button variant="default" onClick={() => window.location.assign("/dashboard")}>
                        <Home className="h-4 w-4 mr-1" />
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
