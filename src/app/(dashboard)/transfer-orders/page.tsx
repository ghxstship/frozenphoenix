"use client";

import { ListPageShell } from "@/components/shells";
import { TRANSFER_ORDERS_PAGE } from "@/config/list-page-configs/operations";

export default function TransferOrdersPage() {
    return <ListPageShell config={TRANSFER_ORDERS_PAGE} />;
}
