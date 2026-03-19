import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SecuritySettingsPageClient } from "./_client";

export default async function SecuritySettingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SecuritySettingsPageClient />
        </Suspense>
    );
}
