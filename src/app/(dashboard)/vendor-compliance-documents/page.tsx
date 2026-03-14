"use client";

import { ListPageShell } from "@/components/shells";
import { VENDOR_COMPLIANCE_DOCUMENTS_PAGE } from "@/config/list-page-configs";

export default function VendorComplianceDocumentsPage() {
    return <ListPageShell config={VENDOR_COMPLIANCE_DOCUMENTS_PAGE} />;
}
