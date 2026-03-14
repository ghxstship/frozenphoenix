"use client";

import { ListPageShell } from "@/components/shells";
import { useCreativeAssets } from "@/lib/supabase/hooks-pages";
import { CREATE_ASSET_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "creative_assets",
    title: "Creative Assets",
    description: "Campaign asset production, review workflow, and brand compliance tracking",
    icon: CheckCircle2,
    createConfig: CREATE_ASSET_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function CreativeAssetsPage() {
    const { data: rawData, isLoading } = useCreativeAssets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
