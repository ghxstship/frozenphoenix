"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface DetailCrudOptions {
    entityId: string;
    entityLabel: string;
    entityKey?: string | undefined;
    listPath: string;
    /**
     * @internal `any` is intentional — function params are contravariant.
     * Using `unknown` would prevent assigning concrete UseMutationResult hooks.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useUpdateHook: () => { mutateAsync: (vars: any) => Promise<any>; isPending: boolean };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useDeleteHook: () => { mutateAsync: (vars: any) => Promise<any>; isPending: boolean };
}

export function useDetailCrud({
    entityId,
    entityLabel,
    entityKey,
    listPath,
    useUpdateHook,
    useDeleteHook,
}: DetailCrudOptions) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { confirm } = useConfirm();
    const { addToast } = useToast();
    const updateMutation = useUpdateHook();
    const deleteMutation = useDeleteHook();

    const handleUpdate = useCallback(
        async (updates: Record<string, unknown>) => {
            // Optimistic update: apply changes to cache immediately
            const cacheKey = entityKey ? [entityKey, entityId] : undefined;
            let previousData: unknown;
            if (cacheKey) {
                previousData = queryClient.getQueryData(cacheKey);
                if (previousData) {
                    queryClient.setQueryData(cacheKey, { ...previousData, ...updates });
                }
            }

            try {
                await updateMutation.mutateAsync({ id: entityId, ...updates });
                addToast({
                    title: `${entityLabel} updated`,
                    variant: "success",
                });
            } catch (error) {
                // Rollback optimistic update on failure
                if (cacheKey && previousData) {
                    queryClient.setQueryData(cacheKey, previousData);
                }
                logger.error(`Failed to update ${entityLabel}`, { error });
                addToast({
                    title: `Failed to update ${entityLabel}`,
                    description:
                        error instanceof Error ? error.message : "An unexpected error occurred.",
                    variant: "destructive",
                });
            }
        },
        [updateMutation, entityId, entityLabel, entityKey, queryClient, addToast]
    );

    const handleDelete = useCallback(async () => {
        const confirmed = await confirm({
            title: `Delete ${entityLabel}`,
            description: `Are you sure you want to delete this ${entityLabel.toLowerCase()}? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
        });
        if (!confirmed) return;
        try {
            await deleteMutation.mutateAsync(entityId);
            addToast({
                title: `${entityLabel} deleted`,
                variant: "success",
            });
            router.push(listPath);
        } catch (error) {
            logger.error(`Failed to delete ${entityLabel}`, { error });
            addToast({
                title: `Failed to delete ${entityLabel}`,
                description:
                    error instanceof Error ? error.message : "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }, [confirm, deleteMutation, entityId, listPath, entityLabel, router, addToast]);

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
