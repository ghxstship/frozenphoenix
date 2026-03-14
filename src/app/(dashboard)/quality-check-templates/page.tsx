"use client";

import { ListPageShell } from "@/components/shells";
import { QUALITY_CHECK_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function QualityCheckTemplatesPage() {
    return <ListPageShell config={QUALITY_CHECK_TEMPLATES_PAGE} />;
}
