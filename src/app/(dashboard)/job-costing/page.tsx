"use client";

import { ListPageShell } from "@/components/shells";
import { useJobCostEntries } from "@/lib/supabase/hooks-pages";
import { BarChart3 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "job_costing",
    title: "Job Costing",
    description:
        "Per-project profitability tracking with labor, material, equipment, and subcontractor cost breakdown",
    icon: BarChart3,
    searchKeys: ["name"],
    columns: [
        { id: "date", header: "Date", accessorKey: "date", fieldType: "date" },
        { id: "description", header: "Description", accessorKey: "description" },
        { id: "project", header: "Project", accessorKey: "project" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "vendor_crew", header: "Vendor / Crew", accessorKey: "vendor_crew" },
        { id: "qty", header: "Qty", accessorKey: "qty" },
        { id: "unit_cost", header: "Unit Cost", accessorKey: "unit_cost", fieldType: "currency" },
        { id: "total", header: "Total", accessorKey: "total", fieldType: "currency" },
        { id: "budgeted", header: "Budgeted", accessorKey: "budgeted", fieldType: "currency" },
        { id: "billable", header: "Billable", accessorKey: "billable" },
    ],
};

export default function JobCostingPage() {
    const { data: rawData, isLoading } = useJobCostEntries();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
