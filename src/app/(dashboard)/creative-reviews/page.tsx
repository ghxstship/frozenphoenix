"use client";

import { ListPageShell } from "@/components/shells";
import { CREATIVE_REVIEWS_PAGE } from "@/config/list-page-configs";
import { useCreateCreativeReview } from "@/lib/supabase/hooks-documents";

export default function CreativeReviewsPage() {
    const _create = useCreateCreativeReview();
    return <ListPageShell config={CREATIVE_REVIEWS_PAGE} />;
}
