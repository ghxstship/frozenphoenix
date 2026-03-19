import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function InventoryPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="INVENTORY_PAGE" />
        </Suspense>
    );
}
