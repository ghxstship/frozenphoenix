import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function EquipmentCheckInsPage() {
    const data = await fetchEntityList("equipment_check_in");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="EQUIPMENT_CHECK_INS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
