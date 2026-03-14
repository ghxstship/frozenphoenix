"use client";

import { ListPageShell } from "@/components/shells";
import { UPSELL_TRIGGERS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={UPSELL_TRIGGERS_PAGE} />;
}
