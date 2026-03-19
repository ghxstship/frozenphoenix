import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { SHIFTS_PAGE } from "@/config/list-page-configs";

export default async function ShiftsPage() {
    const data = await fetchEntityList("shift");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SHIFTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
