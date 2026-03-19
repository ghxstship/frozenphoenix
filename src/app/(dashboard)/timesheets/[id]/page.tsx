import { TimesheetsDetailClient } from "./_client";

export default async function TimesheetsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <TimesheetsDetailClient id={id} />;
}
