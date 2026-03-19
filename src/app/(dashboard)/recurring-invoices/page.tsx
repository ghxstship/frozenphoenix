import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { RECURRING_INVOICES_PAGE } from "@/config/list-page-configs";

export default async function RecurringInvoicesPage() {
    const data = await fetchEntityList("recurring_invoice");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={RECURRING_INVOICES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
