"use client";

import { ListPageShell } from "@/components/shells";
import { ASSET_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ASSET_ASSIGNMENTS_PAGE} />;
}
