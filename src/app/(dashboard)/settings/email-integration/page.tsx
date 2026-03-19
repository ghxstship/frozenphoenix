import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { EmailIntegrationPageClient } from "./_client";

export default async function EmailIntegrationPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <EmailIntegrationPageClient />
        </Suspense>
    );
}
