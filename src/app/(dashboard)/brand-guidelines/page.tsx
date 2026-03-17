"use client";

import { ListPageShell } from "@/components/shells";
import { useBrandGuidelines } from "@/lib/supabase";
import { BRANDS_PAGE } from "@/config/list-page-configs";

export default function BrandGuidelinesPage() {
    const { data: rawData, isLoading } = useBrandGuidelines();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={BRANDS_PAGE} data={data} isLoading={isLoading} />;
}
