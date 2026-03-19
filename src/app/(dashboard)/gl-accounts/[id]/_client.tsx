"use client";

import { useGlAccount } from "@/lib/supabase";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Landmark } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "gl_account",
    titleKey: "name",
    statusKey: "status",
    icon: Landmark,
    backHref: "/gl-accounts",
    backLabel: "Gl Accounts",
    chatterRecordType: "gl_account",
    fields: [],
    tabs: [],
};

export function GlAccountsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: record, isLoading } = useGlAccount(id);

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(record ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
        />
    );
}
