"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";

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
    return (
        <div className={cn("animate-fade-in max-w-3xl", className)}>
            {/* Back Link */}
            <Link
                href={backHref}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
                <ChevronLeft className="h-4 w-4" />
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
            <form onSubmit={onSubmit}>
                <div className="space-y-6">
                    {children}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
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
            </form>
        </div>
    );
}

export interface FormSectionProps {
    title: string;
    description?: string;
    className?: string;
    children: React.ReactNode;
}

export function FormSection({
    title,
    description,
    className,
    children,
}: FormSectionProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}
