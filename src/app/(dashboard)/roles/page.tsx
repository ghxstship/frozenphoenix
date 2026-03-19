import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { RolesPageClient } from "./_client";

export default async function RolesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <RolesPageClient />
        </Suspense>
    );
}
