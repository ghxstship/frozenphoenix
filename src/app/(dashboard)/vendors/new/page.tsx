import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewVendorPageClient } from "./_client";

export default async function NewVendorPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewVendorPageClient />
        </Suspense>
    );
}
