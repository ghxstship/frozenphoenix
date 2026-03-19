import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewProjectPageClient } from "./_client";

export default async function NewProjectPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewProjectPageClient />
        </Suspense>
    );
}
