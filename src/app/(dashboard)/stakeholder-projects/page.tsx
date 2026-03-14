"use client";

import { ListPageShell } from "@/components/shells";
import { STAKEHOLDER_PROJECTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={STAKEHOLDER_PROJECTS_PAGE} />;
}
