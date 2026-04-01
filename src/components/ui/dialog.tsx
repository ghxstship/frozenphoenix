"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useSwipeToDismiss } from "@/hooks/use-swipe-to-dismiss";
import { useBreakpoint } from "@/hooks/use-media-query";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 glass-overlay backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = "DialogOverlay";

// ─── Mobile Swipe-to-Dismiss Wrapper ───
// Wraps DialogContent inner div on mobile to enable swipe-down dismiss.
// Uses a controlled close ref to trigger Radix's close machinery.

function MobileSwipeWrapper({
    children,
    closeRef,
}: {
    children: React.ReactNode;
    closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const { bind } = useSwipeToDismiss({
        onDismiss: () => closeRef.current?.click(),
        enabled: true,
    });

    return (
        <div {...bind()} data-swipe-dismiss style={{ touchAction: "pan-x" }}>
            {children}
        </div>
    );
}

const DialogContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
        showClose?: boolean | undefined;
        size?: "sm" | "md" | "lg" | "xl" | "full" | undefined;
    }
>(({ className, children, showClose = true, size = "md", ...props }, ref) => {
    const sizeClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
        full: "sm:max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
    };

    const { isMobile } = useBreakpoint();
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const innerContent = (
        <div
            className={cn(
                "relative w-full",
                "max-h-[calc(100dvh-3rem)] overflow-y-auto",
                "bg-[var(--glass-surface-bg)] backdrop-blur-xl backdrop-saturate-150",
                "border border-[var(--glass-surface-border)]",
                // Mobile: rounded top, full-width bottom-sheet
                "rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
                // Desktop: centered card
                "sm:rounded-xl sm:p-6 sm:pb-6",
                "glass-noise glass-edge-glow",
                // Mobile: slide up from bottom
                "data-[state=open]:slide-in-from-bottom-[10%]",
                "data-[state=closed]:slide-out-to-bottom-[10%]",
                // Desktop: zoom + slide
                "sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95",
                "sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95",
                "sm:data-[state=open]:slide-in-from-top-[2%]",
                "sm:data-[state=closed]:slide-out-to-top-[2%]",
                sizeClasses[size],
                className
            )}
        >
            {/* Mobile drag handle indicator */}
            <div
                className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/20 sm:hidden"
                aria-hidden="true"
            />
            {children}
            {showClose && (
                <DialogPrimitive.Close
                    ref={closeRef}
                    className="absolute right-2 top-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
            )}
            {/* Hidden close trigger for swipe gesture */}
            {!showClose && (
                <DialogPrimitive.Close ref={closeRef} className="hidden" aria-hidden="true" />
            )}
        </div>
    );

    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(
                    // Mobile: bottom-sheet layout
                    "fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end",
                    // Desktop: centered modal layout
                    "sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "duration-200",
                    "overscroll-contain"
                )}
                {...props}
            >
                {isMobile ? (
                    <MobileSwipeWrapper closeRef={closeRef}>{innerContent}</MobileSwipeWrapper>
                ) : (
                    innerContent
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
            className
        )}
        {...props}
    />
);

const DialogTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
