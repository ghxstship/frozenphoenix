"use client";

import { useTranslation } from "@/lib/i18n/locale-provider";

/**
 * Type-safe access to messaging i18n strings with interpolation.
 * Usage:
 *   const ms = useMessagingStrings();
 *   ms("chat_members_count", { count: 5 }) → "5 members"
 *   ms("panel_title") → "Messages"
 */
export function useMessagingStrings() {
    const { t } = useTranslation("messaging");
    return t;
}
