import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CredentialsDetailClient } from "./_client";

export default async function CredentialsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("credential_types", id);
    return <CredentialsDetailClient id={id} initialRecord={initialRecord} />;
}
