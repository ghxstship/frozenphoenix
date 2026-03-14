"use client";

import { ListPageShell } from "@/components/shells";
import { useContracts } from "@/lib/supabase/hooks";
import { CREATE_CONTRACT_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "contracts",
    title: "Contract Management",
    description: "Track contracts, NDAs, SOWs, and amendments across all projects",
    icon: AlertTriangle,
    createConfig: CREATE_CONTRACT_CONFIG,
    searchKeys: ["title", "contractNumber"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

export default function ContractsPage() {
    const { data: rawData, isLoading } = useContracts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
