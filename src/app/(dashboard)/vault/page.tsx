"use client";

import { ListPageShell } from "@/components/shells";
import { useVaultDocuments } from "@/lib/supabase/hooks";
import { CREATE_VAULT_DOCUMENT_CONFIG } from "@/config/create-entity-configs";
import { Clock } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "vault",
    title: "Secure Document Vault",
    description: "Encrypted storage with expiring view-only links for external stakeholders",
    icon: Clock,
    createConfig: CREATE_VAULT_DOCUMENT_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function VaultPage() {
    const { data: rawData, isLoading } = useVaultDocuments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
