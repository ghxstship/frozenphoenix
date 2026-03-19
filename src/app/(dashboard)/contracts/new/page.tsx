import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewContractPageClient } from "./_client";

export default async function NewContractPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewContractPageClient />
        </Suspense>
    );
}
