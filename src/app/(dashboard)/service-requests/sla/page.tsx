import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SlaPageClient } from "./_client";

export default async function SlaPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SlaPageClient />
        </Suspense>
    );
}
