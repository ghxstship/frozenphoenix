import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AutomationsPageClient } from "./_client";

export default async function AutomationsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AutomationsPageClient />
        </Suspense>
    );
}
