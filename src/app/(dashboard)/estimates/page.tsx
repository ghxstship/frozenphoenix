"use client";

import { ListPageShell } from "@/components/shells";
import { useEstimates } from "@/lib/supabase/hooks-pages";
import { CREATE_ESTIMATE_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "estimates",
    title: "Estimates",
    description:
        "Client-facing estimates and quotes with e-signature support and project conversion",
    icon: CheckCircle2,
    createConfig: CREATE_ESTIMATE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "number", header: "Number", accessorKey: "number" },
        { id: "title", header: "Title", accessorKey: "title" },
        { id: "client", header: "Client", accessorKey: "client" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "total", header: "Total", accessorKey: "total", fieldType: "currency" },
        { id: "valid_until", header: "Valid Until", accessorKey: "valid_until" },
        { id: "created", header: "Created", accessorKey: "created", fieldType: "date" },
    ],
    exportable: true,
};

export default function EstimatesPage() {
    const { data: rawData, isLoading } = useEstimates();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
