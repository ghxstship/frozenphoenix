"use client";

import { ListPageShell } from "@/components/shells";
import { useIpRights } from "@/lib/supabase/hooks-pages";
import { CREATE_IP_RIGHT_CONFIG } from "@/config/create-entity-configs";
import { Fingerprint } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "ip_rights",
    title: "IP & Usage Rights",
    description:
        "Intellectual property ownership, licensing terms, and usage rights tracking across all contracts",
    icon: Fingerprint,
    createConfig: CREATE_IP_RIGHT_CONFIG,
    searchKeys: ["asset_description", "asset_type"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function IPRightsPage() {
    const { data: rawData, isLoading } = useIpRights();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
