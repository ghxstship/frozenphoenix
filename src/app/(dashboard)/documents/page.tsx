import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function DocumentsPage() {
    const data = await fetchEntityList("document");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="DOCUMENTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
