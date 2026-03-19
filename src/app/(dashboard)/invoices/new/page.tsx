import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { NewInvoicePageClient } from "./_client";

export default async function NewInvoicePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <NewInvoicePageClient />
        </Suspense>
    );
}
