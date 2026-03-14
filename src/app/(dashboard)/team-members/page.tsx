"use client";

import { ListPageShell } from "@/components/shells";
import { TEAM_MEMBERS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={TEAM_MEMBERS_PAGE} />;
}
