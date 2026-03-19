"use client";

import { useEffect, useState } from "react";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { useProviderConnections } from "@/lib/supabase/hooks-external-sync";
import { CheckCircle2, ExternalLink, Link2, Plus, Store } from "lucide-react";

interface CatalogItem {
    id: string;
    provider_type: string;
    display_name: string;
    description: string | null;
    category: string;
    auth_type: string;
    is_available: boolean;
    is_beta: boolean;
    features: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
    finance: "Finance & Accounting",
    project_management: "Project Management",
    communications: "Communications",
    erp: "ERP",
    ticketing: "Ticketing & Events",
    crm: "CRM & Sales",
    hr: "HR & Workforce",
    storage: "Storage & Documents",
    ipaas: "Integration Platforms",
    pos: "Point of Sale",
};

export function MarketplacePageClient() {
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const { data: connections } = useProviderConnections();
    const connectedTypes = new Set(
        ((connections ?? []) as Record<string, unknown>[])
            .filter((c) => c.is_active)
            .map((c) => c.provider_type as string)
    );

    useEffect(() => {
        async function loadCatalog() {
            try {
                const res = await fetch("/api/integration-catalog");
                if (res.ok) {
                    const data = await res.json();
                    setCatalog(data.data ?? []);
                }
            } catch {
                // Use empty catalog
            } finally {
                setIsLoading(false);
            }
        }
        loadCatalog();
    }, []);

    const categories = [...new Set(catalog.map((c) => c.category))].sort();

    const filtered = catalog.filter((item) => {
        const matchesSearch =
            !search ||
            item.display_name.toLowerCase().includes(search.toLowerCase()) ||
            (item.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const grouped = categories
        .filter((cat) => categoryFilter === "all" || cat === categoryFilter)
        .map((cat) => ({
            category: cat,
            label: CATEGORY_LABELS[cat] ?? cat,
            items: filtered.filter((i) => i.category === cat),
        }))
        .filter((g) => g.items.length > 0);

    const contentSlot = (
        <div className="density-gap-page">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search integrations..."
                    className="flex-1 max-w-sm"
                />
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={categoryFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("all")}
                    >
                        All
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={categoryFilter === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {CATEGORY_LABELS[cat] ?? cat}
                        </Button>
                    ))}
                </div>
            </div>

            {grouped.length === 0 ? (
                <EmptyState
                    icon={Store}
                    title="No integrations found"
                    description="Try adjusting your search or filter criteria."
                />
            ) : (
                grouped.map((group) => (
                    <div key={group.category}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                            {group.label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.items.map((item) => {
                                const isConnected = connectedTypes.has(item.provider_type);
                                return (
                                    <Card
                                        key={item.id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <CardContent className="py-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Link2 className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold">
                                                                {item.display_name}
                                                            </h4>
                                                            {item.is_beta && (
                                                                <Badge
                                                                    variant="warning"
                                                                    className="text-[10px]"
                                                                >
                                                                    Beta
                                                                </Badge>
                                                            )}
                                                            {isConnected && (
                                                                <Badge
                                                                    variant="success"
                                                                    className="text-[10px]"
                                                                >
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                                                                    Connected
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <Badge
                                                                variant="ghost"
                                                                className="text-[10px]"
                                                            >
                                                                {item.auth_type === "oauth2"
                                                                    ? "OAuth 2.0"
                                                                    : item.auth_type === "api_key"
                                                                      ? "API Key"
                                                                      : "Webhook"}
                                                            </Badge>
                                                            {item.features.slice(0, 3).map((f) => (
                                                                <Badge
                                                                    key={f}
                                                                    variant="ghost"
                                                                    className="text-[10px]"
                                                                >
                                                                    {f}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0">
                                                    {isConnected ? (
                                                        <Button variant="outline" size="sm">
                                                            <ExternalLink className="h-3 w-3 mr-1" />{" "}
                                                            Manage
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            disabled={!item.is_available}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />{" "}
                                                            Connect
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "provider_connections",
        action: "read",
        title: "Integration Marketplace",
        description: "Browse and connect external services to your workspace",
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
