"use client";

import { ListPageShell } from "@/components/shells";
import { CONVERSATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CONVERSATIONS_PAGE} />;
}
