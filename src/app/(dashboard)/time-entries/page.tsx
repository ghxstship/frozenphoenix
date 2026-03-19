import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { TIME_ENTRIES_PAGE } from "@/config/list-page-configs";

export default async function TimeEntriesPage() {
    const data = await fetchEntityList("time_entry");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TIME_ENTRIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
