"use client";

import { ListPageShell } from "@/components/shells";
import { CREATIVE_REVIEWS_PAGE } from "@/config/list-page-configs";

export default function CreativeReviewsPage() {
    return <ListPageShell config={CREATIVE_REVIEWS_PAGE} />;
}
