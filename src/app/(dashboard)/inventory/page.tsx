import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { INVENTORY_PAGE } from "@/config/list-page-configs";

export default async function InventoryPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INVENTORY_PAGE} />
        </Suspense>
    );
}
