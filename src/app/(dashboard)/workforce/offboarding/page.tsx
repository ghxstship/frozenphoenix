import { redirect } from "next/navigation";

/* SSOT: workforce/onboarding/_client.tsx is the single source of truth
   for all lifecycle workflows (onboarding + offboarding tabs).
   Deep-link to the offboarding tab. */
export default function OffboardingPage() {
    redirect("/workforce/onboarding?tab=offboarding");
}
