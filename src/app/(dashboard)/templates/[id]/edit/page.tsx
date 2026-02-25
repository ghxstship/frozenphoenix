"use client";

import React, { useState } from "react";
import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, Save, Eye, Code, Type, Image as ImageIcon,
    AlignLeft, Variable, Plus, Trash2, GripVertical, FileText,
} from "lucide-react";

type BlockType = "heading" | "paragraph" | "variable" | "image" | "divider" | "table";

interface TemplateBlock {
    id: string;
    type: BlockType;
    content: string;
    variableKey?: string;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
    { type: "heading", label: "Heading", icon: Type },
    { type: "paragraph", label: "Paragraph", icon: AlignLeft },
    { type: "variable", label: "Merge Field", icon: Variable },
    { type: "image", label: "Image", icon: ImageIcon },
    { type: "divider", label: "Divider", icon: Code },
];

const AVAILABLE_VARIABLES = [
    "{{client.name}}", "{{client.address}}", "{{project.name}}", "{{project.date}}",
    "{{invoice.number}}", "{{invoice.total}}", "{{contract.title}}", "{{contract.value}}",
    "{{company.name}}", "{{company.logo}}", "{{date.today}}", "{{date.due}}",
];

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    void resolvedParams.id;

    const [templateName, setTemplateName] = useState("Standard Invoice Template");
    const [templateCategory, setTemplateCategory] = useState("invoice");
    const [previewMode, setPreviewMode] = useState(false);
    const [blocks, setBlocks] = useState<TemplateBlock[]>([
        { id: "1", type: "heading", content: "INVOICE" },
        { id: "2", type: "variable", content: "{{company.name}}", variableKey: "company.name" },
        { id: "3", type: "paragraph", content: "Invoice Number: {{invoice.number}}" },
        { id: "4", type: "paragraph", content: "Date: {{date.today}}" },
        { id: "5", type: "divider", content: "" },
        { id: "6", type: "heading", content: "Bill To" },
        { id: "7", type: "variable", content: "{{client.name}}", variableKey: "client.name" },
        { id: "8", type: "variable", content: "{{client.address}}", variableKey: "client.address" },
        { id: "9", type: "divider", content: "" },
        { id: "10", type: "paragraph", content: "Thank you for your business. Payment is due within 30 days." },
    ]);

    const blockCounter = React.useRef(100);
    const addBlock = (type: BlockType) => {
        blockCounter.current += 1;
        setBlocks([...blocks, { id: String(blockCounter.current), type, content: type === "variable" ? "{{variable}}" : "" }]);
    };

    const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

    const updateBlock = (id: string, content: string) =>
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Template Editor" description={`Editing: ${templateName}`}>
                <div className="flex gap-2">
                    <Link href="/templates"><Button variant="outline" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
                    <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                        <Eye className="mr-2 h-4 w-4" />{previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button size="sm"><Save className="mr-2 h-4 w-4" />Save</Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Template Settings */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Template Name</label>
                                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {["invoice", "contract", "call_sheet", "tech_sheet", "proposal"].map((cat) => (
                                        <Badge
                                            key={cat}
                                            variant={templateCategory === cat ? "default" : "ghost"}
                                            className="cursor-pointer text-[10px]"
                                            onClick={() => setTemplateCategory(cat)}
                                        >
                                            {cat.replace("_", " ")}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Blocks */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Add Block</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                                <Button key={type} variant="outline" size="sm" className="w-full justify-start" onClick={() => addBlock(type)}>
                                    <Icon className="mr-2 h-3.5 w-3.5" />{label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Available Variables */}
                    <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Variable className="h-4 w-4" />Merge Fields</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {AVAILABLE_VARIABLES.map((v) => (
                                    <button
                                        key={v}
                                        className="w-full text-left text-xs font-mono px-2 py-1.5 rounded bg-secondary/30 hover:bg-secondary/60 transition-colors"
                                        onClick={() => navigator.clipboard.writeText(v)}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">Click to copy to clipboard</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Editor / Preview */}
                <div className="lg:col-span-3">
                    {previewMode ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Eye className="h-4 w-4" />Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="p-8 bg-white dark:bg-zinc-900 rounded-lg border min-h-[600px] space-y-4">
                                    {blocks.map((block) => {
                                        switch (block.type) {
                                            case "heading":
                                                return <h2 key={block.id} className="text-xl font-bold">{block.content}</h2>;
                                            case "paragraph":
                                                return <p key={block.id} className="text-sm">{block.content}</p>;
                                            case "variable":
                                                return (
                                                    <div key={block.id} className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-sm font-mono">
                                                        {block.content}
                                                    </div>
                                                );
                                            case "image":
                                                return (
                                                    <div key={block.id} className="h-32 bg-secondary/30 rounded-lg flex items-center justify-center">
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                                                    </div>
                                                );
                                            case "divider":
                                                return <hr key={block.id} className="border-border" />;
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
                                    <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Template Blocks ({blocks.length})</CardTitle>
                                    <Badge variant="ghost">{templateCategory.replace("_", " ")}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {blocks.map((block) => {
                                    const blockCfg = BLOCK_TYPES.find(b => b.type === block.type);
                                    const Icon = blockCfg?.icon ?? AlignLeft;
                                    return (
                                        <div key={block.id} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors group">
                                            <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-2.5 cursor-grab shrink-0" />
                                            <div className="h-8 w-8 rounded flex items-center justify-center bg-secondary shrink-0 mt-0.5">
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-muted-foreground font-medium mb-1">{blockCfg?.label ?? block.type}</p>
                                                {block.type === "divider" ? (
                                                    <hr className="border-border mt-1" />
                                                ) : block.type === "image" ? (
                                                    <div className="h-16 bg-secondary/50 rounded flex items-center justify-center cursor-pointer">
                                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <Input
                                                        value={block.content}
                                                        onChange={(e) => updateBlock(block.id, e.target.value)}
                                                        className="text-sm"
                                                        placeholder={block.type === "variable" ? "{{variable.name}}" : `Enter ${block.type} content...`}
                                                    />
                                                )}
                                            </div>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => removeBlock(block.id)}>
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                        </div>
                                    );
                                })}
                                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addBlock("paragraph")}>
                                    <Plus className="mr-2 h-4 w-4" />Add Block
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
