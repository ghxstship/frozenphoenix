"use client";

import { ListPageShell } from "@/components/shells";
import { CHANNEL_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CHANNEL_TEMPLATES_PAGE} />;
}
