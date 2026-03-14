"use client";

import { ListPageShell } from "@/components/shells";
import { COMMENTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={COMMENTS_PAGE} />;
}
