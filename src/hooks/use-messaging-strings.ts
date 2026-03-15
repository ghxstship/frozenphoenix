"use client";

import { useMemo } from "react";
import { MESSAGING_STRINGS, type MessagingStringKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";

/**
 * Type-safe access to messaging i18n strings with interpolation.
 * Usage:
 *   const ms = useMessagingStrings();
 *   ms("chat_members_count", { count: 5 }) → "5 members"
 *   ms("panel_title") → "Messages"
 */
export function useMessagingStrings() {
    return useMemo(
        () =>
            (key: MessagingStringKey, vars?: Record<string, string | number>): string =>
                t(MESSAGING_STRINGS[key], vars),
        []
    );
}
