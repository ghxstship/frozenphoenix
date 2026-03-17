"use client";

import { ListPageShell } from "@/components/shells";
import { useVaultDocuments } from "@/lib/supabase";
import { VAULT_DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default function VaultPage() {
    const { data: rawData, isLoading } = useVaultDocuments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={VAULT_DOCUMENTS_PAGE} data={data} isLoading={isLoading} />;
}
