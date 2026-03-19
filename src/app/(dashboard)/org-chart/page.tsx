import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { OrgChartPageClient } from "./_client";

export default async function OrgChartPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <OrgChartPageClient />
        </Suspense>
    );
}
