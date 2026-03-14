"use client";

import { ListPageShell } from "@/components/shells";
import { useAccounts } from "@/lib/supabase/hooks-pages";
import { CREATE_ACCOUNT_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "accounts",
    title: "Accounts",
    description: "Client relationship health and revenue overview",
    icon: AlertTriangle,
    createConfig: CREATE_ACCOUNT_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function AccountsPage() {
    const { data: rawData, isLoading } = useAccounts();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
