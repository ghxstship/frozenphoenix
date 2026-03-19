import { BrandKitDetailClient } from "./_client";

export default async function BrandKitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BrandKitDetailClient id={id} initialRecord={null} />;
}
