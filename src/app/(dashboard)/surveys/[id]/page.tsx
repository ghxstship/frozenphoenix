import { SurveysDetailClient } from "./_client";

export default async function SurveysDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <SurveysDetailClient id={id} />;
}
