import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { PostEventReportsPageClient } from "./_client";

export default async function PostEventReportsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <PostEventReportsPageClient />
        </Suspense>
    );
}
