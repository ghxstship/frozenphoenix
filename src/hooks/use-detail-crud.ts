"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { logger } from "@/lib/logger";

interface DetailCrudOptions {
    entityId: string;
    entityLabel: string;
    listPath: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useUpdateHook: () => { mutateAsync: (vars: any) => Promise<any>; isPending: boolean };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useDeleteHook: () => { mutateAsync: (vars: any) => Promise<any>; isPending: boolean };
}

export function useDetailCrud({
    entityId,
    entityLabel,
    listPath,
    useUpdateHook,
    useDeleteHook,
}: DetailCrudOptions) {
    const router = useRouter();
    const updateMutation = useUpdateHook();
    const deleteMutation = useDeleteHook();

    const handleUpdate = useCallback(
        async (updates: Record<string, unknown>) => {
            try {
                await updateMutation.mutateAsync({ id: entityId, ...updates });
            } catch (error) {
                logger.error(`Failed to update ${entityLabel}`, { error });
            }
        },
        [updateMutation, entityId, entityLabel]
    );

    const handleDelete = useCallback(async () => {
        try {
            await deleteMutation.mutateAsync(entityId);
            router.push(listPath);
        } catch (error) {
            logger.error(`Failed to delete ${entityLabel}`, { error });
        }
    }, [deleteMutation, entityId, listPath, entityLabel, router]);

    const menuItems = [
        {
            label: deleteMutation.isPending ? "Deleting…" : `Delete ${entityLabel}`,
            onClick: handleDelete,
            variant: "destructive" as const,
        },
    ];

    return {
        handleUpdate,
        handleDelete,
        menuItems,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
