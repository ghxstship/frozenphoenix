import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { DASHBOARD_WIDGETS_PAGE } from "@/config/list-page-configs";

export default async function DashboardWidgetsPage() {
    const data = await fetchEntityList("dashboard_widget");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={DASHBOARD_WIDGETS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
