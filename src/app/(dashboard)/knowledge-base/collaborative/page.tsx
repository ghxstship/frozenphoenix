import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { CollaborativeEditorPageClient } from "./_client";

export default async function CollaborativeEditorPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CollaborativeEditorPageClient />
        </Suspense>
    );
}
