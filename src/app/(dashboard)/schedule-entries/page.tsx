import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SCHEDULE_ENTRIES_PAGE } from "@/config/list-page-configs";

export default async function ScheduleEntriesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SCHEDULE_ENTRIES_PAGE} />
        </Suspense>
    );
}
