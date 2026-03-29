"use client";

import { useMemo, useState } from "react";
import { COMMON_STRINGS } from "@/lib/i18n/common-strings";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_CUSTOM_FIELD_CONFIG } from "@/config/create-entity-configs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/components/ui/toast";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { useCustomFieldDefinitions, useUpdateCustomFieldDefinition } from "@/lib/supabase";
import { useCreateCustomFieldDefinition } from "@/lib/supabase/hooks-automation";
import { useQueryClient } from "@tanstack/react-query";

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

export function CustomFieldsPageClient() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState("all");
    const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const createField = useCreateCustomFieldDefinition();
    const { data: sbFields, isLoading } = useCustomFieldDefinitions();
    const updateField = useUpdateCustomFieldDefinition();

    const handleEdit = (field: CustomFieldDefinition) => {
        setEditingField(field);
        setEditName(field.name);
    };

    const handleEditSave = async () => {
        if (!editingField || !editName.trim()) return;
        updateField.mutate(
            { id: editingField.id, name: editName.trim() } as Parameters<
                typeof updateField.mutate
            >[0],
            {
                onSuccess: () => {
                    addToast({
                        title: "Field updated",
                        description: `${editName} saved successfully.`,
                        variant: "default",
                    });
                    setEditingField(null);
                },
                onError: () => {
                    addToast({
                        title: "Update failed",
                        description: "Could not update the field. Please try again.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleDelete = async (field: CustomFieldDefinition) => {
        setDeletingId(field.id);
        try {
            const res = await fetch(`/api/custom-field-definitions?id=${field.id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                addToast({
                    title: "Delete failed",
                    description: `Could not delete ${field.name}.`,
                    variant: "destructive",
                });
                return;
            }
            addToast({
                title: "Field deleted",
                description: `${field.name} has been removed.`,
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ["custom_field_definition"] });
        } finally {
            setDeletingId(null);
        }
    };

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

    // isLoading is passed to the shell below

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

    const contentSlot = (
        <>
            <div className="flex items-center gap-3">
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
                                            <h4 className="text-sm font-semibold">{field.name}</h4>
                                            {field.isRequired && (
                                                <Badge
                                                    variant="destructive"
                                                    className="density-caption"
                                                >
                                                    Required
                                                </Badge>
                                            )}
                                            {field.isSearchable && (
                                                <Badge variant="info" className="density-caption">
                                                    Searchable
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                            <code className="density-caption bg-secondary/50 px-1.5 py-0.5 rounded">
                                                {field.fieldKey}
                                            </code>
                                            <span>·</span>
                                            <Badge
                                                variant="ghost"
                                                className="density-caption capitalize"
                                            >
                                                {field.entityType}
                                            </Badge>
                                            <span>·</span>
                                            <span className="capitalize">
                                                {field.fieldType.replaceAll("_", " ")}
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
                                                    className="density-caption"
                                                >
                                                    {opt}
                                                </Badge>
                                            ))}
                                            {field.options.length > 4 && (
                                                <Badge variant="ghost" className="density-caption">
                                                    +{field.options.length - 4}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-center text-xs">
                                        <p className="font-bold">{field.usageCount}</p>
                                        <p className="density-caption text-muted-foreground">
                                            uses
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleEdit(field)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-destructive"
                                            disabled={deletingId === field.id}
                                            onClick={() => handleDelete(field)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {field.defaultValue && (
                                <p className="density-caption text-muted-foreground mt-2 ml-12">
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
        </>
    );

    const config: ListPageConfig = {
        entityKey: "settings",
        resource: "settings",
        action: "read",
        title: "Custom Property Fields",
        description:
            "Define custom fields on any entity type \u2014 projects, companies, assets, events, and more",
        headerActions: (
            <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> New Field
            </Button>
        ),
        stats: [
            { label: "Custom Fields", icon: Settings, value: fields.length },
            { label: "Total Usage", icon: Layers, value: totalUsage },
            { label: "Entity Types", icon: Tag, value: entityCoverage },
            {
                label: "Required Fields",
                icon: CheckSquare,
                value: fields.filter((f) => f.isRequired).length,
            },
        ],
        searchState: { value: search, onValueChange: setSearch, placeholder: "Search fields..." },
        contentSlot,
    };

    return (
        <>
            <ListPageShell config={config} isLoading={isLoading} />
            <CreateEntityDialog
                config={CREATE_CUSTOM_FIELD_CONFIG}
                open={createOpen}
                onClose={closeCreate}
                onSubmit={async (values) => {
                    await createField.mutateAsync(
                        values as Parameters<typeof createField.mutateAsync>[0]
                    );
                }}
            />
            <Dialog
                open={!!editingField}
                onOpenChange={(open) => {
                    if (!open) setEditingField(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Custom Field</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Field Name</label>
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Field name"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingField(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSave}
                            disabled={!editName.trim() || updateField.isPending}
                        >
                            {updateField.isPending
                                ? COMMON_STRINGS.action_saving
                                : COMMON_STRINGS.action_save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
