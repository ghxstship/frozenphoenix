import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewProposalPageClient } from "./_client";

export default async function NewProposalPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewProposalPageClient />
        </Suspense>
    );
}
