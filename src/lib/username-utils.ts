/* ═══════════════════════════════════════════════════════════════
   USERNAME UTILITIES — Shared logic for username operations
   ═══════════════════════════════════════════════════════════════ */

import type { ServerClient } from "@/lib/supabase/server";
import { serverFromTable } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

// ─── Client-side reserved words (mirrors DB reserved_usernames table) ──
// This is a subset for fast client-side pre-validation.
// The DB table is the canonical source of truth.
export const RESERVED_USERNAMES = new Set([
    "admin",
    "api",
    "app",
    "auth",
    "billing",
    "blog",
    "calendar",
    "cdn",
    "config",
    "dashboard",
    "docs",
    "email",
    "events",
    "explore",
    "feed",
    "graphql",
    "help",
    "home",
    "inbox",
    "internal",
    "invite",
    "jobs",
    "login",
    "logout",
    "mail",
    "manage",
    "marketplace",
    "me",
    "notifications",
    "null",
    "onboarding",
    "org",
    "organizations",
    "portal",
    "privacy",
    "profile",
    "projects",
    "public",
    "root",
    "search",
    "security",
    "settings",
    "setup",
    "signup",
    "status",
    "support",
    "system",
    "teams",
    "terms",
    "test",
    "undefined",
    "user",
    "users",
    "webhooks",
    "www",
    "playbook",
    "rilla",
    "frozenphoenix",
    "frozen-phoenix",
]);

// ─── Username change cooldown: 30 days ──────────────────────
export const USERNAME_CHANGE_COOLDOWN_DAYS = 30;

interface AvailabilityResult {
    available: boolean;
    reason: string | null;
}

/**
 * Check whether a username is available.
 * Uses direct queries (bypasses generated types for new tables).
 */
export async function checkUsernameAvailable(
    admin: ServerClient,
    username: string
): Promise<AvailabilityResult> {
    const normalized = username.toLowerCase().trim();

    // Format guard
    if (normalized.length < 3 || normalized.length > 40) {
        return { available: false, reason: "Username must be 3-40 characters" };
    }
    if (!/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(normalized)) {
        return {
            available: false,
            reason: "Username must start and end with a letter or number",
        };
    }

    // Reserved check
    const { data: reserved } = await serverFromTable(admin, "reserved_usernames")
        .select("username")
        .eq("username", normalized)
        .maybeSingle();

    if (reserved) {
        return { available: false, reason: "This username is reserved" };
    }

    // Taken by existing user
    const { data: existing } = await serverFromTable(admin, "user_profiles")
        .select("id")
        .ilike("username", normalized)
        .maybeSingle();

    if (existing) {
        return { available: false, reason: "This username is already taken" };
    }

    // Cooldown check (recently released)
    const { data: released } = await serverFromTable(admin, "released_usernames")
        .select("claimable_after")
        .ilike("username", normalized)
        .gt("claimable_after", new Date().toISOString())
        .maybeSingle();

    if (released) {
        return {
            available: false,
            reason: "This username was recently released and is not yet available",
        };
    }

    return { available: true, reason: null };
}

/**
 * Generate up to 3 available username suggestions based on a desired base.
 */
export async function generateUsernameSuggestions(
    admin: ServerClient,
    base: string,
    maxSuggestions = 3
): Promise<string[]> {
    const clean = slugify(base).replace(/-/g, ".");
    const year = new Date().getFullYear().toString().slice(-2);
    const rand = Math.floor(Math.random() * 900 + 100);

    const candidates = [
        `${clean}${year}`,
        `${clean}.${rand}`,
        `${clean}-pro`,
        `the.${clean}`,
        `${clean}.official`,
        `${clean}${Math.floor(Math.random() * 99)}`,
    ].filter((s) => s.length >= 3 && s.length <= 40);

    const available: string[] = [];
    for (const candidate of candidates) {
        if (available.length >= maxSuggestions) break;
        const result = await checkUsernameAvailable(admin, candidate);
        if (result.available) {
            available.push(candidate);
        }
    }

    return available;
}

/**
 * Check whether a user is within the username change cooldown period.
 */
export async function isWithinChangeCooldown(
    admin: ServerClient,
    userId: string
): Promise<{ blocked: boolean; nextChangeAt: string | null }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - USERNAME_CHANGE_COOLDOWN_DAYS);

    const { data: profile } = await serverFromTable(admin, "user_profiles")
        .select("username_changed_at")
        .eq("id", userId)
        .single();

    if (!profile?.username_changed_at) {
        return { blocked: false, nextChangeAt: null };
    }

    const lastChanged = new Date(profile.username_changed_at as string);
    if (lastChanged > cutoff) {
        const nextChange = new Date(lastChanged);
        nextChange.setDate(nextChange.getDate() + USERNAME_CHANGE_COOLDOWN_DAYS);
        return { blocked: true, nextChangeAt: nextChange.toISOString() };
    }

    return { blocked: false, nextChangeAt: null };
}
