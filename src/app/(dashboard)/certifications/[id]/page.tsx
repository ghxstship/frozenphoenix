import { CertificationDetailClient } from "./_client";

export default async function CertificationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CertificationDetailClient id={id} initialRecord={null} />;
}
