import { VendorDetailClient } from "./_client";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <VendorDetailClient id={id} initialRecord={null} />;
}
