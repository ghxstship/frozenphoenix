"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-media-query";

interface AnimatedCheckboxProps {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export function AnimatedCheckbox({
    checked,
    onChange,
    label,
    disabled = false,
    className,
    id,
}: AnimatedCheckboxProps) {
    const reducedMotion = useReducedMotion();
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
        <label
            htmlFor={inputId}
            className={cn(
                "inline-flex items-center gap-2 cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <div className="relative">
                <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                    aria-checked={checked}
                />
                <div
                    className={cn(
                        "h-[18px] w-[18px] rounded border-2 flex items-center justify-center transition-colors duration-150",
                        checked
                            ? "bg-primary border-primary"
                            : "bg-transparent border-muted-foreground/30 peer-hover:border-muted-foreground/50",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
                    )}
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className={cn(
                            "h-3 w-3 text-primary-foreground",
                            checked ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                    >
                        <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pathLength="1"
                            className={cn(
                                !reducedMotion &&
                                    checked &&
                                    "animate-[checkmarkDraw_250ms_ease-out_forwards]"
                            )}
                            style={{
                                strokeDasharray: 1,
                                strokeDashoffset:
                                    !reducedMotion && checked ? undefined : checked ? 0 : 1,
                            }}
                        />
                    </svg>
                </div>
            </div>
            {label && <span className="text-sm">{label}</span>}
        </label>
    );
}
