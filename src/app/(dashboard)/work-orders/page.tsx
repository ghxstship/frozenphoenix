"use client";

import { ListPageShell } from "@/components/shells";
import { useWorkOrders } from "@/lib/supabase/hooks-pages";
import { CREATE_WORK_ORDER_CONFIG } from "@/config/create-entity-configs";
import { Calendar } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "work_orders",
    title: "Work Orders",
    description: "Dispatch, assign, and track all vendor and crew work orders across projects",
    icon: Calendar,
    createConfig: CREATE_WORK_ORDER_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "number", header: "Number", accessorKey: "number" },
        { id: "title", header: "Title", accessorKey: "title" },
        { id: "project", header: "Project", accessorKey: "project" },
        { id: "vendor", header: "Vendor", accessorKey: "vendor" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "priority", header: "Priority", accessorKey: "priority" },
        { id: "est_cost", header: "Est. Cost", accessorKey: "est_cost", fieldType: "currency" },
        { id: "scheduled", header: "Scheduled", accessorKey: "scheduled" },
    ],
};

export default function WorkOrdersPage() {
    const { data: rawData, isLoading } = useWorkOrders();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
