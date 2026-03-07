"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAcknowledgeMandatoryRead } from "@/lib/supabase/hooks-messaging";

interface MandatoryReadBannerProps {
    messageId: string;
    isAcknowledged: boolean;
    acknowledgedAt?: string | null;
    className?: string;
}

export function MandatoryReadBanner({
    messageId,
    isAcknowledged,
    acknowledgedAt,
    className,
}: MandatoryReadBannerProps) {
    const acknowledge = useAcknowledgeMandatoryRead();

    const handleAcknowledge = () => {
        acknowledge.mutate({ messageId });
    };

    if (isAcknowledged) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2",
                    className
                )}
                role="status"
            >
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                <span className="text-xs text-green-700 dark:text-green-300">
                    Acknowledged
                    {acknowledgedAt && (
                        <span className="text-green-600/70 dark:text-green-400/70">
                            {" · "}
                            {new Date(acknowledgedAt).toLocaleString()}
                        </span>
                    )}
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2",
                className
            )}
            role="alert"
        >
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    This message requires your acknowledgment
                </span>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                onClick={handleAcknowledge}
                disabled={acknowledge.isPending}
            >
                {acknowledge.isPending ? "..." : "Acknowledge"}
            </Button>
        </div>
    );
}
