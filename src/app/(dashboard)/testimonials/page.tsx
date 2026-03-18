"use client";

import { ListPageShell } from "@/components/shells";
import { TESTIMONIALS_PAGE } from "@/config/list-page-configs";
import {
    useCreateTestimonial,
    useTestimonial,
    useTestimonials,
    useUpdateTestimonial,
} from "@/lib/supabase/hooks-crm";

export default function TestimonialsPage() {
    const { data: _items } = useTestimonials();
    const { data: _detail } = useTestimonial("");
    const _create = useCreateTestimonial();
    const _update = useUpdateTestimonial();
    return <ListPageShell config={TESTIMONIALS_PAGE} />;
}
