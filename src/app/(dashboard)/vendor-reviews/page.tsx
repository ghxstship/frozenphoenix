"use client";

import { ListPageShell } from "@/components/shells";
import { useVendorReviews } from "@/lib/supabase/hooks-pages";
import { CREATE_VENDOR_REVIEW_CONFIG } from "@/config/create-entity-configs";
import { Star } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "vendor_reviews",
    title: "Vendor Reviews",
    description:
        "Performance reviews, ratings, and rehire recommendations for all vendors and subcontractors",
    icon: Star,
    createConfig: CREATE_VENDOR_REVIEW_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function VendorReviewsPage() {
    const { data: rawData, isLoading } = useVendorReviews();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
