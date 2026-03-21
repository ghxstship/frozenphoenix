"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { useNetworkStatus } from "@/components/network-status";

interface MutationWithToastOptions<TData, TVariables> {
    mutationFn: (variables: TVariables) => Promise<TData>;
    invalidateKeys?: string[][];
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData) => void;
}

export function useMutationWithToast<TData, TVariables>({
    mutationFn,
    invalidateKeys = [],
    successMessage,
    errorMessage = "Something went wrong. Please try again.",
    onSuccess,
}: MutationWithToastOptions<TData, TVariables>) {
    const queryClient = useQueryClient();
    const { addToast } = useToast();
    const { isOnline } = useNetworkStatus();

    return useMutation({
        mutationFn: async (variables: TVariables) => {
            if (!isOnline) {
                throw new Error("You are offline. Please check your connection and try again.");
            }
            return mutationFn(variables);
        },
        onSuccess: (data) => {
            if (successMessage) {
                addToast({ title: successMessage, variant: "success" });
            }
            for (const key of invalidateKeys) {
                queryClient.invalidateQueries({ queryKey: key });
            }
            onSuccess?.(data);
        },
        onError: (error: Error) => {
            addToast({
                title: "Error",
                description: error.message || errorMessage,
                variant: "destructive",
            });
        },
    });
}
