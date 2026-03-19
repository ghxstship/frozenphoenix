import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewCrewMemberPageClient } from "./_client";

export default async function NewCrewMemberPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewCrewMemberPageClient />
        </Suspense>
    );
}
