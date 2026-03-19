import { NotificationsDetailClient } from "./_client";

export default async function NotificationsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <NotificationsDetailClient id={id} />;
}
