import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NotificationSettingsPageClient } from "./_client";

export default async function NotificationSettingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NotificationSettingsPageClient />
        </Suspense>
    );
}
