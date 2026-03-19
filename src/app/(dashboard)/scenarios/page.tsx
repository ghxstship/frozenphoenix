import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ScenariosPageClient } from "./_client";

export default async function ScenariosPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ScenariosPageClient />
        </Suspense>
    );
}
