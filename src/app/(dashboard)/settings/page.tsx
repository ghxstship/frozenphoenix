import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SettingsPageClient } from "./_client";

export default async function SettingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SettingsPageClient />
        </Suspense>
    );
}
