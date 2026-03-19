import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CustomFieldsPageClient } from "./_client";

export default async function CustomFieldsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CustomFieldsPageClient />
        </Suspense>
    );
}
