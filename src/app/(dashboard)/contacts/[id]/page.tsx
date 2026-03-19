import { fetchEntityDetail } from "@/lib/api/server-fetch";
import { ContactDetailClient } from "./_client";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await fetchEntityDetail("contact", id);
    return <ContactDetailClient id={id} initialRecord={record} />;
}
