import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CompanyDetailClient } from "./_client";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("companies", id);
    return <CompanyDetailClient id={id} initialRecord={initialRecord} />;
}
