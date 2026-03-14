"use client";

import { ListPageShell } from "@/components/shells";
import { BOMS_PAGE } from "@/config/list-page-configs";

export default function BomsPage() {
    return <ListPageShell config={BOMS_PAGE} />;
}
