"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
    label: string;
    htmlFor?: string;
    description?: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

export function FormField({
    label,
    htmlFor,
    description,
    error,
    required,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <label
                htmlFor={htmlFor}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {children}
            {description && !error && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    );
}
