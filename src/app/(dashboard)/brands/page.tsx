"use client";

import { ListPageShell } from "@/components/shells";
import { BRANDS_PAGE } from "@/config/list-page-configs";

export default function BrandsPage() {
    return <ListPageShell config={BRANDS_PAGE} />;
}
