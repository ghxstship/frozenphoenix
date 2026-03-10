"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";

export interface FormSectionConfig {
    id: string;
    title: string;
    description?: string;
}

export interface FormLayoutProps {
    backHref: string;
    backLabel?: string;
    title: string;
    description?: string;
    sections?: FormSectionConfig[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    isValid?: boolean;
    className?: string;
    children: React.ReactNode;
}

export function FormLayout({
    backHref,
    backLabel = "Back",
    title,
    description,
    onSubmit,
    onCancel,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    isSubmitting = false,
    isValid = true,
    className,
    children,
}: FormLayoutProps) {
    const formRef = useRef<HTMLFormElement>(null);

    // Ctrl/Cmd+S to submit
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                if (isValid && !isSubmitting) {
                    formRef.current?.requestSubmit();
                }
            }
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isValid, isSubmitting]);

    return (
        <div className={cn("animate-fade-in max-w-3xl", className)}>
            {/* Back Link */}
            <Link
                href={backHref}
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                aria-label={`Go back to ${backLabel}`}
            >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                {backLabel}
            </Link>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={onSubmit}>
                <div className="space-y-6">
                    {children}
                </div>

                {/* Actions — sticky on scroll */}
                <div className="flex items-center justify-between gap-3 mt-8 pt-4 pb-2 border-t border-border sticky bottom-0 bg-background/95 backdrop-blur-sm z-10">
                    <div className="text-xs text-muted-foreground/50 hidden sm:block" aria-hidden="true">
                        <kbd className="bg-muted px-1 py-0.5 rounded text-[10px]">⌘S</kbd> to save
                    </div>
                    <span className="sr-only">Press Command+S or Control+S to save</span>
                    <div className="flex items-center gap-3 ml-auto">
                        {onCancel ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                {cancelLabel}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                disabled={isSubmitting}
                            >
                                <Link href={backHref}>{cancelLabel}</Link>
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValid}
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export interface FormSectionProps {
    title: string;
    description?: string;
    collapsible?: boolean;
    defaultOpen?: boolean;
    className?: string;
    children: React.ReactNode;
}

export function FormSection({
    title,
    description,
    collapsible = false,
    defaultOpen = true,
    className,
    children,
}: FormSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentId = React.useId();

    return (
        <Card className={cn("transition-shadow hover:shadow-sm", className)}>
            <CardHeader className="pb-3">
                {collapsible ? (
                    <button
                        type="button"
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                    >
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                isOpen && "rotate-180"
                            )}
                            aria-hidden="true"
                        />
                    </button>
                ) : (
                    <CardTitle className="text-lg">{title}</CardTitle>
                )}
                {description && isOpen && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                )}
            </CardHeader>
            {isOpen && (
                <CardContent id={contentId} className="space-y-4">
                    {children}
                </CardContent>
            )}
        </Card>
    );
}
