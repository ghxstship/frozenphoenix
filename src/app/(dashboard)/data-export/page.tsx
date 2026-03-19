import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DataExportPageClient } from "./_client";

export default async function DataExportPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DataExportPageClient />
        </Suspense>
    );
}
