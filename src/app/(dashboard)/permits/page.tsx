"use client";

import { ListPageShell } from "@/components/shells";
import { usePermits } from "@/lib/supabase/hooks-pages";
import { CREATE_PERMIT_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "permits",
    title: "Permits & Licenses",
    description:
        "Track permits, licenses, and regulatory approvals across all jurisdictions and entities",
    icon: AlertTriangle,
    createConfig: CREATE_PERMIT_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "permit", header: "Permit", accessorKey: "permit" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "jurisdiction", header: "Jurisdiction", accessorKey: "jurisdiction" },
        { id: "entity", header: "Entity", accessorKey: "entity" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "expiry", header: "Expiry", accessorKey: "expiry", fieldType: "date" },
        { id: "cost", header: "Cost", accessorKey: "cost", fieldType: "currency" },
    ],
};

export default function PermitsPage() {
    const { data: rawData, isLoading } = usePermits();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
