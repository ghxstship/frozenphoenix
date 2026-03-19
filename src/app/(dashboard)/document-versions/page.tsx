import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { DOCUMENT_VERSIONS_PAGE } from "@/config/list-page-configs";

export default async function DocumentVersionsPage() {
    const data = await fetchEntityList("document_version");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={DOCUMENT_VERSIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
