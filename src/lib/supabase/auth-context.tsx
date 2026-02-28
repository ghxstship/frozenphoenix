"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient, isSupabaseConfigured } from "./client";
import type { User, Session } from "@supabase/supabase-js";
import type { Tables } from "./database.types";

type Profile = Tables<"profiles">;

// ─── Org Membership (lightweight shape for context) ────────────
interface OrgMembership {
    id: string;
    user_id: string;
    organization_id: string;
    role: string;
    status: string;
    is_default: boolean;
    organizations?: {
        id: string;
        name: string;
        slug: string;
    } | null;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    memberships: OrgMembership[];
    activeOrg: OrgMembership | null;
    switchOrg: (orgId: string) => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AUTH_ACTIVE_ORG_KEY = "fp-active-org-id";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [memberships, setMemberships] = useState<OrgMembership[]>([]);
    const [activeOrgId, setActiveOrgId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(AUTH_ACTIVE_ORG_KEY);
        }
        return null;
    });
    const [loading, setLoading] = useState(!isSupabaseConfigured ? false : true);

    const supabase = useMemo(() => createClient(), []);

    // Derive active org from memberships + stored preference
    const activeOrg = useMemo(() => {
        if (memberships.length === 0) return null;
        if (activeOrgId) {
            const match = memberships.find((m) => m.organization_id === activeOrgId);
            if (match) return match;
        }
        // Fallback: default org, or first membership
        return memberships.find((m) => m.is_default) || memberships[0];
    }, [memberships, activeOrgId]);

    const switchOrg = useCallback((orgId: string) => {
        setActiveOrgId(orgId);
        if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_ACTIVE_ORG_KEY, orgId);
        }
    }, []);

    const fetchMemberships = useCallback(async (userId: string) => {
        if (!supabase) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
            .from("org_memberships")
            .select("id, user_id, organization_id, role, status, is_default, organizations(id, name, slug)")
            .eq("user_id", userId)
            .eq("status", "active");

        if (data && data.length > 0) {
            setMemberships(data as unknown as OrgMembership[]);
            return;
        }

        // No org_memberships — create one in the default org
        const { data: defaultOrg } = await supabase
            .from("organizations")
            .select("id")
            .eq("slug", "default")
            .single();

        if (defaultOrg) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: created } = await (supabase as any)
                .from("org_memberships")
                .upsert(
                    {
                        user_id: userId,
                        organization_id: defaultOrg.id,
                        role: "pm",
                        status: "active",
                        is_default: true,
                    },
                    { onConflict: "user_id,organization_id" }
                )
                .select("id, user_id, organization_id, role, status, is_default, organizations(id, name, slug)")
                .single();

            if (created) {
                setMemberships([created as unknown as OrgMembership]);
            }
        }
    }, [supabase]);

    const fetchProfile = useCallback(async (userId: string) => {
        if (!supabase) return;
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (data) {
            setProfile(data as Profile);
            return;
        }

        // Profile row missing — DB trigger may have failed.
        // Create it from auth metadata so the user is never stuck as "Guest".
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const displayName =
            authUser.user_metadata?.name ||
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "User";

        const { data: created } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: userId,
                    email: authUser.email ?? "",
                    name: displayName,
                },
                { onConflict: "id" }
            )
            .select("*")
            .single();

        setProfile((created as Profile | null) ?? null);
    }, [supabase]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
            await fetchMemberships(user.id);
        }
    }, [user, fetchProfile, fetchMemberships]);

    const signOut = useCallback(async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        setMemberships([]);
        setActiveOrgId(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUTH_ACTIVE_ORG_KEY);
        }
    }, [supabase]);

    useEffect(() => {
        if (!supabase || !isSupabaseConfigured) {
            return;
        }

        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
                await fetchMemberships(session.user.id);
            }

            setLoading(false);
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
                await fetchMemberships(session.user.id);
            } else {
                setProfile(null);
                setMemberships([]);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchProfile, fetchMemberships]);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                memberships,
                activeOrg,
                switchOrg,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
