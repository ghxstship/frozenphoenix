"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { useEscapeKey, useFocusReturn, useFocusTrap } from "@/hooks/use-accessibility";
import { AnimatePresence, motion, MOTION_TOKENS } from "@/lib/motion";
import { SPRING_PRESETS } from "@/config/design-tokens";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useSwipeToDismiss } from "@/hooks/use-swipe-to-dismiss";
import { useBreakpoint } from "@/hooks/use-media-query";

interface ConfirmOptions {
    title: string;
    description: string;
    confirmLabel?: string | undefined;
    cancelLabel?: string | undefined;
    variant?: "destructive" | "default" | undefined;
}

interface ConfirmContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
    confirm: () => Promise.resolve(false),
});

export function useConfirm() {
    return useContext(ConfirmContext);
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{
        open: boolean;
        options: ConfirmOptions;
        resolve: ((value: boolean) => void) | null;
    }>({
        open: false,
        options: { title: "", description: "" },
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({ open: true, options, resolve });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve?.(true);
        setState((s) => ({ ...s, open: false, resolve: null }));
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState((s) => ({ ...s, open: false, resolve: null }));
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {state.open && (
                    <div className="fixed inset-0 z-[var(--z-confirm)] flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center">
                        <motion.div
                            className="absolute inset-0 glass-overlay backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={MOTION_TOKENS.preset.overlay.transition}
                            onClick={handleCancel}
                            aria-hidden="true"
                        />
                        <ConfirmDialogContent
                            options={state.options}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                        />
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
}

function ConfirmDialogContent({
    options,
    onConfirm,
    onCancel,
}: {
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const trapRef = useFocusTrap(true);
    useFocusReturn();
    useEscapeKey(onCancel);

    const { isMobile } = useBreakpoint();
    const containerRef = useRef<HTMLDivElement>(null);

    const { bind } = useSwipeToDismiss({
        onDismiss: onCancel,
        enabled: isMobile,
    });

    return (
        <motion.div
            ref={trapRef as React.RefObject<HTMLDivElement>}
            className="relative bg-[var(--glass-surface-bg)] backdrop-blur-xl backdrop-saturate-150 border border-[var(--glass-surface-border)] rounded-t-2xl sm:rounded-xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:p-6 sm:pb-6 max-w-sm w-full sm:mx-4 glass-noise glass-edge-glow overscroll-contain"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", ...SPRING_PRESETS.snappy }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
        >
            {/* Swipe-to-dismiss touch target — covers drag handle + header area */}
            <div ref={containerRef} data-swipe-dismiss {...bind()} style={{ touchAction: "pan-x" }}>
                {/* Mobile drag handle */}
                <div
                    className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/20 sm:hidden"
                    aria-hidden="true"
                />
            </div>
            {options.variant === "destructive" && (
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
            )}
            <h2 id="confirm-title" className="text-base font-bold">
                {options.title}
            </h2>
            <p id="confirm-desc" className="text-sm text-muted-foreground mt-2">
                {options.description}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    {options.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                    variant={options.variant === "destructive" ? "destructive" : "default"}
                    size="sm"
                    onClick={onConfirm}
                    autoFocus
                >
                    {options.confirmLabel ?? "Confirm"}
                </Button>
            </div>
        </motion.div>
    );
}
