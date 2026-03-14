"use client";

import { ListPageShell } from "@/components/shells";
import { CATALOG_CATEGORIES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CATALOG_CATEGORIES_PAGE} />;
}
