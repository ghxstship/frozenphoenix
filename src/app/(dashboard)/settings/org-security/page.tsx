import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { OrgSecurityPageClient } from "./_client";

export default async function OrgSecurityPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <OrgSecurityPageClient />
        </Suspense>
    );
}
