import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function TestimonialsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TESTIMONIALS_PAGE" />
        </Suspense>
    );
}
