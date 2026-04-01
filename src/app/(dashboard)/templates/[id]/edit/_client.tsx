"use client";

import React, { useCallback, useMemo, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { COMMON_STRINGS } from "@/lib/i18n/common-strings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    AlignLeft,
    ArrowLeft,
    Code,
    Eye,
    FileText,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    Plus,
    Save,
    Trash2,
    Type,
    Variable,
} from "lucide-react";
import { useDocumentTemplate, useUpdateDocumentTemplate } from "@/lib/supabase";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

type BlockType = "heading" | "paragraph" | "variable" | "image" | "divider" | "table";

interface TemplateBlock {
    id: string;
    type: BlockType;
    content: string;
    variableKey?: string | undefined;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
    { type: "heading", label: "Heading", icon: Type },
    { type: "paragraph", label: "Paragraph", icon: AlignLeft },
    { type: "variable", label: "Merge Field", icon: Variable },
    { type: "image", label: "Image", icon: ImageIcon },
    { type: "divider", label: "Divider", icon: Code },
];

const AVAILABLE_VARIABLES = [
    "{{client.name}}",
    "{{client.address}}",
    "{{project.name}}",
    "{{project.date}}",
    "{{invoice.number}}",
    "{{invoice.total}}",
    "{{contract.title}}",
    "{{contract.value}}",
    "{{company.name}}",
    "{{company.logo}}",
    "{{date.today}}",
    "{{date.due}}",
];

function parseBlocks(content: unknown): TemplateBlock[] {
    if (Array.isArray(content)) {
        return content.map((b: Record<string, unknown>, i: number) => ({
            id: String(b.id ?? i),
            type: (b.type as BlockType) ?? "paragraph",
            content: (b.content as string) ?? "",
            variableKey: b.variableKey as string | undefined,
        }));
    }
    if (typeof content === "string" && content.trim().startsWith("[")) {
        try {
            const parsed = JSON.parse(content) as Record<string, unknown>[];
            return parsed.map((b, i) => ({
                id: String(b.id ?? i),
                type: (b.type as BlockType) ?? "paragraph",
                content: (b.content as string) ?? "",
                variableKey: b.variableKey as string | undefined,
            }));
        } catch {
            return [{ id: "1", type: "paragraph", content: content }];
        }
    }
    return [];
}

export function TemplateEditorPageClient({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const templateId = resolvedParams.id;

    const { data: template, isLoading } = useDocumentTemplate(templateId);

    if (isLoading)
        return (
            <ListPageShell
                config={{
                    entityKey: "templates",
                    resource: "templates",
                    action: "write",
                    title: "Template Editor",
                    description: "",
                }}
                data={[]}
                isLoading={true}
            />
        );

    const t = (template ?? {}) as Record<string, unknown>;
    const initialName = (t.name as string) ?? "";
    const initialCategory = (t.category as string) ?? "invoice";
    const initialBlocks = parseBlocks(t.content);

    return (
        <TemplateEditorInner
            key={templateId}
            templateId={templateId}
            initialName={initialName}
            initialCategory={initialCategory}
            initialBlocks={initialBlocks}
        />
    );
}

function TemplateEditorInner({
    templateId,
    initialName,
    initialCategory,
    initialBlocks,
}: {
    templateId: string;
    initialName: string;
    initialCategory: string;
    initialBlocks: TemplateBlock[];
}) {
    const updateTemplate = useUpdateDocumentTemplate();

    const [previewMode, setPreviewMode] = useState(false);
    const [templateName, setTemplateName] = useState(initialName);
    const [templateCategory, setTemplateCategory] = useState(initialCategory);
    const [blocks, setBlocks] = useState<TemplateBlock[]>(initialBlocks);
    const blockCounter = React.useRef(100);

    const handleSave = useCallback(() => {
        updateTemplate.mutate({
            id: templateId,
            name: templateName,
            category: templateCategory,
            content: JSON.stringify(blocks),
        });
    }, [updateTemplate, templateId, templateName, templateCategory, blocks]);

    const addBlock = useCallback((type: BlockType) => {
        blockCounter.current += 1;
        setBlocks((prev) => [
            ...prev,
            {
                id: String(blockCounter.current),
                type,
                content: type === "variable" ? "{{variable}}" : "",
            },
        ]);
    }, []);

    const removeBlock = useCallback(
        (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id)),
        []
    );

    const updateBlock = useCallback(
        (id: string, content: string) =>
            setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b))),
        []
    );

    const config: ListPageConfig = useMemo(
        () => ({
            entityKey: "templates",
            resource: "templates",
            action: "write",
            title: "Template Editor",
            description: `Editing: ${templateName}`,
            headerActions: (
                <div className="flex gap-2">
                    <Link href={`/templates/${templateId}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={updateTemplate.isPending}>
                        {updateTemplate.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {updateTemplate.isPending
                            ? COMMON_STRINGS.action_saving
                            : COMMON_STRINGS.action_save}
                    </Button>
                </div>
            ),
            contentSlot: (
                <div className="grid grid-cols-1 lg:grid-cols-4 density-gap-card">
                    {/* Template Settings */}
                    <div className="density-gap-section">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">
                                        Template Name
                                    </Label>
                                    <Input
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">
                                        Category
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            "invoice",
                                            "contract",
                                            "call_sheet",
                                            "tech_sheet",
                                            "proposal",
                                        ].map((cat) => (
                                            <Badge
                                                key={cat}
                                                variant={
                                                    templateCategory === cat ? "default" : "ghost"
                                                }
                                                className="cursor-pointer density-caption"
                                                onClick={() => setTemplateCategory(cat)}
                                            >
                                                {cat.replaceAll("_", " ")}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Add Blocks */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Add Block</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => addBlock(type)}
                                    >
                                        <Icon className="mr-2 h-3.5 w-3.5" />
                                        {label}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Available Variables */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Variable className="h-4 w-4" />
                                    Merge Fields
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {AVAILABLE_VARIABLES.map((v) => (
                                        <Button
                                            key={v}
                                            variant="ghost"
                                            className="w-full justify-start text-xs font-mono h-auto px-2 py-1.5 bg-secondary/30 hover:bg-secondary/60"
                                            onClick={() => navigator.clipboard.writeText(v)}
                                        >
                                            {v}
                                        </Button>
                                    ))}
                                </div>
                                <p className="density-caption text-muted-foreground mt-2">
                                    Click to copy to clipboard
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Editor / Preview */}
                    <div className="lg:col-span-3">
                        {previewMode ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-8 bg-card rounded-lg border min-h-[600px] density-gap-section">
                                        {blocks.map((block) => {
                                            switch (block.type) {
                                                case "heading":
                                                    return (
                                                        <h2
                                                            key={block.id}
                                                            className="text-xl font-bold"
                                                        >
                                                            {block.content}
                                                        </h2>
                                                    );
                                                case "paragraph":
                                                    return (
                                                        <p key={block.id} className="text-sm">
                                                            {block.content}
                                                        </p>
                                                    );
                                                case "variable":
                                                    return (
                                                        <div
                                                            key={block.id}
                                                            className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-sm font-mono"
                                                        >
                                                            {block.content}
                                                        </div>
                                                    );
                                                case "image":
                                                    return (
                                                        <div
                                                            key={block.id}
                                                            className="h-32 bg-secondary/30 rounded-lg flex items-center justify-center"
                                                        >
                                                            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                                        </div>
                                                    );
                                                case "divider":
                                                    return (
                                                        <hr
                                                            key={block.id}
                                                            className="border-border"
                                                        />
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Template Blocks ({blocks.length})
                                        </CardTitle>
                                        <Badge variant="ghost">
                                            {templateCategory.replaceAll("_", " ")}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {blocks.map((block) => {
                                        const blockCfg = BLOCK_TYPES.find(
                                            (b) => b.type === block.type
                                        );
                                        const Icon = blockCfg?.icon ?? AlignLeft;
                                        return (
                                            <div
                                                key={block.id}
                                                className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors group"
                                            >
                                                <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-2.5 cursor-grab shrink-0" />
                                                <div className="h-8 w-8 rounded flex items-center justify-center bg-secondary shrink-0 mt-0.5">
                                                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="density-caption text-muted-foreground font-medium mb-1">
                                                        {blockCfg?.label ?? block.type}
                                                    </p>
                                                    {block.type === "divider" ? (
                                                        <hr className="border-border mt-1" />
                                                    ) : block.type === "image" ? (
                                                        <div className="h-16 bg-secondary/50 rounded flex items-center justify-center cursor-pointer">
                                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <Input
                                                            value={block.content}
                                                            onChange={(e) =>
                                                                updateBlock(
                                                                    block.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="text-sm"
                                                            placeholder={
                                                                block.type === "variable"
                                                                    ? "{{variable.name}}"
                                                                    : `Enter ${block.type} content...`
                                                            }
                                                        />
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                    onClick={() => removeBlock(block.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => addBlock("paragraph")}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Block
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ),
        }),
        [
            templateName,
            templateId,
            previewMode,
            handleSave,
            updateTemplate.isPending,
            templateCategory,
            setTemplateName,
            setTemplateCategory,
            blocks,
            addBlock,
            removeBlock,
            updateBlock,
        ]
    );

    return (
        <ListPageShell
            config={config}
            data={blocks as unknown as Record<string, unknown>[]}
            isLoading={false}
        />
    );
}
