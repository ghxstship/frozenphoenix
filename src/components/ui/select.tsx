"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextValue {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
    value: "",
    onValueChange: () => {},
    open: false,
    setOpen: () => {},
});

export function Select({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-select]")) setOpen(false);
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [open]);

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative inline-block" data-select>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const { value } = React.useContext(SelectContext);
    return <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const { open } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div className={cn(
            "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 top-full mt-1",
            className
        )}>
            <div className="p-1">{children}</div>
        </div>
    );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
    const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedValue === value && "bg-accent text-accent-foreground"
            )}
            onClick={() => { onValueChange(value); setOpen(false); }}
        >
            {children}
        </button>
    );
}
