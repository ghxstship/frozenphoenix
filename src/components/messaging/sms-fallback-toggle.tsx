"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface SMSFallbackToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    isPending?: boolean | undefined;
    className?: string | undefined;
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
                <Toggle
                    checked={enabled}
                    onCheckedChange={() => onToggle(!enabled)}
                    aria-label={ms("sms_fallback_label")}
                    disabled={isPending}
                    size="sm"
                />
            </div>
        </div>
    );
}
