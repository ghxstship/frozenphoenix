import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LEGAL_HOLDS_PAGE } from "@/config/list-page-configs";

export default async function LegalHoldsPage() {
    const data = await fetchEntityList("legal_hold");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LEGAL_HOLDS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
