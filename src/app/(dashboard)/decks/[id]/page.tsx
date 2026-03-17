"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeck, useDeleteDeck, useUpdateDeck } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Download,
    GripVertical,
    Image as ImageIcon,
    Layout,
    Maximize,
    Play,
    Presentation,
    Save,
    Trash2,
    Type,
} from "lucide-react";

type SlideType = "title" | "content" | "image" | "chart" | "two_column" | "quote";

interface Slide {
    id: string;
    type: SlideType;
    title: string;
    body: string;
    notes: string;
}

const SLIDE_TYPES: { type: SlideType; label: string; icon: React.ElementType }[] = [
    { type: "title", label: "Title Slide", icon: Type },
    { type: "content", label: "Content", icon: Layout },
    { type: "image", label: "Image", icon: ImageIcon },
    { type: "chart", label: "Chart / Data", icon: BarChart3 },
    { type: "two_column", label: "Two Column", icon: Layout },
    { type: "quote", label: "Quote", icon: Type },
];

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "decks",
    titleKey: "title",
    statusKey: "status",
    icon: Presentation,
    backHref: "/decks",
    backLabel: "Decks",
    chatterRecordType: "deck",
    fields: [],
    tabs: [],
};

export default function DeckEditorPage() {
    const params = useParams();
    const router = useRouter();
    const deckId = params.id as string;
    const { data: sbRecord, isLoading } = useDeck(deckId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: deckId,
        entityLabel: "Deck",
        listPath: "/decks",
        useUpdateHook: useUpdateDeck,
        useDeleteHook: useDeleteDeck,
    });

    const [deckTitle, setDeckTitle] = useState("Air Max Launch — Client Pitch Deck");
    const [slides, setSlides] = useState<Slide[]>([
        {
            id: "1",
            type: "title",
            title: "Air Max Launch Experience",
            body: "Barclays Center, Brooklyn — March 2026",
            notes: "Opening slide, use Nike brand colors",
        },
        {
            id: "2",
            type: "content",
            title: "Project Overview",
            body: "A 3-day immersive brand activation celebrating the launch of the new Air Max line, featuring interactive installations, live performances, and exclusive product drops.",
            notes: "",
        },
        {
            id: "3",
            type: "chart",
            title: "Budget Breakdown",
            body: "Fabrication: 35% | AV/Tech: 25% | Talent: 15% | Logistics: 12% | Staffing: 8% | Contingency: 5%",
            notes: "Pull from live budget data",
        },
        {
            id: "4",
            type: "image",
            title: "Venue Layout",
            body: "",
            notes: "Insert Barclays Center floor plan",
        },
        {
            id: "5",
            type: "two_column",
            title: "Timeline & Milestones",
            body: "Pre-Production: Jan-Feb | Fabrication: Feb-Mar | Load-In: Mar 11-12 | Show: Mar 13-15 | Strike: Mar 16",
            notes: "",
        },
        {
            id: "6",
            type: "content",
            title: "Technical Requirements",
            body: "50x LED panels (P2.5) | 48x Moving lights | Line array audio | 24 rigging points | Dedicated 1Gbps network",
            notes: "Reference tech sheet",
        },
        {
            id: "7",
            type: "quote",
            title: "Why Us?",
            body: '"We don\'t just build events — we engineer unforgettable moments."',
            notes: "Closing slide",
        },
    ]);
    const [selectedSlide, setSelectedSlide] = useState(0);
    const [isPresenting, setIsPresenting] = useState(false);

    const slideCounter = React.useRef(100);
    const addSlide = (type: SlideType) => {
        slideCounter.current += 1;
        const newSlide: Slide = {
            id: String(slideCounter.current),
            type,
            title: "",
            body: "",
            notes: "",
        };
        const insertAt = selectedSlide + 1;
        const updated = [...slides.slice(0, insertAt), newSlide, ...slides.slice(insertAt)];
        setSlides(updated);
        setSelectedSlide(insertAt);
    };

    const removeSlide = (idx: number) => {
        if (slides.length <= 1) return;
        const updated = slides.filter((_, i) => i !== idx);
        setSlides(updated);
        setSelectedSlide(Math.min(selectedSlide, updated.length - 1));
    };

    const updateSlide = (field: keyof Slide, value: string) => {
        setSlides(slides.map((s, i) => (i === selectedSlide ? { ...s, [field]: value } : s)));
    };

    const current = slides[selectedSlide];

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Deck Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                            Deck Title
                        </label>
                        <Input value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="info">pitch</Badge>
                        <Badge variant="ghost">{slides.length} slides</Badge>
                    </div>
                </CardContent>
            </Card>

            {current && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Slide Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                            <Badge variant="ghost">
                                {SLIDE_TYPES.find((t) => t.type === current.type)?.label}
                            </Badge>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                                Title
                            </label>
                            <Input
                                value={current.title}
                                onChange={(e) => updateSlide("title", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Body</label>
                            <textarea
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                                value={current.body}
                                onChange={(e) => updateSlide("body", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                                Speaker Notes
                            </label>
                            <textarea
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                                value={current.notes}
                                onChange={(e) => updateSlide("notes", e.target.value)}
                                placeholder="Private notes..."
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Add Slide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    {SLIDE_TYPES.map(({ type, label, icon: Icon }) => (
                        <Button
                            key={type}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs h-7"
                            onClick={() => addSlide(type)}
                        >
                            <Icon className="mr-1 h-3 w-3" />
                            {label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="space-y-4">
            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {slides.map((slide, i) => {
                    const typeCfg = SLIDE_TYPES.find((t) => t.type === slide.type);
                    const Icon = typeCfg?.icon ?? Layout;
                    return (
                        <div
                            key={slide.id}
                            className={`p-2 rounded-lg cursor-pointer transition-all group shrink-0 w-28 ${i === selectedSlide ? "ring-2 ring-primary bg-primary/5" : "bg-secondary/20 hover:bg-secondary/40"}`}
                            onClick={() => setSelectedSlide(i)}
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {i + 1}
                                </span>
                                <Icon className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div className="aspect-video bg-secondary/50 rounded flex items-center justify-center p-1">
                                <p className="text-[8px] text-center line-clamp-2">
                                    {slide.title || typeCfg?.label}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-1 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeSlide(i);
                                }}
                            >
                                <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Slide Canvas */}
            <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-sidebar-background to-sidebar-accent flex items-center justify-center p-8 relative">
                    {current?.type === "title" ? (
                        <div className="text-center text-sidebar-foreground">
                            <h1 className="text-3xl font-bold mb-2">{current.title || "Title"}</h1>
                            <p className="text-sm text-sidebar-foreground/60">
                                {current.body || "Subtitle"}
                            </p>
                        </div>
                    ) : current?.type === "quote" ? (
                        <div className="text-center text-sidebar-foreground max-w-lg">
                            <p className="text-xl italic">{current.body || '"Quote text"'}</p>
                            <p className="text-sm text-sidebar-foreground/50 mt-4">
                                — {current.title || "Attribution"}
                            </p>
                        </div>
                    ) : current?.type === "image" ? (
                        <div className="text-center text-sidebar-foreground/30">
                            <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                            <p className="text-sm">{current.title || "Drop image here"}</p>
                        </div>
                    ) : current?.type === "chart" ? (
                        <div className="text-center text-sidebar-foreground w-full">
                            <h2 className="text-xl font-bold mb-4">
                                {current.title || "Chart Title"}
                            </h2>
                            <div className="flex items-end justify-center gap-3 h-32">
                                {[65, 45, 80, 35, 55, 70].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-8 bg-primary/60 rounded-t"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-sidebar-foreground/50 mt-3">
                                {current.body}
                            </p>
                        </div>
                    ) : current?.type === "two_column" ? (
                        <div className="text-sidebar-foreground w-full">
                            <h2 className="text-xl font-bold mb-4 text-center">
                                {current.title || "Two Column"}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-sidebar-foreground/5 rounded-lg p-3 min-h-[100px]">
                                    <p className="text-xs text-sidebar-foreground/60">
                                        Left column
                                    </p>
                                </div>
                                <div className="bg-sidebar-foreground/5 rounded-lg p-3 min-h-[100px]">
                                    <p className="text-xs text-sidebar-foreground/60">
                                        Right column
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sidebar-foreground w-full">
                            <h2 className="text-xl font-bold mb-3">
                                {current?.title || "Content"}
                            </h2>
                            <p className="text-sm text-sidebar-foreground/70 whitespace-pre-wrap">
                                {current?.body || "Slide content..."}
                            </p>
                        </div>
                    )}
                    <div className="absolute bottom-2 right-3 text-sidebar-foreground/20 text-[10px] font-mono">
                        {selectedSlide + 1}/{slides.length}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-sidebar-foreground/30 hover:text-sidebar-foreground"
                        onClick={() => setIsPresenting(true)}
                    >
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Slide Navigation */}
            <div className="flex items-center justify-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedSlide === 0}
                    onClick={() => setSelectedSlide(selectedSlide - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                    Slide {selectedSlide + 1} of {slides.length}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedSlide === slides.length - 1}
                    onClick={() => setSelectedSlide(selectedSlide + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        titleFn: () => deckTitle,
        subtitleFn: () => `${slides.length} slides`,
        statusFn: () => "draft",
        sidebarSlot,
        overviewSlot,
    };

    const record = sbRecord ? { ...(sbRecord as Record<string, unknown>) } : null;

    return (
        <>
            {isPresenting && current && (
                <div
                    className="fixed inset-0 bg-sidebar-background z-50 flex items-center justify-center"
                    onClick={() => setIsPresenting(false)}
                >
                    <div className="max-w-4xl w-full mx-auto p-12 text-sidebar-foreground text-center">
                        {current.type === "title" ? (
                            <>
                                <h1 className="text-5xl font-bold mb-4">{current.title}</h1>
                                <p className="text-xl text-sidebar-foreground/70">{current.body}</p>
                            </>
                        ) : current.type === "quote" ? (
                            <>
                                <p className="text-3xl italic mb-6">{current.body}</p>
                                <p className="text-lg text-sidebar-foreground/60">
                                    — {current.title}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold mb-6">{current.title}</h2>
                                <p className="text-lg text-sidebar-foreground/80 whitespace-pre-wrap">
                                    {current.body}
                                </p>
                            </>
                        )}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sidebar-foreground/40 text-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sidebar-foreground/40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSlide(Math.max(0, selectedSlide - 1));
                                }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span>
                                {selectedSlide + 1} / {slides.length}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sidebar-foreground/40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSlide(
                                        Math.min(slides.length - 1, selectedSlide + 1)
                                    );
                                }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <DetailPageShell
                config={config}
                id={deckId}
                record={record}
                isLoading={isLoading}
                menuItems={[
                    {
                        label: "Duplicate Deck",
                        onClick: () => router.push(`/decks/new?duplicateFrom=${deckId}`),
                    },
                    ...crudMenuItems,
                ]}
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Presentation className="h-7 w-7 text-primary-foreground" />
                    </div>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPresenting(true)}>
                            <Play className="h-4 w-4 mr-1" />
                            Present
                        </Button>
                        <Button size="sm" onClick={() => handleUpdate({ title: deckTitle })}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                        </Button>
                    </>
                }
            />
        </>
    );
}
