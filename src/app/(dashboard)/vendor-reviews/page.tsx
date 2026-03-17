"use client";

import { ListPageShell } from "@/components/shells";
import { useVendorReviews } from "@/lib/supabase";
import { VENDOR_REVIEWS_PAGE } from "@/config/list-page-configs";

export default function VendorReviewsPage() {
    const { data: rawData, isLoading } = useVendorReviews();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={VENDOR_REVIEWS_PAGE} data={data} isLoading={isLoading} />;
}
