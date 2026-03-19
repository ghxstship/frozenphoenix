"use client";

import { useDeletePayment, usePayment, useUpdatePayment } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { CreditCard } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "payment",
    titleKey: "name",
    statusKey: "status",
    icon: CreditCard,
    backHref: "/payments",
    backLabel: "Payments",
    chatterRecordType: "payment",
    fields: [],
    tabs: [],
};

export function PaymentsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = usePayment(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Payment",
        listPath: "/payments",
        useUpdateHook: useUpdatePayment,
        useDeleteHook: useDeletePayment,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
            menuItems={crudMenuItems}
        />
    );
}
