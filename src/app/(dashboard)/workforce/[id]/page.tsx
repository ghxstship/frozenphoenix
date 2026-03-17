"use client";

import { useParams } from "next/navigation";
import { useDeleteWorkerProfile, useUpdateWorkerProfile, useWorkerProfile } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { Briefcase, HardHat, Mail, Phone } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "workforce",
    titleKey: "full_name",
    subtitleKey: "classification",
    statusKey: "lifecycle_status",
    icon: HardHat,
    backHref: "/workforce",
    backLabel: "Workforce",
    chatterRecordType: "worker_profile",
    sidebarFields: [
        { id: "lifecycle_status", label: "Status", accessorKey: "lifecycle_status" },
        { id: "classification", label: "Classification", accessorKey: "classification" },
        { id: "start_date", label: "Start Date", accessorKey: "start_date", fieldType: "date" },
    ],
    fields: [
        { id: "email", label: "Email", accessorKey: "email", icon: Mail },
        { id: "phone", label: "Phone", accessorKey: "phone", icon: Phone },
        { id: "department", label: "Department", accessorKey: "department" },
        { id: "job_title", label: "Job Title", accessorKey: "job_title" },
    ],
    tabs: [
        {
            id: "assignments",
            label: "Assignments",
            content: (
                <EmptyState
                    icon={Briefcase}
                    title="No assignments yet"
                    description="Project assignments and shift history for this worker will appear here."
                    compact
                />
            ),
        },
    ],
};

export default function WorkforceDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: worker, isLoading } = useWorkerProfile(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Worker Profile",
        listPath: "/workforce",
        useUpdateHook: useUpdateWorkerProfile,
        useDeleteHook: useDeleteWorkerProfile,
    });

    return (
        <PermissionGate resource="workforce" action="read">
            <DetailPageShell
                config={CONFIG}
                id={entityId}
                record={worker as Record<string, unknown> | null}
                isLoading={isLoading}
                menuItems={crudMenuItems}
            />
        </PermissionGate>
    );
}
