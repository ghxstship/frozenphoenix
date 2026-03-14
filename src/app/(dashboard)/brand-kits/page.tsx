"use client";

import { ListPageShell } from "@/components/shells";
import { BRAND_KITS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={BRAND_KITS_PAGE} />;
}
