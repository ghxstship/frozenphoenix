import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function SurveyTemplatesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SURVEY_TEMPLATES_PAGE" />
        </Suspense>
    );
}
