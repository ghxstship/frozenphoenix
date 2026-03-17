"use client";

import { ListPageShell } from "@/components/shells";
import { useDispatchRecords } from "@/lib/supabase";
import { DISPATCH_PAGE } from "@/config/list-page-configs";

export default function DispatchPage() {
    const { data: rawData, isLoading } = useDispatchRecords();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={DISPATCH_PAGE} data={data} isLoading={isLoading} />;
}
