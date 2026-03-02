"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string = string> {
    value: T;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    labelHidden?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
    options: SegmentedControlOption<T>[];
    value: T;
    onValueChange: (value: T) => void;
    ariaLabel?: string;
    size?: "sm" | "md";
    className?: string;
}

export function SegmentedControl<T extends string = string>({
    options,
    value,
    onValueChange,
    ariaLabel,
    size = "md",
    className,
}: SegmentedControlProps<T>) {
    const groupRef = React.useRef<HTMLDivElement>(null);

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            const enabledButtons = Array.from(
                groupRef.current?.querySelectorAll<HTMLButtonElement>(
                    "[role='radio']:not([disabled])"
                ) ?? []
            );
            if (enabledButtons.length === 0) return;

            const currentIndex = enabledButtons.findIndex(
                (button) => button.dataset.value === value
            );
            let nextIndex = currentIndex;

            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    event.preventDefault();
                    nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % enabledButtons.length;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    event.preventDefault();
                    nextIndex =
                        currentIndex < 0
                            ? 0
                            : (currentIndex - 1 + enabledButtons.length) % enabledButtons.length;
                    break;
                case "Home":
                    event.preventDefault();
                    nextIndex = 0;
                    break;
                case "End":
                    event.preventDefault();
                    nextIndex = enabledButtons.length - 1;
                    break;
                default:
                    return;
            }

            const next = enabledButtons[nextIndex];
            const nextValue = next?.dataset.value as T | undefined;
            if (!next || !nextValue) return;

            onValueChange(nextValue);
            next.focus();
        },
        [onValueChange, value]
    );

    return (
        <div
            ref={groupRef}
            role="radiogroup"
            aria-label={ariaLabel ?? "Selection"}
            onKeyDown={handleKeyDown}
            className={cn(
                "inline-flex items-center rounded-lg border border-border bg-card p-0.5",
                className
            )}
        >
            {options.map((option) => {
                const selected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={option.label}
                        data-value={option.value}
                        disabled={option.disabled}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onValueChange(option.value)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:pointer-events-none disabled:opacity-50",
                            size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
                            selected
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {option.icon}
                        {option.labelHidden ? (
                            <span className="sr-only">{option.label}</span>
                        ) : (
                            <span>{option.label}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
