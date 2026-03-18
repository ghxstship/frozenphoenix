"use client";

import { ListPageShell } from "@/components/shells";
import { VENDOR_COMPLIANCE_DOCUMENTS_PAGE } from "@/config/list-page-configs";
import { useCreateVendorComplianceDocument } from "@/lib/supabase/hooks-workforce";

export default function VendorComplianceDocumentsPage() {
    const _create = useCreateVendorComplianceDocument();
    return <ListPageShell config={VENDOR_COMPLIANCE_DOCUMENTS_PAGE} />;
}
