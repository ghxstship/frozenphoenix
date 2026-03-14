"use client";

import { ListPageShell } from "@/components/shells";
import { CONTRACT_OBLIGATIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={CONTRACT_OBLIGATIONS_PAGE} />;
}
