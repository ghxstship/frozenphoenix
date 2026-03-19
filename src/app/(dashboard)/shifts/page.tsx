import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ShiftsPage() {
    const data = await fetchEntityList("shift");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SHIFTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
