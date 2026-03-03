import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import {
    ArrowLeft,
    Building2,
    Copy,
    ExternalLink,
    Globe,
    Linkedin,
    MapPin,
    Users,
} from "lucide-react";
import Link from "next/link";

interface OrgProfileData {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    cover_image_url: string | null;
    tagline: string | null;
    description: string | null;
    industry: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    location: string | null;
    employee_count_range: string | null;
    profile_visibility: string;
}

interface MemberPreview {
    user_id: string;
    role: string;
    user_profiles: {
        username: string | null;
        display_name: string;
        avatar_url: string | null;
        headline: string | null;
    } | null;
}

async function getOrgProfile(slug: string): Promise<{
    org: OrgProfileData;
    members: MemberPreview[];
    memberCount: number;
} | null> {
    const admin = createAdminClient();
    if (!admin) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const { data: org } = await db
        .from("organizations")
        .select(
            "id, name, slug, logo_url, cover_image_url, tagline, description, industry, website_url, linkedin_url, location, employee_count_range, profile_visibility"
        )
        .eq("slug", slug)
        .single();

    if (!org || org.profile_visibility === "private") {
        return null;
    }

    // Get member count
    const { count } = await db
        .from("org_memberships")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("status", "active");

    // Get first few public members for preview
    let members: MemberPreview[] = [];
    if (org.profile_visibility === "public") {
        const { data: memberData } = await db
            .from("org_memberships")
            .select("user_id, role, user_profiles(username, display_name, avatar_url, headline)")
            .eq("organization_id", org.id)
            .eq("status", "active")
            .limit(6);
        members = memberData ?? [];
    }

    return { org, members, memberCount: count ?? 0 };
}

export default async function PublicOrgProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const data = await getOrgProfile(slug);

    if (!data) {
        notFound();
    }

    const { org, members, memberCount } = data;

    const orgInitials = org.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <button
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground"
                        title="Copy organization link"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Share
                    </button>
                </div>
            </nav>

            {/* Cover image */}
            {org.cover_image_url && (
                <div className="h-48 md:h-64 bg-secondary overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={org.cover_image_url}
                        alt={`${org.name} cover`}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Profile content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Org header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    {org.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={org.logo_url}
                            alt={org.name}
                            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-border"
                        />
                    ) : (
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-border">
                            <span className="text-xl font-bold text-primary-foreground">
                                {orgInitials}
                            </span>
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
                        {org.tagline && (
                            <p className="text-base text-muted-foreground mt-1">{org.tagline}</p>
                        )}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            {org.industry && (
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5" />
                                    {org.industry}
                                </span>
                            )}
                            {org.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {org.location}
                                </span>
                            )}
                            {org.employee_count_range && (
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {org.employee_count_range} employees
                                </span>
                            )}
                            {memberCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            {org.website_url && (
                                <a
                                    href={org.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            {org.linkedin_url && (
                                <a
                                    href={org.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                    <Linkedin className="h-3.5 w-3.5" />
                                    LinkedIn
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {org.description && (
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2">About</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                            {org.description}
                        </p>
                    </section>
                )}

                {/* Team preview */}
                {members.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Team</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {members
                                .filter((m) => m.user_profiles)
                                .map((m) => {
                                    const p = m.user_profiles!;
                                    const memberInitials = p.display_name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2);

                                    const href = p.username ? `/u/${p.username}` : "#";

                                    return (
                                        <Link
                                            key={m.user_id}
                                            href={href}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/5 transition-colors"
                                        >
                                            {p.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={p.avatar_url}
                                                    alt={p.display_name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-primary">
                                                        {memberInitials}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">
                                                    {p.display_name}
                                                </p>
                                                {p.username && (
                                                    <p className="text-xs text-muted-foreground">
                                                        @{p.username}
                                                    </p>
                                                )}
                                                {p.headline && (
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {p.headline}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export function generateMetadata({ params }: { params: { slug: string } }) {
    return {
        title: `${params.slug} — Organization`,
        description: `View the profile of ${params.slug}`,
    };
}
