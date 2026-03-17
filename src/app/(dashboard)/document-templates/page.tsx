"use client";

import { ListPageShell } from "@/components/shells";
import { TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function DocumentTemplatesPage() {
    return <ListPageShell config={TEMPLATES_PAGE} />;
}
