"use client";

import { ListPageShell } from "@/components/shells";
import { ASSET_VERSIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ASSET_VERSIONS_PAGE} />;
}
