import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { RFQS_PAGE } from "@/config/list-page-configs";

export default async function RfqsPage() {
    const data = await fetchEntityList("rfq");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={RFQS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
