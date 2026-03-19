import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { VAULT_DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default async function VaultPage() {
    const data = await fetchEntityList("vault_document");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VAULT_DOCUMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
