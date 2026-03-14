"use client";

import { ListPageShell } from "@/components/shells";
import { BRAND_GUIDELINE_SECTIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={BRAND_GUIDELINE_SECTIONS_PAGE} />;
}
