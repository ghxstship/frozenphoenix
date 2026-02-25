"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    ListChecks, Search, Plus, CheckCircle2, Circle, Clock,
    Percent,
} from "lucide-react";
import { MOCK_JOB_CHECKLISTS, MOCK_CHECKLIST_TEMPLATES } from "@/lib/mock-data-vendor-lifecycle";

type ViewTab = "active" | "templates";

export default function ChecklistsPage() {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<ViewTab>("active");

    const checklists = MOCK_JOB_CHECKLISTS;
    const templates = MOCK_CHECKLIST_TEMPLATES;

    const filteredChecklists = checklists.filter(c =>
        !search || c.title.toLowerCase().includes(search.toLowerCase())
    );
    const filteredTemplates = templates.filter(t =>
        !search || t.name.toLowerCase().includes(search.toLowerCase())
    );

    const inProgress = checklists.filter(c => c.status === "in_progress").length;
    const completed = checklists.filter(c => c.status === "completed").length;
    const avgCompletion = checklists.length > 0
        ? Math.round(checklists.reduce((s, c) => s + c.completionPercent, 0) / checklists.length)
        : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Job Checklists" description="Template-based checklists for work orders, quality assurance, and safety compliance">
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border bg-card p-0.5" role="tablist">
                        <button role="tab" aria-selected={tab === "active"} onClick={() => setTab("active")} className={`px-2 py-1 rounded-md text-xs transition-colors ${tab === "active" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Active</button>
                        <button role="tab" aria-selected={tab === "templates"} onClick={() => setTab("templates")} className={`px-2 py-1 rounded-md text-xs transition-colors ${tab === "templates" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Templates</button>
                    </div>
                    <Button size="sm"><Plus className="h-4 w-4" /> {tab === "templates" ? "New Template" : "New Checklist"}</Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Checklists" value={checklists.length} icon={ListChecks} />
                <StatCard title="In Progress" value={inProgress} icon={Clock} />
                <StatCard title="Completed" value={completed} icon={CheckCircle2} />
                <StatCard title="Avg. Completion" value={`${avgCompletion}%`} icon={Percent} />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={`Search ${tab === "templates" ? "templates" : "checklists"}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            {tab === "active" && (
                <div className="space-y-4">
                    {filteredChecklists.map((checklist, i) => (
                        <Card key={checklist.id} className="animate-slide-up hover:shadow-md transition-shadow" style={{ animationDelay: `${i * 60}ms` }}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold">{checklist.title}</h3>
                                        {checklist.dueDate && (
                                            <p className="text-xs text-muted-foreground mt-0.5">Due: {checklist.dueDate}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={checklist.status} className="text-[10px]" />
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${checklist.completionPercent === 100 ? "bg-success" : "bg-primary"}`}
                                            style={{ width: `${checklist.completionPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium">{checklist.completedItems}/{checklist.totalItems}</span>
                                </div>

                                <div className="space-y-1">
                                    {checklist.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 py-1">
                                            {item.completed ? (
                                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                            )}
                                            <span className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                                {item.title}
                                            </span>
                                            {item.required && !item.completed && (
                                                <span className="text-[9px] text-destructive">Required</span>
                                            )}
                                            {item.completedBy && (
                                                <span className="text-[9px] text-muted-foreground ml-auto">{item.completedBy}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {tab === "templates" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template, i) => (
                        <Card key={template.id} className="animate-slide-up hover:shadow-md transition-shadow cursor-pointer" style={{ animationDelay: `${i * 60}ms` }}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-sm font-bold">{template.name}</h3>
                                    {template.isActive && <Badge variant="success" className="text-[10px]">Active</Badge>}
                                </div>
                                {template.description && (
                                    <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" /> {template.items.length} items</span>
                                    {template.category && <span>{template.category}</span>}
                                    <span>Used {template.usageCount}x</span>
                                </div>
                                <div className="space-y-0.5">
                                    {template.items.slice(0, 4).map(item => (
                                        <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Circle className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    ))}
                                    {template.items.length > 4 && (
                                        <p className="text-[10px] text-muted-foreground pl-5">+{template.items.length - 4} more items</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
