import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { NOTIFICATIONS_PAGE } from "@/config/list-page-configs";

export default async function NotificationsPage() {
    const data = await fetchEntityList("notification");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={NOTIFICATIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
