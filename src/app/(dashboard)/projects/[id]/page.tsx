import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ProjectDetailPageClient } from "./_client";

export default async function ProjectDetailPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ProjectDetailPageClient />
        </Suspense>
    );
}
