import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AdvancingInventoryPageClient } from "./_client";

export default async function AdvancingInventoryPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AdvancingInventoryPageClient />
        </Suspense>
    );
}
