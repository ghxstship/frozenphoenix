"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
    value?: number;
    onChange?: (value: number | undefined) => void;
    currency?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onChange, currency = "USD", ...props }, ref) => {
        const currencySymbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
        const [displayValue, setDisplayValue] = useState(
            value !== undefined ? formatCurrency(value) : ""
        );

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            setDisplayValue(raw);
            
            const numValue = parseFloat(raw);
            if (!isNaN(numValue)) {
                onChange?.(numValue);
            } else if (raw === "") {
                onChange?.(undefined);
            }
        }, [onChange]);

        const handleBlur = useCallback(() => {
            if (value !== undefined) {
                setDisplayValue(formatCurrency(value));
            }
        }, [value]);

        return (
            <div className="relative">
                <span className="absolute left-2.5 top-2 text-sm text-muted-foreground pointer-events-none">{currencySymbol}</span>
                <input
                    ref={ref}
                    type="text"
                    inputMode="decimal"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                        "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "pl-8",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);
CurrencyInput.displayName = "CurrencyInput";

function formatCurrency(value: number): string {
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}
