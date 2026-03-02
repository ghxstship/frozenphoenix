"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { INTERACTION_TIMING } from "@/config/design-tokens";

const toastVariants = cva(
    "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
    {
        variants: {
            variant: {
                default: "bg-background border-border text-foreground",
                success: "bg-success/10 border-success/30 text-success",
                warning: "bg-warning/10 border-warning/30 text-warning",
                destructive: "bg-destructive/10 border-destructive/30 text-destructive",
                info: "bg-info/10 border-info/30 text-info",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

export interface ToastData {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "success" | "warning" | "destructive" | "info";
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextValue {
    toasts: ToastData[];
    addToast: (toast: Omit<ToastData, "id">) => string;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
    toasts: [],
    addToast: () => "",
    removeToast: () => {},
});

export function useToast() {
    return React.useContext(ToastContext);
}

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastData[]>([]);

    const addToast = React.useCallback((toast: Omit<ToastData, "id">) => {
        const id = `toast-${++toastIdCounter}`;
        setToasts((prev) => [...prev, { ...toast, id }]);

        const duration = toast.duration ?? INTERACTION_TIMING.toastDuration;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastViewport />
        </ToastContext.Provider>
    );
}

function ToastViewport() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
}

const variantIcons = {
    default: null,
    success: CheckCircle,
    warning: AlertTriangle,
    destructive: AlertCircle,
    info: Info,
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
    const Icon = variantIcons[toast.variant ?? "default"];
    const duration = toast.duration ?? INTERACTION_TIMING.toastDuration;
    const [paused, setPaused] = React.useState(false);

    // Timer bar color based on variant
    const timerBarColor: Record<string, string> = {
        default: "bg-foreground/20",
        success: "bg-success/40",
        warning: "bg-warning/40",
        destructive: "bg-destructive/40",
        info: "bg-info/40",
    };

    return (
        <div
            className={cn(toastVariants({ variant: toast.variant }), "animate-slide-up flex-col")}
            role="alert"
            aria-live="assertive"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="flex items-start gap-3 w-full">
                {Icon && <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.description && (
                        <p className="text-sm opacity-80 mt-0.5">{toast.description}</p>
                    )}
                    {toast.action && (
                        <button
                            type="button"
                            onClick={toast.action.onClick}
                            className="text-sm font-medium underline underline-offset-2 mt-1 hover:opacity-80 transition-opacity"
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Dismiss notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            {/* Auto-dismiss timer bar */}
            {duration > 0 && (
                <div
                    className="w-full h-0.5 rounded-full overflow-hidden mt-2 bg-foreground/5"
                    aria-hidden="true"
                >
                    <div
                        className={cn(
                            "h-full rounded-full origin-left",
                            timerBarColor[toast.variant ?? "default"]
                        )}
                        style={{
                            animation: `toast-timer ${duration}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export { toastVariants };
