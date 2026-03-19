import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function DispatchPage() {
    const data = await fetchEntityList("dispatch_entry");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="DISPATCH_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
