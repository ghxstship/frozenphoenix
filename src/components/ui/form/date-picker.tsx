"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export type DatePickerProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className="relative">
                <input
                    ref={ref}
                    type="date"
                    className={cn(
                        "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "pr-10",
                        className
                    )}
                    {...props}
                />
                <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
        );
    }
);
DatePicker.displayName = "DatePicker";
