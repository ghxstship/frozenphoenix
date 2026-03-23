import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { CaseStudiesDetailClient } from "./_client";

export default async function CaseStudiesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("case_studies", id);
    return <CaseStudiesDetailClient id={id} initialRecord={initialRecord} />;
}
