import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CreditNotesDetailClient } from "./_client";

export default async function CreditNotesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("credit_notes", id);
    return <CreditNotesDetailClient id={id} initialRecord={initialRecord} />;
}
