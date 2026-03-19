import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CredentialAssignmentsPageClient } from "./_client";

export default async function CredentialAssignmentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CredentialAssignmentsPageClient />
        </Suspense>
    );
}
