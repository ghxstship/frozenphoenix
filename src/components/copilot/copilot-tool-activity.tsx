"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2, Wrench } from "lucide-react";

interface CopilotToolActivityProps {
    name: string;
    status: "pending" | "done";
    className?: string;
}

const TOOL_LABELS: Record<string, string> = {
    query_projects: "Searching projects",
    query_tasks: "Looking up tasks",
    query_budgets: "Checking budgets",
    query_crew: "Finding crew members",
    query_events: "Searching events",
    query_invoices: "Looking up invoices",
    query_vendors: "Searching vendors",
    query_assets: "Checking assets",
    search_knowledge_base: "Searching knowledge base",
    generate_document: "Generating document",
    generate_summary: "Generating summary",
    calculate_budget_variance: "Calculating variance",
    navigate_to: "Finding page",
};

export function CopilotToolActivity({ name, status, className }: CopilotToolActivityProps) {
    const label = TOOL_LABELS[name] ?? name.replace(/_/g, " ");

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs",
                "bg-secondary/40 text-muted-foreground",
                "animate-in fade-in slide-in-from-bottom-1 duration-200",
                className
            )}
            role="status"
            aria-label={`Tool ${name} ${status === "pending" ? "running" : "complete"}`}
        >
            {status === "pending" ? (
                <Loader2 className="h-3 w-3 motion-safe:animate-spin shrink-0" />
            ) : (
                <Check className="h-3 w-3 text-green-500 shrink-0" />
            )}
            <Wrench className="h-3 w-3 shrink-0" />
            <span className="truncate">
                {label}
                {status === "pending" ? "…" : ""}
            </span>
        </div>
    );
}
