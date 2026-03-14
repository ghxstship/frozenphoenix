"use client";

import { useParams } from "next/navigation";
import {
    useComplianceChecklist,
    useDeleteComplianceChecklist,
    useUpdateComplianceChecklist,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { EmptyState } from "@/components/layouts/empty-state";
import { CheckSquare, ClipboardList } from "lucide-react";
import type { DetailPageConfig } from "@/types/detail-page-config";

const CONFIG: DetailPageConfig = {
    entityKey: "compliance_checklists",
    titleKey: "name",
    statusKey: "status",
    icon: ClipboardList,
    backHref: "/compliance-checklists",
    backLabel: "Compliance Checklists",
    chatterRecordType: "compliance_checklist",
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "category", label: "Category", accessorKey: "category" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    fields: [
        { id: "description", label: "Description", accessorKey: "description", fullWidth: true },
    ],
    tabs: [
        {
            id: "items",
            label: "Checklist Items",
            content: (
                <EmptyState
                    icon={CheckSquare}
                    title="No checklist items yet"
                    description="Individual compliance checklist items will appear here."
                    compact
                />
            ),
        },
    ],
};

export default function ComplianceChecklistDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: checklist, isLoading } = useComplianceChecklist(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Compliance Checklist",
        listPath: "/compliance-checklists",
        useUpdateHook: useUpdateComplianceChecklist,
        useDeleteHook: useDeleteComplianceChecklist,
    });

    return (
        <DetailPageShell
            config={CONFIG}
            id={entityId}
            record={checklist as Record<string, unknown> | null}
            isLoading={isLoading}
            menuItems={crudMenuItems}
        />
    );
}
