"use client";

import { ListPageShell } from "@/components/shells";
import { LOST_REASONS_PAGE } from "@/config/list-page-configs";

export default function LostReasonsPage() {
    return <ListPageShell config={LOST_REASONS_PAGE} />;
}
