"use client";

import { useQcGate } from "@/lib/supabase";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { ShieldCheck } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "qc_gate",
    titleKey: "name",
    statusKey: "status",
    icon: ShieldCheck,
    backHref: "/qc-gates",
    backLabel: "Qc Gates",
    chatterRecordType: "qc_gate",
    fields: [],
    tabs: [],
};

export function QcGatesDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useQcGate(id);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
        />
    );
}
