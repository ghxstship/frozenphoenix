import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function DocumentVersionsPage() {
    const data = await fetchEntityList("document_version");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="DOCUMENT_VERSIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
