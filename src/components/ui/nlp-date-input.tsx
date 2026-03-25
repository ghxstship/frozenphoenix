"use client";

/* ═══════════════════════════════════════════════════════════════
   NLP DATE INPUT — Natural Language Date Input Component (GAP-SCH-01)

   Composable date input with real-time NLP parsing preview.
   As the user types, a human-readable preview of the parsed date
   appears below the input field. On Enter or blur the confirmed
   date is emitted via onDateChange.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { formatParsedPreview, parseNaturalDate } from "@/lib/formatters/nlp-date-parser";
import { CalendarDays, Check, X } from "lucide-react";

export interface NlpDateInputProps {
    /** Current value (text) */
    value?: string | undefined;
    /** Fired when a valid date is confirmed */
    onDateChange?: ((date: Date) => void) | undefined;
    /** Fired when the text value changes */
    onValueChange?: ((value: string) => void) | undefined;
    placeholder?: string | undefined;
    className?: string | undefined;
    disabled?: boolean | undefined;
}

export function NlpDateInput({
    value: externalValue,
    onDateChange,
    onValueChange,
    placeholder = "e.g. next Tuesday at 2pm",
    className,
    disabled = false,
}: NlpDateInputProps) {
    const controlledValue = externalValue ?? "";
    const [localValue, setLocalValue] = useState("");
    const isControlled = externalValue !== undefined;
    const internalValue = isControlled ? controlledValue : localValue;

    const parsed = useMemo(() => parseNaturalDate(internalValue), [internalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setLocalValue(e.target.value);
        onValueChange?.(e.target.value);
    };

    const confirmDate = useCallback(() => {
        if (parsed) {
            onDateChange?.(parsed.date);
        }
    }, [parsed, onDateChange]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                confirmDate();
            }
        },
        [confirmDate]
    );

    const handleBlur = useCallback(() => {
        confirmDate();
    }, [confirmDate]);

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    type="text"
                    value={internalValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-9"
                    aria-label="Date input with natural language support"
                />
                {internalValue && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {parsed ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <X className="h-4 w-4 text-destructive/50" />
                        )}
                    </div>
                )}
            </div>
            {internalValue && parsed && (
                <p className="text-xs text-muted-foreground mt-1 pl-1 motion-safe:animate-fade-in">
                    → {formatParsedPreview(parsed.date, parsed.hasTime)}
                </p>
            )}
            {internalValue && !parsed && internalValue.length > 2 && (
                <p className="text-xs text-destructive/60 mt-1 pl-1">
                    Could not parse date. Try &quot;next Tuesday&quot; or &quot;March 15&quot;
                </p>
            )}
        </div>
    );
}

NlpDateInput.displayName = "NlpDateInput";
