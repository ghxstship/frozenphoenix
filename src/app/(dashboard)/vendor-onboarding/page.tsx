"use client";

import { ListPageShell } from "@/components/shells";
import { useVendorOnboarding } from "@/lib/supabase/hooks-pages";
import { CREATE_VENDOR_ONBOARDING_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "vendor_onboarding",
    title: "Vendor Onboarding",
    description:
        "Pipeline view of vendor/subcontractor onboarding with compliance document tracking",
    icon: CheckCircle2,
    createConfig: CREATE_VENDOR_ONBOARDING_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "vendor", header: "Vendor", accessorKey: "vendor" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "contact", header: "Contact", accessorKey: "contact" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "documents", header: "Documents", accessorKey: "documents" },
        { id: "invited", header: "Invited", accessorKey: "invited" },
    ],
};

export default function VendorOnboardingPage() {
    const { data: rawData, isLoading } = useVendorOnboarding();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
