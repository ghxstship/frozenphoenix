"use client";

import { ListPageShell } from "@/components/shells";
import { ACTIVITIES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={ACTIVITIES_PAGE} />;
}
