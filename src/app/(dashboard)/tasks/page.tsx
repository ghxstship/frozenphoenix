import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { TasksPageClient } from "./_client";

export default async function TasksPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <TasksPageClient />
        </Suspense>
    );
}
