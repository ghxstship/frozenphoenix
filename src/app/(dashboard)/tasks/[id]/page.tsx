import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { TaskDetailPageClient } from "./_client";

export default async function TaskDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <TaskDetailPageClient />
        </Suspense>
    );
}
