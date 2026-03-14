"use client";

import { ListPageShell } from "@/components/shells";
import { useCertifications } from "@/lib/supabase/hooks-pages";
import { CREATE_CERTIFICATION_CONFIG } from "@/config/create-entity-configs";
import { BadgeCheck } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "certifications",
    title: "Certifications",
    description: "Unified crew and asset certification tracking with expiry enforcement",
    icon: BadgeCheck,
    createConfig: CREATE_CERTIFICATION_CONFIG,
    searchKeys: ["title", "asset_id"],
    columns: [
        { id: "id", header: "Asset", accessorKey: "id" },
        { id: "asset_id", header: "Certification", accessorKey: "asset_id" },
        { id: "title", header: "Type", accessorKey: "title" },
        { id: "cert_number", header: "Issued By", accessorKey: "cert_number", fieldType: "date" },
        { id: "issued_by", header: "Status", accessorKey: "issued_by", fieldType: "status" },
        { id: "status", header: "Issued", accessorKey: "status", fieldType: "date" },
        { id: "expiry_date", header: "Expiry", accessorKey: "expiry_date", fieldType: "date" },
    ],
    exportable: true,
};

export default function CertificationsPage() {
    const { data: rawData, isLoading } = useCertifications();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
