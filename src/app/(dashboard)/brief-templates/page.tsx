"use client";

import { ListPageShell } from "@/components/shells";
import { BRIEF_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function BriefTemplatesPage() {
    return <ListPageShell config={BRIEF_TEMPLATES_PAGE} />;
}
