import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function PaymentsPage() {
    const data = await fetchEntityList("payment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PAYMENTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
