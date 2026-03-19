import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { GoalsPageClient } from "./_client";

export default async function GoalsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <GoalsPageClient />
        </Suspense>
    );
}
