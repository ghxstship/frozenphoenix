import * as React from "react";
import { cn } from "@/lib/utils";

const NativeSelect = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }
>(({ className, error, children, ...props }, ref) => {
    return (
        <select
            aria-invalid={error || undefined}
            className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-base sm:text-sm shadow-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-destructive focus-visible:ring-destructive",
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </select>
    );
});
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
