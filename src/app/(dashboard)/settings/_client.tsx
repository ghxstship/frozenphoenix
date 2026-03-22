"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import { getInitials } from "@/lib/utils";
import { SettingsPageShell } from "@/components/shells/settings-page-shell";
import type { SettingsPageConfig } from "@/types/settings-page-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/supabase/auth-context";
import { useSettings } from "@/lib/settings/settings-provider";
import { PermissionGate } from "@/components/app/permission-guard";
import { useTheme } from "@/components/app/theme-provider";
import type { SettingCategory } from "@/types/settings";
import {
    AtSign,
    Award,
    Bell,
    Building2,
    CheckCircle2,
    ExternalLink,
    Heart,
    Loader2,
    MapPin,
    Palette,
    Phone,
    Plane,
    Save,
    Shield,
    Upload,
    User,
    XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { buildAvatarPath, STORAGE_BUCKETS, useUploadFile } from "@/lib/supabase/storage";
import { useUpdateProfile } from "@/lib/supabase/auth-actions";
import { useUpdateOrganization } from "@/lib/supabase/hooks-admin";
import Image from "next/image";
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog";
import { ROLE_LABELS } from "@/config/rbac";
import { SettingsCategorySection } from "./_components/settings-category-section";
import { AppearanceTab } from "./_tabs/appearance-tab";
import { NotificationsTab, SecurityTab } from "./_tabs/security-notifications-tab";

export function SettingsPageClient() {
    const {
        colorMode: _cm,
        accentColor: _ac,
        density: _d,
        borderRadius: _br,
        fontFamily: _ff,
        fontSizeScale: _fs,
        shadowIntensity: _si,
        glassEffect: _ge,
        animationSpeed: _as,
    } = useTheme();
    const { user, profile, memberships, activeOrg, isOwner, refreshProfile } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();
    const { settings, loading: settingsLoading, updateSetting } = useSettings();

    // Profile form state — pre-populated from auth context
    const [profileName, setProfileName] = useState(profile?.display_name ?? "");
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

    // Organization & team hooks
    const updateOrg = useUpdateOrganization();
    const [editOrgName, setEditOrgName] = useState("");
    const [orgNameDirty, setOrgNameDirty] = useState(false);

    // Avatar upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadFile = useUploadFile();
    const updateProfile = useUpdateProfile();
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

    const handleAvatarFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
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
            if (file.size > 5 * 1024 * 1024) {
                addToast({
                    title: "File too large",
                    description: "Please upload an image under 5MB.",
                    variant: "destructive",
                });
                return;
            }

            // Open crop dialog with preview
            const objectUrl = URL.createObjectURL(file);
            setCropImageSrc(objectUrl);
            setCropDialogOpen(true);

            // Reset file input so the same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [user?.id, addToast]
    );

    const handleCropComplete = useCallback(
        async (croppedBlob: Blob) => {
            if (!user?.id) return;

            setAvatarUploading(true);
            try {
                const croppedFile = new File([croppedBlob], "avatar.jpg", {
                    type: "image/jpeg",
                });
                const path = buildAvatarPath(user.id, croppedFile.name);
                const result = await uploadFile.mutateAsync({
                    bucket: STORAGE_BUCKETS.AVATARS,
                    path,
                    file: croppedFile,
                    upsert: true,
                });

                // Update the profile record with the new public URL
                await updateProfile.mutateAsync({
                    userId: user.id,
                    updates: { avatar_url: result.publicUrl },
                });

                await refreshProfile();
                setCropDialogOpen(false);
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
                // Revoke object URL to free memory
                if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
            }
        },
        [user?.id, uploadFile, updateProfile, refreshProfile, addToast, cropImageSrc]
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

    const userRole = activeOrg?.role ?? "vendor";
    const userInitials = getInitials(profile?.display_name ?? "U");

    const profileContent = (
        <>
            {/* Avatar & Display Name */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="density-gap-section">
                    <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                            {profile?.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.display_name ?? "Avatar"}
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
                                onChange={handleAvatarFileSelect}
                                disabled={avatarUploading}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={avatarUploading}
                            >
                                {avatarUploading ? (
                                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {avatarUploading ? "Uploading…" : "Upload Photo"}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, WebP, GIF up to 5MB
                            </p>
                        </div>
                    </div>

                    {/* Avatar crop dialog */}
                    {cropImageSrc && (
                        <AvatarCropDialog
                            open={cropDialogOpen}
                            onOpenChange={setCropDialogOpen}
                            imageSrc={cropImageSrc}
                            onCropComplete={handleCropComplete}
                            loading={avatarUploading}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="profile-name" className="text-sm font-medium">
                                Display Name
                            </label>
                            <Input
                                id="profile-name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input id="profile-email" value={profileEmail} type="email" disabled />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-role" className="text-sm font-medium">
                                Role
                            </label>
                            <Input
                                id="profile-role"
                                value={ROLE_LABELS[userRole] ?? userRole}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-org" className="text-sm font-medium">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="legal-first" className="text-sm font-medium">
                                Legal First Name
                            </label>
                            <Input
                                id="legal-first"
                                value={legalFirstName}
                                onChange={(e) => setLegalFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="legal-middle" className="text-sm font-medium">
                                Legal Middle Name
                            </label>
                            <Input
                                id="legal-middle"
                                value={legalMiddleName}
                                onChange={(e) => setLegalMiddleName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="legal-last" className="text-sm font-medium">
                                Legal Last Name
                            </label>
                            <Input
                                id="legal-last"
                                value={legalLastName}
                                onChange={(e) => setLegalLastName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card mt-4">
                        <div className="space-y-2">
                            <label htmlFor="preferred-name" className="text-sm font-medium">
                                Preferred Name
                            </label>
                            <Input
                                id="preferred-name"
                                value={preferredName}
                                onChange={(e) => setPreferredName(e.target.value)}
                                placeholder="How you'd like to be addressed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="pronouns" className="text-sm font-medium">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="profile-phone" className="text-sm font-medium">
                                Phone
                            </label>
                            <Input
                                id="profile-phone"
                                type="tel"
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="profile-email-ro" className="text-sm font-medium">
                                Email
                            </label>
                            <Input id="profile-email-ro" value={profileEmail} disabled />
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
                    <div className="grid grid-cols-1 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="mail-street1" className="text-sm font-medium">
                                Street Address
                            </label>
                            <Input
                                id="mail-street1"
                                value={mailStreet1}
                                onChange={(e) => setMailStreet1(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="mail-street2" className="text-sm font-medium">
                                Apt / Suite / Unit
                            </label>
                            <Input
                                id="mail-street2"
                                value={mailStreet2}
                                onChange={(e) => setMailStreet2(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 density-gap-card">
                            <div className="space-y-2">
                                <label htmlFor="mail-city" className="text-sm font-medium">
                                    City
                                </label>
                                <Input
                                    id="mail-city"
                                    value={mailCity}
                                    onChange={(e) => setMailCity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="mail-state" className="text-sm font-medium">
                                    State / Province
                                </label>
                                <Input
                                    id="mail-state"
                                    value={mailState}
                                    onChange={(e) => setMailState(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="mail-postal" className="text-sm font-medium">
                                    Postal Code
                                </label>
                                <Input
                                    id="mail-postal"
                                    value={mailPostal}
                                    onChange={(e) => setMailPostal(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="mail-country" className="text-sm font-medium">
                                    Country
                                </label>
                                <Input
                                    id="mail-country"
                                    value={mailCountry}
                                    onChange={(e) => setMailCountry(e.target.value)}
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
                <CardContent className="density-gap-section">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={billingSameAsMailing}
                            onChange={(e) => setBillingSameAsMailing(e.target.checked)}
                            className="rounded border-input"
                        />
                        Same as mailing address
                    </label>
                    {!billingSameAsMailing && (
                        <div className="grid grid-cols-1 density-gap-card">
                            <div className="space-y-2">
                                <label htmlFor="bill-street1" className="text-sm font-medium">
                                    Street Address
                                </label>
                                <Input
                                    id="bill-street1"
                                    value={billStreet1}
                                    onChange={(e) => setBillStreet1(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="bill-street2" className="text-sm font-medium">
                                    Apt / Suite / Unit
                                </label>
                                <Input
                                    id="bill-street2"
                                    value={billStreet2}
                                    onChange={(e) => setBillStreet2(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 density-gap-card">
                                <div className="space-y-2">
                                    <label htmlFor="bill-city" className="text-sm font-medium">
                                        City
                                    </label>
                                    <Input
                                        id="bill-city"
                                        value={billCity}
                                        onChange={(e) => setBillCity(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bill-state" className="text-sm font-medium">
                                        State / Province
                                    </label>
                                    <Input
                                        id="bill-state"
                                        value={billState}
                                        onChange={(e) => setBillState(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bill-postal" className="text-sm font-medium">
                                        Postal Code
                                    </label>
                                    <Input
                                        id="bill-postal"
                                        value={billPostal}
                                        onChange={(e) => setBillPostal(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bill-country" className="text-sm font-medium">
                                        Country
                                    </label>
                                    <Input
                                        id="bill-country"
                                        value={billCountry}
                                        onChange={(e) => setBillCountry(e.target.value)}
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
                        This information is kept confidential and only shared with authorized
                        personnel during emergencies.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="ec-name" className="text-sm font-medium">
                                Full Name
                            </label>
                            <Input
                                id="ec-name"
                                value={ecName}
                                onChange={(e) => setEcName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="ec-relationship" className="text-sm font-medium">
                                Relationship
                            </label>
                            <Input
                                id="ec-relationship"
                                value={ecRelationship}
                                onChange={(e) => setEcRelationship(e.target.value)}
                                placeholder="e.g. Spouse, Parent, Sibling"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="ec-phone" className="text-sm font-medium">
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
                            <label htmlFor="ec-email" className="text-sm font-medium">
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
                        <label htmlFor="dietary" className="text-sm font-medium">
                            Dietary Needs &amp; Allergies
                        </label>
                        <Input
                            id="dietary"
                            value={dietaryRestrictions}
                            onChange={(e) => setDietaryRestrictions(e.target.value)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="tp-seat" className="text-sm font-medium">
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
                            <label htmlFor="tp-meal" className="text-sm font-medium">
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
                            <label htmlFor="tp-airline" className="text-sm font-medium">
                                Airline Loyalty Program
                            </label>
                            <Input
                                id="tp-airline"
                                value={tpAirlineLoyalty}
                                onChange={(e) => setTpAirlineLoyalty(e.target.value)}
                                placeholder="e.g. Delta SkyMiles #12345"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="tp-hotel" className="text-sm font-medium">
                                Hotel Loyalty Program
                            </label>
                            <Input
                                id="tp-hotel"
                                value={tpHotelLoyalty}
                                onChange={(e) => setTpHotelLoyalty(e.target.value)}
                                placeholder="e.g. Marriott Bonvoy #67890"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <label htmlFor="tp-notes" className="text-sm font-medium">
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
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
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
    );

    const organizationContent = (
        <PermissionGate resource="settings" action="read">
            <Card>
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="density-gap-section">
                    <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                        <div className="space-y-2">
                            <label htmlFor="org-name" className="text-sm font-medium">
                                Organization Name
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    id="org-name"
                                    value={
                                        orgNameDirty
                                            ? editOrgName
                                            : (activeOrg?.organizations?.name ?? "")
                                    }
                                    onChange={(e) => {
                                        setEditOrgName(e.target.value);
                                        setOrgNameDirty(true);
                                    }}
                                />
                                {orgNameDirty && (
                                    <Button
                                        size="sm"
                                        disabled={updateOrg.isPending || !editOrgName.trim()}
                                        onClick={() => {
                                            if (!activeOrg?.organization_id) return;
                                            updateOrg.mutate(
                                                {
                                                    id: activeOrg.organization_id,
                                                    name: editOrgName.trim(),
                                                },
                                                { onSuccess: () => setOrgNameDirty(false) }
                                            );
                                        }}
                                    >
                                        <Save className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="org-role" className="text-sm font-medium">
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
                                        {m.user_id === user?.id ? userInitials : "??"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {m.user_id === user?.id
                                                ? (profile?.display_name ?? "You")
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
                    <PermissionGate resource="invitations" action="write" silent>
                        <Button
                            variant="ghost"
                            className="w-full mt-3"
                            onClick={() => router.push("/onboarding/invite-team")}
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
    );

    const notificationsContent = (
        <NotificationsTab
            settingsLoading={settingsLoading}
            settingsContent={
                <SettingsCategorySection
                    category="notifications"
                    settings={settings}
                    onSave={handleSaveSetting}
                />
            }
        />
    );

    const securityContent = <SecurityTab />;

    const appearanceContent = <AppearanceTab handleSaveSetting={handleSaveSetting} />;

    const config: SettingsPageConfig = {
        resource: "settings",
        action: "read",
        title: "Settings",
        description: "Manage your account, organization, and preferences",
        orientation: "vertical",
        tabs: [
            { id: "profile", label: "Profile", icon: User, content: profileContent },
            {
                id: "organization",
                label: "Organization",
                icon: Building2,
                content: organizationContent,
            },
            {
                id: "notifications",
                label: "Notifications",
                icon: Bell,
                content: notificationsContent,
            },
            { id: "security", label: "Security", icon: Shield, content: securityContent },
            { id: "appearance", label: "Appearance", icon: Palette, content: appearanceContent },
        ],
    };

    return <SettingsPageShell config={config} />;
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
                headers: csrfHeaders({ "Content-Type": "application/json" }),
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
            <CardContent className="density-gap-section">
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
                                <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
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
            <CardContent className="density-gap-section">
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
                                        <Loader2 className="h-4 w-4 motion-safe:animate-spin text-muted-foreground" />
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
                                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
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
