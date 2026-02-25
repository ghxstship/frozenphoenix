"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SplitLayoutProps {
    list: React.ReactNode;
    detail: React.ReactNode;
    listWidth?: number;
    showDetail?: boolean;
    className?: string;
}

export function SplitLayout({
    list,
    detail,
    listWidth = 320,
    showDetail = true,
    className,
}: SplitLayoutProps) {
    return (
        <div className={cn("flex h-[calc(100vh-8rem)] gap-4", className)}>
            {/* List Panel */}
            <div
                className={cn(
                    "shrink-0 overflow-y-auto border-r border-border pr-4",
                    !showDetail && "flex-1 border-r-0 pr-0"
                )}
                style={{ width: showDetail ? listWidth : "100%" }}
            >
                {list}
            </div>

            {/* Detail Panel */}
            {showDetail && (
                <div className="flex-1 overflow-y-auto">
                    {detail}
                </div>
            )}
        </div>
    );
}
