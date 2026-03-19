import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ClientInvoicesPage() {
    const data = await fetchEntityList("client_invoice");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CLIENT_INVOICES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
