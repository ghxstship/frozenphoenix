"use client";

import { useParams } from "next/navigation";
import { useDeleteVendorReview, useUpdateVendorReview, useVendorReview } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { ClipboardCheck, Star } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "vendor_reviews",
    titleKey: "title",
    statusKey: "status",
    icon: ClipboardCheck,
    backHref: "/vendor-reviews",
    backLabel: "Vendor Reviews",
    chatterRecordType: "vendor_review",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "overall_score", label: "Rating", accessorKey: "overall_score" },
        { id: "review_date", label: "Review Date", accessorKey: "review_date", fieldType: "date" },
    ],
    fields: [
        { id: "overall_score", label: "Overall Score", accessorKey: "overall_score" },
        { id: "comments", label: "Comments", accessorKey: "comments", fullWidth: true },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [
        {
            id: "scores",
            label: "Scores",
            content: (
                <EmptyState
                    icon={Star}
                    title="No scores recorded"
                    description="Detailed scoring breakdown for this vendor review will appear here."
                    compact
                />
            ),
        },
    ],
};

export default function VendorReviewDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: review, isLoading } = useVendorReview(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Vendor Review",
        listPath: "/vendor-reviews",
        useUpdateHook: useUpdateVendorReview,
        useDeleteHook: useDeleteVendorReview,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={review as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
