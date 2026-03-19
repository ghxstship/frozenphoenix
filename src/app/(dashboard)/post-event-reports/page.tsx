import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { POST_EVENT_REPORTS_PAGE } from "@/config/list-page-configs";

export default async function PostEventReportsPage() {
    const data = await fetchEntityList("post_event_report");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={POST_EVENT_REPORTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
