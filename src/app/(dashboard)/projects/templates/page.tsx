import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ProjectTemplatesPageClient } from "./_client";

export default async function ProjectTemplatesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ProjectTemplatesPageClient />
        </Suspense>
    );
}
