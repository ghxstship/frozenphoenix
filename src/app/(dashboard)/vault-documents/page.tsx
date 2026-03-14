"use client";

import { ListPageShell } from "@/components/shells";
import { VAULT_DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default function VaultDocumentsPage() {
    return <ListPageShell config={VAULT_DOCUMENTS_PAGE} />;
}
