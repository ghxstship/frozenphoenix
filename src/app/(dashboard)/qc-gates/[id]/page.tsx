import { QcGatesDetailClient } from "./_client";

export default async function QcGatesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <QcGatesDetailClient id={id} initialRecord={null} />;
}
