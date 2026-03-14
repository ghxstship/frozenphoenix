"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/supabase/auth-context";
import { useSettings } from "@/lib/settings/settings-provider";
import {
    useNotificationPreferences,
    useRevokeSession,
    useUpsertNotificationPreferences,
    useUserSessions,
} from "@/lib/settings/hooks";
import { SettingRow } from "@/components/settings/setting-row";
import { PermissionGate } from "@/components/permission-guard";
import {
    ACCENT_PRESETS,
    ANIMATION_PRESETS,
    BORDER_RADIUS_PRESETS,
    DENSITY_SCALE,
    FONT_FAMILY_PRESETS,
    FONT_SIZE_PRESETS,
    SHADOW_PRESETS,
    useTheme,
} from "@/components/theme-provider";
import type {
    AccentColor,
    AnimationSpeed,
    BorderRadiusScale,
    ColorMode,
    FontFamilyChoice,
    FontSizeScale,
    GlassEffect,
    LayoutDensity,
    ShadowIntensity,
} from "@/components/theme-provider";
import type { ResolvedSetting, SettingCategory } from "@/types/settings";
import {
    AtSign,
    Award,
    Bell,
    Building2,
    CheckCircle2,
    ExternalLink,
    Heart,
    Key,
    Loader2,
    LogOut,
    Mail,
    MapPin,
    Monitor,
    Moon,
    Palette,
    Phone,
    Plane,
    Save,
    Shield,
    Smartphone,
    Sun,
    Upload,
    User,
    XCircle,
} from "lucide-react";
import { TabBar } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { buildAvatarPath, STORAGE_BUCKETS, useUploadFile } from "@/lib/supabase/storage";
import { useUpdateProfile } from "@/lib/supabase/auth-actions";
import Image from "next/image";

const ROLE_LABELS: Record<string, string> = {
    exec: "Executive",
    director: "Director",
    pm: "Project Manager",
    member: "Team Member",
    client: "Client",
    collaborator: "Collaborator",
};

type SettingsTab = "profile" | "organization" | "notifications" | "security" | "appearance";

const SETTINGS_TAB_VALUES = [
    "profile",
    "organization",
    "notifications",
    "security",
    "appearance",
] as const;

const tabs = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "organization", label: "Organization", icon: <Building2 className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
];

function SettingsCategorySection({
    category,
    settings,
    onSave,
}: {
    category: SettingCategory;
    settings: Map<string, ResolvedSetting>;
    onSave: (category: SettingCategory, key: string, value: unknown) => Promise<void>;
}) {
    const filtered = Array.from(settings.values()).filter(
        (s) => s.definition.category === category
    );
    if (filtered.length === 0) return null;

    return (
        <div className="space-y-1">
            {filtered
                .sort((a, b) => a.definition.display_order - b.definition.display_order)
                .map((setting) => (
                    <SettingRow key={setting.definition.key} setting={setting} onSave={onSave} />
                ))}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useQueryTabState<SettingsTab>({
        key: "tab",
        defaultValue: "profile",
        validValues: SETTINGS_TAB_VALUES,
    });
    const {
        colorMode,
        setColorMode,
        accentColor,
        setAccentColor,
        density: currentDensity,
        setDensity,
        borderRadius: currentRadius,
        setBorderRadius,
        fontFamily: currentFont,
        setFontFamily,
        fontSizeScale: currentFontSize,
        setFontSizeScale,
        shadowIntensity: currentShadow,
        setShadowIntensity,
        glassEffect: currentGlass,
        setGlassEffect,
        animationSpeed: currentAnimation,
        setAnimationSpeed,
    } = useTheme();
    const { user, profile, memberships, activeOrg, isOwner, refreshProfile } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { settings, loading: settingsLoading, updateSetting } = useSettings();

    // Profile form state — pre-populated from auth context
    const [profileName, setProfileName] = useState(profile?.name ?? "");
    const [profileEmail] = useState(user?.email ?? "");
    const [profileSaving, setProfileSaving] = useState(false);

    // Extended profile fields
    const [legalFirstName, setLegalFirstName] = useState("");
    const [legalMiddleName, setLegalMiddleName] = useState("");
    const [legalLastName, setLegalLastName] = useState("");
    const [preferredName, setPreferredName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [profilePhone, setProfilePhone] = useState("");

    // Mailing address
    const [mailStreet1, setMailStreet1] = useState("");
    const [mailStreet2, setMailStreet2] = useState("");
    const [mailCity, setMailCity] = useState("");
    const [mailState, setMailState] = useState("");
    const [mailPostal, setMailPostal] = useState("");
    const [mailCountry, setMailCountry] = useState("");

    // Billing address
    const [billStreet1, setBillStreet1] = useState("");
    const [billStreet2, setBillStreet2] = useState("");
    const [billCity, setBillCity] = useState("");
    const [billState, setBillState] = useState("");
    const [billPostal, setBillPostal] = useState("");
    const [billCountry, setBillCountry] = useState("");
    const [billingSameAsMailing, setBillingSameAsMailing] = useState(false);

    // Emergency contact
    const [ecName, setEcName] = useState("");
    const [ecRelationship, setEcRelationship] = useState("");
    const [ecPhone, setEcPhone] = useState("");
    const [ecEmail, setEcEmail] = useState("");

    // Dietary
    const [dietaryRestrictions, setDietaryRestrictions] = useState("");

    // Travel profile
    const [tpSeatPref, setTpSeatPref] = useState("");
    const [tpMealPref, setTpMealPref] = useState("");
    const [tpAirlineLoyalty, setTpAirlineLoyalty] = useState("");
    const [tpHotelLoyalty, setTpHotelLoyalty] = useState("");
    const [tpNotes, setTpNotes] = useState("");

    // Avatar upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadFile = useUploadFile();
    const updateProfile = useUpdateProfile();
    const [avatarUploading, setAvatarUploading] = useState(false);

    const handleAvatarUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !user?.id) return;

            // Validate file type and size
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                addToast({
                    title: "Invalid file type",
                    description: "Please upload a JPG, PNG, WebP, or GIF image.",
                    variant: "destructive",
                });
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                addToast({
                    title: "File too large",
                    description: "Please upload an image under 2MB.",
                    variant: "destructive",
                });
                return;
            }

            setAvatarUploading(true);
            try {
                const path = buildAvatarPath(user.id, file.name);
                const result = await uploadFile.mutateAsync({
                    bucket: STORAGE_BUCKETS.AVATARS,
                    path,
                    file,
                    upsert: true,
                });

                // Update the profile record with the new public URL
                await updateProfile.mutateAsync({
                    userId: user.id,
                    updates: { avatar_url: result.publicUrl },
                });

                await refreshProfile();
                addToast({
                    title: "Photo updated",
                    description: "Your profile photo has been uploaded.",
                    variant: "default",
                });
            } catch (err) {
                addToast({
                    title: "Upload failed",
                    description: err instanceof Error ? err.message : "Something went wrong.",
                    variant: "destructive",
                });
            } finally {
                setAvatarUploading(false);
                // Reset file input so the same file can be re-selected
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        },
        [user?.id, uploadFile, updateProfile, refreshProfile, addToast]
    );

    // Notification preferences
    const { data: notifPrefs } = useNotificationPreferences(user?.id ?? null);
    const upsertNotifPrefs = useUpsertNotificationPreferences();

    // Sessions
    const { data: sessions } = useUserSessions(user?.id ?? null);
    const revokeSession = useRevokeSession();

    const handleNotifToggle = useCallback(
        (channel: string, enabled: boolean) => {
            if (!user?.id) return;
            upsertNotifPrefs.mutate({
                user_id: user.id,
                [channel]: enabled,
            });
        },
        [user?.id, upsertNotifPrefs]
    );

    const handleSaveSetting = useCallback(
        async (category: SettingCategory, key: string, value: unknown) => {
            await updateSetting(category, key, value);
        },
        [updateSetting]
    );

    // Hydrate extended fields when profile loads
    useEffect(() => {
        if (!profile) return;
        const p = profile as Record<string, unknown>;
        setLegalFirstName((p.legal_first_name as string) ?? "");
        setLegalMiddleName((p.legal_middle_name as string) ?? "");
        setLegalLastName((p.legal_last_name as string) ?? "");
        setPreferredName((p.preferred_name as string) ?? "");
        setPronouns((p.pronouns as string) ?? "");
        setProfilePhone((p.phone as string) ?? "");
        setDietaryRestrictions((p.dietary_restrictions as string) ?? "");
        setEcName((p.emergency_contact_name as string) ?? "");
        setEcRelationship((p.emergency_contact_relationship as string) ?? "");
        setEcPhone((p.emergency_contact_phone as string) ?? "");
        setEcEmail((p.emergency_contact_email as string) ?? "");

        const mail = (p.mailing_address ?? {}) as Record<string, string>;
        setMailStreet1(mail.street1 ?? "");
        setMailStreet2(mail.street2 ?? "");
        setMailCity(mail.city ?? "");
        setMailState(mail.state ?? "");
        setMailPostal(mail.postal_code ?? "");
        setMailCountry(mail.country ?? "");

        const bill = (p.billing_address ?? {}) as Record<string, string>;
        setBillStreet1(bill.street1 ?? "");
        setBillStreet2(bill.street2 ?? "");
        setBillCity(bill.city ?? "");
        setBillState(bill.state ?? "");
        setBillPostal(bill.postal_code ?? "");
        setBillCountry(bill.country ?? "");

        const tp = (p.travel_preferences ?? {}) as Record<string, string>;
        setTpSeatPref(tp.seat_preference ?? "");
        setTpMealPref(tp.meal_preference ?? "");
        setTpAirlineLoyalty(tp.airline_loyalty ?? "");
        setTpHotelLoyalty(tp.hotel_loyalty ?? "");
        setTpNotes(tp.notes ?? "");
    }, [profile]);

    const handleSaveProfile = useCallback(async () => {
        if (!user?.id) return;
        setProfileSaving(true);
        try {
            const mailingAddr = {
                street1: mailStreet1,
                street2: mailStreet2,
                city: mailCity,
                state: mailState,
                postal_code: mailPostal,
                country: mailCountry,
            };
            const billingAddr = billingSameAsMailing
                ? mailingAddr
                : {
                      street1: billStreet1,
                      street2: billStreet2,
                      city: billCity,
                      state: billState,
                      postal_code: billPostal,
                      country: billCountry,
                  };
            const travelPrefs = {
                seat_preference: tpSeatPref,
                meal_preference: tpMealPref,
                airline_loyalty: tpAirlineLoyalty,
                hotel_loyalty: tpHotelLoyalty,
                notes: tpNotes,
            };

            const updates = {
                name: profileName,
                legal_first_name: legalFirstName || null,
                legal_middle_name: legalMiddleName || null,
                legal_last_name: legalLastName || null,
                preferred_name: preferredName || null,
                pronouns: pronouns || null,
                phone: profilePhone || null,
                mailing_address: mailingAddr,
                billing_address: billingAddr,
                emergency_contact_name: ecName || null,
                emergency_contact_relationship: ecRelationship || null,
                emergency_contact_phone: ecPhone || null,
                emergency_contact_email: ecEmail || null,
                dietary_restrictions: dietaryRestrictions || null,
                travel_preferences: travelPrefs,
            };

            await updateProfile.mutateAsync({ userId: user.id, updates });
            await refreshProfile();
            addToast({
                title: "Profile saved",
                description: "Your profile has been updated.",
                variant: "default",
            });
        } catch (err) {
            addToast({
                title: "Save failed",
                description: err instanceof Error ? err.message : "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setProfileSaving(false);
        }
    }, [
        user?.id,
        profileName,
        legalFirstName,
        legalMiddleName,
        legalLastName,
        preferredName,
        pronouns,
        profilePhone,
        mailStreet1,
        mailStreet2,
        mailCity,
        mailState,
        mailPostal,
        mailCountry,
        billStreet1,
        billStreet2,
        billCity,
        billState,
        billPostal,
        billCountry,
        billingSameAsMailing,
        ecName,
        ecRelationship,
        ecPhone,
        ecEmail,
        dietaryRestrictions,
        tpSeatPref,
        tpMealPref,
        tpAirlineLoyalty,
        tpHotelLoyalty,
        tpNotes,
        updateProfile,
        refreshProfile,
        addToast,
    ]);

    const userRole = activeOrg?.role ?? profile?.role ?? "vendor";
    const userInitials = (profile?.name ?? "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Settings"
                description="Manage your account, organization, and preferences"
            />

            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="lg:w-64 shrink-0">
                    <CardContent className="p-2">
                        <TabBar
                            idPrefix="settings-tabs"
                            ariaLabel="Settings navigation"
                            orientation="vertical"
                            variant="pill"
                            items={tabs}
                            value={activeTab}
                            onValueChange={(tabId) => setActiveTab(tabId as SettingsTab)}
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                <div className="flex-1 space-y-6">
                    <div
                        role="tabpanel"
                        id={`settings-tabs-tabpanel-${activeTab}`}
                        aria-labelledby={`settings-tabs-tab-${activeTab}`}
                    >
                        {/* ─── Profile Tab ─── */}
                        {activeTab === "profile" && (
                            <>
                                {/* Avatar & Display Name */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Profile Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                                                {profile?.avatar_url ? (
                                                    <Image
                                                        src={profile.avatar_url}
                                                        alt={profile.name ?? "Avatar"}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    userInitials
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    className="sr-only"
                                                    id="avatar-upload"
                                                    onChange={handleAvatarUpload}
                                                    disabled={avatarUploading}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={avatarUploading}
                                                >
                                                    {avatarUploading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                    {avatarUploading
                                                        ? "Uploading…"
                                                        : "Upload Photo"}
                                                </Button>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    JPG, PNG, WebP, GIF up to 2MB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-name"
                                                    className="text-sm font-medium"
                                                >
                                                    Display Name
                                                </label>
                                                <Input
                                                    id="profile-name"
                                                    value={profileName}
                                                    onChange={(e) => setProfileName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-email"
                                                    className="text-sm font-medium"
                                                >
                                                    Email
                                                </label>
                                                <Input
                                                    id="profile-email"
                                                    value={profileEmail}
                                                    type="email"
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-role"
                                                    className="text-sm font-medium"
                                                >
                                                    Role
                                                </label>
                                                <Input
                                                    id="profile-role"
                                                    value={ROLE_LABELS[userRole] ?? userRole}
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-org"
                                                    className="text-sm font-medium"
                                                >
                                                    Organization
                                                </label>
                                                <Input
                                                    id="profile-org"
                                                    value={activeOrg?.organizations?.name ?? "—"}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Legal Name & Identity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Legal Name &amp; Identity
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Used for contracts, payroll, and compliance documents.
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="legal-first"
                                                    className="text-sm font-medium"
                                                >
                                                    Legal First Name
                                                </label>
                                                <Input
                                                    id="legal-first"
                                                    value={legalFirstName}
                                                    onChange={(e) =>
                                                        setLegalFirstName(e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="legal-middle"
                                                    className="text-sm font-medium"
                                                >
                                                    Legal Middle Name
                                                </label>
                                                <Input
                                                    id="legal-middle"
                                                    value={legalMiddleName}
                                                    onChange={(e) =>
                                                        setLegalMiddleName(e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="legal-last"
                                                    className="text-sm font-medium"
                                                >
                                                    Legal Last Name
                                                </label>
                                                <Input
                                                    id="legal-last"
                                                    value={legalLastName}
                                                    onChange={(e) =>
                                                        setLegalLastName(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="preferred-name"
                                                    className="text-sm font-medium"
                                                >
                                                    Preferred Name
                                                </label>
                                                <Input
                                                    id="preferred-name"
                                                    value={preferredName}
                                                    onChange={(e) =>
                                                        setPreferredName(e.target.value)
                                                    }
                                                    placeholder="How you'd like to be addressed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="pronouns"
                                                    className="text-sm font-medium"
                                                >
                                                    Pronouns
                                                </label>
                                                <Input
                                                    id="pronouns"
                                                    value={pronouns}
                                                    onChange={(e) => setPronouns(e.target.value)}
                                                    placeholder="e.g. he/him, she/her, they/them"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Contact */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-phone"
                                                    className="text-sm font-medium"
                                                >
                                                    Phone
                                                </label>
                                                <Input
                                                    id="profile-phone"
                                                    type="tel"
                                                    value={profilePhone}
                                                    onChange={(e) =>
                                                        setProfilePhone(e.target.value)
                                                    }
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="profile-email-ro"
                                                    className="text-sm font-medium"
                                                >
                                                    Email
                                                </label>
                                                <Input
                                                    id="profile-email-ro"
                                                    value={profileEmail}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Mailing Address */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Mailing Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="mail-street1"
                                                    className="text-sm font-medium"
                                                >
                                                    Street Address
                                                </label>
                                                <Input
                                                    id="mail-street1"
                                                    value={mailStreet1}
                                                    onChange={(e) => setMailStreet1(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="mail-street2"
                                                    className="text-sm font-medium"
                                                >
                                                    Apt / Suite / Unit
                                                </label>
                                                <Input
                                                    id="mail-street2"
                                                    value={mailStreet2}
                                                    onChange={(e) => setMailStreet2(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="mail-city"
                                                        className="text-sm font-medium"
                                                    >
                                                        City
                                                    </label>
                                                    <Input
                                                        id="mail-city"
                                                        value={mailCity}
                                                        onChange={(e) =>
                                                            setMailCity(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="mail-state"
                                                        className="text-sm font-medium"
                                                    >
                                                        State / Province
                                                    </label>
                                                    <Input
                                                        id="mail-state"
                                                        value={mailState}
                                                        onChange={(e) =>
                                                            setMailState(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="mail-postal"
                                                        className="text-sm font-medium"
                                                    >
                                                        Postal Code
                                                    </label>
                                                    <Input
                                                        id="mail-postal"
                                                        value={mailPostal}
                                                        onChange={(e) =>
                                                            setMailPostal(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="mail-country"
                                                        className="text-sm font-medium"
                                                    >
                                                        Country
                                                    </label>
                                                    <Input
                                                        id="mail-country"
                                                        value={mailCountry}
                                                        onChange={(e) =>
                                                            setMailCountry(e.target.value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Billing Address */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Billing Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={billingSameAsMailing}
                                                onChange={(e) =>
                                                    setBillingSameAsMailing(e.target.checked)
                                                }
                                                className="rounded border-input"
                                            />
                                            Same as mailing address
                                        </label>
                                        {!billingSameAsMailing && (
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="bill-street1"
                                                        className="text-sm font-medium"
                                                    >
                                                        Street Address
                                                    </label>
                                                    <Input
                                                        id="bill-street1"
                                                        value={billStreet1}
                                                        onChange={(e) =>
                                                            setBillStreet1(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="bill-street2"
                                                        className="text-sm font-medium"
                                                    >
                                                        Apt / Suite / Unit
                                                    </label>
                                                    <Input
                                                        id="bill-street2"
                                                        value={billStreet2}
                                                        onChange={(e) =>
                                                            setBillStreet2(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="bill-city"
                                                            className="text-sm font-medium"
                                                        >
                                                            City
                                                        </label>
                                                        <Input
                                                            id="bill-city"
                                                            value={billCity}
                                                            onChange={(e) =>
                                                                setBillCity(e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="bill-state"
                                                            className="text-sm font-medium"
                                                        >
                                                            State / Province
                                                        </label>
                                                        <Input
                                                            id="bill-state"
                                                            value={billState}
                                                            onChange={(e) =>
                                                                setBillState(e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="bill-postal"
                                                            className="text-sm font-medium"
                                                        >
                                                            Postal Code
                                                        </label>
                                                        <Input
                                                            id="bill-postal"
                                                            value={billPostal}
                                                            onChange={(e) =>
                                                                setBillPostal(e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="bill-country"
                                                            className="text-sm font-medium"
                                                        >
                                                            Country
                                                        </label>
                                                        <Input
                                                            id="bill-country"
                                                            value={billCountry}
                                                            onChange={(e) =>
                                                                setBillCountry(e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Emergency Contact */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Emergency Contact
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            This information is kept confidential and only shared
                                            with authorized personnel during emergencies.
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="ec-name"
                                                    className="text-sm font-medium"
                                                >
                                                    Full Name
                                                </label>
                                                <Input
                                                    id="ec-name"
                                                    value={ecName}
                                                    onChange={(e) => setEcName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="ec-relationship"
                                                    className="text-sm font-medium"
                                                >
                                                    Relationship
                                                </label>
                                                <Input
                                                    id="ec-relationship"
                                                    value={ecRelationship}
                                                    onChange={(e) =>
                                                        setEcRelationship(e.target.value)
                                                    }
                                                    placeholder="e.g. Spouse, Parent, Sibling"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="ec-phone"
                                                    className="text-sm font-medium"
                                                >
                                                    Phone
                                                </label>
                                                <Input
                                                    id="ec-phone"
                                                    type="tel"
                                                    value={ecPhone}
                                                    onChange={(e) => setEcPhone(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="ec-email"
                                                    className="text-sm font-medium"
                                                >
                                                    Email
                                                </label>
                                                <Input
                                                    id="ec-email"
                                                    type="email"
                                                    value={ecEmail}
                                                    onChange={(e) => setEcEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Dietary Restrictions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            Dietary Restrictions
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Used for event catering and meal planning.
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="dietary"
                                                className="text-sm font-medium"
                                            >
                                                Dietary Needs &amp; Allergies
                                            </label>
                                            <Input
                                                id="dietary"
                                                value={dietaryRestrictions}
                                                onChange={(e) =>
                                                    setDietaryRestrictions(e.target.value)
                                                }
                                                placeholder="e.g. Vegetarian, Gluten-free, Nut allergy"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Travel Preferences */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Plane className="h-4 w-4" />
                                            Travel Preferences
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Used when booking travel for events and projects.
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="tp-seat"
                                                    className="text-sm font-medium"
                                                >
                                                    Seat Preference
                                                </label>
                                                <Input
                                                    id="tp-seat"
                                                    value={tpSeatPref}
                                                    onChange={(e) => setTpSeatPref(e.target.value)}
                                                    placeholder="e.g. Window, Aisle"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="tp-meal"
                                                    className="text-sm font-medium"
                                                >
                                                    Meal Preference
                                                </label>
                                                <Input
                                                    id="tp-meal"
                                                    value={tpMealPref}
                                                    onChange={(e) => setTpMealPref(e.target.value)}
                                                    placeholder="e.g. Vegetarian, Kosher"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="tp-airline"
                                                    className="text-sm font-medium"
                                                >
                                                    Airline Loyalty Program
                                                </label>
                                                <Input
                                                    id="tp-airline"
                                                    value={tpAirlineLoyalty}
                                                    onChange={(e) =>
                                                        setTpAirlineLoyalty(e.target.value)
                                                    }
                                                    placeholder="e.g. Delta SkyMiles #12345"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="tp-hotel"
                                                    className="text-sm font-medium"
                                                >
                                                    Hotel Loyalty Program
                                                </label>
                                                <Input
                                                    id="tp-hotel"
                                                    value={tpHotelLoyalty}
                                                    onChange={(e) =>
                                                        setTpHotelLoyalty(e.target.value)
                                                    }
                                                    placeholder="e.g. Marriott Bonvoy #67890"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            <label
                                                htmlFor="tp-notes"
                                                className="text-sm font-medium"
                                            >
                                                Additional Notes
                                            </label>
                                            <Input
                                                id="tp-notes"
                                                value={tpNotes}
                                                onChange={(e) => setTpNotes(e.target.value)}
                                                placeholder="TSA PreCheck, wheelchair assistance, etc."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Save All Changes */}
                                <div className="flex justify-end sticky bottom-4 z-10">
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={profileSaving}
                                        size="lg"
                                        className="shadow-lg"
                                    >
                                        {profileSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Save All Changes
                                    </Button>
                                </div>

                                <UsernameCard />

                                {/* User Preferences from settings framework */}
                                {!settingsLoading && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Preferences</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <SettingsCategorySection
                                                category="preferences"
                                                settings={settings}
                                                onSave={handleSaveSetting}
                                            />
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}

                        {/* ─── Organization Tab ─── */}
                        {activeTab === "organization" && (
                            <PermissionGate resource="settings" action="read">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organization Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="org-name"
                                                    className="text-sm font-medium"
                                                >
                                                    Organization Name
                                                </label>
                                                <Input
                                                    id="org-name"
                                                    value={activeOrg?.organizations?.name ?? "—"}
                                                    disabled
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="org-role"
                                                    className="text-sm font-medium"
                                                >
                                                    Your Role
                                                </label>
                                                <Input
                                                    id="org-role"
                                                    value={ROLE_LABELS[userRole] ?? userRole}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Team Members</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {memberships.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                                            {m.user_id === user?.id
                                                                ? userInitials
                                                                : "??"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {m.user_id === user?.id
                                                                    ? (profile?.name ?? "You")
                                                                    : m.user_id.slice(0, 8)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {m.organizations?.name ?? "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            m.role === "exec"
                                                                ? "default"
                                                                : m.role === "pm"
                                                                  ? "info"
                                                                  : "warning"
                                                        }
                                                    >
                                                        {ROLE_LABELS[m.role] ?? m.role}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                        <PermissionGate
                                            resource="invitations"
                                            action="write"
                                            silent
                                        >
                                            <Button
                                                variant="ghost"
                                                className="w-full mt-3"
                                                onClick={() =>
                                                    router.push("/onboarding/invite-team")
                                                }
                                            >
                                                <User className="h-4 w-4" />
                                                Invite Team Member
                                            </Button>
                                        </PermissionGate>
                                    </CardContent>
                                </Card>

                                {/* Org-scoped settings */}
                                {!settingsLoading && (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Governance & Compliance</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="governance"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Security Controls</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="security"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Operational Controls</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="operational"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {isOwner && <TransferOwnershipCard />}
                            </PermissionGate>
                        )}

                        {/* ─── Notifications Tab ─── */}
                        {activeTab === "notifications" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Category settings from framework */}
                                    {!settingsLoading && (
                                        <SettingsCategorySection
                                            category="notifications"
                                            settings={settings}
                                            onSave={handleSaveSetting}
                                        />
                                    )}

                                    <div className="pt-4 border-t border-border">
                                        <h4 className="text-sm font-semibold mb-3">
                                            Delivery Methods
                                        </h4>
                                        <div className="space-y-2">
                                            {[
                                                { id: "email_enabled", label: "Email", icon: Mail },
                                                {
                                                    id: "push_enabled",
                                                    label: "Push Notifications",
                                                    icon: Bell,
                                                },
                                                {
                                                    id: "sms_enabled",
                                                    label: "SMS",
                                                    icon: Smartphone,
                                                },
                                            ].map((method) => {
                                                const enabled = notifPrefs
                                                    ? Boolean(
                                                          (notifPrefs as Record<string, unknown>)[
                                                              method.id
                                                          ] ?? method.id === "email_enabled"
                                                      )
                                                    : method.id === "email_enabled";
                                                return (
                                                    <div
                                                        key={method.id}
                                                        className="flex items-center justify-between p-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <method.icon className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {method.label}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleNotifToggle(
                                                                    method.id,
                                                                    !enabled
                                                                )
                                                            }
                                                            className={`h-6 w-11 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
                                                            role="switch"
                                                            aria-checked={enabled}
                                                            aria-label={`Toggle ${method.label}`}
                                                        >
                                                            <div
                                                                className={`h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
                                                            />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* ─── Security Tab ─── */}
                        {activeTab === "security" && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="current-password"
                                                className="text-sm font-medium"
                                            >
                                                Current Password
                                            </label>
                                            <Input
                                                id="current-password"
                                                type="password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="new-password"
                                                className="text-sm font-medium"
                                            >
                                                New Password
                                            </label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="confirm-password"
                                                className="text-sm font-medium"
                                            >
                                                Confirm New Password
                                            </label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <Button onClick={() => router.push("/settings/security")}>
                                            <Key className="h-4 w-4" />
                                            Update Password
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Two-Factor Authentication</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                                            <div>
                                                <p className="text-sm font-medium">2FA Status</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Add an extra layer of security to your account
                                                </p>
                                            </div>
                                            <Badge variant="ghost">Not Enabled</Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="mt-3"
                                            onClick={() => router.push("/auth/mfa-setup")}
                                        >
                                            <Shield className="h-4 w-4" />
                                            Enable 2FA
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Active Sessions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {sessions && sessions.length > 0 ? (
                                                sessions.map((session: Record<string, unknown>) => {
                                                    const s = session as Record<string, unknown>;
                                                    return (
                                                        <div
                                                            key={s.id as string}
                                                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Monitor className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {(s.device_name as string) ??
                                                                            "Unknown device"}{" "}
                                                                        —{" "}
                                                                        {(s.browser as string) ??
                                                                            "Unknown browser"}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {(s.ip_address as string) ??
                                                                            "—"}{" "}
                                                                        · Last active:{" "}
                                                                        {s.last_active_at
                                                                            ? new Date(
                                                                                  s.last_active_at as string
                                                                              ).toLocaleDateString()
                                                                            : "—"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant={
                                                                        (s.is_active as boolean)
                                                                            ? "success"
                                                                            : "ghost"
                                                                    }
                                                                >
                                                                    {(s.is_active as boolean)
                                                                        ? "Active"
                                                                        : "Ended"}
                                                                </Badge>
                                                                {(s.is_active as boolean) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            revokeSession.mutate(
                                                                                s.id as string
                                                                            )
                                                                        }
                                                                    >
                                                                        <LogOut className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                                                    <div className="flex items-center gap-3">
                                                        <Monitor className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                Current Session
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Active now
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="success">Active</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* ─── Appearance Tab ─── */}
                        {activeTab === "appearance" && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Theme Preferences</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <p className="text-sm font-medium mb-3">Color Mode</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {[
                                                    {
                                                        id: "light" as ColorMode,
                                                        label: "Light",
                                                        icon: Sun,
                                                    },
                                                    {
                                                        id: "dark" as ColorMode,
                                                        label: "Dark",
                                                        icon: Moon,
                                                    },
                                                    {
                                                        id: "system" as ColorMode,
                                                        label: "System",
                                                        icon: Monitor,
                                                    },
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => {
                                                            setColorMode(mode.id);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "theme",
                                                                mode.id
                                                            );
                                                        }}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                                                            colorMode === mode.id
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                        }`}
                                                    >
                                                        <mode.icon
                                                            className={`h-6 w-6 ${colorMode === mode.id ? "text-primary" : "text-muted-foreground"}`}
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {mode.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">Accent Color</p>
                                            <div className="flex gap-3">
                                                {(
                                                    Object.entries(ACCENT_PRESETS) as [
                                                        AccentColor,
                                                        (typeof ACCENT_PRESETS)[AccentColor],
                                                    ][]
                                                ).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setAccentColor(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "accent_color",
                                                                key
                                                            );
                                                        }}
                                                        className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all ${
                                                            accentColor === key
                                                                ? "ring-foreground scale-110"
                                                                : "ring-transparent hover:ring-muted-foreground"
                                                        }`}
                                                        style={{
                                                            backgroundColor: `hsl(${preset.hsl})`,
                                                        }}
                                                        title={preset.label}
                                                        aria-label={`Accent color: ${preset.label}`}
                                                        aria-pressed={accentColor === key}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">Density</p>
                                            <div className="flex gap-2">
                                                {(
                                                    Object.keys(DENSITY_SCALE) as LayoutDensity[]
                                                ).map((densityKey) => (
                                                    <button
                                                        key={densityKey}
                                                        onClick={() => {
                                                            setDensity(densityKey);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "layout_density",
                                                                densityKey
                                                            );
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentDensity === densityKey
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-secondary hover:bg-secondary/80"
                                                        }`}
                                                        aria-pressed={currentDensity === densityKey}
                                                    >
                                                        {densityKey.charAt(0).toUpperCase() +
                                                            densityKey.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Shape & Typography</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <p className="text-sm font-medium mb-3">
                                                Border Radius
                                            </p>
                                            <div className="flex gap-2">
                                                {(
                                                    Object.entries(BORDER_RADIUS_PRESETS) as [
                                                        BorderRadiusScale,
                                                        (typeof BORDER_RADIUS_PRESETS)[BorderRadiusScale],
                                                    ][]
                                                ).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setBorderRadius(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "border_radius",
                                                                key
                                                            );
                                                        }}
                                                        className={`flex flex-col items-center gap-1.5 px-3 py-2.5 border-2 transition-colors ${
                                                            currentRadius === key
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                        }`}
                                                        style={{
                                                            borderRadius:
                                                                preset.value === "9999px"
                                                                    ? "1rem"
                                                                    : preset.value,
                                                        }}
                                                        aria-pressed={currentRadius === key}
                                                        aria-label={`Border radius: ${preset.label}`}
                                                    >
                                                        <div
                                                            className="h-6 w-10 border-2 border-foreground/30 bg-muted"
                                                            style={{ borderRadius: preset.value }}
                                                        />
                                                        <span className="text-xs font-medium">
                                                            {preset.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">Font Family</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {(
                                                    Object.entries(FONT_FAMILY_PRESETS) as [
                                                        FontFamilyChoice,
                                                        (typeof FONT_FAMILY_PRESETS)[FontFamilyChoice],
                                                    ][]
                                                ).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setFontFamily(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "font_family",
                                                                key
                                                            );
                                                        }}
                                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
                                                            currentFont === key
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                        }`}
                                                        aria-pressed={currentFont === key}
                                                        aria-label={`Font: ${preset.label}`}
                                                    >
                                                        <span
                                                            className="text-2xl font-semibold leading-none"
                                                            style={{ fontFamily: preset.stack }}
                                                        >
                                                            {preset.sample}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {preset.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">Font Size</p>
                                            <div className="flex gap-2">
                                                {(
                                                    Object.entries(FONT_SIZE_PRESETS) as [
                                                        FontSizeScale,
                                                        (typeof FONT_SIZE_PRESETS)[FontSizeScale],
                                                    ][]
                                                ).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setFontSizeScale(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "font_size_scale",
                                                                key
                                                            );
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentFontSize === key
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-secondary hover:bg-secondary/80"
                                                        }`}
                                                        aria-pressed={currentFontSize === key}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Effects & Motion</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <p className="text-sm font-medium mb-3">
                                                Shadow Intensity
                                            </p>
                                            <div className="flex gap-2">
                                                {(
                                                    Object.entries(SHADOW_PRESETS) as [
                                                        ShadowIntensity,
                                                        (typeof SHADOW_PRESETS)[ShadowIntensity],
                                                    ][]
                                                ).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setShadowIntensity(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "shadow_intensity",
                                                                key
                                                            );
                                                        }}
                                                        className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border-2 transition-colors ${
                                                            currentShadow === key
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                        }`}
                                                        aria-pressed={currentShadow === key}
                                                        aria-label={`Shadow: ${preset.label}`}
                                                    >
                                                        <div
                                                            className="h-6 w-10 rounded bg-card border border-border"
                                                            style={{
                                                                boxShadow:
                                                                    key === "none"
                                                                        ? "none"
                                                                        : key === "subtle"
                                                                          ? "0 2px 4px rgb(0 0 0 / 0.05)"
                                                                          : key === "default"
                                                                            ? "0 4px 8px rgb(0 0 0 / 0.1)"
                                                                            : "0 8px 16px rgb(0 0 0 / 0.2)",
                                                            }}
                                                        />
                                                        <span className="text-xs font-medium">
                                                            {preset.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">
                                                Glass / Blur Effects
                                            </p>
                                            <div className="flex gap-2">
                                                {(["on", "off"] as GlassEffect[]).map((key) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setGlassEffect(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "glass_effect",
                                                                key
                                                            );
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentGlass === key
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-secondary hover:bg-secondary/80"
                                                        }`}
                                                        aria-pressed={currentGlass === key}
                                                    >
                                                        {key === "on" ? "Enabled" : "Disabled"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium mb-3">
                                                Animation Speed
                                            </p>
                                            <div className="flex gap-2">
                                                {(
                                                    Object.entries(ANIMATION_PRESETS) as [
                                                        AnimationSpeed,
                                                        (typeof ANIMATION_PRESETS)[AnimationSpeed],
                                                    ][]
                                                ).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => {
                                                            setAnimationSpeed(key);
                                                            handleSaveSetting(
                                                                "preferences",
                                                                "animation_speed",
                                                                key
                                                            );
                                                        }}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            currentAnimation === key
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-secondary hover:bg-secondary/80"
                                                        }`}
                                                        aria-pressed={currentAnimation === key}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Branding settings (exec only) */}
                                {!settingsLoading && (
                                    <PermissionGate resource="brand" action="write" silent>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Branding</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <SettingsCategorySection
                                                    category="branding"
                                                    settings={settings}
                                                    onSave={handleSaveSetting}
                                                />
                                            </CardContent>
                                        </Card>
                                    </PermissionGate>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Transfer Ownership Card (used in Organization tab, owner-only) ──
function TransferOwnershipCard() {
    const { user, activeOrg, memberships, refreshProfile } = useAuth();
    const { addToast } = useToast();
    const [targetUserId, setTargetUserId] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [transferring, setTransferring] = useState(false);

    // Only show internal-role members from the same org (excluding self)
    const transferCandidates = memberships.filter(
        (m) =>
            m.organization_id === activeOrg?.organization_id &&
            m.user_id !== user?.id &&
            ["exec", "director", "pm", "member"].includes(m.role)
    );

    const orgName = activeOrg?.organizations?.name ?? "this organization";
    const confirmRequired = `transfer ${orgName}`;
    const canSubmit =
        targetUserId &&
        confirmText.toLowerCase().trim() === confirmRequired.toLowerCase().trim() &&
        !transferring;

    const handleTransfer = useCallback(async () => {
        if (!canSubmit || !activeOrg) return;
        setTransferring(true);
        try {
            const res = await fetch("/api/organizations/transfer-ownership", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organization_id: activeOrg.organization_id,
                    new_owner_user_id: targetUserId,
                }),
            });
            const contentType = res.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                addToast({
                    title: "Error",
                    description: "Unexpected server response. Please try again.",
                    variant: "destructive",
                });
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                addToast({
                    title: "Transfer failed",
                    description: data?.error?.message ?? "Something went wrong.",
                    variant: "destructive",
                });
                return;
            }
            addToast({
                title: "Ownership transferred",
                description: "You are no longer the organization owner.",
                variant: "default",
            });
            setTargetUserId("");
            setConfirmText("");
            await refreshProfile();
        } catch {
            addToast({
                title: "Error",
                description: "Network error. Please try again.",
                variant: "destructive",
            });
        } finally {
            setTransferring(false);
        }
    }, [canSubmit, activeOrg, targetUserId, addToast, refreshProfile]);

    return (
        <Card className="border-destructive/30">
            <CardHeader>
                <CardTitle className="text-destructive">Transfer Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Transfer organization ownership to another internal team member. The new owner
                    will gain full administrative control including billing, organization settings,
                    and the ability to delete the organization. This action is{" "}
                    <strong>irreversible</strong> without the new owner&apos;s consent.
                </p>

                {transferCandidates.length === 0 ? (
                    <div className="rounded-lg bg-secondary/30 p-4 text-sm text-muted-foreground">
                        No eligible team members found. Invite an internal team member before
                        transferring ownership.
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="transfer-target" className="text-sm font-medium">
                                New Owner
                            </label>
                            <select
                                id="transfer-target"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={transferring}
                            >
                                <option value="">Select a team member…</option>
                                {transferCandidates.map((m) => (
                                    <option key={m.user_id} value={m.user_id}>
                                        {m.user_id.slice(0, 8)}… ({ROLE_LABELS[m.role] ?? m.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="transfer-confirm" className="text-sm font-medium">
                                Type{" "}
                                <code className="text-xs bg-secondary px-1 py-0.5 rounded">
                                    transfer {orgName}
                                </code>{" "}
                                to confirm
                            </label>
                            <Input
                                id="transfer-confirm"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={`transfer ${orgName}`}
                                disabled={transferring}
                            />
                        </div>

                        <Button
                            variant="destructive"
                            onClick={handleTransfer}
                            disabled={!canSubmit}
                        >
                            {transferring ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ExternalLink className="h-4 w-4" />
                            )}
                            Transfer Ownership
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Username Management Card (used in Profile tab) ─────────────────
type UsernameAvailability = "idle" | "checking" | "available" | "unavailable";

function UsernameCard() {
    const { username, refreshProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState("");
    const [availability, setAvailability] = useState<UsernameAvailability>("idle");
    const [reason, setReason] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = useCallback((value: string) => {
        const normalized = value.toLowerCase().trim();
        setInput(normalized);
        if (normalized.length < 3) {
            setAvailability("idle");
            setReason(null);
            setSuggestions([]);
        }
    }, []);

    // Debounced availability check
    useEffect(() => {
        if (!editing || input.length < 3) return;

        const timer = setTimeout(async () => {
            setAvailability("checking");
            try {
                const res = await fetch(`/api/usernames/check?q=${encodeURIComponent(input)}`);
                if (!res.ok) {
                    setAvailability("idle");
                    return;
                }
                const data = await res.json();
                setAvailability(data.available ? "available" : "unavailable");
                setReason(data.reason ?? null);
                setSuggestions(data.suggestions ?? []);
            } catch {
                setAvailability("idle");
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [input, editing]);

    const handleSave = useCallback(async () => {
        if (availability !== "available" || !input) return;
        setSaving(true);
        setError(null);

        const endpoint = username ? "/api/usernames/change" : "/api/usernames/claim";
        const method = username ? "PATCH" : "POST";

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: input }),
            });

            const contentType = res.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                setError("Unexpected response. Please try again.");
                setSaving(false);
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                const msg =
                    typeof data.error === "string"
                        ? data.error
                        : (data.error?.message ?? "Failed to update username.");
                setError(msg);
                setSaving(false);
                return;
            }

            try {
                await refreshProfile();
            } catch {
                // best-effort
            }

            setSaving(false);
            setEditing(false);
            setInput("");
            setAvailability("idle");
        } catch {
            setError("Something went wrong. Please try again.");
            setSaving(false);
        }
    }, [input, availability, username, refreshProfile]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Username
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!editing ? (
                    <div className="flex items-center justify-between">
                        <div>
                            {username ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">@{username}</span>
                                    <a
                                        href={`/u/${username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        View profile
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No username set. Claim one to get a public profile.
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setEditing(true);
                                setInput(username ?? "");
                                setError(null);
                            }}
                        >
                            {username ? "Change" : "Claim Username"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="settings-username" className="text-sm font-medium">
                                {username ? "New Username" : "Choose a Username"}
                            </label>
                            <div className="relative">
                                <AtSign
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                                    aria-hidden="true"
                                />
                                <Input
                                    id="settings-username"
                                    value={input}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    placeholder="your.username"
                                    className="pl-10 pr-10"
                                    disabled={saving}
                                    autoComplete="off"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {availability === "checking" && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {availability === "available" && (
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                    )}
                                    {availability === "unavailable" && (
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                </div>
                            </div>
                            {availability === "available" && (
                                <p className="text-xs text-success">Username is available!</p>
                            )}
                            {availability === "unavailable" && reason && (
                                <p className="text-xs text-destructive">{reason}</p>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleInputChange(s)}
                                        className="px-2 py-1 text-xs rounded-md border border-border hover:bg-accent/10 transition-colors"
                                    >
                                        @{s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditing(false);
                                    setInput("");
                                    setError(null);
                                    setAvailability("idle");
                                }}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving || availability !== "available"}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {username ? "Change Username" : "Claim Username"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
