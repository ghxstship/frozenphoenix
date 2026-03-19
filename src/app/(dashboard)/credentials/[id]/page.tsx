import { CredentialsDetailClient } from "./_client";

export default async function CredentialsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CredentialsDetailClient id={id} />;
}
