"use client";

import { ListPageShell } from "@/components/shells";
import { useDispatch } from "@/lib/supabase/hooks-pages";
import { CREATE_DISPATCH_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "dispatch",
    title: "Dispatch Board",
    description: "Real-time crew and vendor dispatch tracking across all active work orders",
    icon: CheckCircle2,
    createConfig: CREATE_DISPATCH_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function DispatchPage() {
    const { data: rawData, isLoading } = useDispatch();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
