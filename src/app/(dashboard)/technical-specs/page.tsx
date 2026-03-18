"use client";

import { ListPageShell } from "@/components/shells";
import { TECHNICAL_SPECS_PAGE } from "@/config/list-page-configs";
import {
    useCreateTechnicalSpec,
    useTechnicalSpecs,
    useUpdateTechnicalSpec,
} from "@/lib/supabase/hooks-production";

export default function TechnicalSpecsPage() {
    const { data: _items } = useTechnicalSpecs();
    const _create = useCreateTechnicalSpec();
    const _update = useUpdateTechnicalSpec();
    return <ListPageShell config={TECHNICAL_SPECS_PAGE} />;
}
