"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SplitLayoutProps {
    list: React.ReactNode;
    detail: React.ReactNode;
    listWidth?: number;
    showDetail?: boolean;
    onBack?: () => void;
    className?: string;
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
                    "shrink-0 overflow-y-auto border-r border-border transition-all duration-300",
                    showDetail
                        ? "hidden lg:block"
                        : "w-full lg:w-auto border-r-0 lg:border-r"
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
                    className="flex-1 overflow-y-auto animate-fade-in"
                    role="region"
                    aria-label="Detail panel"
                >
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="lg:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 pt-3 pb-1"
                            aria-label="Back to list"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    )}
                    <div className="p-4 lg:pl-4">
                        {detail}
                    </div>
                </div>
            )}
        </div>
    );
}
