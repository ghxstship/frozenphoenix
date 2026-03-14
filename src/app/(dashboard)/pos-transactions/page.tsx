"use client";

import { ListPageShell } from "@/components/shells";
import { POS_TRANSACTIONS_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={POS_TRANSACTIONS_PAGE} />;
}
