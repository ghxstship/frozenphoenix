"use client";

import { ListPageShell } from "@/components/shells";
import { TRANSFER_ORDERS_PAGE } from "@/config/list-page-configs/operations";
import {
    useCreateTransferOrder,
    useDeleteTransferOrder,
    useTransferOrder,
    useTransferOrders,
    useUpdateTransferOrder,
} from "@/lib/supabase/hooks-assets-inventory";

export default function TransferOrdersPage() {
    const { data: _items } = useTransferOrders();
    const { data: _detail } = useTransferOrder("");
    const _create = useCreateTransferOrder();
    const _update = useUpdateTransferOrder();
    const _delete = useDeleteTransferOrder();
    return <ListPageShell config={TRANSFER_ORDERS_PAGE} />;
}
