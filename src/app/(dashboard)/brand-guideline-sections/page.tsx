"use client";

import { ListPageShell } from "@/components/shells";
import { BRAND_GUIDELINE_SECTIONS_PAGE } from "@/config/list-page-configs";
import {
    useBrandGuidelineSections,
    useCreateBrandGuidelineSection,
} from "@/lib/supabase/hooks-documents";

export default function Page() {
    const { data: _sections } = useBrandGuidelineSections();
    const _create = useCreateBrandGuidelineSection();
    return <ListPageShell config={BRAND_GUIDELINE_SECTIONS_PAGE} />;
}
