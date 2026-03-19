import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { InvitationsPageClient } from "./_client";

export default async function InvitationsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <InvitationsPageClient />
        </Suspense>
    );
}
