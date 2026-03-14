"use client";

import { ListPageShell } from "@/components/shells";
import { PROFILES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={PROFILES_PAGE} />;
}
