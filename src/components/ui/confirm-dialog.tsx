"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useEscapeKey, useFocusReturn, useFocusTrap } from "@/hooks/use-accessibility";
import { AnimatePresence, motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "destructive" | "default";
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
                    <div className="fixed inset-0 z-[150] flex items-center justify-center">
                        <motion.div
                            className="absolute inset-0 glass-overlay backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
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

    return (
        <motion.div
            ref={trapRef as React.RefObject<HTMLDivElement>}
            className="relative bg-[var(--glass-surface-bg)] backdrop-blur-xl backdrop-saturate-150 border border-[var(--glass-surface-border)] rounded-xl p-6 max-w-sm w-full mx-4 glass-noise glass-edge-glow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
        >
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
            <div className="flex gap-2 justify-end mt-6">
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
