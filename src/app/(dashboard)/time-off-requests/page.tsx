import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { TIME_OFF_REQUESTS_PAGE } from "@/config/list-page-configs";

export default async function TimeOffRequestsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TIME_OFF_REQUESTS_PAGE} />
        </Suspense>
    );
}
