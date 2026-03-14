"use client";

import { ListPageShell } from "@/components/shells";
import { useAllQualityChecks } from "@/lib/supabase/hooks-feature-gaps";
import { CREATE_QUALITY_CHECK_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "quality_checks",
    title: "Quality Checks",
    description: "Inspection checklists, safety verifications, and client sign-off tracking",
    icon: AlertTriangle,
    createConfig: CREATE_QUALITY_CHECK_CONFIG,
    searchKeys: ["title", "projectName"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function QualityChecksPage() {
    const { data: rawData, isLoading } = useAllQualityChecks();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
