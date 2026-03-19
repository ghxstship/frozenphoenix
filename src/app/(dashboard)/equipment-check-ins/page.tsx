import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { EQUIPMENT_CHECK_INS_PAGE } from "@/config/list-page-configs";

export default async function EquipmentCheckInsPage() {
    const data = await fetchEntityList("equipment_check_in");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={EQUIPMENT_CHECK_INS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
