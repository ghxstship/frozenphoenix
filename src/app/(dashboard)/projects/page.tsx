import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ProjectsPageClient } from "./_client";

export default async function ProjectsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ProjectsPageClient />
        </Suspense>
    );
}
