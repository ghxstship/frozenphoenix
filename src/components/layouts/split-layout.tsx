"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export interface SplitLayoutProps {
    list: React.ReactNode;
    detail: React.ReactNode;
    listWidth?: number | undefined;
    showDetail?: boolean | undefined;
    onBack?: (() => void) | undefined;
    className?: string | undefined;
}

export function SplitLayout({
    list,
    detail,
    listWidth = 320,
    showDetail = true,
    onBack,
    className,
}: SplitLayoutProps) {
    return (
        <div className={cn("flex h-[calc(100vh-8rem)]", className)}>
            {/* List Panel — hidden on mobile when detail is shown */}
            <div
                className={cn(
                    "shrink-0 overflow-y-auto border-r border-border transition-[width,opacity] duration-slow",
                    showDetail ? "hidden lg:block" : "w-full lg:w-auto border-r-0 lg:border-r"
                )}
                style={{ width: showDetail ? listWidth : undefined }}
                role="region"
                aria-label="List panel"
            >
                {list}
            </div>

            {/* Detail Panel — full width on mobile */}
            {showDetail && (
                <div
                    className="flex-1 overflow-y-auto motion-safe:animate-fade-in"
                    role="region"
                    aria-label="Detail panel"
                >
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="lg:hidden gap-1 px-4 pt-3 pb-1 h-auto text-muted-foreground"
                            aria-label="Back to list"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            Back
                        </Button>
                    )}
                    <div className="p-4 lg:pl-4">{detail}</div>
                </div>
            )}
        </div>
    );
}
