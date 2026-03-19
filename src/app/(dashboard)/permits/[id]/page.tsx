import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { PermitDetailClient } from "./_client";

export default async function PermitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("permit", id);
    return <PermitDetailClient id={id} initialRecord={record} />;
}
