"use client";

import { useMemo, useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CUSTOM_FIELD_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import {
    Calendar,
    CheckSquare,
    Hash,
    Layers,
    List,
    Pencil,
    Plus,
    Settings,
    Tag,
    ToggleLeft,
    Trash2,
    Type,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { useToast } from "@/components/ui/toast";
import { LoadingState } from "@/components/layouts/loading-state";
import { useCustomFieldDefinitions } from "@/lib/supabase/hooks-v2-features";

interface CustomFieldDefinition {
    id: string;
    name: string;
    fieldKey: string;
    fieldType: "text" | "number" | "date" | "boolean" | "select" | "multi_select" | "url" | "email";
    entityType: string;
    isRequired: boolean;
    isSearchable: boolean;
    options: string[] | null;
    defaultValue: string | null;
    usageCount: number;
    createdBy: string;
}

const FIELD_TYPE_ICONS: Record<string, React.ReactNode> = {
    text: <Type className="h-3.5 w-3.5" />,
    number: <Hash className="h-3.5 w-3.5" />,
    date: <Calendar className="h-3.5 w-3.5" />,
    boolean: <ToggleLeft className="h-3.5 w-3.5" />,
    select: <List className="h-3.5 w-3.5" />,
    multi_select: <CheckSquare className="h-3.5 w-3.5" />,
    url: <Tag className="h-3.5 w-3.5" />,
    email: <Tag className="h-3.5 w-3.5" />,
};

export default function CustomFieldsPage() {
    const { addToast } = useToast();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState("all");

    const { data: sbFields, isLoading } = useCustomFieldDefinitions();

    const fields: CustomFieldDefinition[] = useMemo(
        () =>
            (sbFields ?? []).map((f) => ({
                id: f.id,
                name: f.name,
                fieldKey: f.field_key,
                fieldType: (f.field_type as CustomFieldDefinition["fieldType"]) ?? "text",
                entityType: (f.entity_types ?? [])[0] ?? "",
                isRequired: f.is_required === true,
                isSearchable: f.is_filterable === true,
                options: (f.options as string[] | null) ?? null,
                defaultValue: f.default_value,
                usageCount: 0,
                createdBy: "",
            })),
        [sbFields]
    );

    if (isLoading) return <LoadingState />;

    const entityTypes = ["all", ...new Set(fields.map((f) => f.entityType))];

    const filtered = fields.filter((f) => {
        const matchesSearch =
            !search ||
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.fieldKey.toLowerCase().includes(search.toLowerCase());
        const matchesEntity = entityFilter === "all" || f.entityType === entityFilter;
        return matchesSearch && matchesEntity;
    });

    const totalUsage = fields.reduce((s, f) => s + f.usageCount, 0);
    const entityCoverage = new Set(fields.map((f) => f.entityType)).size;

    return (
        <PermissionGate resource="settings" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Custom Property Fields"
                    description="Define custom fields on any entity type — projects, companies, assets, events, and more"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" /> New Field
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Custom Fields" value={fields.length} icon={Settings} />
                    <StatCard title="Total Usage" value={totalUsage} icon={Layers} />
                    <StatCard title="Entity Types" value={entityCoverage} icon={Tag} />
                    <StatCard
                        title="Required Fields"
                        value={fields.filter((f) => f.isRequired).length}
                        icon={CheckSquare}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search fields..."
                        className="max-w-sm"
                    />
                    <div className="flex gap-1">
                        {entityTypes.map((entity) => (
                            <Button
                                key={entity}
                                size="sm"
                                variant={entityFilter === entity ? "default" : "outline"}
                                onClick={() => setEntityFilter(entity)}
                                className="text-xs capitalize"
                            >
                                {entity === "all" ? "All" : entity}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.map((field) => (
                        <Card key={field.id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                                            {FIELD_TYPE_ICONS[field.fieldType]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold">
                                                    {field.name}
                                                </h4>
                                                {field.isRequired && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-[9px]"
                                                    >
                                                        Required
                                                    </Badge>
                                                )}
                                                {field.isSearchable && (
                                                    <Badge variant="info" className="text-[9px]">
                                                        Searchable
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                <code className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">
                                                    {field.fieldKey}
                                                </code>
                                                <span>·</span>
                                                <Badge
                                                    variant="ghost"
                                                    className="text-[10px] capitalize"
                                                >
                                                    {field.entityType}
                                                </Badge>
                                                <span>·</span>
                                                <span className="capitalize">
                                                    {field.fieldType.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {field.options && (
                                            <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                                                {field.options.slice(0, 4).map((opt) => (
                                                    <Badge
                                                        key={opt}
                                                        variant="ghost"
                                                        className="text-[9px]"
                                                    >
                                                        {opt}
                                                    </Badge>
                                                ))}
                                                {field.options.length > 4 && (
                                                    <Badge variant="ghost" className="text-[9px]">
                                                        +{field.options.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        <div className="text-center text-xs">
                                            <p className="font-bold">{field.usageCount}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                uses
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={() =>
                                                    addToast({
                                                        title: "Coming soon",
                                                        description: `Editing ${field.name} is not yet available.`,
                                                        variant: "default",
                                                    })
                                                }
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-destructive"
                                                onClick={() =>
                                                    addToast({
                                                        title: "Coming soon",
                                                        description: `Deleting ${field.name} is not yet available.`,
                                                        variant: "default",
                                                    })
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {field.defaultValue && (
                                    <p className="text-[10px] text-muted-foreground mt-2 ml-12">
                                        Default:{" "}
                                        <code className="bg-secondary/50 px-1 py-0.5 rounded">
                                            {field.defaultValue}
                                        </code>
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <CreateEntityDialog
                config={CREATE_CUSTOM_FIELD_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
