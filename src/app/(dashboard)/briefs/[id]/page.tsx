import { BriefDetailClient } from "./_client";

export default async function BriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BriefDetailClient id={id} initialRecord={null} />;
}
