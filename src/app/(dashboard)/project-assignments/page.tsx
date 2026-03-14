"use client";

import { ListPageShell } from "@/components/shells";
import { PROJECT_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={PROJECT_ASSIGNMENTS_PAGE} />;
}
