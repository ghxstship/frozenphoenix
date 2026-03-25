import { redirect } from "next/navigation";

/* SSOT: workforce/onboarding/_client.tsx is the single source of truth
   for all lifecycle workflows (onboarding + offboarding tabs). */
export default function RecruitmentPage() {
    redirect("/workforce/onboarding");
}
