import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { InviteTeamPageClient } from "./_client";

export default async function InviteTeamPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <InviteTeamPageClient />
        </Suspense>
    );
}
