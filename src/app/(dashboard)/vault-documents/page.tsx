import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function VaultDocumentsPage() {
    const data = await fetchEntityList("vault_document");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="VAULT_DOCUMENTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
