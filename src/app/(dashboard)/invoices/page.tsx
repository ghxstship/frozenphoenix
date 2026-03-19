import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { INVOICES_PAGE } from "@/config/list-page-configs";

export default async function InvoicesPage() {
    const data = await fetchEntityList("invoice");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INVOICES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
