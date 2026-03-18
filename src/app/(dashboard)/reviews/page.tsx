"use client";

import { ListPageShell } from "@/components/shells";
import { REVIEWS_PAGE } from "@/config/list-page-configs";
import { useCreateReview, useReviews } from "@/lib/supabase/hooks-crm";

export default function ReviewsPage() {
    const { data: _items } = useReviews();
    const _create = useCreateReview();
    return <ListPageShell config={REVIEWS_PAGE} />;
}
