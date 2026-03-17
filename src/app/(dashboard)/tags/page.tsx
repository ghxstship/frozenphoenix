"use client";

import { ListPageShell } from "@/components/shells";
import { TAGS_PAGE } from "@/config/list-page-configs/system";

export default function TagsPage() {
    return <ListPageShell config={TAGS_PAGE} />;
}
