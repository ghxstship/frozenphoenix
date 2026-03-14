"use client";

import { ListPageShell } from "@/components/shells";
import { useDigitalAssets } from "@/lib/supabase/hooks-pages";
import { CREATE_DIGITAL_ASSET_CONFIG } from "@/config/create-entity-configs";
import { FileText } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "digital_assets",
    title: "Digital Assets",
    description:
        "Centralized asset library — images, video, documents, audio — with versioning and access control",
    icon: FileText,
    createConfig: CREATE_DIGITAL_ASSET_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function DigitalAssetsPage() {
    const { data: rawData, isLoading } = useDigitalAssets();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
