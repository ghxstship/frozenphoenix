"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { INTERACTION_TIMING } from "@/config/design-tokens";

export interface SearchInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
    value: string;
    onValueChange: (value: string) => void;
    debounce?: number;
    showClear?: boolean;
    size?: "sm" | "md" | "lg";
}

export function SearchInput({
    value,
    onValueChange,
    debounce = INTERACTION_TIMING.debounceSearch,
    showClear = true,
    size = "md",
    placeholder = "Search...",
    className,
    ...props
}: SearchInputProps) {
    const [localValue, setLocalValue] = React.useState(value);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setLocalValue(newValue);

            if (timerRef.current) clearTimeout(timerRef.current);

            if (debounce > 0) {
                timerRef.current = setTimeout(() => {
                    onValueChange(newValue);
                }, debounce);
            } else {
                onValueChange(newValue);
            }
        },
        [debounce, onValueChange]
    );

    const handleClear = React.useCallback(() => {
        setLocalValue("");
        onValueChange("");
        if (timerRef.current) clearTimeout(timerRef.current);
    }, [onValueChange]);

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const sizeClasses = {
        sm: "h-8 text-xs pl-8 pr-7",
        md: "h-9 text-sm pl-9 pr-8",
        lg: "h-11 text-base pl-10 pr-9",
    };

    const iconSizes = {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    const iconPositions = {
        sm: "left-2.5 top-[9px]",
        md: "left-3 top-[10px]",
        lg: "left-3 top-3",
    };

    const inputRef = React.useRef<HTMLInputElement>(null);
    const showHint = !localValue && size !== "sm";

    return (
        <div className={cn("relative group", className)}>
            <Search
                className={cn(
                    "absolute text-muted-foreground pointer-events-none transition-colors group-focus-within:text-foreground/70",
                    iconSizes[size],
                    iconPositions[size]
                )}
            />
            <input
                ref={inputRef}
                type="search"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={cn(
                    "w-full rounded-lg border border-input bg-background ring-offset-background",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all",
                    sizeClasses[size]
                )}
                aria-label={placeholder}
                {...props}
            />
            {showHint && (
                <kbd
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground/60 font-mono"
                    aria-hidden="true"
                >
                    ⌘K
                </kbd>
            )}
            {showClear && localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm",
                        size === "sm" ? "right-2" : size === "lg" ? "right-3" : "right-2.5"
                    )}
                    aria-label="Clear search"
                >
                    <X className={iconSizes[size]} />
                </button>
            )}
        </div>
    );
}
