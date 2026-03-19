import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AISettingsPageClient } from "./_client";

export default async function AISettingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AISettingsPageClient />
        </Suspense>
    );
}
