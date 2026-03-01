"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
    children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

interface DropdownMenuContentProps {
    children: React.ReactNode;
    align?: "start" | "center" | "end";
    className?: string;
}

interface DropdownMenuItemProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const DropdownMenuContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-dropdown]")) setOpen(false);
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [open]);

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block" data-dropdown>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
    const { open, setOpen } = React.useContext(DropdownMenuContext);
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
            onClick: handleClick,
        });
    }

    return (
        <button
            onClick={handleClick}
            aria-haspopup="menu"
            aria-expanded={open}
        >
            {children}
        </button>
    );
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
    const { open } = React.useContext(DropdownMenuContext);
    if (!open) return null;

    return (
        <div
            role="menu"
            aria-orientation="vertical"
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 -translate-x-1/2",
                "top-full mt-1",
                className
            )}
        >
            {children}
        </div>
    );
}

export function DropdownMenuItem({ children, className, onClick }: DropdownMenuItemProps) {
    const { setOpen } = React.useContext(DropdownMenuContext);
    return (
        <button
            role="menuitem"
            tabIndex={-1}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className
            )}
            onClick={() => {
                onClick?.();
                setOpen(false);
            }}
        >
            {children}
        </button>
    );
}

export function DropdownMenuSeparator() {
    return <div className="-mx-1 my-1 h-px bg-muted" />;
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}>
            {children}
        </div>
    );
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
    return <div role="group">{children}</div>;
}
