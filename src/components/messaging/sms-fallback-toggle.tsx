"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface SMSFallbackToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    isPending?: boolean;
    className?: string;
}

export function SMSFallbackToggle({
    enabled,
    onToggle,
    isPending = false,
    className,
}: SMSFallbackToggleProps) {
    const ms = useMessagingStrings();

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                className
            )}
        >
            <div className="flex items-center gap-2 min-w-0">
                <div
                    className={cn(
                        "h-7 w-7 shrink-0 rounded-lg flex items-center justify-center",
                        enabled ? "bg-primary/10" : "bg-secondary"
                    )}
                >
                    {enabled ? (
                        <Phone className="h-3.5 w-3.5 text-primary" />
                    ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-medium">{ms("sms_fallback_label")}</p>
                    <p className="density-caption text-muted-foreground truncate">
                        {ms("sms_fallback_description")}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {enabled && (
                    <Badge variant="success" className="density-caption">
                        {ms("sms_fallback_enabled")}
                    </Badge>
                )}
                <button
                    role="switch"
                    aria-checked={enabled}
                    aria-label={ms("sms_fallback_label")}
                    disabled={isPending}
                    onClick={() => onToggle(!enabled)}
                    className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        enabled ? "bg-primary" : "bg-input"
                    )}
                >
                    <span
                        className={cn(
                            "pointer-events-none block h-3.5 w-3.5 rounded-full bg-background shadow-sm ring-0 transition-transform",
                            enabled ? "translate-x-4" : "translate-x-0.5"
                        )}
                    />
                </button>
            </div>
        </div>
    );
}
