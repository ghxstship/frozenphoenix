import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CLIENT_INVOICES_PAGE } from "@/config/list-page-configs";

export default async function ClientInvoicesPage() {
    const data = await fetchEntityList("client_invoice");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CLIENT_INVOICES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
