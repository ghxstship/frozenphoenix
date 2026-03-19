import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DashboardsPageClient } from "./_client";

export default async function DashboardsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DashboardsPageClient />
        </Suspense>
    );
}
