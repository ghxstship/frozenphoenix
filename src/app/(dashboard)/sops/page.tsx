"use client";

import { ListPageShell } from "@/components/shells";
import { useSOPs } from "@/lib/supabase/hooks";
import { CREATE_SOP_CONFIG } from "@/config/create-entity-configs";
import { BookOpen } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "sops",
    title: "Standard Operating Procedures",
    description: "Role-based SOPs for instant onboarding and compliance",
    icon: BookOpen,
    createConfig: CREATE_SOP_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function SOPsPage() {
    const { data: rawData, isLoading } = useSOPs();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
