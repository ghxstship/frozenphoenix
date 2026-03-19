import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { EditProjectPageClient } from "./_client";

export default async function EditProjectPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <EditProjectPageClient />
        </Suspense>
    );
}
