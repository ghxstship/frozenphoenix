"use client";

import { ListPageShell } from "@/components/shells";
import { useVendorReviews } from "@/lib/supabase";
import { VENDOR_REVIEWS_PAGE } from "@/config/list-page-configs";
import { useCreateVendorReview } from "@/lib/supabase/hooks-workforce";

export default function VendorReviewsPage() {
    const { data: rawData, isLoading } = useVendorReviews();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateVendorReview();

    return <ListPageShell config={VENDOR_REVIEWS_PAGE} data={data} isLoading={isLoading} />;
}
