import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ActivationDetailClient } from "./_client";

export default async function ActivationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("activations", id);
    return <ActivationDetailClient id={id} initialRecord={initialRecord} />;
}
