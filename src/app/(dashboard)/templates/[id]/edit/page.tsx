import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { TemplateEditorPageClient } from "./_client";

export default async function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<LoadingState />}>
            <TemplateEditorPageClient params={params} />
        </Suspense>
    );
}
