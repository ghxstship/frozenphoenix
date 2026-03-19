import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TransferOrdersPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TRANSFER_ORDERS_PAGE" />
        </Suspense>
    );
}
