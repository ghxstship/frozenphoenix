import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AdvancingTemplatesPageClient } from "./_client";

export default async function AdvancingTemplatesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AdvancingTemplatesPageClient />
        </Suspense>
    );
}
