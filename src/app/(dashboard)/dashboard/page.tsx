import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DashboardPageClient } from "./_client";

export default async function DashboardPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DashboardPageClient />
        </Suspense>
    );
}
