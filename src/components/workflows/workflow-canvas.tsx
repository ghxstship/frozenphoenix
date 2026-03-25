"use client";

/* ═══════════════════════════════════════════════════════════════
   WORKFLOW CANVAS — Visual Drag-and-Drop Workflow Builder

   SVG-based node canvas for building automation workflows.
   Integrates with existing automation_rules data model.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, GitBranch, GripVertical, Play, Plus, Trash2, Zap } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

export type WorkflowNodeType = "trigger" | "condition" | "action" | "delay";

export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    label: string;
    config: Record<string, unknown>;
    x: number;
    y: number;
}

export interface WorkflowEdge {
    id: string;
    from: string;
    to: string;
    label?: string | undefined;
}

export interface WorkflowCanvasProps {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    onNodesChange: (nodes: WorkflowNode[]) => void;
    onEdgesChange: (edges: WorkflowEdge[]) => void;
    onNodeSelect?: ((node: WorkflowNode | null) => void) | undefined;
    className?: string | undefined;
}

// ─── Node Config ─────────────────────────────────────────────

const NODE_ICONS: Record<WorkflowNodeType, React.ElementType> = {
    trigger: Zap,
    condition: GitBranch,
    action: Play,
    delay: Clock,
};

const NODE_COLORS: Record<WorkflowNodeType, string> = {
    trigger: "border-amber-500/50 bg-amber-500/10",
    condition: "border-blue-500/50 bg-blue-500/10",
    action: "border-green-500/50 bg-green-500/10",
    delay: "border-purple-500/50 bg-purple-500/10",
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

// ─── Component ───────────────────────────────────────────────

export function WorkflowCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeSelect,
    className,
}: WorkflowCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [connecting, setConnecting] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

    // ─── Drag Handling ───────────────────────────────────────

    const handleMouseDown = useCallback(
        (e: React.MouseEvent, nodeId: string) => {
            e.stopPropagation();
            const node = nodeMap.get(nodeId);
            if (!node) return;
            setDragging(nodeId);
            setDragOffset({
                x: e.clientX - node.x,
                y: e.clientY - node.y,
            });
        },
        [nodeMap]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!dragging) return;
            const newNodes = nodes.map((n) =>
                n.id === dragging
                    ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
                    : n
            );
            onNodesChange(newNodes);
        },
        [dragging, dragOffset, nodes, onNodesChange]
    );

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    // ─── Node Actions ────────────────────────────────────────

    const handleNodeClick = useCallback(
        (node: WorkflowNode) => {
            setSelectedNode(node.id);
            onNodeSelect?.(node);
        },
        [onNodeSelect]
    );

    const addNode = useCallback(
        (type: WorkflowNodeType) => {
            const id = `node-${Date.now()}`;
            const newNode: WorkflowNode = {
                id,
                type,
                label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                config: {},
                x: 200 + nodes.length * 50,
                y: 150 + nodes.length * 30,
            };
            onNodesChange([...nodes, newNode]);
        },
        [nodes, onNodesChange]
    );

    const deleteNode = useCallback(
        (nodeId: string) => {
            onNodesChange(nodes.filter((n) => n.id !== nodeId));
            onEdgesChange(edges.filter((e) => e.from !== nodeId && e.to !== nodeId));
            if (selectedNode === nodeId) {
                setSelectedNode(null);
                onNodeSelect?.(null);
            }
        },
        [nodes, edges, onNodesChange, onEdgesChange, selectedNode, onNodeSelect]
    );

    // ─── Connection ──────────────────────────────────────────

    const startConnect = useCallback((nodeId: string) => {
        setConnecting(nodeId);
    }, []);

    const finishConnect = useCallback(
        (nodeId: string) => {
            if (connecting && connecting !== nodeId) {
                const exists = edges.some((e) => e.from === connecting && e.to === nodeId);
                if (!exists) {
                    onEdgesChange([
                        ...edges,
                        { id: `edge-${Date.now()}`, from: connecting, to: nodeId },
                    ]);
                }
            }
            setConnecting(null);
        },
        [connecting, edges, onEdgesChange]
    );

    // ─── Edge Path ───────────────────────────────────────────

    const getEdgePath = useCallback(
        (edge: WorkflowEdge): string => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return "";

            const sx = from.x + NODE_WIDTH;
            const sy = from.y + NODE_HEIGHT / 2;
            const ex = to.x;
            const ey = to.y + NODE_HEIGHT / 2;
            const mx = (sx + ex) / 2;

            return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`;
        },
        [nodeMap]
    );

    return (
        <div className={cn("relative", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-lg border">
                <span className="text-xs font-medium text-muted-foreground mr-2">Add Node:</span>
                {(["trigger", "condition", "action", "delay"] as const).map((type) => {
                    const Icon = NODE_ICONS[type];
                    return (
                        <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => addNode(type)}
                            className="gap-1.5 capitalize"
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {type}
                        </Button>
                    );
                })}
            </div>

            {/* Canvas */}
            <div
                className="relative border rounded-lg bg-muted/5 overflow-hidden"
                style={{ minHeight: 500 }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* SVG edges layer */}
                <svg
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 0 }}
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill="hsl(var(--muted-foreground))"
                            />
                        </marker>
                    </defs>
                    {edges.map((edge) => (
                        <path
                            key={edge.id}
                            d={getEdgePath(edge)}
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            opacity={0.5}
                        />
                    ))}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                    const Icon = NODE_ICONS[node.type];
                    const isSelected = selectedNode === node.id;
                    return (
                        <div
                            key={node.id}
                            className={cn(
                                "absolute border-2 rounded-lg cursor-move transition-shadow",
                                NODE_COLORS[node.type],
                                isSelected && "ring-2 ring-primary shadow-lg",
                                dragging === node.id && "opacity-80"
                            )}
                            style={{
                                left: node.x,
                                top: node.y,
                                width: NODE_WIDTH,
                                height: NODE_HEIGHT,
                                zIndex: dragging === node.id ? 10 : 1,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, node.id)}
                            onClick={() => handleNodeClick(node)}
                        >
                            <div className="flex items-center gap-2 p-3 h-full">
                                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                                <Icon className="h-5 w-5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{node.label}</p>
                                    <Badge variant="ghost" className="text-[9px] uppercase mt-0.5">
                                        {node.type}
                                    </Badge>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button
                                        type="button"
                                        className="p-0.5 rounded hover:bg-destructive/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNode(node.id);
                                        }}
                                        aria-label="Delete node"
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </button>
                                    <button
                                        type="button"
                                        className="p-0.5 rounded hover:bg-primary/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (connecting) {
                                                finishConnect(node.id);
                                            } else {
                                                startConnect(node.id);
                                            }
                                        }}
                                        aria-label={
                                            connecting ? "Connect to this node" : "Start connection"
                                        }
                                    >
                                        <ArrowRight
                                            className={cn(
                                                "h-3 w-3",
                                                connecting === node.id
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty state */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Add nodes to get started</p>
                            <p className="text-xs mt-1">
                                Use the toolbar to add triggers, conditions, and actions
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

WorkflowCanvas.displayName = "WorkflowCanvas";
