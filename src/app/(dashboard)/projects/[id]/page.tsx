import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { ProjectDetailPageClient } from "./_client";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("projects", id);
    return <ProjectDetailPageClient id={id} initialRecord={initialRecord} />;
}
