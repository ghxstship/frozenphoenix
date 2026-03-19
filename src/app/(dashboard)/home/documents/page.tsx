import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DocumentsPageClient } from "./_client";

export default async function DocumentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DocumentsPageClient />
        </Suspense>
    );
}
