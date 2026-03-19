"use client";

import { useContact, useDeleteContact, useUpdateContact } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Building2, Mail, Phone, User } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "contacts",
    titleKey: "name",
    subtitleKey: "email",
    statusKey: "status",
    icon: User,
    backHref: "/contacts",
    backLabel: "Contacts",
    chatterRecordType: "contact",
    sidebarFields: [
        { id: "company_name", label: "Company", accessorKey: "company_name" },
        { id: "role", label: "Role", accessorKey: "role" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "email", label: "Email", accessorKey: "email", icon: Mail },
        { id: "phone", label: "Phone", accessorKey: "phone", icon: Phone },
        { id: "company_name", label: "Company", accessorKey: "company_name", icon: Building2 },
        { id: "notes", label: "Notes", accessorKey: "notes", fullWidth: true },
    ],
    tabs: [],
};

export function ContactDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { data: contact, isLoading } = useContact(id);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Contact",
        listPath: "/contacts",
        useUpdateHook: useUpdateContact,
        useDeleteHook: useDeleteContact,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={id}
            record={(contact ?? initialRecord) as Record<string, unknown> | null}
            isLoading={isLoading && !initialRecord}
            menuItems={crudMenuItems}
        />
    );
}
