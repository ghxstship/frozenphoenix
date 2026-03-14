"use client";

import { ListPageShell } from "@/components/shells";
import { KNOWLEDGE_ARTICLES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={KNOWLEDGE_ARTICLES_PAGE} />;
}
