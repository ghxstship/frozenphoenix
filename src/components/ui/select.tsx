"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextValue {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    highlightedIndex: number;
    setHighlightedIndex: (index: number) => void;
    optionValues: string[];
    registerOption: (value: string) => void;
    unregisterOption: (value: string) => void;
    listboxId: string;
}

const SelectContext = React.createContext<SelectContextValue>({
    value: "",
    onValueChange: () => {},
    open: false,
    setOpen: () => {},
    highlightedIndex: -1,
    setHighlightedIndex: () => {},
    optionValues: [],
    registerOption: () => {},
    unregisterOption: () => {},
    listboxId: "",
});

export function Select({
    value,
    onValueChange,
    children,
}: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const [optionValues, setOptionValues] = React.useState<string[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const reactId = React.useId();
    const listboxId = `select-listbox-${reactId.replace(/:/g, "")}`;

    const registerOption = React.useCallback((val: string) => {
        setOptionValues((prev) => (prev.includes(val) ? prev : [...prev, val]));
    }, []);
    const unregisterOption = React.useCallback((val: string) => {
        setOptionValues((prev) => prev.filter((v) => v !== val));
    }, []);

    React.useEffect(() => {
        if (!open) {
            setHighlightedIndex(-1);
            return;
        }
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
        <SelectContext.Provider
            value={{
                value,
                onValueChange,
                open,
                setOpen,
                highlightedIndex,
                setHighlightedIndex,
                optionValues,
                registerOption,
                unregisterOption,
                listboxId,
            }}
        >
            <div
                className="relative inline-block"
                data-select
                ref={containerRef}
                onBlur={handleFocusOut}
            >
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({
    children,
    className,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    const {
        open,
        setOpen,
        highlightedIndex,
        setHighlightedIndex,
        optionValues,
        onValueChange,
        listboxId: ctxListboxId,
    } = React.useContext(SelectContext);
    const resolvedListboxId = id ? `${id}-listbox` : ctxListboxId;
    const typeAheadRef = React.useRef("");
    const typeAheadTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    if (!open) {
                        setOpen(true);
                        setHighlightedIndex(0);
                    } else {
                        setHighlightedIndex(
                            Math.min(highlightedIndex + 1, optionValues.length - 1)
                        );
                    }
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    if (!open) {
                        setOpen(true);
                        setHighlightedIndex(optionValues.length - 1);
                    } else {
                        setHighlightedIndex(Math.max(highlightedIndex - 1, 0));
                    }
                    break;
                case "Home":
                    if (open) {
                        e.preventDefault();
                        setHighlightedIndex(0);
                    }
                    break;
                case "End":
                    if (open) {
                        e.preventDefault();
                        setHighlightedIndex(optionValues.length - 1);
                    }
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (open && highlightedIndex >= 0 && optionValues[highlightedIndex]) {
                        onValueChange(optionValues[highlightedIndex]);
                        setOpen(false);
                    } else if (!open) {
                        setOpen(true);
                        setHighlightedIndex(0);
                    }
                    break;
                case "Escape":
                    if (open) {
                        e.preventDefault();
                        setOpen(false);
                    }
                    break;
                default:
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        typeAheadRef.current += e.key.toLowerCase();
                        clearTimeout(typeAheadTimerRef.current);
                        typeAheadTimerRef.current = setTimeout(() => {
                            typeAheadRef.current = "";
                        }, 500);
                        const match = optionValues.findIndex((v) =>
                            v.toLowerCase().startsWith(typeAheadRef.current)
                        );
                        if (match >= 0) {
                            if (!open) setOpen(true);
                            setHighlightedIndex(match);
                        }
                    }
                    break;
            }
        },
        [open, setOpen, highlightedIndex, setHighlightedIndex, optionValues, onValueChange]
    );

    return (
        <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? resolvedListboxId : undefined}
            aria-activedescendant={
                open && highlightedIndex >= 0
                    ? `${resolvedListboxId}-option-${highlightedIndex}`
                    : undefined
            }
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
            }}
            onKeyDown={handleKeyDown}
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

export function SelectContent({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { open, listboxId } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div
            role="listbox"
            id={listboxId}
            className={cn(
                "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 top-full mt-1",
                className
            )}
        >
            <div className="p-1">{children}</div>
        </div>
    );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
    const {
        value: selectedValue,
        onValueChange,
        setOpen,
        highlightedIndex,
        setHighlightedIndex,
        optionValues,
        registerOption,
        unregisterOption,
        listboxId,
    } = React.useContext(SelectContext);
    const index = optionValues.indexOf(value);
    const isHighlighted = index >= 0 && index === highlightedIndex;

    React.useEffect(() => {
        registerOption(value);
        return () => unregisterOption(value);
    }, [value, registerOption, unregisterOption]);

    return (
        <div
            role="option"
            id={`${listboxId}-option-${index}`}
            aria-selected={selectedValue === value}
            data-highlighted={isHighlighted || undefined}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedValue === value && "bg-accent text-accent-foreground",
                isHighlighted && "bg-accent text-accent-foreground"
            )}
            onClick={() => {
                onValueChange(value);
                setOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
        >
            {children}
        </div>
    );
}
