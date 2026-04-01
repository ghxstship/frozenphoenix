"use client";

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW BUILDER PAGE — Visual Automation Builder Route

   Hosts the WorkflowCanvas with toolbar, node palette,
   and properties panel. Persists to automation_rules.
   ═══════════════════════════════════════════════════════════════ */

import React, { useState } from "react";
import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";
import type { WorkflowEdge, WorkflowNode } from "@/components/workflows/workflow-canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Label } from "@/components/ui/label";
import { Save, Undo2 } from "lucide-react";

export default function WorkflowBuilderPage() {
    const [nodes, setNodes] = useState<WorkflowNode[]>([
        {
            id: "trigger-1",
            type: "trigger",
            label: "New Task Created",
            config: { event: "task.created" },
            x: 50,
            y: 100,
        },
        {
            id: "condition-1",
            type: "condition",
            label: "Priority is High?",
            config: { field: "priority", operator: "eq", value: "high" },
            x: 320,
            y: 80,
        },
        {
            id: "action-1",
            type: "action",
            label: "Send Notification",
            config: { action: "notify", channel: "email" },
            x: 590,
            y: 100,
        },
    ]);

    const [edges, setEdges] = useState<WorkflowEdge[]>([
        { id: "edge-1", from: "trigger-1", to: "condition-1" },
        { id: "edge-1b", from: "condition-1", to: "action-1" },
    ]);

    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Workflow Builder"
                    description="Visually design automation workflows with triggers, conditions, and actions."
                />
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Undo2 className="h-4 w-4 mr-1.5" />
                        Reset
                    </Button>
                    <Button size="sm">
                        <Save className="h-4 w-4 mr-1.5" />
                        Save Workflow
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
                <WorkflowCanvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={setNodes}
                    onEdgesChange={setEdges}
                    onNodeSelect={setSelectedNode}
                />

                {/* Properties Panel */}
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm">
                            {selectedNode ? "Node Properties" : "Properties"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {selectedNode ? (
                            <>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Label
                                    </Label>
                                    <Input
                                        value={selectedNode.label}
                                        onChange={(e) => {
                                            setNodes((ns) =>
                                                ns.map((n) =>
                                                    n.id === selectedNode.id
                                                        ? { ...n, label: e.target.value }
                                                        : n
                                                )
                                            );
                                            setSelectedNode((s) =>
                                                s ? { ...s, label: e.target.value } : null
                                            );
                                        }}
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Type
                                    </Label>
                                    <Badge variant="secondary" className="capitalize">
                                        {selectedNode.type}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground block mb-1">
                                        Configuration
                                    </Label>
                                    <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                                        {JSON.stringify(selectedNode.config, null, 2)}
                                    </pre>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                Select a node to edit its properties
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
