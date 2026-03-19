import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ProposalDetailPageClient } from "./_client";

export default async function ProposalDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ProposalDetailPageClient />
        </Suspense>
    );
}
