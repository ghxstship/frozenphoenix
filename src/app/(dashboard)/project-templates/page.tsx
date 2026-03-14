"use client";

import { ListPageShell } from "@/components/shells";
import { PROJECT_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function ProjectTemplatesPage() {
    return <ListPageShell config={PROJECT_TEMPLATES_PAGE} />;
}
