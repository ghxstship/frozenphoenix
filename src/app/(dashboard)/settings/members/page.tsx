import { redirect } from "next/navigation";

/**
 * /settings/members → redirects to Organization tab which has the members section.
 * The org members management is built into the Settings Organization tab.
 */
export default function SettingsMembersPage() {
    redirect("/settings?tab=organization");
}
