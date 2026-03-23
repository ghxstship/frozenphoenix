"use client";

import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { MessageSquareQuote } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "testimonial",
    titleKey: "name",
    statusKey: "status",
    icon: MessageSquareQuote,
    backHref: "/testimonials",
    backLabel: "Testimonials",
    chatterRecordType: "testimonial",
    fields: [],
    tabs: [],
};

export function TestimonialsDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={initialRecord as Record<string, unknown> | undefined}
        />
    );
}
