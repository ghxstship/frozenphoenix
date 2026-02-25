"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface RadioGroupContextValue {
    value: string;
    onValueChange: (value: string) => void;
    name?: string;
    disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({
    value: "",
    onValueChange: () => {},
});

export interface RadioGroupProps {
    value: string;
    onValueChange: (value: string) => void;
    name?: string;
    disabled?: boolean;
    orientation?: "horizontal" | "vertical";
    className?: string;
    children: React.ReactNode;
}

export function RadioGroup({
    value,
    onValueChange,
    name,
    disabled,
    orientation = "vertical",
    className,
    children,
}: RadioGroupProps) {
    return (
        <RadioGroupContext.Provider value={{ value, onValueChange, name, disabled }}>
            <div
                role="radiogroup"
                aria-orientation={orientation}
                className={cn(
                    "grid gap-2",
                    orientation === "horizontal" && "grid-flow-col auto-cols-max",
                    className
                )}
            >
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
}

export interface RadioGroupItemProps {
    value: string;
    id?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function RadioGroupItem({
    value,
    id,
    disabled: itemDisabled,
    className,
}: RadioGroupItemProps) {
    const { value: selectedValue, onValueChange, name, disabled: groupDisabled } =
        React.useContext(RadioGroupContext);
    const isChecked = selectedValue === value;
    const isDisabled = itemDisabled || groupDisabled;

    return (
        <button
            type="button"
            role="radio"
            aria-checked={isChecked}
            id={id}
            name={name}
            disabled={isDisabled}
            onClick={() => !isDisabled && onValueChange(value)}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-input text-primary ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-colors",
                isChecked && "border-primary",
                className
            )}
        >
            {isChecked && (
                <span className="flex items-center justify-center">
                    <Circle className="h-2.5 w-2.5 fill-current text-current" />
                </span>
            )}
        </button>
    );
}
