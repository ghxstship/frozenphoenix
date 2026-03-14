"use client";

import { ListPageShell } from "@/components/shells";
import { CAMPAIGN_ASSETS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CAMPAIGN_ASSETS_PAGE} />;
}
