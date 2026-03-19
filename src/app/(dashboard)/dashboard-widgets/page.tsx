import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function DashboardWidgetsPage() {
    const data = await fetchEntityList("dashboard_widget");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="DASHBOARD_WIDGETS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
