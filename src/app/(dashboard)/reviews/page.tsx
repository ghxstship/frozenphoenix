"use client";

import { ListPageShell } from "@/components/shells";
import { REVIEWS_PAGE } from "@/config/list-page-configs";

export default function ReviewsPage() {
    return <ListPageShell config={REVIEWS_PAGE} />;
}
