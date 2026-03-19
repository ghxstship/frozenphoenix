import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ESignaturesPage() {
    const data = await fetchEntityList("e_signature");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="E_SIGNATURES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
