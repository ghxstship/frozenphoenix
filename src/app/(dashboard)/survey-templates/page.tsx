"use client";

import { ListPageShell } from "@/components/shells";
import { SURVEY_TEMPLATES_PAGE } from "@/config/list-page-configs";

export default function SurveyTemplatesPage() {
    return <ListPageShell config={SURVEY_TEMPLATES_PAGE} />;
}
