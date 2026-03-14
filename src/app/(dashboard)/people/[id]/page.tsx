"use client";

import { useParams } from "next/navigation";
import { useDeletePerson, usePerson, useUpdatePerson } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { Mail, Phone, User } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "people",
    titleKey: "full_name",
    subtitleKey: "role",
    statusKey: "status",
    icon: User,
    backHref: "/people",
    backLabel: "People",
    chatterRecordType: "person",
    sidebarFields: [
        { id: "role", label: "Role", accessorKey: "role" },
        { id: "department", label: "Department", accessorKey: "department" },
        { id: "created_at", label: "Joined", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "email", label: "Email", accessorKey: "email", icon: Mail },
        { id: "phone", label: "Phone", accessorKey: "phone", icon: Phone },
    ],
    tabs: [
        {
            id: "projects",
            label: "Projects",
            content: (
                <EmptyState
                    icon={User}
                    title="No project assignments"
                    description="Projects this person is assigned to will appear here."
                    compact
                />
            ),
        },
    ],
};

export default function PersonDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: person, isLoading } = usePerson(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Person",
        listPath: "/people",
        useUpdateHook: useUpdatePerson,
        useDeleteHook: useDeletePerson,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={person as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
