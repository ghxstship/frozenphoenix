import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function VendorComplianceDocumentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="VENDOR_COMPLIANCE_DOCUMENTS_PAGE" />
        </Suspense>
    );
}
