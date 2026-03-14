"use client";

import { ListPageShell } from "@/components/shells";
import { MILESTONES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={MILESTONES_PAGE} />;
}
