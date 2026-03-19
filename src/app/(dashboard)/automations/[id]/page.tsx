import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AutomationDetailPageClient } from "./_client";

export default async function AutomationDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AutomationDetailPageClient />
        </Suspense>
    );
}
