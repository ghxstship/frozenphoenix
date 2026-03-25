"use client";

/* ═══════════════════════════════════════════════════════════════
   SUSTAINABILITY DASHBOARD PAGE

   Environmental impact tracking: carbon footprint, waste
   management, and aggregate sustainability scoring (A-F grade).
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Droplets, Leaf, Recycle, TrendingDown, Zap } from "lucide-react";
import {
    useCarbonFootprint,
    useSustainabilityScore,
    useWasteMetrics,
} from "@/lib/data-hooks/hooks-sustainability";

const GRADE_COLORS: Record<string, string> = {
    A: "text-green-400 bg-green-400/10 border-green-400/30",
    B: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    C: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    D: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    F: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function SustainabilityPage() {
    const { data: carbon } = useCarbonFootprint();
    const { data: waste } = useWasteMetrics();
    const { data: score } = useSustainabilityScore();

    const totalCarbonKg = (carbon ?? []).reduce((s, e) => s + e.kgCO2, 0);
    const grade = score?.grade ?? "C";

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sustainability"
                description="Track environmental impact, carbon footprint, and waste management across events."
            />

            {/* Score Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="col-span-2 md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[140px]">
                        <div
                            className={`text-5xl font-black ${GRADE_COLORS[grade]?.split(" ")[0] ?? "text-muted-foreground"} mb-1`}
                        >
                            {grade}
                        </div>
                        <p className="text-xs text-muted-foreground">Overall Grade</p>
                        <p className="text-lg font-semibold mt-1">{score?.overall ?? 0}/100</p>
                    </CardContent>
                </Card>

                {[
                    {
                        label: "Carbon",
                        value: score?.carbon ?? 0,
                        icon: TrendingDown,
                        color: "text-green-400",
                    },
                    {
                        label: "Waste",
                        value: score?.waste ?? 0,
                        icon: Recycle,
                        color: "text-blue-400",
                    },
                    {
                        label: "Energy",
                        value: score?.energy ?? 0,
                        icon: Zap,
                        color: "text-amber-400",
                    },
                    {
                        label: "Water",
                        value: score?.water ?? 0,
                        icon: Droplets,
                        color: "text-cyan-400",
                    },
                ].map((metric) => (
                    <Card key={metric.label}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                                <span className="text-xs text-muted-foreground">
                                    {metric.label}
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <ProgressBar value={metric.value} max={100} className="mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Carbon Breakdown */}
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-400" />
                            Carbon Footprint
                            <Badge variant="secondary" className="ml-auto">
                                {(totalCarbonKg / 1000).toFixed(1)} tCO₂
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(carbon ?? []).length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No carbon data available yet
                            </p>
                        ) : (
                            (carbon ?? []).map((item) => (
                                <div key={item.category} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>{item.label}</span>
                                        <span className="font-medium">
                                            {item.kgCO2.toLocaleString()} kgCO₂ ({item.percentage}%)
                                        </span>
                                    </div>
                                    <ProgressBar value={item.percentage} max={100} />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Waste Management */}
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Recycle className="h-4 w-4 text-blue-400" />
                            Waste Management
                            {waste && (
                                <Badge variant="secondary" className="ml-auto">
                                    {Math.round(waste.diversionRate * 100)}% Diverted
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {waste ? (
                            <>
                                {[
                                    {
                                        label: "Recycled",
                                        value: waste.recycledKg,
                                        color: "text-green-400",
                                    },
                                    {
                                        label: "Composted",
                                        value: waste.compostedKg,
                                        color: "text-amber-400",
                                    },
                                    {
                                        label: "Landfill",
                                        value: waste.landfillKg,
                                        color: "text-red-400",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full ${item.color.replace("text-", "bg-")}`}
                                            />
                                            {item.label}
                                        </span>
                                        <span className="font-medium">
                                            {item.value.toLocaleString()} kg
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t text-sm flex justify-between font-medium">
                                    <span>Total Waste</span>
                                    <span>{waste.totalWasteKg.toLocaleString()} kg</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No waste data available yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
