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
    const reactId = React.useId();
    const fieldId = htmlFor ?? `field-${reactId.replace(/:/g, "")}`;
    const errorId = error ? `${fieldId}-error` : undefined;
    const descriptionId = description && !error ? `${fieldId}-desc` : undefined;
    const describedBy = [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

    return (
        <div className={cn("space-y-2", className)}>
            <label
                htmlFor={fieldId}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {React.Children.map(children, (child) => {
                if (React.isValidElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>(child)) {
                    return React.cloneElement(child, {
                        id: child.props.id ?? fieldId,
                        "aria-describedby": child.props["aria-describedby"] ?? describedBy,
                        ...(error ? { "aria-invalid": true } : {}),
                    });
                }
                return child;
            })}
            {description && !error && (
                <p id={descriptionId} className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
                <p id={errorId} className="text-xs text-destructive" role="alert">{error}</p>
            )}
        </div>
    );
}
