"use client";

import { ListPageShell } from "@/components/shells";
import { useBrandGuidelines } from "@/lib/supabase";
import { useCreateBrandGuideline } from "@/lib/supabase/hooks-documents";
import { BRANDS_PAGE } from "@/config/list-page-configs";

export default function BrandGuidelinesPage() {
    const { data: rawData, isLoading } = useBrandGuidelines();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateBrandGuideline();

    return <ListPageShell config={BRANDS_PAGE} data={data} isLoading={isLoading} />;
}
