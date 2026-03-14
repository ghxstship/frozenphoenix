"use client";

import { ListPageShell } from "@/components/shells";
import { CAMPAIGN_CHANNELS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CAMPAIGN_CHANNELS_PAGE} />;
}
