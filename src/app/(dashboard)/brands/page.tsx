"use client";

import { ListPageShell } from "@/components/shells";
import { BRANDS_PAGE } from "@/config/list-page-configs";
import { useBrands } from "@/lib/supabase/hooks-admin";

export default function BrandsPage() {
    const { data: _items } = useBrands();
    return <ListPageShell config={BRANDS_PAGE} />;
}
