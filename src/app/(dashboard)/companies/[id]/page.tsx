import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { CompanyDetailClient } from "./_client";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("company", id);
    return <CompanyDetailClient id={id} initialRecord={record} />;
}
