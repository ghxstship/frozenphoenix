"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Radio, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMessagingStrings } from "@/hooks/use-messaging-strings";

interface PushToTalkButtonProps {
    channelName?: string;
    activeSpeakers?: number;
    disabled?: boolean;
    onPTTStart?: () => void;
    onPTTEnd?: () => void;
    className?: string;
}

type PTTState = "idle" | "connecting" | "transmitting";

export function PushToTalkButton({
    channelName,
    activeSpeakers = 0,
    disabled = false,
    onPTTStart,
    onPTTEnd,
    className,
}: PushToTalkButtonProps) {
    const ms = useMessagingStrings();
    const [state, setState] = React.useState<PTTState>("idle");
    const [supported] = React.useState(
        () => typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia)
    );

    const handlePointerDown = React.useCallback(() => {
        if (disabled || !supported) return;
        setState("connecting");
        // Simulate brief connection delay, then start transmitting
        const timer = setTimeout(() => {
            setState("transmitting");
            onPTTStart?.();
        }, 150);
        return () => clearTimeout(timer);
    }, [disabled, supported, onPTTStart]);

    const handlePointerUp = React.useCallback(() => {
        if (state === "transmitting" || state === "connecting") {
            setState("idle");
            onPTTEnd?.();
        }
    }, [state, onPTTEnd]);

    // Release on pointer leave to prevent stuck transmit
    const handlePointerLeave = React.useCallback(() => {
        if (state === "transmitting" || state === "connecting") {
            setState("idle");
            onPTTEnd?.();
        }
    }, [state, onPTTEnd]);

    // Keyboard support: Space to transmit
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === " " && state === "idle" && !disabled && supported) {
                e.preventDefault();
                setState("transmitting");
                onPTTStart?.();
            }
        },
        [state, disabled, supported, onPTTStart]
    );

    const handleKeyUp = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === " " && (state === "transmitting" || state === "connecting")) {
                e.preventDefault();
                setState("idle");
                onPTTEnd?.();
            }
        },
        [state, onPTTEnd]
    );

    if (!supported) {
        return (
            <div className={cn("text-xs text-muted-foreground px-3 py-2", className)}>
                {ms("ptt_unsupported")}
            </div>
        );
    }

    return (
        <div
            className={cn("flex items-center gap-3", className)}
            role="group"
            aria-label={ms("a11y_ptt_button")}
        >
            {/* Channel info */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RadioTower className="h-3.5 w-3.5" />
                <span className="font-medium">{channelName ?? ms("ptt_channel")}</span>
                {activeSpeakers > 0 && (
                    <Badge variant="info" className="density-caption">
                        {ms("ptt_active_speakers").replace("{count}", String(activeSpeakers))}
                    </Badge>
                )}
            </div>

            {/* PTT Button */}
            <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                disabled={disabled}
                className={cn(
                    "relative flex items-center justify-center rounded-full transition-all select-none touch-none",
                    "h-12 w-12 shrink-0",
                    state === "idle" &&
                        "bg-secondary text-muted-foreground hover:bg-secondary/80 active:scale-95",
                    state === "connecting" && "bg-warning/20 text-warning",
                    state === "transmitting" &&
                        "bg-destructive/20 text-destructive ring-4 ring-destructive/20 scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label={
                    state === "transmitting" ? ms("ptt_release_to_send") : ms("ptt_hold_to_talk")
                }
                aria-pressed={state === "transmitting"}
            >
                {state === "connecting" ? (
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin" />
                ) : (
                    <Radio className={cn("h-5 w-5", state === "transmitting" && "animate-pulse")} />
                )}

                {/* Pulse ring when transmitting */}
                {state === "transmitting" && (
                    <span className="absolute inset-0 rounded-full border-2 border-destructive/40 motion-safe:animate-ping" />
                )}
            </button>

            {/* State label */}
            <span
                className={cn(
                    "density-caption font-medium min-w-[80px]",
                    state === "idle" && "text-muted-foreground",
                    state === "connecting" && "text-warning",
                    state === "transmitting" && "text-destructive"
                )}
            >
                {state === "idle" && ms("ptt_hold_to_talk")}
                {state === "connecting" && ms("ptt_connecting")}
                {state === "transmitting" && ms("ptt_listening")}
            </span>
        </div>
    );
}
