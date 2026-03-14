"use client";

import { ListPageShell } from "@/components/shells";
import { SURVEY_RESPONSES_PAGE } from "@/config/list-page-configs";

export default function Page() {
    return <ListPageShell config={SURVEY_RESPONSES_PAGE} />;
}
