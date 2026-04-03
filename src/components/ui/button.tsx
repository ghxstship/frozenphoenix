import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98]",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
                outline:
                    "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
                ghost: "hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]",
                link: "text-primary underline-offset-4 hover:underline active:opacity-80",
                glow: "bg-primary text-primary-foreground shadow-sm hover:shadow-lg motion-safe:animate-pulse-glow",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-11 rounded-lg px-8",
                xl: "h-12 rounded-xl px-10 text-base",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: { variant: "default", size: "default" },
    }
);

/**
 * A button component with multiple variants, sizes, and loading state.
 *
 * @example
 * ```tsx
 * <Button variant="default" size="sm" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * <Button variant="destructive" loading={isDeleting}>
 *   Delete Project
 * </Button>
 *
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 */
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    /** Merge behavior onto child element instead of rendering a wrapper. */
    asChild?: boolean | undefined;
    /** Show a loading spinner, disable interaction, and preserve button width. */
    loading?: boolean | undefined;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
                {...props}
            >
                {loading && <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />}
                {children}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
