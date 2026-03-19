import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { INVOICE_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default async function InvoiceTemplatesPage() {
    const data = await fetchEntityList("invoice_template");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INVOICE_TEMPLATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
