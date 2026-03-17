"use client";

import { ListPageShell } from "@/components/shells";
import { useVendorOnboarding } from "@/lib/supabase";
import { VENDOR_ONBOARDING_PAGE } from "@/config/list-page-configs";

export default function VendorOnboardingPage() {
    const { data: rawData, isLoading } = useVendorOnboarding();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={VENDOR_ONBOARDING_PAGE} data={data} isLoading={isLoading} />;
}
