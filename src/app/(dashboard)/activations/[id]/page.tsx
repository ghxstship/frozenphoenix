import { ActivationDetailClient } from "./_client";

export default async function ActivationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ActivationDetailClient id={id} initialRecord={null} />;
}
