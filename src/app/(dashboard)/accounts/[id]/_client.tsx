"use client";

import { useAccount, useDeleteAccount, useUpdateAccount } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "accounts",
    titleKey: "name",
    subtitleKey: "type",
    statusKey: "status",
    icon: Building2,
    backHref: "/accounts",
    backLabel: "Accounts",
    chatterRecordType: "account",
    sidebarFields: [
        { id: "type", label: "Type", accessorKey: "type" },
        { id: "industry", label: "Industry", accessorKey: "industry" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "email", label: "Email", accessorKey: "email", icon: Mail },
        { id: "phone", label: "Phone", accessorKey: "phone", icon: Phone },
        { id: "address", label: "Address", accessorKey: "address", icon: MapPin },
        { id: "website", label: "Website", accessorKey: "website" },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [
        {
            id: "contacts",
            label: "Contacts",
            content: (
                <EmptyState
                    icon={User}
                    title="No contacts yet"
                    description="Contacts associated with this account will appear here."
                    compact
                />
            ),
        },
    ],
};

export function AccountDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: account, isLoading } = useAccount(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Account",
        listPath: "/accounts",
        useUpdateHook: useUpdateAccount,
        useDeleteHook: useDeleteAccount,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(account ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
            menuItems={crudMenuItems}
        />
    );
}
