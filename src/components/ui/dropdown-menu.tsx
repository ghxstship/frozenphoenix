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
    menuId: string;
}>({ open: false, setOpen: () => {}, menuId: "" });

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const reactId = React.useId();
    const menuId = `dropdown-menu-${reactId.replace(/:/g, "")}`;

    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [open]);

    const handleFocusOut = React.useCallback((e: React.FocusEvent) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
        }
    }, []);

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen, menuId }}>
            <div className="relative inline-block" data-dropdown ref={containerRef} onBlur={handleFocusOut}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
    const { open, setOpen, menuId } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(!open);
    };

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case "ArrowDown":
            case "Enter":
            case " ":
                if (!open) {
                    e.preventDefault();
                    setOpen(true);
                }
                break;
            case "Escape":
                if (open) {
                    e.preventDefault();
                    setOpen(false);
                }
                break;
        }
    }, [open, setOpen]);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; onKeyDown?: (e: React.KeyboardEvent) => void; "aria-haspopup"?: string; "aria-expanded"?: boolean; "aria-controls"?: string }>, {
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            "aria-haspopup": "menu",
            "aria-expanded": open,
            "aria-controls": open ? menuId : undefined,
        });
    }

    return (
        <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
        >
            {children}
        </button>
    );
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
    const { open, setOpen, menuId } = React.useContext(DropdownMenuContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open || !contentRef.current) return;
        const firstItem = contentRef.current.querySelector<HTMLElement>("[role='menuitem']");
        firstItem?.focus();
    }, [open]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(
            contentRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])") ?? []
        );
        if (items.length === 0) return;

        const currentIndex = items.indexOf(document.activeElement as HTMLElement);

        switch (e.key) {
            case "ArrowDown": {
                e.preventDefault();
                const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                items[next]?.focus();
                break;
            }
            case "ArrowUp": {
                e.preventDefault();
                const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                items[prev]?.focus();
                break;
            }
            case "Home": {
                e.preventDefault();
                items[0]?.focus();
                break;
            }
            case "End": {
                e.preventDefault();
                items[items.length - 1]?.focus();
                break;
            }
            case "Escape": {
                e.preventDefault();
                setOpen(false);
                break;
            }
        }
    }, [setOpen]);

    if (!open) return null;

    return (
        <div
            ref={contentRef}
            role="menu"
            id={menuId}
            aria-orientation="vertical"
            onKeyDown={handleKeyDown}
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
    return <div role="separator" className="-mx-1 my-1 h-px bg-muted" />;
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
