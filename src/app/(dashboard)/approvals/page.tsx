import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ApprovalsPageClient } from "./_client";

export default async function ApprovalsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ApprovalsPageClient />
        </Suspense>
    );
}
