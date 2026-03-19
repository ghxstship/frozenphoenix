import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { VipPageClient } from "./_client";

export default async function VipPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <VipPageClient />
        </Suspense>
    );
}
