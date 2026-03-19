import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ClientPortalPageClient } from "./_client";

export default async function ClientPortalPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ClientPortalPageClient />
        </Suspense>
    );
}
