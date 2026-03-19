import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { QueuePageClient } from "./_client";

export default async function QueuePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <QueuePageClient />
        </Suspense>
    );
}
