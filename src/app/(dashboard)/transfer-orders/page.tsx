import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TRANSFER_ORDERS_PAGE } from "@/config/list-page-configs";

export default async function TransferOrdersPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TRANSFER_ORDERS_PAGE} />
        </Suspense>
    );
}
