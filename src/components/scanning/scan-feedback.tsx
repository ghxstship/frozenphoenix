"use client";

/* ═══════════════════════════════════════════════════════════════
   SCAN FEEDBACK — Audio/haptic/visual feedback for scan results.
   Respects prefers-reduced-motion (disables flash animation).

   Usage — parent owns `visible` + `onDismiss`:
     const [fb, setFb] = useState({ visible: false, ... });
     <ScanFeedback {...fb} onDismiss={() => setFb(f => ({...f, visible:false}))} />
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    playErrorBeep,
    playInfoBeep,
    playSuccessBeep,
    playWarningBeep,
    triggerHaptic,
} from "@/lib/audio/scan-audio";

export type ScanFeedbackResult = "success" | "warning" | "error" | "info";

export interface ScanFeedbackProps {
    result: ScanFeedbackResult;
    message: string;
    visible: boolean;
    /** Called when feedback should auto-hide. Parent sets visible=false. */
    onDismiss?: () => void;
    /** Auto-hide after this many ms. 0 = never. Default 3000. */
    autoHideMs?: number;
    className?: string;
}

const RESULT_CONFIG: Record<
    ScanFeedbackResult,
    {
        icon: typeof CheckCircle2;
        bg: string;
        border: string;
        text: string;
        flash: string;
        play: () => void;
        haptic: number | number[];
    }
> = {
    success: {
        icon: CheckCircle2,
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-600 dark:text-green-400",
        flash: "bg-green-500/20",
        play: playSuccessBeep,
        haptic: 200,
    },
    warning: {
        icon: AlertTriangle,
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-600 dark:text-amber-400",
        flash: "bg-amber-500/20",
        play: playWarningBeep,
        haptic: [100, 50, 100],
    },
    error: {
        icon: XCircle,
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-600 dark:text-red-400",
        flash: "bg-red-500/20",
        play: playErrorBeep,
        haptic: [300],
    },
    info: {
        icon: Info,
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-600 dark:text-blue-400",
        flash: "bg-blue-500/20",
        play: playInfoBeep,
        haptic: 100,
    },
};

export function ScanFeedback({
    result,
    message,
    visible,
    onDismiss,
    autoHideMs = 3000,
    className,
}: ScanFeedbackProps) {
    const prevVisibleRef = useRef(visible);
    const flashRef = useRef<HTMLDivElement>(null);

    const config = RESULT_CONFIG[result];
    const Icon = config.icon;

    // Trigger audio/haptic/flash on rising edge (external system sync)
    useEffect(() => {
        if (visible && !prevVisibleRef.current) {
            config.play();
            triggerHaptic(config.haptic);

            // Flash via DOM — no setState needed
            if (flashRef.current) {
                flashRef.current.style.opacity = "1";
                setTimeout(() => {
                    if (flashRef.current) flashRef.current.style.opacity = "0";
                }, 300);
            }
        }
        prevVisibleRef.current = visible;
    }, [visible, config]);

    // Auto-hide via onDismiss callback (no local state change)
    useEffect(() => {
        if (!visible || autoHideMs === 0 || !onDismiss) return;

        const timer = setTimeout(onDismiss, autoHideMs);
        return () => clearTimeout(timer);
    }, [visible, autoHideMs, onDismiss]);

    return (
        <>
            {/* Full-screen flash overlay — controlled via ref, not state */}
            <div
                ref={flashRef}
                className={cn(
                    "fixed inset-0 z-[100] pointer-events-none transition-opacity duration-300",
                    config.flash
                )}
                style={{ opacity: 0 }}
                aria-hidden="true"
            />

            {/* Feedback card */}
            {visible && (
                <div
                    className={cn(
                        "flex items-center gap-3 rounded-lg border p-3",
                        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2",
                        "motion-safe:duration-200",
                        config.bg,
                        config.border,
                        className
                    )}
                    role="status"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <Icon className={cn("h-5 w-5 shrink-0", config.text)} />
                    <p className={cn("text-sm font-medium", config.text)}>{message}</p>
                </div>
            )}
        </>
    );
}
