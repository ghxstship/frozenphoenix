"use client";

/* ═══════════════════════════════════════════════════════════════
   SUPPLIER DISCOVERY PAGE — Marketplace Directory

   SAP Ariba-inspired supplier marketplace with search,
   category filters, and verified supplier profiles.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { CheckCircle2, Mail, MapPin, Search, Star } from "lucide-react";
import {
    SUPPLIER_CATEGORIES,
    useSupplierDirectory,
} from "@/lib/data-hooks/hooks-supplier-discovery";
import type { SupplierFilter } from "@/lib/data-hooks/hooks-supplier-discovery";

export default function SupplierDiscoveryPage() {
    const [filters, setFilters] = useState<SupplierFilter>({});
    const [searchInput, setSearchInput] = useState("");
    const { data: suppliers, isLoading } = useSupplierDirectory(filters);

    const handleSearch = () => {
        setFilters((f) => ({ ...f, search: searchInput || undefined }));
    };

    const handleCategoryFilter = (category: string) => {
        setFilters((f) => ({
            ...f,
            category: f.category === category ? undefined : category,
        }));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Supplier Discovery"
                description="Find and connect with verified suppliers across all event service categories."
            />

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers by name, service, or location..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={handleSearch}>Search</Button>
                </div>
                <Button
                    variant={filters.verified_only ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                        setFilters((f) => ({
                            ...f,
                            verified_only: !f.verified_only || undefined,
                        }))
                    }
                    className="gap-1.5"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Verified Only
                </Button>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-1.5">
                {SUPPLIER_CATEGORIES.slice(0, 12).map((cat) => (
                    <Badge
                        key={cat}
                        variant={filters.category === cat ? "default" : "outline"}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleCategoryFilter(cat)}
                    >
                        {cat}
                    </Badge>
                ))}
                {SUPPLIER_CATEGORIES.length > 12 && (
                    <Badge variant="outline" className="text-muted-foreground">
                        +{SUPPLIER_CATEGORIES.length - 12} more
                    </Badge>
                )}
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="motion-safe:animate-pulse">
                            <CardContent className="pt-6">
                                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                                <div className="h-3 bg-muted rounded w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (suppliers ?? []).length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No suppliers found</p>
                        <p className="text-xs mt-1">
                            Try adjusting your search criteria or browse categories
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(suppliers ?? []).map((supplier) => (
                        <Card key={supplier.id} className="hover:shadow-lg transition-shadow group">
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm font-semibold truncate">
                                                {supplier.name}
                                            </h3>
                                            {supplier.verified && (
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="ghost" className="text-[10px]">
                                                {supplier.category}
                                            </Badge>
                                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {supplier.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {supplier.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-medium">
                                            {supplier.rating.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            ({supplier.review_count})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Mail className="h-3 w-3" />
                                        Contact
                                    </Button>
                                </div>

                                {supplier.services.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {supplier.services.slice(0, 3).map((s) => (
                                            <Badge key={s} variant="outline" className="text-[9px]">
                                                {s}
                                            </Badge>
                                        ))}
                                        {supplier.services.length > 3 && (
                                            <Badge
                                                variant="outline"
                                                className="text-[9px] text-muted-foreground"
                                            >
                                                +{supplier.services.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
