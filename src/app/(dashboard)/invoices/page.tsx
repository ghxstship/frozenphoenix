import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function InvoicesPage() {
    const data = await fetchEntityList("invoice");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="INVOICES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
