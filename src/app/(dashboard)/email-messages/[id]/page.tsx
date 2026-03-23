import { prefetchDetailRecord } from "@/lib/api/prefetch-detail";
import { EmailMessagesDetailClient } from "./_client";

export default async function EmailMessagesDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const initialRecord = await prefetchDetailRecord("email_messages", id);
    return <EmailMessagesDetailClient id={id} initialRecord={initialRecord} />;
}
