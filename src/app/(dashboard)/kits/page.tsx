"use client";

import { ListPageShell } from "@/components/shells";
import { KITS_PAGE } from "@/config/list-page-configs";

export default function KitsPage() {
    return <ListPageShell config={KITS_PAGE} />;
}
