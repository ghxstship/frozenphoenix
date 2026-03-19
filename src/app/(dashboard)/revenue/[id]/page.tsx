import { RevenueDetailClient } from "./_client";

export default async function RevenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <RevenueDetailClient id={id} />;
}
