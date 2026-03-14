"use client";

import { ListPageShell } from "@/components/shells";
import { GOALS_PAGE } from "@/config/list-page-configs";

export default function GoalsPage() {
    return <ListPageShell config={GOALS_PAGE} />;
}
