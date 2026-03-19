import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { DecksPageClient } from "./_client";

export default async function DecksPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DecksPageClient />
        </Suspense>
    );
}
