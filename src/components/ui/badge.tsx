"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground",
                secondary: "border-transparent bg-secondary text-secondary-foreground",
                destructive: "border-transparent bg-destructive text-destructive-foreground",
                warning: "border-transparent bg-warning text-warning-foreground",
                success: "border-transparent bg-success text-success-foreground",
                info: "border-transparent bg-info text-info-foreground",
                outline: "text-foreground",
                ghost: "border-transparent bg-muted text-muted-foreground",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    /** When true, badge pulses on content change via key-based re-trigger */
    animate?: boolean | undefined;
}

/**
 * A badge/status indicator component with semantic variants and optional
 * content-change animation.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="destructive">Overdue</Badge>
 * <Badge variant="info" animate>{count}</Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, animate, ...props }, ref) => {
        const [bumpKey, setBumpKey] = React.useState(0);
        const prevChildren = React.useRef(props.children);

        React.useEffect(() => {
            if (animate && prevChildren.current !== props.children) {
                setBumpKey((k) => k + 1);
            }
            prevChildren.current = props.children;
        }, [animate, props.children]);

        return (
            <div
                key={animate ? bumpKey : undefined}
                ref={ref}
                className={cn(
                    badgeVariants({ variant }),
                    animate && bumpKey > 0 && "motion-safe:animate-badge-bump",
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
