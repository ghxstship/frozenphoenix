import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AuditLogPageClient } from "./_client";

export default async function AuditLogPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AuditLogPageClient />
        </Suspense>
    );
}
