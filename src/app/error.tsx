"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("GlobalError", {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
        });
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
            <div className="flex flex-col items-center justify-center text-center gap-4 max-w-md">
                <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Something went wrong</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        An unexpected error occurred. Please try again or reload the page.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Try Again
                    </Button>
                    <Button variant="default" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reload Page
                    </Button>
                </div>
            </div>
        </div>
    );
}
