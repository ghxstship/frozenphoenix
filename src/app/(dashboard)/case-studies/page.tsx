"use client";

import { ListPageShell } from "@/components/shells";
import { useCaseStudies } from "@/lib/supabase";
import { CASE_STUDIES_PAGE } from "@/config/list-page-configs";
import {
    useCaseStudy,
    useCreateCaseStudy,
    useDeleteCaseStudy,
    useUpdateCaseStudy,
} from "@/lib/supabase/hooks-crm";

export default function CaseStudiesPage() {
    const { data: rawData, isLoading } = useCaseStudies();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const { data: _detail } = useCaseStudy("");
    const _create = useCreateCaseStudy();
    const _update = useUpdateCaseStudy();
    const _delete = useDeleteCaseStudy();

    return <ListPageShell config={CASE_STUDIES_PAGE} data={data} isLoading={isLoading} />;
}
