"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
                success:
                    "data-[state=checked]:bg-success data-[state=unchecked]:bg-input",
                destructive:
                    "data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input",
            },
            size: {
                sm: "h-5 w-9",
                md: "h-6 w-11",
                lg: "h-7 w-[52px]",
            },
        },
        defaultVariants: { variant: "default", size: "md" },
    }
);

const thumbVariants = cva(
    "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
    {
        variants: {
            size: {
                sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
                md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
                lg: "h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0",
            },
        },
        defaultVariants: { size: "md" },
    }
);

export interface ToggleProps
    extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
        VariantProps<typeof toggleVariants> {}

const Toggle = React.forwardRef<
    React.ComponentRef<typeof SwitchPrimitive.Root>,
    ToggleProps
>(({ className, variant, size, ...props }, ref) => (
    <SwitchPrimitive.Root
        className={cn(toggleVariants({ variant, size, className }))}
        ref={ref}
        {...props}
    >
        <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }))} />
    </SwitchPrimitive.Root>
));
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
