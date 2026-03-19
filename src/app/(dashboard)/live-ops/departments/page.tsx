import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DepartmentStatusPageClient } from "./_client";

export default async function DepartmentStatusPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DepartmentStatusPageClient />
        </Suspense>
    );
}
