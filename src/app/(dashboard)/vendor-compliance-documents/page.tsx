import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { VENDOR_COMPLIANCE_DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default async function VendorComplianceDocumentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={VENDOR_COMPLIANCE_DOCUMENTS_PAGE} />
        </Suspense>
    );
}
