"use client";

import { ListPageShell } from "@/components/shells";
import { useTemplates } from "@/lib/supabase/hooks-pages";
import { CREATE_TEMPLATE_CONFIG } from "@/config/create-entity-configs";
import { Clock } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "templates",
    title: "Document Templates",
    description: "Reusable templates for proposals, contracts, invoices, call sheets, and more",
    icon: Clock,
    createConfig: CREATE_TEMPLATE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function TemplatesPage() {
    const { data: rawData, isLoading } = useTemplates();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
