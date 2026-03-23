"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

export interface AuthFormFieldProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "id"
> {
    fieldId: string;
    label: string;
    icon?: LucideIcon | undefined;
    error?: string | undefined;
    description?: string | undefined;
}

export const AuthFormField = React.forwardRef<HTMLInputElement, AuthFormFieldProps>(
    ({ fieldId, label, icon: Icon, error, description, className, required, ...props }, ref) => {
        const errorId = `${fieldId}-error`;
        const descId = `${fieldId}-desc`;
        const hasError = !!error;

        return (
            <div className="space-y-2">
                <label htmlFor={fieldId} className="text-sm font-medium leading-none">
                    {label}
                    {required && (
                        <span className="text-destructive ml-1" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>
                <div className="relative">
                    {Icon && (
                        <Icon
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                            aria-hidden="true"
                        />
                    )}
                    <Input
                        ref={ref}
                        id={fieldId}
                        className={cn(
                            Icon && "pl-10",
                            hasError && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        aria-invalid={hasError || undefined}
                        aria-describedby={
                            [hasError ? errorId : null, description ? descId : null]
                                .filter(Boolean)
                                .join(" ") || undefined
                        }
                        aria-required={required || undefined}
                        required={required}
                        {...props}
                    />
                </div>
                {description && !hasError && (
                    <p id={descId} className="density-caption text-muted-foreground">
                        {description}
                    </p>
                )}
                {hasError && (
                    <p id={errorId} className="text-xs text-destructive" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
AuthFormField.displayName = "AuthFormField";
