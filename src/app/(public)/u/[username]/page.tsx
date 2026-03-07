import { notFound } from "next/navigation";
import { createAdminClient, serverFromTable } from "@/lib/supabase/server";
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Copy,
    ExternalLink,
    Globe,
    Linkedin,
    MapPin,
    Shield,
} from "lucide-react";
import Link from "next/link";

interface ProfileData {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    headline: string | null;
    bio: string | null;
    job_title: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    location: string | null;
    profile_visibility: string;
}

interface OrgMembership {
    role: string;
    organizations: {
        name: string;
        slug: string;
        logo_url: string | null;
    } | null;
}

async function getPublicProfile(username: string): Promise<{
    profile: ProfileData;
    memberships: OrgMembership[];
} | null> {
    const admin = createAdminClient();
    if (!admin) return null;

    const { data: profile } = await serverFromTable(admin!, "user_profiles")
        .select(
            "id, username, display_name, avatar_url, headline, bio, job_title, website_url, linkedin_url, location, profile_visibility"
        )
        .ilike("username", username)
        .single();

    if (!profile || profile.profile_visibility === "private") {
        return null;
    }

    // Only fetch org memberships if profile is public
    let memberships: OrgMembership[] = [];
    if (profile.profile_visibility === "public") {
        const { data: orgs } = await serverFromTable(admin!, "org_memberships")
            .select("role, organizations(name, slug, logo_url)")
            .eq("user_id", profile.id)
            .eq("status", "active");
        memberships = orgs ?? [];
    }

    return { profile, memberships };
}

export default async function PublicUserProfilePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const data = await getPublicProfile(username);

    if (!data) {
        notFound();
    }

    const { profile, memberships } = data;
    const initials = profile.display_name
        .split(" ")
        .map((n: string) => n[0])
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
                    <div className="flex items-center gap-2">
                        <CopyLinkButton />
                    </div>
                </div>
            </nav>

            {/* Profile content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Profile header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    {/* Avatar */}
                    {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profile.avatar_url}
                            alt={profile.display_name}
                            className="h-24 w-24 rounded-2xl object-cover ring-2 ring-border"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-border">
                            <span className="text-2xl font-bold text-primary-foreground">
                                {initials}
                            </span>
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {profile.display_name}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>

                        {profile.headline && <p className="text-base mt-2">{profile.headline}</p>}

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            {profile.job_title && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {profile.job_title}
                                </span>
                            )}
                            {profile.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {profile.location}
                                </span>
                            )}
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            {profile.website_url && (
                                <a
                                    href={profile.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a
                                    href={profile.linkedin_url}
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

                {/* Bio */}
                {profile.bio && (
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2">About</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{profile.bio}</p>
                    </section>
                )}

                {/* Organizations */}
                {memberships.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                            Organizations
                        </h2>
                        <div className="space-y-3">
                            {memberships
                                .filter((m) => m.organizations)
                                .map((m) => (
                                    <Link
                                        key={m.organizations!.slug}
                                        href={`/org/${m.organizations!.slug}`}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/5 transition-colors"
                                    >
                                        {m.organizations!.logo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={m.organizations!.logo_url}
                                                alt={m.organizations!.name}
                                                className="h-10 w-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {m.organizations!.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {m.role}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </section>
                )}

                {/* Visibility indicator */}
                {profile.profile_visibility !== "public" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-8 pt-4 border-t border-border">
                        <Shield className="h-3.5 w-3.5" />
                        Limited profile — some information may be hidden
                    </div>
                )}
            </main>
        </div>
    );
}

function CopyLinkButton() {
    return (
        <button
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground"
            title="Copy profile link"
        >
            <Copy className="h-3.5 w-3.5" />
            Share
        </button>
    );
}

export function generateMetadata({ params }: { params: { username: string } }) {
    return {
        title: `@${params.username} — Profile`,
        description: `View the professional profile of @${params.username}`,
    };
}
