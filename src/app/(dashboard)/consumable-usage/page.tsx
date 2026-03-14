"use client";

import { ListPageShell } from "@/components/shells";
import { CONSUMABLE_USAGE_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CONSUMABLE_USAGE_PAGE} />;
}
