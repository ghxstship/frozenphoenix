"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseQueryTabStateOptions<T extends string> {
    key?: string;
    defaultValue: T;
    validValues: readonly T[];
}

export function useQueryTabState<T extends string>({
    key = "tab",
    defaultValue,
    validValues,
}: UseQueryTabStateOptions<T>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const value = React.useMemo<T>(() => {
        const queryValue = searchParams.get(key) as T | null;
        if (queryValue && validValues.includes(queryValue)) {
            return queryValue;
        }
        return defaultValue;
    }, [defaultValue, key, searchParams, validValues]);

    const setValue = React.useCallback(
        (nextValue: T) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(key, nextValue);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [key, pathname, router, searchParams]
    );

    return [value, setValue] as const;
}
