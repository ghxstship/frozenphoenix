"use client";

import { ListPageShell } from "@/components/shells";
import { ENGAGEMENT_TERMS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ENGAGEMENT_TERMS_PAGE} />;
}
