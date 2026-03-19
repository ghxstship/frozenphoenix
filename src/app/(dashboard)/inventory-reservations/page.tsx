import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function InventoryReservationsPage() {
    const data = await fetchEntityList("inventory_reservation");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="INVENTORY_RESERVATIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
