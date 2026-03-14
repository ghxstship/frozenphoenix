"use client";

import { ListPageShell } from "@/components/shells";
import { SHIFTS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SHIFTS_PAGE} />;
}
