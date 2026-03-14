"use client";

import { ListPageShell } from "@/components/shells";
import { VIP_GUESTS_PAGE } from "@/config/list-page-configs";

export default function VipGuestsPage() {
    return <ListPageShell config={VIP_GUESTS_PAGE} />;
}
