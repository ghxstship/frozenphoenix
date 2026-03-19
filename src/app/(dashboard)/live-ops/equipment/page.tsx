import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { EquipmentPageClient } from "./_client";

export default async function EquipmentPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <EquipmentPageClient />
        </Suspense>
    );
}
