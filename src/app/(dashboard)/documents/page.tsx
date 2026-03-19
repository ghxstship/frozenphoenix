import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default async function DocumentsPage() {
    const data = await fetchEntityList("document");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={DOCUMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
