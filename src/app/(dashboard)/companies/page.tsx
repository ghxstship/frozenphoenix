"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatCurrency } from "@/lib/utils";
import { Building2, Globe, MapPin, MoreHorizontal, Plus, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured, useCompanies } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type CompanyType = "client" | "brand" | "agency" | "vendor" | "partner";
type CompanyStatus = "prospect" | "active" | "inactive" | "churned";

interface Company {
    id: string;
    name: string;
    legalName?: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    companyType: CompanyType;
    status: CompanyStatus;
    accountManagerName?: string;
    logoUrl?: string;
    city?: string;
    state?: string;
    projectCount: number;
    totalRevenue: number;
    tags: string[];
}

const mockCompanies: Company[] = [
    {
        id: "1",
        name: "Nike",
        legalName: "Nike, Inc.",
        industry: "Sportswear",
        website: "https://nike.com",
        phone: "+1 503-671-6453",
        email: "partnerships@nike.com",
        companyType: "brand",
        status: "active",
        accountManagerName: "Sarah Chen",
        logoUrl: "/brands/nike-logo.png",
        city: "Beaverton",
        state: "OR",
        projectCount: 12,
        totalRevenue: 2450000,
        tags: ["tier-1", "experiential", "sports"],
    },
    {
        id: "2",
        name: "Red Bull",
        legalName: "Red Bull GmbH",
        industry: "Beverages",
        website: "https://redbull.com",
        phone: "+1 310-393-4647",
        email: "events@redbull.com",
        companyType: "brand",
        status: "active",
        accountManagerName: "Mike Torres",
        logoUrl: "/brands/redbull-logo.png",
        city: "Santa Monica",
        state: "CA",
        projectCount: 8,
        totalRevenue: 1850000,
        tags: ["tier-1", "festivals", "extreme-sports"],
    },
    {
        id: "3",
        name: "Momentum Worldwide",
        industry: "Marketing Agency",
        website: "https://momentumww.com",
        phone: "+1 212-367-4500",
        email: "newbusiness@momentumww.com",
        companyType: "agency",
        status: "active",
        accountManagerName: "Sarah Chen",
        city: "New York",
        state: "NY",
        projectCount: 5,
        totalRevenue: 890000,
        tags: ["agency-partner"],
    },
    {
        id: "4",
        name: "Coachella Valley Music",
        industry: "Entertainment",
        website: "https://coachella.com",
        companyType: "client",
        status: "active",
        accountManagerName: "Mike Torres",
        city: "Indio",
        state: "CA",
        projectCount: 3,
        totalRevenue: 1200000,
        tags: ["festivals", "annual"],
    },
    {
        id: "5",
        name: "TechStart Inc",
        industry: "Technology",
        website: "https://techstart.io",
        companyType: "client",
        status: "prospect",
        city: "Austin",
        state: "TX",
        projectCount: 0,
        totalRevenue: 0,
        tags: ["prospect", "tech"],
    },
];

const statusVariants: Record<CompanyStatus, "info" | "success" | "ghost" | "destructive"> = {
    prospect: "info",
    active: "success",
    inactive: "ghost",
    churned: "destructive",
};

const typeVariants: Record<
    CompanyType,
    "default" | "warning" | "info" | "secondary" | "destructive"
> = {
    client: "default",
    brand: "warning",
    agency: "info",
    vendor: "secondary",
    partner: "default",
};

export default function CompaniesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const VIEW_MODES = ["table", "cards"] as const;
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "table",
        validValues: VIEW_MODES,
    });

    const { data: sbCompanies, isLoading } = useCompanies();

    const companies: Company[] =
        isSupabaseConfigured && sbCompanies
            ? sbCompanies.map((c: Record<string, unknown>) => ({
                  id: (c.id as string) ?? "",
                  name: (c.name as string) ?? "",
                  legalName: (c.legal_name as string) ?? undefined,
                  industry: (c.industry as string) ?? undefined,
                  website: (c.website as string) ?? undefined,
                  phone: (c.phone as string) ?? undefined,
                  email: (c.email as string) ?? undefined,
                  companyType: ((c.company_type as string) ?? "client") as CompanyType,
                  status: ((c.status as string) ?? "prospect") as CompanyStatus,
                  accountManagerName: (c.account_manager_name as string) ?? undefined,
                  logoUrl: (c.logo_url as string) ?? undefined,
                  city: (c.city as string) ?? undefined,
                  state: (c.state as string) ?? undefined,
                  projectCount: (c.project_count as number) ?? 0,
                  totalRevenue: (c.total_revenue as number) ?? 0,
                  tags: (c.tags as string[]) ?? [],
              }))
            : mockCompanies;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filteredCompanies = companies.filter((company) => {
        const matchesSearch =
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.industry?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || company.companyType === typeFilter;
        const matchesStatus = statusFilter === "all" || company.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const stats = {
        total: companies.length,
        active: companies.filter((c) => c.status === "active").length,
        prospects: companies.filter((c) => c.status === "prospect").length,
        totalRevenue: companies.reduce((sum, c) => sum + c.totalRevenue, 0),
    };

    return (
        <PermissionGate resource="companies" action="read">
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
                        <p className="text-muted-foreground">
                            Manage your clients, brands, agencies, and partners
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Company
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Companies" value={stats.total} icon={Building2} />
                    <StatCard title="Active" value={stats.active} icon={Star} />
                    <StatCard title="Prospects" value={stats.prospects} icon={Users} />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={Building2}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <SearchInput
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            placeholder="Search companies..."
                            className="flex-1 max-w-sm"
                        />
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="brand">Brand</SelectItem>
                                <SelectItem value="agency">Agency</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="prospect">Prospect</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="churned">Churned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <SegmentedControl
                        value={view}
                        onValueChange={(v) => setView(v as "table" | "cards")}
                        options={[
                            { value: "table", label: "Table" },
                            { value: "cards", label: "Cards" },
                        ]}
                        ariaLabel="View mode"
                    />
                </div>

                {/* Table View */}
                {view === "table" && (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Account Manager</TableHead>
                                    <TableHead className="text-right">Projects</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCompanies.map((company) => (
                                    <TableRow
                                        key={company.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={company.logoUrl}
                                                        alt={company.name}
                                                    />
                                                    <AvatarFallback>
                                                        {company.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {company.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {company.industry}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={typeVariants[company.companyType]}>
                                                {company.companyType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariants[company.status]}>
                                                {company.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {company.city && company.state && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {company.city}, {company.state}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {company.accountManagerName || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {company.projectCount}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(company.totalRevenue)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Company actions"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        View Contacts
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        View Projects
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {/* Cards View */}
                {view === "cards" && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCompanies.map((company) => (
                            <Card
                                key={company.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={company.logoUrl}
                                                    alt={company.name}
                                                />
                                                <AvatarFallback>
                                                    {company.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {company.name}
                                                </CardTitle>
                                                <CardDescription>
                                                    {company.industry}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Company actions"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        <Badge variant={typeVariants[company.companyType]}>
                                            {company.companyType}
                                        </Badge>
                                        <Badge variant={statusVariants[company.status]}>
                                            {company.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        {company.city && company.state && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                {company.city}, {company.state}
                                            </div>
                                        )}
                                        {company.website && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Globe className="h-3 w-3" />
                                                {company.website.replace("https://", "")}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="text-sm">
                                            <span className="font-medium">
                                                {company.projectCount}
                                            </span>
                                            <span className="text-muted-foreground"> projects</span>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {formatCurrency(company.totalRevenue)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PermissionGate>
    );
}
