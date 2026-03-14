"use client";

import { ListPageShell } from "@/components/shells";
import { REVIEW_CYCLES_PAGE } from "@/config/list-page-configs";

export default function ReviewCyclesPage() {
    return <ListPageShell config={REVIEW_CYCLES_PAGE} />;
}
