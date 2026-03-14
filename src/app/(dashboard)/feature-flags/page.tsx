"use client";

import { ListPageShell } from "@/components/shells";
import { useFeatureFlags } from "@/lib/settings/hooks";
import { Flag } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "feature_flags",
    title: "Feature Flags",
    description: "Control feature rollout across organizations, roles, and users",
    icon: Flag,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function FeatureFlagsPage() {
    const { data: rawData, isLoading } = useFeatureFlags();
    const data = (rawData ?? []) as unknown as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
