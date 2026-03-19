import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function ScheduleEntriesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SCHEDULE_ENTRIES_PAGE" />
        </Suspense>
    );
}
