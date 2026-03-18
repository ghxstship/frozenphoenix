"use client";

import { ListPageShell } from "@/components/shells";
import { SURVEY_RESPONSES_PAGE } from "@/config/list-page-configs";
import { useCreateSurveyResponse } from "@/lib/supabase/hooks-automation";

export default function Page() {
    const _create = useCreateSurveyResponse();
    return <ListPageShell config={SURVEY_RESPONSES_PAGE} />;
}
