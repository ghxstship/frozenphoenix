import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { LiveCrewPageClient } from "./_client";

export default async function LiveCrewPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <LiveCrewPageClient />
        </Suspense>
    );
}
