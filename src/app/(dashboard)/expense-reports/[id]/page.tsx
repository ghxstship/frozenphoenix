import { ExpenseReportsDetailClient } from "./_client";

export default async function ExpenseReportsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ExpenseReportsDetailClient id={id} />;
}
