import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { SurveysDetailClient } from "./_client";

export default async function SurveysDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("survey_templates", id);
    return <SurveysDetailClient id={id} initialRecord={initialRecord} />;
}
