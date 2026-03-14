"use client";

import { ListPageShell } from "@/components/shells";
import { useProposals } from "@/lib/supabase/hooks-pages";
import { CREATE_PROPOSAL_CONFIG } from "@/config/create-entity-configs";
import { Building2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "proposals",
    title: "Total Proposals",
    description: "conversion rate",
    icon: Building2,
    createConfig: CREATE_PROPOSAL_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function ProposalsPage() {
    const { data: rawData, isLoading } = useProposals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
