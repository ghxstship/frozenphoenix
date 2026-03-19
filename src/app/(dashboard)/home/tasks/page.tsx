import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { TasksHomePageClient } from "./_client";

export default async function TasksHomePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <TasksHomePageClient />
        </Suspense>
    );
}
