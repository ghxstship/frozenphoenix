"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brandConfig } from "@/config/brand";
import {
    Settings,
    User,
    Building2,
    Bell,
    Shield,
    Palette,
    Key,
    Mail,
    Save,
    Upload,
    Moon,
    Sun,
    Monitor,
} from "lucide-react";

type SettingsTab = "profile" | "organization" | "notifications" | "security" | "appearance";

const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Settings" description="Manage your account, organization, and preferences" />

            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="lg:w-64 shrink-0">
                    <CardContent className="p-2">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </CardContent>
                </Card>

                <div className="flex-1 space-y-6">
                    {activeTab === "profile" && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                                            AR
                                        </div>
                                        <div>
                                            <Button variant="ghost" size="sm">
                                                <Upload className="h-4 w-4" />
                                                Upload Photo
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Name</label>
                                            <Input defaultValue="Alex Rivera" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <Input defaultValue={`alex@${brandConfig.name.toLowerCase().replace(/\s+/g, '')}.com`} type="email" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Role</label>
                                            <Input defaultValue="Executive Producer" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone</label>
                                            <Input defaultValue="(555) 123-4567" type="tel" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === "organization" && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Organization Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Organization Name</label>
                                            <Input defaultValue={brandConfig.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Website</label>
                                            <Input defaultValue={brandConfig.support.url.replace('/support', '')} type="url" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Industry</label>
                                            <Input defaultValue="Technical Production & Fabrication" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Team Size</label>
                                            <Input defaultValue="25-50" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Team Members</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { name: "Alex Rivera", email: `alex@${brandConfig.name.toLowerCase().replace(/\s+/g, '')}.com`, role: "exec" },
                                            { name: "Jordan Park", email: `jordan@${brandConfig.name.toLowerCase().replace(/\s+/g, '')}.com`, role: "pm" },
                                            { name: "Sarah Chen", email: "sarah@nike.com", role: "client" },
                                        ].map((member) => (
                                            <div key={member.email} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                                        {member.name.split(" ").map((n) => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{member.name}</p>
                                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={member.role === "exec" ? "default" : member.role === "pm" ? "info" : "warning"}>
                                                    {member.role.toUpperCase()}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="w-full mt-3">
                                        <User className="h-4 w-4" />
                                        Invite Team Member
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === "notifications" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { id: "approvals", label: "Approval Requests", description: "Get notified when approvals are pending or overdue", enabled: true },
                                    { id: "tasks", label: "Task Updates", description: "Notifications for task assignments and status changes", enabled: true },
                                    { id: "projects", label: "Project Milestones", description: "Phase transitions and project completions", enabled: true },
                                    { id: "finance", label: "Financial Alerts", description: "Budget warnings and invoice notifications", enabled: false },
                                    { id: "crew", label: "Crew & Scheduling", description: "Shift changes and certification expirations", enabled: true },
                                    { id: "vendors", label: "Vendor Updates", description: "COI expirations and vendor status changes", enabled: false },
                                ].map((pref) => (
                                    <div key={pref.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium">{pref.label}</p>
                                            <p className="text-xs text-muted-foreground">{pref.description}</p>
                                        </div>
                                        <button
                                            className={`h-6 w-11 rounded-full transition-colors ${pref.enabled ? "bg-primary" : "bg-muted"}`}
                                        >
                                            <div
                                                className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${pref.enabled ? "translate-x-5" : "translate-x-0.5"}`}
                                            />
                                        </button>
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-border">
                                    <h4 className="text-sm font-semibold mb-3">Delivery Methods</h4>
                                    <div className="space-y-2">
                                        {[
                                            { id: "email", label: "Email", icon: Mail, enabled: true },
                                            { id: "push", label: "Push Notifications", icon: Bell, enabled: true },
                                        ].map((method) => (
                                            <div key={method.id} className="flex items-center justify-between p-2">
                                                <div className="flex items-center gap-2">
                                                    <method.icon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{method.label}</span>
                                                </div>
                                                <button
                                                    className={`h-5 w-9 rounded-full transition-colors ${method.enabled ? "bg-primary" : "bg-muted"}`}
                                                >
                                                    <div
                                                        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${method.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Password</label>
                                        <Input type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <Input type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm New Password</label>
                                        <Input type="password" placeholder="••••••••" />
                                    </div>
                                    <Button>
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
                                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                                        </div>
                                        <Badge variant="ghost">Not Enabled</Badge>
                                    </div>
                                    <Button variant="ghost" className="mt-3">
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
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <Monitor className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">MacBook Pro — Chrome</p>
                                                    <p className="text-xs text-muted-foreground">Los Angeles, CA · Current session</p>
                                                </div>
                                            </div>
                                            <Badge variant="success">Active</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {activeTab === "appearance" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Theme Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium mb-3">Color Mode</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: "light", label: "Light", icon: Sun },
                                            { id: "dark", label: "Dark", icon: Moon },
                                            { id: "system", label: "System", icon: Monitor },
                                        ].map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setTheme(mode.id as typeof theme)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === mode.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                <mode.icon className={`h-6 w-6 ${theme === mode.id ? "text-primary" : "text-muted-foreground"}`} />
                                                <span className="text-sm font-medium">{mode.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-3">Accent Color</p>
                                    <div className="flex gap-2">
                                        {[
                                            { color: "bg-blue-500", name: "Blue" },
                                            { color: "bg-violet-500", name: "Violet" },
                                            { color: "bg-rose-500", name: "Rose" },
                                            { color: "bg-orange-500", name: "Orange" },
                                            { color: "bg-emerald-500", name: "Emerald" },
                                        ].map((accent) => (
                                            <button
                                                key={accent.name}
                                                className={`h-8 w-8 rounded-full ${accent.color} ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-primary transition-all`}
                                                title={accent.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium mb-3">Density</p>
                                    <div className="flex gap-2">
                                        {["Compact", "Default", "Comfortable"].map((density) => (
                                            <button
                                                key={density}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${density === "Default"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary hover:bg-secondary/80"
                                                    }`}
                                            >
                                                {density}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
