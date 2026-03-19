import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function LegalHoldsPage() {
    const data = await fetchEntityList("legal_hold");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="LEGAL_HOLDS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
