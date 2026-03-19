import { EmailMessagesDetailClient } from "./_client";

export default async function EmailMessagesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <EmailMessagesDetailClient id={id} />;
}
