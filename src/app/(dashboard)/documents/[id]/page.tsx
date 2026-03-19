import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { DocumentDetailClient } from "./_client";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("document", id);
    return <DocumentDetailClient id={id} initialRecord={record} />;
}
